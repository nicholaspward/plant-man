using plant_manager.Data.Models;

namespace plant_manager
{
    public record CreatePlantRequest(
        string Nickname,
        DateOnly? Birthday,
        int? TaxonId,
        int? LocationId,
        IReadOnlyList<SavePlantCareScheduleRequest>? CareSchedules);

    public record UpdatePlantRequest(
        string Nickname,
        DateOnly? Birthday,
        int? TaxonId,
        int? LocationId,
        IReadOnlyList<SavePlantCareScheduleRequest>? CareSchedules);

    public record SavePlantCareScheduleRequest(
        int CareActivityId,
        int? EveryDays,
        DateOnly? ScheduledFor,
        string? RecurrenceMode,
        int? RepeatEvery,
        string? RepeatUnit,
        string? RepeatOnDays,
        string? EndsMode,
        DateOnly? EndsOn,
        int? EndsAfterOccurrences);

    public record BulkSavePlantCareScheduleRequest(
        IReadOnlyList<int> PlantIds,
        int CareActivityId,
        int? EveryDays,
        DateOnly? ScheduledFor,
        string? RecurrenceMode,
        int? RepeatEvery,
        string? RepeatUnit,
        string? RepeatOnDays,
        string? EndsMode,
        DateOnly? EndsOn,
        int? EndsAfterOccurrences);

    public record SavePlantTaxonRequest(
        string Name,
        string Genus,
        string Species,
        string? Cultivar,
        string? Variety,
        string? Authority,
        string? Family,
        string? CommonName,
        string? ExternalSource,
        string? ExternalId);

    public record ImportPlantTaxonRequest(
        string Source,
        string ExternalId,
        string ScientificName,
        string? CanonicalName,
        string? CommonName,
        string? Rank,
        string? Status,
        string? Family,
        string? Genus,
        string? Species);

    public record SavePlantLocationRequest(
        string Name,
        string? Notes);

    public record SavePlantGroupRequest(
        string Name,
        IReadOnlyList<int>? PlantIds,
        string? Notes);

    public record SaveCareActionRequest(
        string Name,
        string? Description);

    public record SaveActionResourceRequest(
        string Name,
        string? Notes);

    public record SaveCareActivityRequest(
        string Name,
        IReadOnlyList<SaveCareActivityActionRequest> Actions,
        string? Notes);

    public record SaveCareActivityActionRequest(
        int CareActionId,
        IReadOnlyList<SaveCareActivityActionResourceRequest>? Resources);

    public record SaveCareActivityActionResourceRequest(
        int ActionResourceId,
        decimal? Quantity,
        string? Unit,
        string? Notes);

    public record SaveRecipeRequest(
        string Name,
        string Type,
        string? MeasurementMode,
        string? OutputResourceName,
        IReadOnlyList<SaveRecipeComponentRequest>? Components,
        string? Notes);

    public record SaveRecipeComponentRequest(
        int ActionResourceId,
        decimal? Quantity,
        string? Unit,
        string? Notes);

    public record CareActivityActionResourceDto(
        int ActionResourceId,
        string Name,
        decimal? Quantity,
        string? Unit,
        string? Notes)
    {
        public static CareActivityActionResourceDto FromCareActivityActionResource(
            CareActivityActionResource resource) =>
            new(
                resource.ActionResourceId,
                resource.ActionResource.Name,
                resource.Quantity,
                resource.Unit,
                resource.Notes);
    }

    public record CareActivityActionDto(
        int CareActionId,
        string Name,
        string? Description,
        int SortOrder,
        IReadOnlyList<CareActivityActionResourceDto> Resources)
    {
        public static CareActivityActionDto FromCareActivityAction(CareActivityAction activityAction) =>
            new(
                activityAction.CareActionId,
                activityAction.CareAction.Name,
                activityAction.CareAction.Description,
                activityAction.SortOrder,
                activityAction.Resources
                    .OrderBy(resource => resource.ActionResource.Name)
                    .Select(CareActivityActionResourceDto.FromCareActivityActionResource)
                    .ToList());
    }

    public record SavePlantFlagDefinitionRequest(
        string Name,
        string? Color);

    public record AssignPlantFlagRequest(
        int PlantFlagDefinitionId,
        DateOnly? StartedOn,
        string? Notes);

    public record UpdatePlantFlagRequest(
        DateOnly? StartedOn,
        DateOnly? ResolvedOn,
        string? Notes);

    public record CreateActionLogRequest(
        int PlantId,
        int CareActivityId,
        string? Notes,
        DateOnly? PerformedOn,
        IReadOnlyList<ActionLogResourceRequest>? Resources);

    public record UpdateActionLogRequest(
        int PlantId,
        int CareActivityId,
        string? Notes,
        DateOnly PerformedOn,
        IReadOnlyList<ActionLogResourceRequest>? Resources);

    public record ActionLogResourceRequest(
        int ActionResourceId,
        decimal? Quantity,
        string? Unit);

    public record BulkCompleteCareTasksRequest(
        int CareActivityId,
        IReadOnlyList<int> PlantIds,
        DateOnly? PerformedOn,
        string? Notes,
        IReadOnlyList<ActionLogResourceRequest>? Resources);

    public record CatalogImportIssue(
        string Sheet,
        int Row,
        string Field,
        string Message,
        string Severity);

    public record CatalogImportSheetSummary(
        string Sheet,
        int Rows,
        int Creates,
        int Updates,
        int Skips);

    public record CatalogImportResult(
        bool Applied,
        bool CanApply,
        int Created,
        int Updated,
        int Skipped,
        IReadOnlyList<CatalogImportSheetSummary> Sheets,
        IReadOnlyList<CatalogImportIssue> Issues);

    public record PlantTaxonDto(
        int Id,
        string Name,
        string Genus,
        string Species,
        string? Cultivar,
        string? Variety,
        string? Authority,
        string? Family,
        string? CommonName,
        string? ExternalSource,
        string? ExternalId)
    {
        public static PlantTaxonDto FromTaxon(PlantTaxon taxon) =>
            new(
                taxon.Id,
                taxon.Name,
                taxon.Genus,
                taxon.Species,
                taxon.Cultivar,
                taxon.Variety,
                taxon.Authority,
                taxon.Family,
                taxon.CommonName,
                taxon.ExternalSource,
                taxon.ExternalId);
    }

    public record PlantLocationDto(
        int Id,
        string Name,
        string? Notes)
    {
        public static PlantLocationDto FromLocation(PlantLocation location) =>
            new(location.Id, location.Name, location.Notes);
    }

    public record PlantGroupSummaryDto(
        int Id,
        string Name)
    {
        public static PlantGroupSummaryDto FromMembership(PlantGroupMembership membership) =>
            new(membership.PlantGroupId, membership.PlantGroup.Name);
    }

    public record PlantGroupMemberDto(
        int Id,
        string Nickname)
    {
        public static PlantGroupMemberDto FromMembership(PlantGroupMembership membership) =>
            new(membership.PlantId, membership.Plant.Nickname);
    }

    public record PlantGroupDto(
        int Id,
        string Name,
        IReadOnlyList<PlantGroupMemberDto> Plants,
        string? Notes)
    {
        public static PlantGroupDto FromGroup(PlantGroup group) =>
            new(
                group.Id,
                group.Name,
                group.Memberships
                    .OrderBy(membership => membership.Plant.Nickname)
                    .Select(PlantGroupMemberDto.FromMembership)
                    .ToList(),
                group.Notes);
    }

    public record CareActionDto(
        int Id,
        string Name,
        string? Description)
    {
        public static CareActionDto FromCareAction(CareAction action) =>
            new(action.Id, action.Name, action.Description);
    }

    public record ActionResourceDto(
        int Id,
        string Name,
        string? Notes,
        RecipeSummaryDto? ProducedByRecipe)
    {
        public static ActionResourceDto FromActionResource(ActionResource resource) =>
            new(
                resource.Id,
                resource.Name,
                resource.Notes,
                resource.ProducedByRecipe is null
                    ? null
                    : RecipeSummaryDto.FromRecipe(resource.ProducedByRecipe));
    }

    public record ActionResourceSummaryDto(
        int Id,
        string Name)
    {
        public static ActionResourceSummaryDto FromActionResource(ActionResource resource) =>
            new(resource.Id, resource.Name);
    }

    public record RecipeSummaryDto(
        int Id,
        string Name,
        string Type,
        string MeasurementMode)
    {
        public static RecipeSummaryDto FromRecipe(Recipe recipe) =>
            new(recipe.Id, recipe.Name, recipe.Type, recipe.MeasurementMode);
    }

    public record CareActivityDto(
        int Id,
        string Name,
        int CareActionId,
        string Action,
        IReadOnlyList<CareActivityActionDto> Actions,
        string? Notes)
    {
        public static CareActivityDto FromCareActivity(CareActivity activity) =>
            new(
                activity.Id,
                activity.Name,
                activity.PrimaryAction()?.Id ?? 0,
                activity.PrimaryAction()?.Name ?? activity.Name,
                activity.Actions
                    .OrderBy(action => action.SortOrder)
                    .Select(CareActivityActionDto.FromCareActivityAction)
                    .ToList(),
                activity.Notes);
    }

    public record RecipeComponentDto(
        int ActionResourceId,
        string Name,
        decimal? Quantity,
        string? Unit,
        string? Notes,
        int SortOrder)
    {
        public static RecipeComponentDto FromRecipeComponent(RecipeComponent component) =>
            new(
                component.ActionResourceId,
                component.ActionResource.Name,
                component.Quantity,
                component.Unit,
                component.Notes,
                component.SortOrder);
    }

    public record RecipeDto(
        int Id,
        string Name,
        string Type,
        string MeasurementMode,
        ActionResourceSummaryDto? OutputResource,
        IReadOnlyList<RecipeComponentDto> Components,
        string? Notes)
    {
        public static RecipeDto FromRecipe(Recipe recipe) =>
            new(
                recipe.Id,
                recipe.Name,
                recipe.Type,
                recipe.MeasurementMode,
                recipe.OutputResource is null
                    ? null
                    : ActionResourceSummaryDto.FromActionResource(recipe.OutputResource),
                recipe.Components
                    .OrderBy(component => component.SortOrder)
                    .Select(RecipeComponentDto.FromRecipeComponent)
                    .ToList(),
                recipe.Notes);
    }

    public record PlantDto(
        int Id,
        string Nickname,
        DateOnly? Birthday,
        int? TaxonId,
        string Taxon,
        int? LocationId,
        string Location,
        string NextCare,
        string Status,
        IReadOnlyList<PlantFlagDto> Flags,
        IReadOnlyList<PlantGroupSummaryDto> Groups,
        IReadOnlyList<ActionLogDto> ActionLogs,
        IReadOnlyList<PlantCareScheduleDto> CareSchedules)
    {
        public static PlantDto FromPlant(Plant plant)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var schedules = plant.CareSchedules
                .OrderBy(schedule => schedule.CareActivity.Name)
                .Select(schedule => PlantCareScheduleDto.FromSchedule(
                    schedule,
                    GetLatestPerformedOn(plant, schedule.CareActivityId),
                    today))
                .ToList();
            var nextCare = schedules
                .Select(schedule =>
                {
                    var source = plant.CareSchedules.First(item => item.Id == schedule.Id);
                    return PlantCareFormatter.GetNextCareDate(
                        source,
                        schedule.LastPerformedOn,
                        plant.ActionLogs.Count(log => log.CareActivityId == source.CareActivityId));
                })
                .Where(date => date is not null)
                .OrderBy(date => date)
                .FirstOrDefault();

            return new PlantDto(
                plant.Id,
                plant.Nickname,
                plant.Birthday,
                plant.TaxonId,
                plant.Taxon is null ? "Unassigned" : $"{plant.Taxon.Genus} {plant.Taxon.Species}",
                plant.LocationId,
                plant.Location?.Name ?? "Unassigned",
                PlantCareFormatter.FormatRelativeDate(nextCare, today, "Unscheduled"),
                PlantCareFormatter.GetStatus(nextCare, today),
                plant.Flags
                    .OrderBy(flag => flag.ResolvedOn is not null)
                    .ThenByDescending(flag => flag.StartedOn)
                    .ThenBy(flag => flag.Definition.Name)
                    .Select(PlantFlagDto.FromPlantFlag)
                    .ToList(),
                plant.GroupMemberships
                    .OrderBy(membership => membership.PlantGroup.Name)
                    .Select(PlantGroupSummaryDto.FromMembership)
                    .ToList(),
                plant.ActionLogs
                    .OrderByDescending(log => log.PerformedOn)
                    .ThenByDescending(log => log.Id)
                    .Select(ActionLogDto.FromActionLog)
                    .ToList(),
                schedules);
        }

        private static DateOnly? GetLatestPerformedOn(Plant plant, int careActivityId) =>
            plant.ActionLogs
                .Where(log => log.CareActivityId == careActivityId)
                .Select(log => (DateOnly?)log.PerformedOn)
                .Max();
    }

    public record PlantCareScheduleDto(
        int Id,
        int CareActivityId,
        int CareActionId,
        string Action,
        int EveryDays,
        DateOnly? ScheduledFor,
        string RecurrenceMode,
        int RepeatEvery,
        string RepeatUnit,
        string? RepeatOnDays,
        string EndsMode,
        DateOnly? EndsOn,
        int? EndsAfterOccurrences,
        DateOnly? LastPerformedOn,
        string LastPerformed,
        string NextCare,
        string Status)
    {
        public static PlantCareScheduleDto FromSchedule(
            PlantCareSchedule schedule,
            DateOnly? lastPerformedOn,
            DateOnly today)
        {
            var nextCare = PlantCareFormatter.GetNextCareDate(schedule, lastPerformedOn, GetCompletedOccurrences(schedule));

            return new PlantCareScheduleDto(
                schedule.Id,
                schedule.CareActivityId,
                schedule.CareActionId,
                schedule.CareActivity.Name,
                schedule.EveryDays,
                schedule.ScheduledFor,
                schedule.RecurrenceMode,
                schedule.RepeatEvery,
                schedule.RepeatUnit,
                schedule.RepeatOnDays,
                schedule.EndsMode,
                schedule.EndsOn,
                schedule.EndsAfterOccurrences,
                lastPerformedOn,
                PlantCareFormatter.FormatRelativeDate(lastPerformedOn, today, "Never"),
                PlantCareFormatter.FormatRelativeDate(nextCare, today, "Unscheduled"),
                PlantCareFormatter.GetStatus(nextCare, today));
        }

        private static int GetCompletedOccurrences(PlantCareSchedule schedule) =>
            schedule.Plant.ActionLogs.Count(log => log.CareActivityId == schedule.CareActivityId);
    }

    internal static class CareActivityExtensions
    {
        public static CareAction? PrimaryAction(this CareActivity activity) =>
            activity.Actions
                .OrderBy(action => action.SortOrder)
                .Select(action => action.CareAction)
                .FirstOrDefault();

        public static int PrimaryActionId(this CareActivity activity) =>
            activity.Actions
                .OrderBy(action => action.SortOrder)
                .Select(action => action.CareActionId)
                .FirstOrDefault();
    }

    public record CareTaskDto(
        int Id,
        int PlantId,
        string PlantName,
        int CareActivityId,
        int CareActionId,
        string Action,
        string? DueDate,
        string Due,
        string Status)
    {
        public static CareTaskDto FromSchedule(
            PlantCareSchedule schedule,
            DateOnly? lastPerformedOn,
            int completedOccurrences,
            DateOnly today)
        {
            var nextCare = PlantCareFormatter.GetNextCareDate(schedule, lastPerformedOn, completedOccurrences);

            return new CareTaskDto(
                schedule.Id,
                schedule.PlantId,
                schedule.Plant.Nickname,
                schedule.CareActivityId,
                schedule.CareActionId,
                schedule.CareActivity.Name,
                nextCare?.ToString("yyyy-MM-dd"),
                PlantCareFormatter.FormatRelativeDate(nextCare, today, "Unscheduled"),
                PlantCareFormatter.GetStatus(nextCare, today));
        }
    }

    public record PlantFlagDefinitionDto(
        int Id,
        string Name,
        string Color)
    {
        public static PlantFlagDefinitionDto FromDefinition(PlantFlagDefinition definition) =>
            new(
                definition.Id,
                definition.Name,
                definition.Color);
    }

    public record PlantFlagDto(
        int Id,
        int PlantFlagDefinitionId,
        string Name,
        string Color,
        DateOnly StartedOn,
        DateOnly? ResolvedOn,
        string? Notes)
    {
        public static PlantFlagDto FromPlantFlag(PlantFlag flag) =>
            new(
                flag.Id,
                flag.PlantFlagDefinitionId,
                flag.Definition.Name,
                flag.Definition.Color,
                flag.StartedOn,
                flag.ResolvedOn,
                flag.Notes);
    }

    public record ActionLogDto(
        int Id,
        int PlantId,
        string PlantName,
        int CareActivityId,
        int CareActionId,
        string Action,
        string? Notes,
        DateOnly PerformedOn,
        IReadOnlyList<ActionLogResourceDto> Resources)
    {
        public static ActionLogDto FromActionLog(ActionLog log) =>
            new(
                log.Id,
                log.PlantId,
                log.Plant.Nickname,
                log.CareActivityId,
                log.CareActionId,
                log.ActionNameSnapshot,
                log.Notes,
                log.PerformedOn,
                log.Resources
                    .Select(resource => ActionLogResourceDto.FromActionLogResource(resource))
                    .ToList());
    }

    public record ActionLogResourceDto(
        int ActionResourceId,
        string Name,
        decimal? Quantity,
        string? Unit)
    {
        public static ActionLogResourceDto FromActionLogResource(ActionLogResource resource) =>
            new(
                resource.ActionResourceId,
                resource.ActionResource.Name,
                resource.Quantity,
                resource.Unit);
    }

    internal static class PlantCareFormatter
    {
        public static DateOnly? GetNextCareDate(
            PlantCareSchedule schedule,
            DateOnly? lastPerformedOn,
            int completedOccurrences = 0)
        {
            if (schedule.EndsMode == "after" && schedule.EndsAfterOccurrences is not null && completedOccurrences >= schedule.EndsAfterOccurrences)
            {
                return null;
            }

            DateOnly? nextCare;
            if (schedule.RecurrenceMode == "none")
            {
                nextCare = schedule.ScheduledFor is not null && (lastPerformedOn is null || schedule.ScheduledFor > lastPerformedOn)
                    ? schedule.ScheduledFor
                    : null;
            }
            else if (lastPerformedOn is null)
            {
                nextCare = schedule.ScheduledFor;
            }
            else
            {
                nextCare = AddInterval(lastPerformedOn.Value, schedule);
            }

            if (nextCare is not null && schedule.EndsMode == "on" && schedule.EndsOn is not null && nextCare > schedule.EndsOn)
            {
                return null;
            }

            return nextCare;
        }

        private static DateOnly AddInterval(DateOnly date, PlantCareSchedule schedule)
        {
            var repeatEvery = Math.Clamp(schedule.RepeatEvery, 1, 365);
            var unit = schedule.RecurrenceMode == "custom" ? schedule.RepeatUnit : schedule.RecurrenceMode;

            return unit switch
            {
                "day" or "daily" => date.AddDays(repeatEvery),
                "week" when !string.IsNullOrWhiteSpace(schedule.RepeatOnDays) => GetNextSelectedWeekday(date, schedule.RepeatOnDays, repeatEvery),
                "week" or "weekly" => date.AddDays(repeatEvery * 7),
                "month" or "monthly" => date.AddMonths(repeatEvery),
                "year" or "yearly" => date.AddYears(repeatEvery),
                _ => date.AddDays(Math.Clamp(schedule.EveryDays, 1, 365))
            };
        }

        private static DateOnly GetNextSelectedWeekday(DateOnly date, string repeatOnDays, int repeatEvery)
        {
            var selectedDays = repeatOnDays
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Select(ParseDayOfWeek)
                .OfType<DayOfWeek>()
                .ToHashSet();
            if (selectedDays.Count == 0)
            {
                return date.AddDays(repeatEvery * 7);
            }

            var maxDays = Math.Max(7, repeatEvery * 7);
            for (var offset = 1; offset <= maxDays; offset++)
            {
                var candidate = date.AddDays(offset);
                if (selectedDays.Contains(candidate.DayOfWeek))
                {
                    return candidate;
                }
            }

            return date.AddDays(repeatEvery * 7);
        }

        private static DayOfWeek? ParseDayOfWeek(string value) =>
            value.ToUpperInvariant() switch
            {
                "SU" => DayOfWeek.Sunday,
                "MO" => DayOfWeek.Monday,
                "TU" => DayOfWeek.Tuesday,
                "WE" => DayOfWeek.Wednesday,
                "TH" => DayOfWeek.Thursday,
                "FR" => DayOfWeek.Friday,
                "SA" => DayOfWeek.Saturday,
                _ => null
            };

        public static string GetStatus(DateOnly? date, DateOnly today)
        {
            if (date is null)
            {
                return "unscheduled";
            }

            if (date <= today)
            {
                return "due";
            }

            return date <= today.AddDays(2) ? "soon" : "ok";
        }

        public static string FormatRelativeDate(DateOnly? date, DateOnly today, string fallback)
        {
            if (date is null)
            {
                return fallback;
            }

            var days = date.Value.DayNumber - today.DayNumber;

            return days switch
            {
                0 => "Today",
                1 => "Tomorrow",
                -1 => "Yesterday",
                > 1 => $"In {days} days",
                < -1 => $"{Math.Abs(days)} days ago",
            };
        }
    }
}
