using plant_manager.Data.Models;

namespace plant_manager
{
    public record CreatePlantRequest(
        string Nickname,
        int TaxonId,
        string? Location,
        DateOnly? LastWateredOn,
        int? WaterEveryDays);

    public record UpdatePlantRequest(
        string Nickname,
        int TaxonId,
        string? Location,
        DateOnly? LastWateredOn,
        int? WaterEveryDays);

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

    public record CreateActionLogRequest(
        int PlantId,
        string Action,
        string? Notes,
        DateOnly? PerformedOn);

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
        DateOnly? LastWateredOn,
        string LastWatered,
        string NextCare,
        int WaterEveryDays,
        string Status)
    {
        public static PlantDto FromPlant(Plant plant)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var nextCare = PlantCareFormatter.GetNextCareDate(plant);

            return new PlantDto(
                plant.Id,
                plant.Nickname,
                plant.TaxonId,
                $"{plant.Taxon.Genus} {plant.Taxon.Species}",
                plant.Location,
                plant.LastWateredOn,
                PlantCareFormatter.FormatRelativeDate(plant.LastWateredOn, today, "Never"),
                PlantCareFormatter.FormatRelativeDate(nextCare, today, "Unscheduled"),
                plant.WaterEveryDays,
                PlantCareFormatter.GetStatus(nextCare, today));
        }
    }

    public record CareTaskDto(
        int Id,
        int PlantId,
        string PlantName,
        string Action,
        string Due,
        string Status)
    {
        public static CareTaskDto FromPlant(Plant plant, DateOnly today)
        {
            var nextCare = PlantCareFormatter.GetNextCareDate(plant);

            return new CareTaskDto(
                plant.Id,
                plant.Id,
                plant.Nickname,
                "Water",
                PlantCareFormatter.FormatRelativeDate(nextCare, today, "Unscheduled"),
                PlantCareFormatter.GetStatus(nextCare, today));
        }
    }

    public record ActionLogDto(
        int Id,
        int PlantId,
        string PlantName,
        string Action,
        string? Notes,
        DateOnly PerformedOn)
    {
        public static ActionLogDto FromActionLog(ActionLog log) =>
            new(log.Id, log.PlantId, log.Plant.Nickname, log.Action, log.Notes, log.PerformedOn);
    }

    internal static class PlantCareFormatter
    {
        public static DateOnly? GetNextCareDate(Plant plant) =>
            plant.LastWateredOn?.AddDays(plant.WaterEveryDays);

        public static string GetStatus(DateOnly? date, DateOnly today)
        {
            if (date is null)
            {
                return "due";
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
