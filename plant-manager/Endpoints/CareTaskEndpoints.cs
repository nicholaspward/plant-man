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
                var assignments = await db.PlantCareScheduleAssignments
                    .Include(assignment => assignment.Plant)
                    .ThenInclude(plant => plant.CareDismissals)
                    .Include(assignment => assignment.Plant)
                    .ThenInclude(plant => plant.CareSnoozes)
                    .Include(assignment => assignment.Plant)
                    .ThenInclude(plant => plant.ActionLogs)
                    .Include(assignment => assignment.PlantCareSchedule)
                    .ThenInclude(schedule => schedule.CareAction)
                    .Include(assignment => assignment.PlantCareSchedule)
                    .ThenInclude(schedule => schedule.CareActivity)
                    .ThenInclude(activity => activity.Actions)
                    .ThenInclude(action => action.CareAction)
                    .Include(assignment => assignment.PlantCareSchedule)
                    .ThenInclude(schedule => schedule.CareActivity)
                    .ThenInclude(activity => activity.Actions)
                    .ThenInclude(action => action.Resources)
                    .ThenInclude(resource => resource.ActionResource)
                    .OrderBy(assignment => assignment.Plant.Nickname)
                    .ThenBy(assignment => assignment.PlantCareSchedule.CareActivity.Name)
                    .ToListAsync();
                var (latestLogLookup, completedLookup, snoozeLookup) = await GetCareProgress(db);

                var tasks = assignments
                    .Select(assignment => CareTaskDto.FromAssignment(
                        assignment,
                        latestLogLookup.GetValueOrDefault((assignment.PlantId, assignment.PlantCareSchedule.CareActivityId)),
                        completedLookup.GetValueOrDefault((assignment.PlantId, assignment.PlantCareSchedule.CareActivityId)),
                        snoozeLookup.GetValueOrDefault((assignment.PlantId, assignment.PlantCareSchedule.CareActivityId)),
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
                if (primaryAction is null)
                {
                    return Results.BadRequest(new { error = "Care activity has no configured actions." });
                }

                var today = DateOnly.FromDateTime(DateTime.UtcNow);
                var assignments = await db.PlantCareScheduleAssignments
                    .Include(assignment => assignment.Plant)
                    .Include(assignment => assignment.PlantCareSchedule)
                    .Where(assignment =>
                        assignment.PlantCareSchedule.CareActivityId == activity.Id
                        && plantIds.Contains(assignment.PlantId))
                    .ToListAsync();
                var schedulePlantIds = assignments
                    .Select(assignment => assignment.PlantId)
                    .ToHashSet();
                if (schedulePlantIds.Count != plantIds.Count)
                {
                    return Results.BadRequest(new { error = "One or more plants do not have this schedule." });
                }

                var (latestLogLookup, completedLookup, snoozeLookup) = await GetCareProgress(db, activity.Id, plantIds);
                var duePlantIds = assignments
                    .Where(assignment =>
                        PlantCareFormatter.GetStatus(
                            PlantCareFormatter.GetNextCareDate(
                                assignment.PlantCareSchedule,
                                latestLogLookup.GetValueOrDefault((assignment.PlantId, activity.Id)),
                                completedLookup.GetValueOrDefault((assignment.PlantId, activity.Id)),
                                snoozeLookup.GetValueOrDefault((assignment.PlantId, activity.Id))),
                            today) == "due")
                    .Select(assignment => assignment.PlantId)
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

                var performedOn = request.PerformedOn ?? today;
                var notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim();
                var logs = assignments
                    .OrderBy(assignment => assignment.Plant.Nickname)
                    .Select(assignment => new ActionLog
                    {
                        PlantId = assignment.PlantId,
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

            app.MapPost("/api/care-tasks/dismiss-bulk", async (
                DismissCareTasksRequest request,
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

                var activity = await db.CareActivities.FindAsync(request.CareActivityId);
                if (activity is null)
                {
                    return Results.BadRequest(new { error = "Care activity was not found." });
                }

                var today = DateOnly.FromDateTime(DateTime.UtcNow);
                var assignments = await db.PlantCareScheduleAssignments
                    .Include(assignment => assignment.Plant)
                    .Include(assignment => assignment.PlantCareSchedule)
                    .Where(assignment =>
                        assignment.PlantCareSchedule.CareActivityId == activity.Id
                        && plantIds.Contains(assignment.PlantId))
                    .ToListAsync();
                var schedulePlantIds = assignments
                    .Select(assignment => assignment.PlantId)
                    .ToHashSet();
                if (schedulePlantIds.Count != plantIds.Count)
                {
                    return Results.BadRequest(new { error = "One or more plants do not have this schedule." });
                }

                var (latestLookup, completedLookup, snoozeLookup) = await GetCareProgress(db, activity.Id, plantIds);
                var duePlantIds = assignments
                    .Where(assignment =>
                        PlantCareFormatter.GetStatus(
                            PlantCareFormatter.GetNextCareDate(
                                assignment.PlantCareSchedule,
                                latestLookup.GetValueOrDefault((assignment.PlantId, activity.Id)),
                                completedLookup.GetValueOrDefault((assignment.PlantId, activity.Id)),
                                snoozeLookup.GetValueOrDefault((assignment.PlantId, activity.Id))),
                            today) == "due")
                    .Select(assignment => assignment.PlantId)
                    .ToHashSet();

                if (duePlantIds.Count != plantIds.Count)
                {
                    return Results.BadRequest(new { error = "Only due care tasks can be dismissed." });
                }

                var dismissedOn = request.DismissedOn ?? today;
                var notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim();
                var dismissals = assignments
                    .OrderBy(assignment => assignment.Plant.Nickname)
                    .Select(assignment => new CareDismissal
                    {
                        PlantId = assignment.PlantId,
                        CareActivityId = activity.Id,
                        DismissedOn = dismissedOn,
                        Notes = notes
                    })
                    .ToList();

                db.CareDismissals.AddRange(dismissals);
                await db.SaveChangesAsync();

                return Results.Ok(new { dismissed = dismissals.Count });
            });

            app.MapPost("/api/care-tasks/snooze-bulk", async (
                SnoozeCareTasksRequest request,
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

                var activity = await db.CareActivities.FindAsync(request.CareActivityId);
                if (activity is null)
                {
                    return Results.BadRequest(new { error = "Care activity was not found." });
                }

                var today = DateOnly.FromDateTime(DateTime.UtcNow);
                if (request.SnoozedUntil <= today)
                {
                    return Results.BadRequest(new { error = "Snooze date must be after today." });
                }

                var assignments = await db.PlantCareScheduleAssignments
                    .Include(assignment => assignment.Plant)
                    .Include(assignment => assignment.PlantCareSchedule)
                    .Where(assignment =>
                        assignment.PlantCareSchedule.CareActivityId == activity.Id
                        && plantIds.Contains(assignment.PlantId))
                    .ToListAsync();
                var schedulePlantIds = assignments
                    .Select(assignment => assignment.PlantId)
                    .ToHashSet();
                if (schedulePlantIds.Count != plantIds.Count)
                {
                    return Results.BadRequest(new { error = "One or more plants do not have this schedule." });
                }

                var (latestLookup, completedLookup, snoozeLookup) = await GetCareProgress(db, activity.Id, plantIds);
                var duePlantIds = assignments
                    .Where(assignment =>
                        PlantCareFormatter.GetStatus(
                            PlantCareFormatter.GetNextCareDate(
                                assignment.PlantCareSchedule,
                                latestLookup.GetValueOrDefault((assignment.PlantId, activity.Id)),
                                completedLookup.GetValueOrDefault((assignment.PlantId, activity.Id)),
                                snoozeLookup.GetValueOrDefault((assignment.PlantId, activity.Id))),
                            today) == "due")
                    .Select(assignment => assignment.PlantId)
                    .ToHashSet();

                if (duePlantIds.Count != plantIds.Count)
                {
                    return Results.BadRequest(new { error = "Only due care tasks can be snoozed." });
                }

                var notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim();
                var snoozes = assignments
                    .OrderBy(assignment => assignment.Plant.Nickname)
                    .Select(assignment => new CareSnooze
                    {
                        PlantId = assignment.PlantId,
                        CareActivityId = activity.Id,
                        SnoozedUntil = request.SnoozedUntil,
                        CreatedOn = today,
                        Notes = notes
                    })
                    .ToList();

                db.CareSnoozes.AddRange(snoozes);
                await db.SaveChangesAsync();

                return Results.Ok(new { snoozed = snoozes.Count });
            });
        }

        private static async Task<(
            Dictionary<(int PlantId, int CareActivityId), DateOnly?> LatestLookup,
            Dictionary<(int PlantId, int CareActivityId), int> CompletedLookup,
            Dictionary<(int PlantId, int CareActivityId), DateOnly?> SnoozeLookup)> GetCareProgress(
                ApplicationDbContext db,
                int? careActivityId = null,
                IReadOnlyList<int>? plantIds = null)
        {
            var logsQuery = db.ActionLogs.AsQueryable();
            var dismissalsQuery = db.CareDismissals.AsQueryable();
            var snoozesQuery = db.CareSnoozes.AsQueryable();
            if (careActivityId is not null)
            {
                logsQuery = logsQuery.Where(log => log.CareActivityId == careActivityId);
                dismissalsQuery = dismissalsQuery.Where(dismissal => dismissal.CareActivityId == careActivityId);
                snoozesQuery = snoozesQuery.Where(snooze => snooze.CareActivityId == careActivityId);
            }
            if (plantIds is not null)
            {
                logsQuery = logsQuery.Where(log => plantIds.Contains(log.PlantId));
                dismissalsQuery = dismissalsQuery.Where(dismissal => plantIds.Contains(dismissal.PlantId));
                snoozesQuery = snoozesQuery.Where(snooze => plantIds.Contains(snooze.PlantId));
            }

            var latestLogs = await logsQuery
                .GroupBy(log => new { log.PlantId, log.CareActivityId })
                .Select(group => new
                {
                    group.Key.PlantId,
                    group.Key.CareActivityId,
                    LastPerformedOn = group.Max(log => log.PerformedOn),
                    CompletedOccurrences = group.Count()
                })
                .ToListAsync();
            var latestLookup = latestLogs.ToDictionary(
                log => (log.PlantId, log.CareActivityId),
                log => (DateOnly?)log.LastPerformedOn);
            var completedLookup = latestLogs.ToDictionary(
                log => (log.PlantId, log.CareActivityId),
                log => log.CompletedOccurrences);

            var latestDismissals = await dismissalsQuery
                .GroupBy(dismissal => new { dismissal.PlantId, dismissal.CareActivityId })
                .Select(group => new
                {
                    group.Key.PlantId,
                    group.Key.CareActivityId,
                    LastDismissedOn = group.Max(dismissal => dismissal.DismissedOn),
                    DismissedOccurrences = group.Count()
                })
                .ToListAsync();
            foreach (var dismissal in latestDismissals)
            {
                var key = (dismissal.PlantId, dismissal.CareActivityId);
                latestLookup[key] = MaxDate(latestLookup.GetValueOrDefault(key), dismissal.LastDismissedOn);
                completedLookup[key] = completedLookup.GetValueOrDefault(key) + dismissal.DismissedOccurrences;
            }

            var latestSnoozes = await snoozesQuery
                .GroupBy(snooze => new { snooze.PlantId, snooze.CareActivityId })
                .Select(group => new
                {
                    group.Key.PlantId,
                    group.Key.CareActivityId,
                    SnoozedUntil = group.Max(snooze => snooze.SnoozedUntil)
                })
                .ToListAsync();
            var snoozeLookup = latestSnoozes.ToDictionary(
                snooze => (snooze.PlantId, snooze.CareActivityId),
                snooze => (DateOnly?)snooze.SnoozedUntil);

            return (latestLookup, completedLookup, snoozeLookup);
        }

        private static DateOnly MaxDate(DateOnly? left, DateOnly right) =>
            left is null || right > left ? right : left.Value;

        private static IEnumerable<CareActivityActionResource> GetConfiguredResources(CareActivity activity) =>
            activity.Actions
                .SelectMany(action => action.Resources)
                .GroupBy(resource => resource.ActionResourceId)
                .Select(group => group.First());
    }
}
