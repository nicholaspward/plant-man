using Microsoft.EntityFrameworkCore;
using plant_manager.Data;
using plant_manager.Data.Models;

namespace plant_manager.Endpoints
{
    public static class PlantCareScheduleEndpoints
    {
        public static void MapPlantCareScheduleEndpoints(this WebApplication app)
        {
            app.MapPost("/api/plant-care-schedules/bulk", async (
                BulkSavePlantCareScheduleRequest request,
                ApplicationDbContext db) =>
            {
                var plantIds = request.PlantIds
                    .Where(id => id > 0)
                    .Distinct()
                    .ToList();
                if (plantIds.Count == 0)
                {
                    return Results.BadRequest(new { error = "At least one plant is required." });
                }

                var activity = await db.CareActivities
                    .Include(item => item.Actions)
                    .ThenInclude(action => action.CareAction)
                    .FirstOrDefaultAsync(item => item.Id == request.CareActivityId);
                if (activity is null)
                {
                    return Results.BadRequest(new { error = "Care activity was not found." });
                }

                var primaryAction = activity.PrimaryAction();
                if (!activity.IsEnabled || primaryAction is null || activity.Actions.Any(action => !action.CareAction.IsEnabled))
                {
                    return Results.BadRequest(new { error = "Disabled activities cannot be scheduled." });
                }

                var plants = await db.Plants
                    .Include(plant => plant.CareSchedules)
                    .Where(plant => plantIds.Contains(plant.Id))
                    .ToListAsync();
                if (plants.Count != plantIds.Count)
                {
                    return Results.BadRequest(new { error = "One or more plants were not found." });
                }

                var recurrence = NormalizeRecurrence(
                    request.RecurrenceMode,
                    request.RepeatEvery,
                    request.RepeatUnit,
                    request.RepeatOnDays,
                    request.EndsMode,
                    request.EndsOn,
                    request.EndsAfterOccurrences,
                    request.ScheduledFor,
                    request.EveryDays);
                foreach (var plant in plants)
                {
                    var schedule = plant.CareSchedules
                        .FirstOrDefault(item => item.CareActivityId == activity.Id);
                    if (schedule is null)
                    {
                        schedule = new PlantCareSchedule
                        {
                            PlantId = plant.Id,
                            CareActionId = primaryAction.Id,
                            CareActivityId = activity.Id
                        };
                        plant.CareSchedules.Add(schedule);
                    }

                    schedule.CareActionId = primaryAction.Id;
                    schedule.CareActivityId = activity.Id;
                    ApplyRecurrence(schedule, recurrence);
                    schedule.IsEnabled = request.IsEnabled;
                }

                await db.SaveChangesAsync();

                return Results.Ok(new { updated = plants.Count });
            });

            app.MapPost("/api/plant-care-schedules/bulk-remove", async (
                BulkSavePlantCareScheduleRequest request,
                ApplicationDbContext db) =>
            {
                var plantIds = request.PlantIds
                    .Where(id => id > 0)
                    .Distinct()
                    .ToList();
                if (plantIds.Count == 0)
                {
                    return Results.BadRequest(new { error = "At least one plant is required." });
                }

                if (request.CareActivityId <= 0)
                {
                    return Results.BadRequest(new { error = "Care activity is required." });
                }

                var schedules = await db.PlantCareSchedules
                    .Where(schedule =>
                        schedule.CareActivityId == request.CareActivityId
                        && plantIds.Contains(schedule.PlantId))
                    .ToListAsync();

                db.PlantCareSchedules.RemoveRange(schedules);
                await db.SaveChangesAsync();

                return Results.Ok(new { removed = schedules.Count });
            });
        }

        internal static ScheduleRecurrence NormalizeRecurrence(
            string? recurrenceMode,
            int? repeatEvery,
            string? repeatUnit,
            string? repeatOnDays,
            string? endsMode,
            DateOnly? endsOn,
            int? endsAfterOccurrences,
            DateOnly? scheduledFor,
            int? everyDays)
        {
            var mode = NormalizeOption(recurrenceMode, new HashSet<string> { "none", "daily", "weekly", "monthly", "yearly", "custom" }, scheduledFor is null ? "weekly" : "none");
            var unit = NormalizeOption(repeatUnit, new HashSet<string> { "day", "week", "month", "year" }, mode switch
            {
                "daily" => "day",
                "weekly" => "week",
                "monthly" => "month",
                "yearly" => "year",
                _ => "week"
            });
            var every = mode switch
            {
                "daily" or "weekly" or "monthly" or "yearly" => 1,
                "none" => 1,
                _ => Math.Clamp(repeatEvery ?? 1, 1, 365)
            };
            var normalizedEndsMode = mode == "none"
                ? "after"
                : NormalizeOption(endsMode, new HashSet<string> { "on", "after" }, "after");
            var normalizedEveryDays = mode switch
            {
                "none" => Math.Clamp(everyDays ?? 7, 1, 365),
                "daily" => 1,
                "weekly" => 7,
                "monthly" => 30,
                "yearly" => 365,
                "custom" => unit switch
                {
                    "day" => every,
                    "week" => every * 7,
                    "month" => every * 30,
                    "year" => every * 365,
                    _ => Math.Clamp(everyDays ?? 7, 1, 365)
                },
                _ => Math.Clamp(everyDays ?? 7, 1, 365)
            };

            return new ScheduleRecurrence(
                normalizedEveryDays,
                scheduledFor,
                mode,
                every,
                unit,
                string.IsNullOrWhiteSpace(repeatOnDays) ? null : repeatOnDays.Trim(),
                normalizedEndsMode,
                normalizedEndsMode == "on" ? endsOn : null,
                normalizedEndsMode == "after" ? Math.Clamp(mode == "none" ? 1 : endsAfterOccurrences ?? 12, 1, 999) : null);
        }

        internal static void ApplyRecurrence(PlantCareSchedule schedule, ScheduleRecurrence recurrence)
        {
            schedule.EveryDays = recurrence.EveryDays;
            schedule.ScheduledFor = recurrence.ScheduledFor;
            schedule.RecurrenceMode = recurrence.RecurrenceMode;
            schedule.RepeatEvery = recurrence.RepeatEvery;
            schedule.RepeatUnit = recurrence.RepeatUnit;
            schedule.RepeatOnDays = recurrence.RepeatOnDays;
            schedule.EndsMode = recurrence.EndsMode;
            schedule.EndsOn = recurrence.EndsOn;
            schedule.EndsAfterOccurrences = recurrence.EndsAfterOccurrences;
        }

        private static string NormalizeOption(string? value, IReadOnlySet<string> allowed, string fallback)
        {
            var normalized = string.IsNullOrWhiteSpace(value) ? fallback : value.Trim().ToLower();
            return allowed.Contains(normalized) ? normalized : fallback;
        }

        internal sealed record ScheduleRecurrence(
            int EveryDays,
            DateOnly? ScheduledFor,
            string RecurrenceMode,
            int RepeatEvery,
            string RepeatUnit,
            string? RepeatOnDays,
            string EndsMode,
            DateOnly? EndsOn,
            int? EndsAfterOccurrences);
    }
}
