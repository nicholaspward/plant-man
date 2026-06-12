using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;
using plant_manager.Data;
using plant_manager.Data.Models;

namespace plant_manager.Endpoints
{
    public static class ImportEndpoints
    {
        private const string CareActionsSheet = "Actions";
        private const string ResourcesSheet = "Resources";
        private const string LocationsSheet = "Locations";
        private const string FlagsSheet = "Flags";
        private const string FlagDefinitionsSheet = "Flag Definitions";
        private const string TaxaSheet = "Taxa";

        public static void MapImportEndpoints(this WebApplication app)
        {
            app.MapPost("/api/import/catalog/preview", async (IFormFile file, ApplicationDbContext db) =>
            {
                if (file.Length == 0)
                {
                    return EndpointHelpers.BadRequest("Choose a spreadsheet to import.");
                }

                try
                {
                    var result = await ImportCatalog(file, db, apply: false);
                    return Results.Ok(result);
                }
                catch (Exception)
                {
                    return EndpointHelpers.BadRequest("Could not read the spreadsheet.");
                }
            }).DisableAntiforgery();

            app.MapPost("/api/import/catalog/apply", async (IFormFile file, ApplicationDbContext db) =>
            {
                if (file.Length == 0)
                {
                    return EndpointHelpers.BadRequest("Choose a spreadsheet to import.");
                }

                try
                {
                    var result = await ImportCatalog(file, db, apply: true);
                    return Results.Ok(result);
                }
                catch (Exception)
                {
                    return EndpointHelpers.BadRequest("Could not read the spreadsheet.");
                }
            }).DisableAntiforgery();
        }

        private static async Task<CatalogImportResult> ImportCatalog(IFormFile file, ApplicationDbContext db, bool apply)
        {
            using var workbook = new XLWorkbook(file.OpenReadStream());
            var context = new ImportContext();

            await ImportCareActions(workbook, db, context, apply);
            await ImportResources(workbook, db, context, apply);
            await ImportLocations(workbook, db, context, apply);
            if (TryGetWorksheet(workbook, FlagDefinitionsSheet, out _))
            {
                await ImportFlags(workbook, db, context, apply, FlagDefinitionsSheet, "Name");
            }
            else
            {
                await ImportFlags(workbook, db, context, apply, FlagsSheet, "Flag");
            }
            await ImportTaxa(workbook, db, context, apply);

            if (context.Sheets.Count == 0)
            {
                context.Issues.Add(new CatalogImportIssue(
                    "Workbook",
                    0,
                    "Sheets",
                    "No supported catalog sheets were found.",
                    "error"));
            }

            var canApply = context.Issues.All(issue => issue.Severity != "error");
            if (apply && canApply)
            {
                await db.SaveChangesAsync();
            }

            return new CatalogImportResult(
                Applied: apply && canApply,
                CanApply: canApply,
                Created: context.Sheets.Sum(sheet => sheet.Creates),
                Updated: context.Sheets.Sum(sheet => sheet.Updates),
                Skipped: context.Sheets.Sum(sheet => sheet.Skips),
                Sheets: context.Sheets,
                Issues: context.Issues);
        }

        private static async Task ImportCareActions(
            XLWorkbook workbook,
            ApplicationDbContext db,
            ImportContext context,
            bool apply)
        {
            if (!TryGetWorksheet(workbook, CareActionsSheet, out var worksheet))
            {
                return;
            }

            var rows = ReadRows(worksheet, CareActionsSheet, context, requiredHeaders: ["Name"]);
            var existing = await db.CareActions.ToListAsync();
            var byName = existing.ToDictionary(action => Key(action.Name), StringComparer.OrdinalIgnoreCase);
            var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var summary = new MutableSummary(CareActionsSheet);

            foreach (var row in rows)
            {
                var name = Required(row, "Name", context);
                if (name is null)
                {
                    summary.Skips++;
                    continue;
                }

                var key = Key(name);
                if (!seen.Add(key))
                {
                    Duplicate(row, "Name", context);
                    summary.Skips++;
                    continue;
                }

                var description = Optional(row, "Description");
                if (byName.TryGetValue(key, out var action))
                {
                    summary.Updates++;
                    if (apply)
                    {
                        action.Name = name;
                        action.Description = description;
                    }
                }
                else
                {
                    summary.Creates++;
                    if (apply)
                    {
                        db.CareActions.Add(new CareAction
                        {
                            Name = name,
                            Description = description
                        });
                    }
                }
            }

            AddSummary(context, summary);
        }

        private static async Task ImportResources(
            XLWorkbook workbook,
            ApplicationDbContext db,
            ImportContext context,
            bool apply)
        {
            if (!TryGetWorksheet(workbook, ResourcesSheet, out var worksheet))
            {
                return;
            }

            var rows = ReadRows(worksheet, ResourcesSheet, context, requiredHeaders: ["Name"]);
            var existing = await db.ActionResources.ToListAsync();
            var byName = existing.ToDictionary(resource => Key(resource.Name), StringComparer.OrdinalIgnoreCase);
            var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var summary = new MutableSummary(ResourcesSheet);

            foreach (var row in rows)
            {
                var name = Required(row, "Name", context);
                if (name is null)
                {
                    summary.Skips++;
                    continue;
                }

                var key = Key(name);
                if (!seen.Add(key))
                {
                    Duplicate(row, "Name", context);
                    summary.Skips++;
                    continue;
                }

                var notes = Optional(row, "Notes");
                if (byName.TryGetValue(key, out var resource))
                {
                    summary.Updates++;
                    if (apply)
                    {
                        resource.Name = name;
                        resource.Notes = notes;
                    }
                }
                else
                {
                    summary.Creates++;
                    if (apply)
                    {
                        db.ActionResources.Add(new ActionResource
                        {
                            Name = name,
                            Notes = notes
                        });
                    }
                }
            }

            AddSummary(context, summary);
        }

        private static async Task ImportLocations(
            XLWorkbook workbook,
            ApplicationDbContext db,
            ImportContext context,
            bool apply)
        {
            if (!TryGetWorksheet(workbook, LocationsSheet, out var worksheet))
            {
                return;
            }

            var rows = ReadRows(worksheet, LocationsSheet, context, requiredHeaders: ["Name"]);
            var existing = await db.PlantLocations.ToListAsync();
            var byName = existing.ToDictionary(location => Key(location.Name), StringComparer.OrdinalIgnoreCase);
            var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var summary = new MutableSummary(LocationsSheet);

            foreach (var row in rows)
            {
                var name = Required(row, "Name", context);
                if (name is null)
                {
                    summary.Skips++;
                    continue;
                }

                var key = Key(name);
                if (!seen.Add(key))
                {
                    Duplicate(row, "Name", context);
                    summary.Skips++;
                    continue;
                }

                var notes = Optional(row, "Notes");
                if (byName.TryGetValue(key, out var location))
                {
                    summary.Updates++;
                    if (apply)
                    {
                        location.Name = name;
                        location.Notes = notes;
                    }
                }
                else
                {
                    summary.Creates++;
                    if (apply)
                    {
                        db.PlantLocations.Add(new PlantLocation
                        {
                            Name = name,
                            Notes = notes
                        });
                    }
                }
            }

            AddSummary(context, summary);
        }

        private static async Task ImportFlags(
            XLWorkbook workbook,
            ApplicationDbContext db,
            ImportContext context,
            bool apply,
            string sheetName,
            string nameHeader)
        {
            if (!TryGetWorksheet(workbook, sheetName, out var worksheet))
            {
                return;
            }

            var rows = ReadRows(worksheet, sheetName, context, requiredHeaders: [nameHeader]);
            var existing = await db.PlantFlagDefinitions.ToListAsync();
            var byName = existing.ToDictionary(definition => Key(definition.Name), StringComparer.OrdinalIgnoreCase);
            var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var summary = new MutableSummary(sheetName);

            foreach (var row in rows)
            {
                var name = Required(row, nameHeader, context);
                if (name is null)
                {
                    summary.Skips++;
                    continue;
                }

                var key = Key(name);
                if (!seen.Add(key))
                {
                    Duplicate(row, nameHeader, context);
                    summary.Skips++;
                    continue;
                }

                var color = Optional(row, "Color") ?? "#f2f2f2";
                if (byName.TryGetValue(key, out var definition))
                {
                    summary.Updates++;
                    if (apply)
                    {
                        definition.Name = name;
                        definition.Color = color;
                    }
                }
                else
                {
                    summary.Creates++;
                    if (apply)
                    {
                        db.PlantFlagDefinitions.Add(new PlantFlagDefinition
                        {
                            Name = name,
                            Color = color
                        });
                    }
                }
            }

            AddSummary(context, summary);
        }

        private static async Task ImportTaxa(
            XLWorkbook workbook,
            ApplicationDbContext db,
            ImportContext context,
            bool apply)
        {
            if (!TryGetWorksheet(workbook, TaxaSheet, out var worksheet))
            {
                return;
            }

            var rows = ReadRows(worksheet, TaxaSheet, context, requiredHeaders: ["Name", "Genus", "Species"]);
            var existing = await db.PlantTaxa.ToListAsync();
            var byName = existing.ToDictionary(taxon => Key(taxon.Name), StringComparer.OrdinalIgnoreCase);
            var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var summary = new MutableSummary(TaxaSheet);

            foreach (var row in rows)
            {
                var name = Required(row, "Name", context);
                var genus = Required(row, "Genus", context);
                var species = Required(row, "Species", context);
                if (name is null || genus is null || species is null)
                {
                    summary.Skips++;
                    continue;
                }

                var key = Key(name);
                if (!seen.Add(key))
                {
                    Duplicate(row, "Name", context);
                    summary.Skips++;
                    continue;
                }

                var cultivar = Optional(row, "Cultivar");
                var variety = Optional(row, "Variety");
                var authority = Optional(row, "Authority");
                var family = Optional(row, "Family");
                var commonName = Optional(row, "Common Name", "CommonName");
                var externalSource = Optional(row, "External Source", "Source");
                var externalId = Optional(row, "External ID", "External Id", "GBIF ID");

                if (byName.TryGetValue(key, out var taxon))
                {
                    summary.Updates++;
                    if (apply)
                    {
                        taxon.Name = name;
                        taxon.Genus = genus;
                        taxon.Species = species;
                        taxon.Cultivar = cultivar;
                        taxon.Variety = variety;
                        taxon.Authority = authority;
                        taxon.Family = family;
                        taxon.CommonName = commonName;
                        taxon.ExternalSource = externalSource;
                        taxon.ExternalId = externalId;
                    }
                }
                else
                {
                    summary.Creates++;
                    if (apply)
                    {
                        db.PlantTaxa.Add(new PlantTaxon
                        {
                            Name = name,
                            Genus = genus,
                            Species = species,
                            Cultivar = cultivar,
                            Variety = variety,
                            Authority = authority,
                            Family = family,
                            CommonName = commonName,
                            ExternalSource = externalSource,
                            ExternalId = externalId
                        });
                    }
                }
            }

            AddSummary(context, summary);
        }

        private static IReadOnlyList<ImportRow> ReadRows(
            IXLWorksheet worksheet,
            string sheetName,
            ImportContext context,
            IReadOnlyList<string> requiredHeaders)
        {
            var headerRow = worksheet.FirstRowUsed();
            if (headerRow is null)
            {
                return [];
            }

            var columns = headerRow.CellsUsed()
                .Select(cell => new
                {
                    Header = NormalizeHeader(cell.GetString()),
                    Column = cell.Address.ColumnNumber
                })
                .Where(header => header.Header.Length > 0)
                .GroupBy(header => header.Header)
                .ToDictionary(group => group.Key, group => group.First().Column);

            foreach (var requiredHeader in requiredHeaders)
            {
                if (!columns.ContainsKey(NormalizeHeader(requiredHeader)))
                {
                    context.Issues.Add(new CatalogImportIssue(
                        sheetName,
                        headerRow.RowNumber(),
                        requiredHeader,
                        $"Missing required column '{requiredHeader}'.",
                        "error"));
                }
            }

            var rows = new List<ImportRow>();
            var lastRow = worksheet.LastRowUsed()?.RowNumber() ?? headerRow.RowNumber();
            for (var rowNumber = headerRow.RowNumber() + 1; rowNumber <= lastRow; rowNumber++)
            {
                var row = worksheet.Row(rowNumber);
                if (row.Cells().All(cell => string.IsNullOrWhiteSpace(cell.GetFormattedString())))
                {
                    continue;
                }

                rows.Add(new ImportRow(sheetName, rowNumber, row, columns));
            }

            return rows;
        }

        private static string? Required(ImportRow row, string field, ImportContext context)
        {
            var value = Optional(row, field);
            if (value is not null)
            {
                return value;
            }

            context.Issues.Add(new CatalogImportIssue(
                row.Sheet,
                row.RowNumber,
                field,
                $"{field} is required.",
                "error"));
            return null;
        }

        private static string? Optional(ImportRow row, params string[] fields)
        {
            foreach (var field in fields)
            {
                if (!row.Columns.TryGetValue(NormalizeHeader(field), out var column))
                {
                    continue;
                }

                var value = row.Row.Cell(column).GetFormattedString().Trim();
                if (!string.IsNullOrWhiteSpace(value))
                {
                    return value;
                }
            }

            return null;
        }

        private static void Duplicate(ImportRow row, string field, ImportContext context)
        {
            context.Issues.Add(new CatalogImportIssue(
                row.Sheet,
                row.RowNumber,
                field,
                $"Duplicate {field.ToLowerInvariant()} in this spreadsheet.",
                "error"));
        }

        private static bool TryGetWorksheet(XLWorkbook workbook, string sheetName, out IXLWorksheet worksheet) =>
            workbook.Worksheets.TryGetWorksheet(sheetName, out worksheet!);

        private static string Key(string value) =>
            value.Trim();

        private static string NormalizeHeader(string header) =>
            new(header
                .Where(char.IsLetterOrDigit)
                .Select(char.ToLowerInvariant)
                .ToArray());

        private static void AddSummary(ImportContext context, MutableSummary summary)
        {
            context.Sheets.Add(new CatalogImportSheetSummary(
                summary.Sheet,
                summary.Creates + summary.Updates + summary.Skips,
                summary.Creates,
                summary.Updates,
                summary.Skips));
        }

        private sealed class ImportContext
        {
            public List<CatalogImportSheetSummary> Sheets { get; } = [];
            public List<CatalogImportIssue> Issues { get; } = [];
        }

        private sealed record ImportRow(
            string Sheet,
            int RowNumber,
            IXLRow Row,
            IReadOnlyDictionary<string, int> Columns);

        private sealed class MutableSummary(string sheet)
        {
            public string Sheet { get; } = sheet;
            public int Creates { get; set; }
            public int Updates { get; set; }
            public int Skips { get; set; }
        }
    }
}
