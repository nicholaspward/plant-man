using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;
using plant_manager.Data;

namespace plant_manager.Endpoints
{
    public static class ExportEndpoints
    {
        private const string SpreadsheetContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

        public static void MapExportEndpoints(this WebApplication app)
        {
            app.MapGet("/api/export/spreadsheet", async (ApplicationDbContext db) =>
            {
                using var workbook = new XLWorkbook();

                await AddPlantsSheet(workbook, db);
                await AddCareSchedulesSheet(workbook, db);
                await AddActionLogsSheet(workbook, db);
                await AddFlagsSheet(workbook, db);
                await AddFlagDefinitionsSheet(workbook, db);
                await AddGroupsSheet(workbook, db);
                await AddTaxaSheet(workbook, db);
                await AddLocationsSheet(workbook, db);
                await AddActivitiesSheet(workbook, db);
                await AddResourcesSheet(workbook, db);
                await AddRecipesSheet(workbook, db);

                using var stream = new MemoryStream();
                workbook.SaveAs(stream);

                var fileName = $"plant-man-export-{DateTime.UtcNow:yyyyMMdd-HHmm}.xlsx";
                return Results.File(stream.ToArray(), SpreadsheetContentType, fileName);
            });
        }

        private static async Task AddPlantsSheet(XLWorkbook workbook, ApplicationDbContext db)
        {
            var plants = await db.Plants
                .Include(plant => plant.Taxon)
                .Include(plant => plant.Location)
                .Include(plant => plant.Flags)
                .ThenInclude(flag => flag.Definition)
                .Include(plant => plant.GroupMemberships)
                .ThenInclude(membership => membership.PlantGroup)
                .Include(plant => plant.CareSchedules)
                .ThenInclude(schedule => schedule.CareActivity)
                .Include(plant => plant.ActionLogs)
                .AsSplitQuery()
                .OrderBy(plant => plant.Nickname)
                .ToListAsync();
            var rows = plants
                .Select(plant => new object?[]
                {
                    plant.Id,
                    plant.Nickname,
                    FormatDate(plant.Birthday),
                    plant.Taxon == null ? "" : plant.Taxon.Name,
                    plant.Taxon == null ? "" : $"{plant.Taxon.Genus} {plant.Taxon.Species}",
                    plant.Location == null ? "" : plant.Location.Name,
                    string.Join(", ", plant.GroupMemberships
                        .OrderBy(membership => membership.PlantGroup.Name)
                        .Select(membership => membership.PlantGroup.Name)),
                    string.Join(", ", plant.Flags
                        .Where(flag => flag.ResolvedOn == null)
                        .OrderBy(flag => flag.Definition.Name)
                        .Select(flag => flag.Definition.Name)),
                    plant.CareSchedules.Count,
                    plant.ActionLogs.Count
                })
                .ToList();

            AddSheet(workbook, "Plants", [
                "ID",
                "Name",
                "Birthday",
                "Taxon",
                "Scientific Name",
                "Location",
                "Groups",
                "Active Flags",
                "Care Schedules",
                "Action Logs"
            ], rows);
        }

        private static async Task AddCareSchedulesSheet(XLWorkbook workbook, ApplicationDbContext db)
        {
            var schedules = await db.PlantCareSchedules
                .Include(schedule => schedule.Plant)
                .Include(schedule => schedule.CareActivity)
                .Include(schedule => schedule.CareAction)
                .OrderBy(schedule => schedule.Plant.Nickname)
                .ThenBy(schedule => schedule.CareActivity.Name)
                .ToListAsync();
            var rows = schedules
                .Select(schedule => new object?[]
                {
                    schedule.Id,
                    schedule.PlantId,
                    schedule.Plant.Nickname,
                    schedule.CareActivity.Name,
                    schedule.CareAction.Name,
                    schedule.EveryDays,
                    FormatDate(schedule.ScheduledFor),
                    schedule.RecurrenceMode,
                    schedule.RepeatEvery,
                    schedule.RepeatUnit,
                    schedule.RepeatOnDays ?? "",
                    schedule.EndsMode,
                    FormatDate(schedule.EndsOn),
                    schedule.EndsAfterOccurrences
                })
                .ToList();

            AddSheet(workbook, "Care Schedules", [
                "ID",
                "Plant ID",
                "Plant",
                "Activity",
                "Primary Action",
                "Every Days",
                "Scheduled For",
                "Recurrence Mode",
                "Repeat Every",
                "Repeat Unit",
                "Repeat On Days",
                "Ends Mode",
                "Ends On",
                "Ends After Occurrences"
            ], rows);
        }

        private static async Task AddActionLogsSheet(XLWorkbook workbook, ApplicationDbContext db)
        {
            var logs = await db.ActionLogs
                .Include(log => log.Plant)
                .Include(log => log.CareActivity)
                .Include(log => log.CareAction)
                .Include(log => log.Resources)
                .ThenInclude(resource => resource.ActionResource)
                .OrderByDescending(log => log.PerformedOn)
                .ThenBy(log => log.Plant.Nickname)
                .ToListAsync();
            var rows = logs
                .Select(log => new object?[]
                {
                    log.Id,
                    log.PlantId,
                    log.Plant.Nickname,
                    FormatDate(log.PerformedOn),
                    log.CareActivity.Name,
                    log.CareAction.Name,
                    log.ActionNameSnapshot,
                    string.Join(", ", log.Resources
                        .OrderBy(resource => resource.ActionResource.Name)
                        .Select(resource => FormatQuantity(resource.ActionResource.Name, resource.Quantity, resource.Unit))),
                    log.Notes ?? ""
                })
                .ToList();

            AddSheet(workbook, "Action Logs", [
                "ID",
                "Plant ID",
                "Plant",
                "Performed On",
                "Activity",
                "Primary Action",
                "Action Snapshot",
                "Resources",
                "Notes"
            ], rows);
        }

        private static async Task AddFlagsSheet(XLWorkbook workbook, ApplicationDbContext db)
        {
            var flags = await db.PlantFlags
                .Include(flag => flag.Plant)
                .Include(flag => flag.Definition)
                .OrderBy(flag => flag.ResolvedOn != null)
                .ThenBy(flag => flag.Plant.Nickname)
                .ThenBy(flag => flag.Definition.Name)
                .ToListAsync();
            var rows = flags
                .Select(flag => new object?[]
                {
                    flag.Id,
                    flag.PlantId,
                    flag.Plant.Nickname,
                    flag.Definition.Name,
                    flag.Definition.Color,
                    FormatDate(flag.StartedOn),
                    FormatDate(flag.ResolvedOn),
                    flag.Notes ?? ""
                })
                .ToList();

            AddSheet(workbook, "Flags", [
                "ID",
                "Plant ID",
                "Plant",
                "Flag",
                "Color",
                "Started On",
                "Resolved On",
                "Notes"
            ], rows);
        }

        private static async Task AddFlagDefinitionsSheet(XLWorkbook workbook, ApplicationDbContext db)
        {
            var rows = await db.PlantFlagDefinitions
                .OrderBy(definition => definition.Name)
                .Select(definition => new object?[]
                {
                    definition.Id,
                    definition.Name,
                    definition.Color
                })
                .ToListAsync();

            AddSheet(workbook, "Flag Definitions", [
                "ID",
                "Name",
                "Color"
            ], rows);
        }

        private static async Task AddGroupsSheet(XLWorkbook workbook, ApplicationDbContext db)
        {
            var groups = await db.PlantGroups
                .Include(group => group.Memberships)
                .ThenInclude(membership => membership.Plant)
                .OrderBy(group => group.Name)
                .ToListAsync();
            var rows = groups
                .Select(group => new object?[]
                {
                    group.Id,
                    group.Name,
                    group.Memberships.Count,
                    string.Join(", ", group.Memberships
                        .OrderBy(membership => membership.Plant.Nickname)
                        .Select(membership => membership.Plant.Nickname)),
                    group.Notes ?? ""
                })
                .ToList();

            AddSheet(workbook, "Groups", [
                "ID",
                "Name",
                "Plant Count",
                "Plants",
                "Notes"
            ], rows);
        }

        private static async Task AddTaxaSheet(XLWorkbook workbook, ApplicationDbContext db)
        {
            var rows = await db.PlantTaxa
                .OrderBy(taxon => taxon.Name)
                .Select(taxon => new object?[]
                {
                    taxon.Id,
                    taxon.Name,
                    taxon.Genus,
                    taxon.Species,
                    taxon.Cultivar ?? "",
                    taxon.Variety ?? "",
                    taxon.Authority ?? "",
                    taxon.Family ?? "",
                    taxon.CommonName ?? "",
                    taxon.ExternalSource ?? "",
                    taxon.ExternalId ?? ""
                })
                .ToListAsync();

            AddSheet(workbook, "Taxa", [
                "ID",
                "Name",
                "Genus",
                "Species",
                "Cultivar",
                "Variety",
                "Authority",
                "Family",
                "Common Name",
                "External Source",
                "External ID"
            ], rows);
        }

        private static async Task AddLocationsSheet(XLWorkbook workbook, ApplicationDbContext db)
        {
            var locations = await db.PlantLocations
                .Include(location => location.Plants)
                .OrderBy(location => location.Name)
                .ToListAsync();
            var rows = locations
                .Select(location => new object?[]
                {
                    location.Id,
                    location.Name,
                    location.Plants.Count,
                    location.Notes ?? ""
                })
                .ToList();

            AddSheet(workbook, "Locations", [
                "ID",
                "Name",
                "Plant Count",
                "Notes"
            ], rows);
        }

        private static async Task AddActivitiesSheet(XLWorkbook workbook, ApplicationDbContext db)
        {
            var activities = await db.CareActivities
                .Include(activity => activity.Actions)
                .ThenInclude(action => action.CareAction)
                .Include(activity => activity.Actions)
                .ThenInclude(action => action.Resources)
                .ThenInclude(resource => resource.ActionResource)
                .AsSplitQuery()
                .OrderBy(activity => activity.Name)
                .ToListAsync();
            var rows = activities
                .Select(activity => new object?[]
                {
                    activity.Id,
                    activity.Name,
                    string.Join(", ", activity.Actions
                        .OrderBy(action => action.SortOrder)
                        .Select(action => action.CareAction.Name)),
                    string.Join(", ", activity.Actions
                        .SelectMany(action => action.Resources)
                        .OrderBy(resource => resource.ActionResource.Name)
                        .Select(resource => FormatQuantity(resource.ActionResource.Name, resource.Quantity, resource.Unit))),
                    activity.Notes ?? ""
                })
                .ToList();

            AddSheet(workbook, "Activities", [
                "ID",
                "Name",
                "Actions",
                "Resources",
                "Notes"
            ], rows);
        }

        private static async Task AddResourcesSheet(XLWorkbook workbook, ApplicationDbContext db)
        {
            var rows = await db.ActionResources
                .Include(resource => resource.ProducedByRecipe)
                .OrderBy(resource => resource.Name)
                .Select(resource => new object?[]
                {
                    resource.Id,
                    resource.Name,
                    resource.ProducedByRecipe == null ? "" : resource.ProducedByRecipe.Name,
                    resource.Notes ?? ""
                })
                .ToListAsync();

            AddSheet(workbook, "Resources", [
                "ID",
                "Name",
                "Produced By Recipe",
                "Notes"
            ], rows);
        }

        private static async Task AddRecipesSheet(XLWorkbook workbook, ApplicationDbContext db)
        {
            var recipes = await db.Recipes
                .Include(recipe => recipe.OutputResource)
                .Include(recipe => recipe.Components)
                .ThenInclude(component => component.ActionResource)
                .OrderBy(recipe => recipe.Name)
                .ToListAsync();
            var rows = recipes
                .Select(recipe => new object?[]
                {
                    recipe.Id,
                    recipe.Name,
                    recipe.MeasurementMode,
                    recipe.OutputResource == null ? "" : recipe.OutputResource.Name,
                    string.Join(", ", recipe.Components
                        .OrderBy(component => component.SortOrder)
                        .Select(component => FormatQuantity(component.ActionResource.Name, component.Quantity, component.Unit))),
                    recipe.Notes ?? ""
                })
                .ToList();

            AddSheet(workbook, "Recipes", [
                "ID",
                "Name",
                "Measurement Mode",
                "Output Resource",
                "Components",
                "Notes"
            ], rows);
        }

        private static void AddSheet(
            XLWorkbook workbook,
            string name,
            IReadOnlyList<string> headers,
            IReadOnlyList<object?[]> rows)
        {
            var worksheet = workbook.Worksheets.Add(name);
            for (var column = 0; column < headers.Count; column++)
            {
                worksheet.Cell(1, column + 1).Value = headers[column];
            }

            for (var row = 0; row < rows.Count; row++)
            {
                for (var column = 0; column < headers.Count; column++)
                {
                    var value = column < rows[row].Length ? rows[row][column] : null;
                    worksheet.Cell(row + 2, column + 1).Value = XLCellValue.FromObject(value ?? "");
                }
            }

            var usedRange = worksheet.Range(1, 1, Math.Max(rows.Count + 1, 1), headers.Count);
            usedRange.SetAutoFilter();
            worksheet.SheetView.FreezeRows(1);

            var headerRange = worksheet.Range(1, 1, 1, headers.Count);
            headerRange.Style.Font.Bold = true;
            headerRange.Style.Fill.BackgroundColor = XLColor.FromHtml("#DBE7D2");

            worksheet.Columns().AdjustToContents();
        }

        private static string FormatDate(DateOnly? date) =>
            date?.ToString("yyyy-MM-dd") ?? "";

        private static string FormatQuantity(string name, decimal? quantity, string? unit)
        {
            if (quantity is null)
            {
                return name;
            }

            var suffix = string.IsNullOrWhiteSpace(unit) ? "" : $" {unit}";
            return $"{name} ({quantity:0.##}{suffix})";
        }
    }
}
