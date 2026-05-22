using Microsoft.EntityFrameworkCore;
using plant_manager.Data;
using plant_manager.Data.Models;

namespace plant_manager.Endpoints
{
    public static class CareTaskEndpoints
    {
        public static void MapCareTaskEndpoints(this WebApplication app)
        {
            async Task<IResult> GetUpcomingCareTasks(ApplicationDbContext db)
            {
                var today = DateOnly.FromDateTime(DateTime.UtcNow);
                var schedules = await db.PlantCareSchedules
                    .Include(schedule => schedule.Plant)
                    .Include(schedule => schedule.CareAction)
                    .Include(schedule => schedule.CareActivity)
                    .ThenInclude(activity => activity.Actions)
                    .ThenInclude(action => action.CareAction)
                    .Include(schedule => schedule.CareActivity)
                    .ThenInclude(activity => activity.Actions)
                    .ThenInclude(action => action.Resources)
                    .ThenInclude(resource => resource.ActionResource)
                    .Where(schedule =>
                        schedule.IsEnabled
                        && schedule.CareActivity.Actions.All(action => action.CareAction.IsEnabled)
                        && schedule.CareActivity.IsEnabled)
                    .OrderBy(schedule => schedule.Plant.Nickname)
                    .ThenBy(schedule => schedule.CareActivity.Name)
                    .ToListAsync();
                var latestLogs = await db.ActionLogs
                    .GroupBy(log => new { log.PlantId, log.CareActivityId })
                    .Select(group => new
                    {
                        group.Key.PlantId,
                        group.Key.CareActivityId,
                        LastPerformedOn = group.Max(log => log.PerformedOn),
                        CompletedOccurrences = group.Count()
                    })
                    .ToListAsync();
                var latestLogLookup = latestLogs.ToDictionary(
                    log => (log.PlantId, log.CareActivityId),
                    log => (DateOnly?)log.LastPerformedOn);
                var completedLookup = latestLogs.ToDictionary(
                    log => (log.PlantId, log.CareActivityId),
                    log => log.CompletedOccurrences);

                var tasks = schedules
                    .Select(schedule => CareTaskDto.FromSchedule(
                        schedule,
                        latestLogLookup.GetValueOrDefault((schedule.PlantId, schedule.CareActivityId)),
                        completedLookup.GetValueOrDefault((schedule.PlantId, schedule.CareActivityId)),
                        today))
                    .Where(task => task.Status is "due" or "soon")
                    .ToList();

                return Results.Ok(tasks);
            }

            app.MapGet("/api/care-tasks/upcoming", GetUpcomingCareTasks);
            app.MapGet("/api/care-tasks/today", GetUpcomingCareTasks);

            app.MapPost("/api/care-tasks/complete-bulk", async (
                BulkCompleteCareTasksRequest request,
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
                    .Include(item => item.Actions)
                    .ThenInclude(action => action.Resources)
                    .ThenInclude(resource => resource.ActionResource)
                    .FirstOrDefaultAsync(item => item.Id == request.CareActivityId);
                if (activity is null)
                {
                    return Results.BadRequest(new { error = "Care activity was not found." });
                }

                var primaryAction = activity.PrimaryAction();
                if (!activity.IsEnabled || primaryAction is null || activity.Actions.Any(action => !action.CareAction.IsEnabled))
                {
                    return Results.BadRequest(new { error = "Disabled activities cannot be logged." });
                }

                var today = DateOnly.FromDateTime(DateTime.UtcNow);
                var schedules = await db.PlantCareSchedules
                    .Include(schedule => schedule.Plant)
                    .Where(schedule =>
                        schedule.IsEnabled
                        && schedule.CareActivityId == activity.Id
                        && plantIds.Contains(schedule.PlantId))
                    .ToListAsync();
                var schedulePlantIds = schedules
                    .Select(schedule => schedule.PlantId)
                    .ToHashSet();
                if (schedulePlantIds.Count != plantIds.Count)
                {
                    return Results.BadRequest(new { error = "One or more plants do not have this enabled schedule." });
                }

                var latestLogs = await db.ActionLogs
                    .Where(log => log.CareActivityId == activity.Id && plantIds.Contains(log.PlantId))
                    .GroupBy(log => log.PlantId)
                    .Select(group => new
                    {
                        PlantId = group.Key,
                        LastPerformedOn = group.Max(log => log.PerformedOn),
                        CompletedOccurrences = group.Count()
                    })
                    .ToListAsync();
                var latestLogLookup = latestLogs.ToDictionary(
                    log => log.PlantId,
                    log => (DateOnly?)log.LastPerformedOn);
                var completedLookup = latestLogs.ToDictionary(
                    log => log.PlantId,
                    log => log.CompletedOccurrences);
                var duePlantIds = schedules
                    .Where(schedule =>
                        PlantCareFormatter.GetStatus(
                            PlantCareFormatter.GetNextCareDate(
                                schedule,
                                latestLogLookup.GetValueOrDefault(schedule.PlantId),
                                completedLookup.GetValueOrDefault(schedule.PlantId)),
                            today) == "due")
                    .Select(schedule => schedule.PlantId)
                    .ToHashSet();

                if (duePlantIds.Count != plantIds.Count)
                {
                    return Results.BadRequest(new { error = "Only due care tasks can be completed in bulk." });
                }

                var resourceIds = request.Resources?
                    .GroupBy(resource => resource.ActionResourceId)
                    .Select(group => group.First())
                    .ToList() ?? [];
                foreach (var configuredResource in GetConfiguredResources(activity))
                {
                    if (!resourceIds.Any(resource => resource.ActionResourceId == configuredResource.ActionResourceId))
                    {
                        resourceIds.Add(new ActionLogResourceRequest(
                            configuredResource.ActionResourceId,
                            configuredResource.Quantity,
                            configuredResource.Unit));
                    }
                }
                if (resourceIds.Any(resource => resource.Quantity < 0))
                {
                    return Results.BadRequest(new { error = "Resource quantities cannot be negative." });
                }

                var requestedResourceIds = resourceIds
                    .Select(resource => resource.ActionResourceId)
                    .ToList();
                var resourcesById = await db.ActionResources
                    .Where(resource => requestedResourceIds.Contains(resource.Id))
                    .ToDictionaryAsync(resource => resource.Id);
                if (resourcesById.Count != requestedResourceIds.Count)
                {
                    return Results.BadRequest(new { error = "One or more resources were not found." });
                }

                if (resourcesById.Values.Any(resource => !resource.IsEnabled))
                {
                    return Results.BadRequest(new { error = "Disabled resources cannot be logged." });
                }

                var performedOn = request.PerformedOn ?? today;
                var notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim();
                var logs = schedules
                    .OrderBy(schedule => schedule.Plant.Nickname)
                    .Select(schedule => new ActionLog
                    {
                        PlantId = schedule.PlantId,
                        CareActionId = primaryAction.Id,
                        CareActivityId = activity.Id,
                        ActionNameSnapshot = activity.Name,
                        Notes = notes,
                        PerformedOn = performedOn,
                        Resources = resourceIds
                            .Select(resource => new ActionLogResource
                            {
                                ActionResourceId = resource.ActionResourceId,
                                Quantity = resource.Quantity,
                                Unit = string.IsNullOrWhiteSpace(resource.Unit) ? null : resource.Unit.Trim()
                            })
                            .ToList()
                    })
                    .ToList();

                db.ActionLogs.AddRange(logs);
                await db.SaveChangesAsync();

                return Results.Ok(new { completed = logs.Count });
            });
        }

        private static IEnumerable<CareActivityActionResource> GetConfiguredResources(CareActivity activity) =>
            activity.Actions
                .SelectMany(action => action.Resources)
                .GroupBy(resource => resource.ActionResourceId)
                .Select(group => group.First());
    }
}
