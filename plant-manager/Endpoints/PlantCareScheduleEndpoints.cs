using Microsoft.EntityFrameworkCore;
using plant_manager.Data;
using plant_manager.Data.Models;

namespace plant_manager.Endpoints
{
    public static class PlantCareScheduleEndpoints
    {
        public static void MapPlantCareScheduleEndpoints(this WebApplication app)
        {
            app.MapGet("/api/plant-care-schedules", async (ApplicationDbContext db) =>
            {
                var schedules = await db.PlantCareSchedules
                    .Include(schedule => schedule.CareActivity)
                    .Include(schedule => schedule.CareAction)
                    .Include(schedule => schedule.Assignments)
                    .ThenInclude(assignment => assignment.Plant)
                    .OrderBy(schedule => schedule.CareActivity.Name)
                    .ThenBy(schedule => schedule.Id)
                    .AsSplitQuery()
                    .ToListAsync();

                return Results.Ok(schedules.Select(PlantCareScheduleRuleDto.FromSchedule));
            });

            app.MapPost("/api/plant-care-schedules", async (
                BulkSavePlantCareScheduleRequest request,
                ApplicationDbContext db) =>
            {
                var context = await ValidateScheduleRequest(request, db);
                if (context.Error is not null)
                {
                    return Results.BadRequest(new { error = context.Error });
                }

                var schedule = new PlantCareSchedule
                {
                    CareActivityId = context.Activity!.Id,
                    CareActionId = context.PrimaryAction!.Id,
                    CareActivity = context.Activity,
                    CareAction = context.PrimaryAction
                };
                ApplyRecurrence(schedule, context.Recurrence!);
                schedule.Assignments = context.PlantIds
                    .Select(plantId => new PlantCareScheduleAssignment { PlantId = plantId })
                    .ToList();

                db.PlantCareSchedules.Add(schedule);
                await db.SaveChangesAsync();

                var saved = await LoadSchedule(schedule.Id, db);
                return Results.Created($"/api/plant-care-schedules/{schedule.Id}", PlantCareScheduleRuleDto.FromSchedule(saved!));
            });

            app.MapPut("/api/plant-care-schedules/{id:int}", async (
                int id,
                BulkSavePlantCareScheduleRequest request,
                ApplicationDbContext db) =>
            {
                var schedule = await db.PlantCareSchedules
                    .Include(item => item.Assignments)
                    .FirstOrDefaultAsync(item => item.Id == id);
                if (schedule is null)
                {
                    return Results.NotFound();
                }

                var context = await ValidateScheduleRequest(request, db);
                if (context.Error is not null)
                {
                    return Results.BadRequest(new { error = context.Error });
                }

                schedule.CareActivityId = context.Activity!.Id;
                schedule.CareActionId = context.PrimaryAction!.Id;
                ApplyRecurrence(schedule, context.Recurrence!);

                var nextPlantIds = context.PlantIds.ToHashSet();
                var assignmentsToRemove = schedule.Assignments
                    .Where(assignment => !nextPlantIds.Contains(assignment.PlantId))
                    .ToList();
                db.PlantCareScheduleAssignments.RemoveRange(assignmentsToRemove);

                var existingPlantIds = schedule.Assignments
                    .Select(assignment => assignment.PlantId)
                    .ToHashSet();
                foreach (var plantId in context.PlantIds.Where(plantId => !existingPlantIds.Contains(plantId)))
                {
                    schedule.Assignments.Add(new PlantCareScheduleAssignment
                    {
                        PlantCareScheduleId = schedule.Id,
                        PlantId = plantId
                    });
                }

                await db.SaveChangesAsync();

                var saved = await LoadSchedule(schedule.Id, db);
                return Results.Ok(PlantCareScheduleRuleDto.FromSchedule(saved!));
            });

            app.MapDelete("/api/plant-care-schedules/{id:int}", async (int id, ApplicationDbContext db) =>
            {
                var schedule = await db.PlantCareSchedules.FindAsync(id);
                if (schedule is null)
                {
                    return Results.NotFound();
                }

                db.PlantCareSchedules.Remove(schedule);
                await db.SaveChangesAsync();

                return Results.NoContent();
            });
        }

        private static async Task<PlantCareSchedule?> LoadSchedule(int id, ApplicationDbContext db) =>
            await db.PlantCareSchedules
                .Include(schedule => schedule.CareActivity)
                .Include(schedule => schedule.CareAction)
                .Include(schedule => schedule.Assignments)
                .ThenInclude(assignment => assignment.Plant)
                .AsSplitQuery()
                .FirstOrDefaultAsync(schedule => schedule.Id == id);

        private static async Task<ValidatedScheduleRequest> ValidateScheduleRequest(
            BulkSavePlantCareScheduleRequest request,
            ApplicationDbContext db)
        {
            var plantIds = request.PlantIds
                .Where(id => id > 0)
                .Distinct()
                .ToList();
            if (plantIds.Count == 0)
            {
                return ValidatedScheduleRequest.Invalid("At least one plant is required.");
            }

            var activity = await db.CareActivities
                .Include(item => item.Actions)
                .ThenInclude(action => action.CareAction)
                .FirstOrDefaultAsync(item => item.Id == request.CareActivityId);
            if (activity is null)
            {
                return ValidatedScheduleRequest.Invalid("Care activity was not found.");
            }

            var primaryAction = activity.PrimaryAction();
            if (primaryAction is null)
            {
                return ValidatedScheduleRequest.Invalid("Care activity has no configured actions.");
            }

            var existingPlantIds = await db.Plants
                .Where(plant => plantIds.Contains(plant.Id))
                .Select(plant => plant.Id)
                .ToListAsync();
            if (existingPlantIds.Count != plantIds.Count)
            {
                return ValidatedScheduleRequest.Invalid("One or more plants were not found.");
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

            return ValidatedScheduleRequest.Valid(plantIds, activity, primaryAction, recurrence);
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
                : NormalizeOption(endsMode, new HashSet<string> { "never", "on", "after" }, "never");
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

        private sealed record ValidatedScheduleRequest(
            IReadOnlyList<int> PlantIds,
            CareActivity? Activity,
            CareAction? PrimaryAction,
            ScheduleRecurrence? Recurrence,
            string? Error)
        {
            public static ValidatedScheduleRequest Invalid(string error) =>
                new([], null, null, null, error);

            public static ValidatedScheduleRequest Valid(
                IReadOnlyList<int> plantIds,
                CareActivity activity,
                CareAction primaryAction,
                ScheduleRecurrence recurrence) =>
                new(plantIds, activity, primaryAction, recurrence, null);
        }
    }
}
