using plant_manager.Data.Models;

namespace plant_manager
{
    public record CreatePlantRequest(
        string Nickname,
        int TaxonId,
        string? Location,
        IReadOnlyList<SavePlantCareScheduleRequest>? CareSchedules);

    public record UpdatePlantRequest(
        string Nickname,
        int TaxonId,
        string? Location,
        IReadOnlyList<SavePlantCareScheduleRequest>? CareSchedules);

    public record SavePlantCareScheduleRequest(
        int CareActionId,
        int? EveryDays,
        bool IsEnabled);

    public record SavePlantTaxonRequest(
        string Name,
        string Genus,
        string Species,
        string? Cultivar,
        string? Variety,
        string? Authority);

    public record SaveCareActionRequest(
        string Name,
        string? Description,
        bool IsEnabled);

    public record SaveActionResourceRequest(
        string Name,
        string? Category,
        string? Notes,
        bool IsEnabled);

    public record SavePlantFlagDefinitionRequest(
        string Name,
        string? Category,
        string? Color,
        bool IsEnabled);

    public record AssignPlantFlagRequest(
        int PlantFlagDefinitionId,
        string? Severity,
        DateOnly? StartedOn,
        string? Notes);

    public record UpdatePlantFlagRequest(
        string? Severity,
        DateOnly? StartedOn,
        DateOnly? ResolvedOn,
        string? Notes);

    public record CreateActionLogRequest(
        int PlantId,
        int CareActionId,
        string? Notes,
        DateOnly? PerformedOn,
        IReadOnlyList<ActionLogResourceRequest>? Resources);

    public record UpdateActionLogRequest(
        int PlantId,
        int CareActionId,
        string? Notes,
        DateOnly PerformedOn,
        IReadOnlyList<ActionLogResourceRequest>? Resources);

    public record ActionLogResourceRequest(
        int ActionResourceId,
        decimal? Quantity,
        string? Unit);

    public record PlantTaxonDto(
        int Id,
        string Name,
        string Genus,
        string Species,
        string? Cultivar,
        string? Variety,
        string? Authority)
    {
        public static PlantTaxonDto FromTaxon(PlantTaxon taxon) =>
            new(
                taxon.Id,
                taxon.Name,
                taxon.Genus,
                taxon.Species,
                taxon.Cultivar,
                taxon.Variety,
                taxon.Authority);
    }

    public record CareActionDto(
        int Id,
        string Name,
        string? Description,
        bool IsEnabled)
    {
        public static CareActionDto FromCareAction(CareAction action) =>
            new(action.Id, action.Name, action.Description, action.IsEnabled);
    }

    public record ActionResourceDto(
        int Id,
        string Name,
        string? Category,
        string? Notes,
        bool IsEnabled)
    {
        public static ActionResourceDto FromActionResource(ActionResource resource) =>
            new(resource.Id, resource.Name, resource.Category, resource.Notes, resource.IsEnabled);
    }

    public record PlantDto(
        int Id,
        string Nickname,
        int TaxonId,
        string Taxon,
        string Location,
        string NextCare,
        string Status,
        IReadOnlyList<PlantFlagDto> Flags,
        IReadOnlyList<PlantCareScheduleDto> CareSchedules)
    {
        public static PlantDto FromPlant(Plant plant)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var schedules = plant.CareSchedules
                .OrderBy(schedule => schedule.CareAction.Name)
                .Select(schedule => PlantCareScheduleDto.FromSchedule(
                    schedule,
                    GetLatestPerformedOn(plant, schedule.CareActionId),
                    today))
                .ToList();
            var nextCare = schedules
                .Where(schedule => schedule.IsEnabled)
                .Select(schedule => PlantCareFormatter.GetNextCareDate(schedule.LastPerformedOn, schedule.EveryDays))
                .Where(date => date is not null)
                .OrderBy(date => date)
                .FirstOrDefault();

            return new PlantDto(
                plant.Id,
                plant.Nickname,
                plant.TaxonId,
                $"{plant.Taxon.Genus} {plant.Taxon.Species}",
                plant.Location,
                PlantCareFormatter.FormatRelativeDate(nextCare, today, "Unscheduled"),
                PlantCareFormatter.GetStatus(nextCare, today),
                plant.Flags
                    .OrderBy(flag => flag.ResolvedOn is not null)
                    .ThenByDescending(flag => flag.StartedOn)
                    .ThenBy(flag => flag.Definition.Name)
                    .Select(PlantFlagDto.FromPlantFlag)
                    .ToList(),
                schedules);
        }

        private static DateOnly? GetLatestPerformedOn(Plant plant, int careActionId) =>
            plant.ActionLogs
                .Where(log => log.CareActionId == careActionId)
                .Select(log => (DateOnly?)log.PerformedOn)
                .Max();
    }

    public record PlantCareScheduleDto(
        int Id,
        int CareActionId,
        string Action,
        int EveryDays,
        DateOnly? LastPerformedOn,
        string LastPerformed,
        string NextCare,
        string Status,
        bool IsEnabled)
    {
        public static PlantCareScheduleDto FromSchedule(
            PlantCareSchedule schedule,
            DateOnly? lastPerformedOn,
            DateOnly today)
        {
            var nextCare = PlantCareFormatter.GetNextCareDate(lastPerformedOn, schedule.EveryDays);

            return new PlantCareScheduleDto(
                schedule.Id,
                schedule.CareActionId,
                schedule.CareAction.Name,
                schedule.EveryDays,
                lastPerformedOn,
                PlantCareFormatter.FormatRelativeDate(lastPerformedOn, today, "Never"),
                PlantCareFormatter.FormatRelativeDate(nextCare, today, "Unscheduled"),
                PlantCareFormatter.GetStatus(nextCare, today),
                schedule.IsEnabled);
        }
    }

    public record CareTaskDto(
        int Id,
        int PlantId,
        string PlantName,
        int CareActionId,
        string Action,
        string Due,
        string Status)
    {
        public static CareTaskDto FromSchedule(
            PlantCareSchedule schedule,
            DateOnly? lastPerformedOn,
            DateOnly today)
        {
            var nextCare = PlantCareFormatter.GetNextCareDate(lastPerformedOn, schedule.EveryDays);

            return new CareTaskDto(
                schedule.Id,
                schedule.PlantId,
                schedule.Plant.Nickname,
                schedule.CareActionId,
                schedule.CareAction.Name,
                PlantCareFormatter.FormatRelativeDate(nextCare, today, "Unscheduled"),
                PlantCareFormatter.GetStatus(nextCare, today));
        }
    }

    public record PlantFlagDefinitionDto(
        int Id,
        string Name,
        string Category,
        string Color,
        bool IsEnabled)
    {
        public static PlantFlagDefinitionDto FromDefinition(PlantFlagDefinition definition) =>
            new(
                definition.Id,
                definition.Name,
                definition.Category,
                definition.Color,
                definition.IsEnabled);
    }

    public record PlantFlagDto(
        int Id,
        int PlantFlagDefinitionId,
        string Name,
        string Category,
        string Color,
        string Severity,
        DateOnly StartedOn,
        DateOnly? ResolvedOn,
        string? Notes)
    {
        public static PlantFlagDto FromPlantFlag(PlantFlag flag) =>
            new(
                flag.Id,
                flag.PlantFlagDefinitionId,
                flag.Definition.Name,
                flag.Definition.Category,
                flag.Definition.Color,
                flag.Severity,
                flag.StartedOn,
                flag.ResolvedOn,
                flag.Notes);
    }

    public record ActionLogDto(
        int Id,
        int PlantId,
        string PlantName,
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
        string? Category,
        decimal? Quantity,
        string? Unit)
    {
        public static ActionLogResourceDto FromActionLogResource(ActionLogResource resource) =>
            new(
                resource.ActionResourceId,
                resource.ActionResource.Name,
                resource.ActionResource.Category,
                resource.Quantity,
                resource.Unit);
    }

    internal static class PlantCareFormatter
    {
        public static DateOnly? GetNextCareDate(DateOnly? lastPerformedOn, int everyDays) =>
            lastPerformedOn?.AddDays(everyDays);

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
