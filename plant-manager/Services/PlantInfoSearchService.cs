using System.Data;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using plant_manager.Data;

namespace plant_manager.Services
{
    public class PlantInfoSearchService(PlantInfoDbContext db)
    {
        public async Task<IReadOnlyList<PlantInfoSearchResultDto>> SearchAsync(
            string query,
            CancellationToken cancellationToken)
        {
            var normalizedText = NormalizeSearchText(query);
            var ftsQuery = ToFtsQuery(normalizedText);
            if (ftsQuery is null)
            {
                return [];
            }

            var connection = db.Database.GetDbConnection();
            if (connection.State != ConnectionState.Open)
            {
                await connection.OpenAsync(cancellationToken);
            }

            await using var command = connection.CreateCommand();
            command.CommandText = """
                SELECT
                    r.Source,
                    r.ExternalId,
                    r.ScientificName,
                    r.CanonicalName,
                    r.CommonName,
                    r.Rank,
                    r.Status,
                    r.Family,
                    r.Genus,
                    r.Species,
                    r.AliasesText,
                    CASE
                        WHEN lower(coalesce(r.CommonName, '')) = $normalized THEN 0
                        WHEN lower(coalesce(r.CanonicalName, '')) = $normalized THEN 1
                        WHEN lower(coalesce(r.CommonName, '')) LIKE $prefix THEN 2
                        WHEN lower(coalesce(r.CanonicalName, '')) LIKE $prefix THEN 3
                        WHEN lower(coalesce(r.ScientificName, '')) LIKE $prefix THEN 4
                        WHEN lower(coalesce(r.Genus, '')) = $normalized THEN 5
                        WHEN lower(coalesce(r.Genus, '')) LIKE $prefix THEN 6
                        WHEN lower(coalesce(r.Family, '')) = $normalized THEN 7
                        ELSE 20
                    END AS RankBucket
                FROM PlantInfoSearch search
                JOIN PlantInfoRecords r ON r.Id = search.rowid
                WHERE PlantInfoSearch MATCH $query
                ORDER BY
                    RankBucket,
                    CASE WHEN RankBucket < 20 THEN r.CanonicalName END,
                    CASE WHEN RankBucket = 20 THEN bm25(PlantInfoSearch) END,
                    r.CanonicalName
                LIMIT 20;
                """;

            var queryParameter = command.CreateParameter();
            queryParameter.ParameterName = "$query";
            queryParameter.Value = ftsQuery;
            command.Parameters.Add(queryParameter);

            var normalizedParameter = command.CreateParameter();
            normalizedParameter.ParameterName = "$normalized";
            normalizedParameter.Value = normalizedText;
            command.Parameters.Add(normalizedParameter);

            var prefixParameter = command.CreateParameter();
            prefixParameter.ParameterName = "$prefix";
            prefixParameter.Value = $"{normalizedText}%";
            command.Parameters.Add(prefixParameter);

            var results = new List<PlantInfoSearchResultDto>();
            await using var reader = await command.ExecuteReaderAsync(cancellationToken);
            while (await reader.ReadAsync(cancellationToken))
            {
                results.Add(new PlantInfoSearchResultDto(
                    reader.GetString(0),
                    reader.GetString(1),
                    reader.GetString(2),
                    ReadNullableString(reader, 3),
                    ReadNullableString(reader, 4),
                    ReadNullableString(reader, 5),
                    ReadNullableString(reader, 6),
                    ReadNullableString(reader, 7),
                    ReadNullableString(reader, 8),
                    ReadNullableString(reader, 9),
                    ToCommonNames(ReadNullableString(reader, 10))));
            }

            return results;
        }

        public static string NormalizeSearchText(string value)
        {
            var normalized = value.Trim().ToLowerInvariant();
            normalized = Regex.Replace(normalized, @"[-'’`]", " ");
            normalized = Regex.Replace(normalized, @"[^\p{L}\p{N}\s]", " ");
            return Regex.Replace(normalized, @"\s+", " ").Trim();
        }

        private static string? ToFtsQuery(string normalized)
        {
            if (normalized.Length < 2)
            {
                return null;
            }

            var terms = normalized
                .Split(' ', StringSplitOptions.RemoveEmptyEntries)
                .Where(term => term.Length > 1)
                .Select(term => $"{term}*")
                .ToList();

            return terms.Count == 0 ? null : string.Join(" ", terms);
        }

        private static string? ReadNullableString(IDataRecord reader, int ordinal) =>
            reader.IsDBNull(ordinal) ? null : reader.GetString(ordinal);

        private static IReadOnlyList<string> ToCommonNames(string? aliasesText)
        {
            if (string.IsNullOrWhiteSpace(aliasesText))
            {
                return [];
            }

            return aliasesText
                .Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .Order(StringComparer.OrdinalIgnoreCase)
                .ToList();
        }
    }

    public record PlantInfoSearchResultDto(
        string Source,
        string ExternalId,
        string ScientificName,
        string? CanonicalName,
        string? CommonName,
        string? Rank,
        string? Status,
        string? Family,
        string? Genus,
        string? Species,
        IReadOnlyList<string> CommonNames);
}
