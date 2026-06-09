using System.Globalization;
using System.IO.Compression;
using System.Xml.Linq;
using Microsoft.Data.Sqlite;

if (args.Length == 0)
{
    PrintUsage();
    return 1;
}

var command = args[0].ToLowerInvariant();
var options = ParseOptions(args.Skip(1).ToArray());

try
{
    return command switch
    {
        "build-db" => await BuildDbAsync(options),
        "verify" => await VerifyAsync(options),
        _ => UsageError($"Unknown command '{args[0]}'.")
    };
}
catch (Exception ex)
{
    Console.Error.WriteLine(ex.Message);
    return 1;
}

static async Task<int> BuildDbAsync(Dictionary<string, string> options)
{
    if (!options.TryGetValue("source", out var source))
    {
        return UsageError("Missing required option --source.");
    }

    if (!options.TryGetValue("output", out var output))
    {
        return UsageError("Missing required option --output.");
    }

    Directory.CreateDirectory(Path.GetDirectoryName(Path.GetFullPath(output)) ?? ".");

    if (File.Exists(output))
    {
        File.Delete(output);
    }

    await using var connection = new SqliteConnection($"Data Source={output}");
    await connection.OpenAsync();
    await CreateSchemaAsync(connection);

    await using var transaction = connection.BeginTransaction();
    var recordCount = 0;
    foreach (var record in ReadRecords(source))
    {
        await UpsertRecordAsync(connection, transaction, record);
        recordCount++;
    }

    await transaction.CommitAsync();
    await RebuildSearchAsync(connection);

    Console.WriteLine($"Imported {recordCount.ToString(CultureInfo.InvariantCulture)} records into {output}");
    return 0;
}

static async Task<int> VerifyAsync(Dictionary<string, string> options)
{
    if (!options.TryGetValue("database", out var database))
    {
        return UsageError("Missing required option --database.");
    }

    var checks = new[]
    {
        new VerifyCheck("ficus"),
        new VerifyCheck("monstera"),
        new VerifyCheck("alocasia"),
        new VerifyCheck("croton")
    };

    await using var connection = new SqliteConnection($"Data Source={database}");
    await connection.OpenAsync();

    var failed = false;
    foreach (var check in checks)
    {
        var result = await SearchFirstCanonicalNameAsync(connection, check.Query);
        var passed = result is not null;
        Console.WriteLine($"{(passed ? "PASS" : "FAIL")} {check.Query} -> {result ?? "(no result)"}");
        failed |= !passed;
    }

    var recordCount = await CountRecordsAsync(connection);
    var gbifCount = await CountGbifRecordsAsync(connection);
    Console.WriteLine($"Records: {recordCount.ToString(CultureInfo.InvariantCulture)}");
    Console.WriteLine($"GBIF records: {gbifCount.ToString(CultureInfo.InvariantCulture)}");

    return failed || recordCount == 0 || gbifCount == 0 ? 1 : 0;
}

static IEnumerable<PlantInfoImportRecord> ReadRecords(string source)
{
    if (File.Exists(source) && Path.GetExtension(source).Equals(".zip", StringComparison.OrdinalIgnoreCase))
    {
        return ReadGbifDwcaZipRecords(source);
    }

    if (Directory.Exists(source) && File.Exists(Path.Combine(source, "meta.xml")))
    {
        return ReadGbifDwcaDirectoryRecords(source);
    }

    throw new FileNotFoundException($"Could not find a GBIF backbone zip or extracted GBIF archive at '{source}'.");
}

static IEnumerable<PlantInfoImportRecord> ReadGbifDwcaZipRecords(string sourceFile)
{
    using var archive = ZipFile.OpenRead(sourceFile);
    var layout = ReadDwcaLayout(OpenArchiveEntry(archive, "meta.xml"));
    return ReadGbifDwcaRecords(layout, fileName => OpenArchiveEntry(archive, fileName));
}

static IEnumerable<PlantInfoImportRecord> ReadGbifDwcaDirectoryRecords(string sourceDirectory)
{
    var layout = ReadDwcaLayout(File.OpenRead(Path.Combine(sourceDirectory, "meta.xml")));
    return ReadGbifDwcaRecords(layout, fileName => File.OpenRead(Path.Combine(sourceDirectory, fileName)));
}

static IEnumerable<PlantInfoImportRecord> ReadGbifDwcaRecords(
    DwcaLayout layout,
    Func<string, Stream> openFile)
{
    var records = new Dictionary<string, GbifRecordBuilder>(StringComparer.OrdinalIgnoreCase);
    using (var taxonStream = openFile(layout.Taxon.FileName))
    using (var reader = new StreamReader(taxonStream))
    {
        var lineNumber = 0;
        while (!reader.EndOfStream)
        {
            lineNumber++;
            var line = reader.ReadLine();
            if (string.IsNullOrWhiteSpace(line))
            {
                continue;
            }

            var fields = line.Split('\t');
            var kingdom = layout.Taxon.Value(fields, "kingdom");
            var rank = layout.Taxon.Value(fields, "taxonRank");
            var status = layout.Taxon.Value(fields, "taxonomicStatus");
            if (!EqualsIgnoreCase(kingdom, "Plantae") ||
                !IsSpeciesOrBelowRank(rank) ||
                !EqualsIgnoreCase(status, "accepted"))
            {
                continue;
            }

            var externalId = layout.Taxon.Value(fields, "taxonID") ?? layout.Taxon.Value(fields, "id");
            var scientificName = layout.Taxon.Value(fields, "scientificName");
            if (string.IsNullOrWhiteSpace(externalId) || string.IsNullOrWhiteSpace(scientificName))
            {
                Console.Error.WriteLine($"Skipping Taxon.tsv line {lineNumber.ToString(CultureInfo.InvariantCulture)} with missing taxonID or scientificName.");
                continue;
            }

            records[externalId] = new GbifRecordBuilder(
                externalId,
                scientificName,
                EmptyToNull(layout.Taxon.Value(fields, "canonicalName")),
                EmptyToNull(layout.Taxon.Value(fields, "scientificNameAuthorship")),
                EmptyToNull(layout.Taxon.Value(fields, "family")),
                EmptyToNull(layout.Taxon.Value(fields, "genus")),
                EmptyToNull(layout.Taxon.Value(fields, "specificEpithet")),
                EmptyToNull(rank),
                EmptyToNull(status));
        }
    }

    if (layout.VernacularName is not null)
    {
        using var vernacularStream = openFile(layout.VernacularName.FileName);
        using var reader = new StreamReader(vernacularStream);
        while (!reader.EndOfStream)
        {
            var line = reader.ReadLine();
            if (string.IsNullOrWhiteSpace(line))
            {
                continue;
            }

            var fields = line.Split('\t');
            var taxonId = layout.VernacularName.Value(fields, "coreid");
            if (string.IsNullOrWhiteSpace(taxonId) || !records.TryGetValue(taxonId, out var record))
            {
                continue;
            }

            var language = layout.VernacularName.Value(fields, "language");
            if (!IsEnglishOrUnknown(language))
            {
                continue;
            }

            var name = layout.VernacularName.Value(fields, "vernacularName");
            if (!string.IsNullOrWhiteSpace(name))
            {
                record.AddAlias(name);
            }
        }
    }

    return records.Values
        .OrderBy(record => record.CanonicalName ?? record.ScientificName, StringComparer.OrdinalIgnoreCase)
        .Select(record => record.ToImportRecord());
}

static Stream OpenArchiveEntry(ZipArchive archive, string fileName)
{
    var entry = archive.GetEntry(fileName)
        ?? archive.Entries.FirstOrDefault(item => item.FullName.Equals(fileName, StringComparison.OrdinalIgnoreCase))
        ?? throw new FileNotFoundException($"Could not find '{fileName}' in GBIF archive.");
    return entry.Open();
}

static DwcaLayout ReadDwcaLayout(Stream metaXmlStream)
{
    using var stream = metaXmlStream;
    var document = XDocument.Load(stream);
    var coreElement = document.Descendants()
        .FirstOrDefault(element => element.Name.LocalName == "core" && HasRowType(element, "Taxon"))
        ?? throw new InvalidDataException("GBIF archive meta.xml does not contain a Taxon core.");

    var extensionElement = document.Descendants()
        .FirstOrDefault(element => element.Name.LocalName == "extension" && HasRowType(element, "VernacularName"));

    return new DwcaLayout(
        ReadDwcaFileLayout(coreElement),
        extensionElement is null ? null : ReadDwcaFileLayout(extensionElement));
}

static DwcaFileLayout ReadDwcaFileLayout(XElement element)
{
    var fileName = element.Descendants()
        .FirstOrDefault(child => child.Name.LocalName == "location")
        ?.Value
        ?? throw new InvalidDataException("Darwin Core Archive file location missing from meta.xml.");

    var fields = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
    foreach (var child in element.Elements())
    {
        var indexText = child.Attribute("index")?.Value;
        if (indexText is null || !int.TryParse(indexText, NumberStyles.Integer, CultureInfo.InvariantCulture, out var index))
        {
            continue;
        }

        if (child.Name.LocalName == "id")
        {
            fields["id"] = index;
            fields["taxonID"] = index;
        }
        else if (child.Name.LocalName == "coreid")
        {
            fields["coreid"] = index;
        }

        var term = child.Attribute("term")?.Value;
        if (term is not null)
        {
            fields[TermName(term)] = index;
        }
    }

    return new DwcaFileLayout(fileName, fields);
}

static bool HasRowType(XElement element, string rowTypeName) =>
    element.Attribute("rowType")?.Value.EndsWith(rowTypeName, StringComparison.OrdinalIgnoreCase) == true;

static string TermName(string term)
{
    var slashIndex = term.LastIndexOf('/');
    var hashIndex = term.LastIndexOf('#');
    var index = Math.Max(slashIndex, hashIndex);
    return index >= 0 ? term[(index + 1)..] : term;
}

static bool EqualsIgnoreCase(string? left, string right) =>
    string.Equals(left, right, StringComparison.OrdinalIgnoreCase);

static bool IsEnglishOrUnknown(string? language) =>
    string.IsNullOrWhiteSpace(language) ||
    EqualsIgnoreCase(language, "en") ||
    EqualsIgnoreCase(language, "eng") ||
    EqualsIgnoreCase(language, "english");

static bool IsSpeciesOrBelowRank(string? rank)
{
    var normalized = rank?.Trim().Replace(" ", "_").Replace("-", "_").ToLowerInvariant();
    return normalized is
        "species" or
        "subspecies" or
        "variety" or
        "subvariety" or
        "form" or
        "forma" or
        "subform" or
        "subforma";
}

static async Task CreateSchemaAsync(SqliteConnection connection)
{
    await ExecuteAsync(connection, """
        CREATE TABLE IF NOT EXISTS PlantInfoRecords (
            Id INTEGER NOT NULL CONSTRAINT PK_PlantInfoRecords PRIMARY KEY AUTOINCREMENT,
            Source TEXT NOT NULL,
            ExternalId TEXT NOT NULL,
            ScientificName TEXT NOT NULL,
            CanonicalName TEXT NULL,
            Authorship TEXT NULL,
            CommonName TEXT NULL,
            AliasesText TEXT NULL,
            Family TEXT NULL,
            Genus TEXT NULL,
            Species TEXT NULL,
            Rank TEXT NULL,
            Status TEXT NULL
        );
        """);

    await ExecuteAsync(connection, "CREATE UNIQUE INDEX IF NOT EXISTS IX_PlantInfoRecords_Source_ExternalId ON PlantInfoRecords (Source, ExternalId);");
    await ExecuteAsync(connection, "CREATE INDEX IF NOT EXISTS IX_PlantInfoRecords_CanonicalName ON PlantInfoRecords (CanonicalName);");
    await ExecuteAsync(connection, "CREATE INDEX IF NOT EXISTS IX_PlantInfoRecords_CommonName ON PlantInfoRecords (CommonName);");
    await ExecuteAsync(connection, "CREATE INDEX IF NOT EXISTS IX_PlantInfoRecords_Family ON PlantInfoRecords (Family);");
    await ExecuteAsync(connection, "CREATE INDEX IF NOT EXISTS IX_PlantInfoRecords_Genus ON PlantInfoRecords (Genus);");

    await ExecuteAsync(connection, """
        CREATE VIRTUAL TABLE IF NOT EXISTS PlantInfoSearch USING fts5(
            CommonName,
            ScientificName,
            CanonicalName,
            AliasesText,
            Family,
            Genus,
            Species,
            content='PlantInfoRecords',
            content_rowid='Id'
        );
        """);

    await ExecuteAsync(connection, """
        CREATE TRIGGER IF NOT EXISTS PlantInfoRecords_ai AFTER INSERT ON PlantInfoRecords BEGIN
            INSERT INTO PlantInfoSearch(rowid, CommonName, ScientificName, CanonicalName, AliasesText, Family, Genus, Species)
            VALUES (new.Id, new.CommonName, new.ScientificName, new.CanonicalName, new.AliasesText, new.Family, new.Genus, new.Species);
        END;
        """);

    await ExecuteAsync(connection, """
        CREATE TRIGGER IF NOT EXISTS PlantInfoRecords_ad AFTER DELETE ON PlantInfoRecords BEGIN
            INSERT INTO PlantInfoSearch(PlantInfoSearch, rowid, CommonName, ScientificName, CanonicalName, AliasesText, Family, Genus, Species)
            VALUES ('delete', old.Id, old.CommonName, old.ScientificName, old.CanonicalName, old.AliasesText, old.Family, old.Genus, old.Species);
        END;
        """);

    await ExecuteAsync(connection, """
        CREATE TRIGGER IF NOT EXISTS PlantInfoRecords_au AFTER UPDATE ON PlantInfoRecords BEGIN
            INSERT INTO PlantInfoSearch(PlantInfoSearch, rowid, CommonName, ScientificName, CanonicalName, AliasesText, Family, Genus, Species)
            VALUES ('delete', old.Id, old.CommonName, old.ScientificName, old.CanonicalName, old.AliasesText, old.Family, old.Genus, old.Species);
            INSERT INTO PlantInfoSearch(rowid, CommonName, ScientificName, CanonicalName, AliasesText, Family, Genus, Species)
            VALUES (new.Id, new.CommonName, new.ScientificName, new.CanonicalName, new.AliasesText, new.Family, new.Genus, new.Species);
        END;
        """);
}

static async Task UpsertRecordAsync(SqliteConnection connection, SqliteTransaction transaction, PlantInfoImportRecord record)
{
    await using var command = connection.CreateCommand();
    command.Transaction = transaction;
    command.CommandText = """
        INSERT INTO PlantInfoRecords (
            Source,
            ExternalId,
            ScientificName,
            CanonicalName,
            Authorship,
            CommonName,
            AliasesText,
            Family,
            Genus,
            Species,
            Rank,
            Status
        )
        VALUES (
            $source,
            $externalId,
            $scientificName,
            $canonicalName,
            $authorship,
            $commonName,
            $aliasesText,
            $family,
            $genus,
            $species,
            $rank,
            $status
        )
        ON CONFLICT(Source, ExternalId) DO UPDATE SET
            ScientificName = excluded.ScientificName,
            CanonicalName = excluded.CanonicalName,
            Authorship = excluded.Authorship,
            CommonName = excluded.CommonName,
            AliasesText = excluded.AliasesText,
            Family = excluded.Family,
            Genus = excluded.Genus,
            Species = excluded.Species,
            Rank = excluded.Rank,
            Status = excluded.Status;
        """;

    command.Parameters.AddWithValue("$source", record.Source);
    command.Parameters.AddWithValue("$externalId", record.ExternalId);
    command.Parameters.AddWithValue("$scientificName", record.ScientificName);
    AddNullableParameter(command, "$canonicalName", record.CanonicalName);
    AddNullableParameter(command, "$authorship", record.Authorship);
    AddNullableParameter(command, "$commonName", record.CommonName);
    AddNullableParameter(command, "$aliasesText", record.AliasesText);
    AddNullableParameter(command, "$family", record.Family);
    AddNullableParameter(command, "$genus", record.Genus);
    AddNullableParameter(command, "$species", record.Species);
    AddNullableParameter(command, "$rank", record.Rank);
    AddNullableParameter(command, "$status", record.Status);

    await command.ExecuteNonQueryAsync();
}

static async Task RebuildSearchAsync(SqliteConnection connection) =>
    await ExecuteAsync(connection, "INSERT INTO PlantInfoSearch(PlantInfoSearch) VALUES ('rebuild');");

static async Task<string?> SearchFirstCanonicalNameAsync(SqliteConnection connection, string query)
{
    await using var command = connection.CreateCommand();
    command.CommandText = """
        SELECT r.CanonicalName
        FROM PlantInfoSearch search
        JOIN PlantInfoRecords r ON r.Id = search.rowid
        WHERE PlantInfoSearch MATCH $query
        ORDER BY bm25(PlantInfoSearch)
        LIMIT 1;
        """;
    command.Parameters.AddWithValue("$query", ToFtsQuery(query));

    var result = await command.ExecuteScalarAsync();
    return result is null or DBNull ? null : (string)result;
}

static async Task<long> CountRecordsAsync(SqliteConnection connection)
{
    await using var command = connection.CreateCommand();
    command.CommandText = "SELECT COUNT(*) FROM PlantInfoRecords;";
    var result = await command.ExecuteScalarAsync();
    return Convert.ToInt64(result, CultureInfo.InvariantCulture);
}

static async Task<long> CountGbifRecordsAsync(SqliteConnection connection)
{
    await using var command = connection.CreateCommand();
    command.CommandText = "SELECT COUNT(*) FROM PlantInfoRecords WHERE Source = 'gbif';";
    var result = await command.ExecuteScalarAsync();
    return Convert.ToInt64(result, CultureInfo.InvariantCulture);
}

static async Task ExecuteAsync(SqliteConnection connection, string sql)
{
    await using var command = connection.CreateCommand();
    command.CommandText = sql;
    await command.ExecuteNonQueryAsync();
}

static void AddNullableParameter(SqliteCommand command, string name, string? value) =>
    command.Parameters.AddWithValue(name, string.IsNullOrWhiteSpace(value) ? DBNull.Value : value);

static string? EmptyToNull(string? value) => string.IsNullOrWhiteSpace(value) ? null : value;

static string ToFtsQuery(string query) =>
    string.Join(
        " ",
        query.Trim()
            .ToLowerInvariant()
            .Replace('-', ' ')
            .Replace('\'', ' ')
            .Split(' ', StringSplitOptions.RemoveEmptyEntries)
            .Where(term => term.Length > 1)
            .Select(term => $"{term}*"));

static Dictionary<string, string> ParseOptions(string[] args)
{
    var options = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
    for (var i = 0; i < args.Length; i++)
    {
        var option = args[i];
        if (!option.StartsWith("--", StringComparison.Ordinal))
        {
            throw new ArgumentException($"Expected option name, got '{option}'.");
        }

        if (i + 1 >= args.Length || args[i + 1].StartsWith("--", StringComparison.Ordinal))
        {
            throw new ArgumentException($"Missing value for option '{option}'.");
        }

        options[option[2..]] = args[++i];
    }

    return options;
}

static int UsageError(string message)
{
    Console.Error.WriteLine(message);
    PrintUsage();
    return 1;
}

static void PrintUsage()
{
    Console.WriteLine("""
        Usage:
          dotnet run --project plant-manager-importer -- build-db --source <gbif-zip-or-directory> --output <db-path>
          dotnet run --project plant-manager-importer -- verify --database <db-path>
        """);
}

internal sealed record PlantInfoImportRecord(
    string Source,
    string ExternalId,
    string ScientificName,
    string? CanonicalName,
    string? Authorship,
    string? CommonName,
    string? AliasesText,
    string? Family,
    string? Genus,
    string? Species,
    string? Rank,
    string? Status);

internal sealed record VerifyCheck(string Query);

internal sealed record DwcaLayout(DwcaFileLayout Taxon, DwcaFileLayout? VernacularName);

internal sealed record DwcaFileLayout(string FileName, IReadOnlyDictionary<string, int> Fields)
{
    public string? Value(string[] values, string fieldName) =>
        Fields.TryGetValue(fieldName, out var index) && index < values.Length
            ? values[index]
            : null;
}

internal sealed class GbifRecordBuilder(
    string externalId,
    string scientificName,
    string? canonicalName,
    string? authorship,
    string? family,
    string? genus,
    string? species,
    string? rank,
    string? status)
{
    private readonly SortedSet<string> aliases = new(StringComparer.OrdinalIgnoreCase);

    public string ScientificName { get; } = scientificName;
    public string? CanonicalName { get; } = canonicalName;

    public void AddAlias(string alias)
    {
        if (!string.IsNullOrWhiteSpace(alias))
        {
            aliases.Add(alias.Trim());
        }
    }

    public PlantInfoImportRecord ToImportRecord() =>
        new(
            "gbif",
            externalId,
            ScientificName,
            CanonicalName,
            authorship,
            aliases.FirstOrDefault(),
            aliases.Count == 0 ? null : string.Join('\n', aliases),
            family,
            genus,
            species,
            rank,
            status);
}
