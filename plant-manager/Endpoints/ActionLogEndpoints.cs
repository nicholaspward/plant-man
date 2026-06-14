using Microsoft.EntityFrameworkCore;
using plant_manager.Data;
using plant_manager.Data.Models;

namespace plant_manager.Endpoints
{
    public static class ActionLogEndpoints
    {
        public static void MapActionLogEndpoints(this WebApplication app)
        {
            app.MapGet("/api/action-logs", async (ApplicationDbContext db) =>
            {
                var logs = await db.ActionLogs
                    .Include(log => log.Plant)
                    .Include(log => log.CareActivity)
                    .Include(log => log.Resources)
                    .ThenInclude(resource => resource.ActionResource)
                    .OrderByDescending(log => log.PerformedOn)
                    .ThenByDescending(log => log.Id)
                    .ToListAsync();

                return Results.Ok(logs.Select(ActionLogDto.FromActionLog));
            });

            app.MapGet("/api/care-history", async (ApplicationDbContext db) =>
            {
                var logs = await db.ActionLogs
                    .Include(log => log.Plant)
                    .Include(log => log.Resources)
                    .ThenInclude(resource => resource.ActionResource)
                    .ToListAsync();
                var dismissals = await db.CareDismissals
                    .Include(dismissal => dismissal.Plant)
                    .Include(dismissal => dismissal.CareActivity)
                    .ToListAsync();
                var snoozes = await db.CareSnoozes
                    .Include(snooze => snooze.Plant)
                    .Include(snooze => snooze.CareActivity)
                    .ToListAsync();

                return Results.Ok(logs.Select(CareHistoryEventDto.FromActionLog)
                    .Concat(dismissals.Select(CareHistoryEventDto.FromDismissal))
                    .Concat(snoozes.Select(CareHistoryEventDto.FromSnooze))
                    .OrderByDescending(item => item.Date)
                    .ThenByDescending(item => item.Id)
                    .ToList());
            });

            app.MapPost("/api/action-logs", async (CreateActionLogRequest request, ApplicationDbContext db) =>
            {
                var plant = await db.Plants.FindAsync(request.PlantId);
                if (plant is null)
                {
                    return Results.BadRequest(new { error = "Plant was not found." });
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

                var performedOn = request.PerformedOn ?? DateOnly.FromDateTime(DateTime.UtcNow);
                var (resources, resourceError) = await BuildLogResources(request.Resources, activity, db);
                if (resourceError is not null)
                {
                    return Results.BadRequest(new { error = resourceError });
                }

                var log = new ActionLog
                {
                    PlantId = plant.Id,
                    CareActionId = primaryAction.Id,
                    CareActivityId = activity.Id,
                    CareAction = primaryAction,
                    CareActivity = activity,
                    ActionNameSnapshot = activity.Name,
                    Notes = request.Notes?.Trim(),
                    PerformedOn = performedOn,
                    Resources = resources
                };

                db.ActionLogs.Add(log);
                await db.SaveChangesAsync();

                log.Plant = plant;

                return Results.Created($"/api/action-logs/{log.Id}", ActionLogDto.FromActionLog(log));
            });

            app.MapPost("/api/action-logs/bulk", async (BulkCompleteCareTasksRequest request, ApplicationDbContext db) =>
            {
                var plantIds = request.PlantIds
                    .Where(id => id > 0)
                    .Distinct()
                    .ToList();
                if (plantIds.Count == 0)
                {
                    return Results.BadRequest(new { error = "At least one plant is required." });
                }

                var plants = await db.Plants
                    .Where(plant => plantIds.Contains(plant.Id))
                    .OrderBy(plant => plant.Nickname)
                    .ToListAsync();
                if (plants.Count != plantIds.Count)
                {
                    return Results.BadRequest(new { error = "One or more plants were not found." });
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

                var performedOn = request.PerformedOn ?? DateOnly.FromDateTime(DateTime.UtcNow);
                var notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim();
                var (resources, resourceError) = await BuildLogResources(request.Resources, activity, db);
                if (resourceError is not null)
                {
                    return Results.BadRequest(new { error = resourceError });
                }

                var logs = plants
                    .Select(plant => new ActionLog
                    {
                        PlantId = plant.Id,
                        CareActionId = primaryAction.Id,
                        CareActivityId = activity.Id,
                        CareAction = primaryAction,
                        CareActivity = activity,
                        ActionNameSnapshot = activity.Name,
                        Notes = notes,
                        PerformedOn = performedOn,
                        Resources = resources
                            .Select(resource => new ActionLogResource
                            {
                                ActionResourceId = resource.ActionResourceId,
                                Quantity = resource.Quantity,
                                Unit = resource.Unit
                            })
                            .ToList()
                    })
                    .ToList();

                db.ActionLogs.AddRange(logs);
                await db.SaveChangesAsync();

                return Results.Ok(new { completed = logs.Count });
            });

            app.MapPut("/api/action-logs/{id:int}", async (int id, UpdateActionLogRequest request, ApplicationDbContext db) =>
            {
                var log = await db.ActionLogs
                    .Include(item => item.Plant)
                    .Include(item => item.CareActivity)
                    .Include(item => item.Resources)
                    .FirstOrDefaultAsync(item => item.Id == id);
                if (log is null)
                {
                    return Results.NotFound();
                }

                var plant = await db.Plants.FindAsync(request.PlantId);
                if (plant is null)
                {
                    return Results.BadRequest(new { error = "Plant was not found." });
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

                var (resources, resourceError) = await BuildLogResources(request.Resources, activity, db);
                if (resourceError is not null)
                {
                    return Results.BadRequest(new { error = resourceError });
                }

                db.ActionLogResources.RemoveRange(log.Resources);

                log.PlantId = plant.Id;
                log.Plant = plant;
                log.CareActionId = primaryAction.Id;
                log.CareActivityId = activity.Id;
                log.CareAction = primaryAction;
                log.CareActivity = activity;
                log.ActionNameSnapshot = activity.Name;
                log.Notes = request.Notes?.Trim();
                log.PerformedOn = request.PerformedOn;
                log.Resources = resources;

                await db.SaveChangesAsync();

                return Results.Ok(ActionLogDto.FromActionLog(log));
            });

            app.MapDelete("/api/action-logs/{id:int}", async (int id, ApplicationDbContext db) =>
            {
                var log = await db.ActionLogs.FindAsync(id);
                if (log is null)
                {
                    return Results.NotFound();
                }

                db.ActionLogs.Remove(log);
                await db.SaveChangesAsync();

                return Results.NoContent();
            });

            app.MapPut("/api/care-dismissals/{id:int}", async (int id, UpdateCareDismissalRequest request, ApplicationDbContext db) =>
            {
                var dismissal = await db.CareDismissals
                    .Include(item => item.Plant)
                    .Include(item => item.CareActivity)
                    .FirstOrDefaultAsync(item => item.Id == id);
                if (dismissal is null)
                {
                    return Results.NotFound();
                }

                var plant = await db.Plants.FindAsync(request.PlantId);
                if (plant is null)
                {
                    return Results.BadRequest(new { error = "Plant was not found." });
                }

                var activity = await db.CareActivities.FindAsync(request.CareActivityId);
                if (activity is null)
                {
                    return Results.BadRequest(new { error = "Care activity was not found." });
                }

                dismissal.PlantId = plant.Id;
                dismissal.Plant = plant;
                dismissal.CareActivityId = activity.Id;
                dismissal.CareActivity = activity;
                dismissal.DismissedOn = request.DismissedOn;
                dismissal.Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim();

                await db.SaveChangesAsync();

                return Results.Ok(CareHistoryEventDto.FromDismissal(dismissal));
            });

            app.MapDelete("/api/care-dismissals/{id:int}", async (int id, ApplicationDbContext db) =>
            {
                var dismissal = await db.CareDismissals.FindAsync(id);
                if (dismissal is null)
                {
                    return Results.NotFound();
                }

                db.CareDismissals.Remove(dismissal);
                await db.SaveChangesAsync();

                return Results.NoContent();
            });

            app.MapPut("/api/care-snoozes/{id:int}", async (int id, UpdateCareSnoozeRequest request, ApplicationDbContext db) =>
            {
                var snooze = await db.CareSnoozes
                    .Include(item => item.Plant)
                    .Include(item => item.CareActivity)
                    .FirstOrDefaultAsync(item => item.Id == id);
                if (snooze is null)
                {
                    return Results.NotFound();
                }

                var plant = await db.Plants.FindAsync(request.PlantId);
                if (plant is null)
                {
                    return Results.BadRequest(new { error = "Plant was not found." });
                }

                var activity = await db.CareActivities.FindAsync(request.CareActivityId);
                if (activity is null)
                {
                    return Results.BadRequest(new { error = "Care activity was not found." });
                }

                snooze.PlantId = plant.Id;
                snooze.Plant = plant;
                snooze.CareActivityId = activity.Id;
                snooze.CareActivity = activity;
                snooze.SnoozedUntil = request.SnoozedUntil;
                snooze.Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim();

                await db.SaveChangesAsync();

                return Results.Ok(CareHistoryEventDto.FromSnooze(snooze));
            });

            app.MapDelete("/api/care-snoozes/{id:int}", async (int id, ApplicationDbContext db) =>
            {
                var snooze = await db.CareSnoozes.FindAsync(id);
                if (snooze is null)
                {
                    return Results.NotFound();
                }

                db.CareSnoozes.Remove(snooze);
                await db.SaveChangesAsync();

                return Results.NoContent();
            });
        }

        private static async Task<(List<ActionLogResource> Resources, string? Error)> BuildLogResources(
            IReadOnlyList<ActionLogResourceRequest>? requestResources,
            CareActivity activity,
            ApplicationDbContext db)
        {
            var requestedResources = requestResources?
                .GroupBy(resource => resource.ActionResourceId)
                .Select(group => group.First())
                .ToList() ?? [];
            foreach (var configuredResource in GetConfiguredResources(activity))
            {
                if (!requestedResources.Any(resource => resource.ActionResourceId == configuredResource.ActionResourceId))
                {
                    requestedResources.Add(new ActionLogResourceRequest(
                        configuredResource.ActionResourceId,
                        configuredResource.Quantity,
                        configuredResource.Unit));
                }
            }

            if (requestedResources.Any(resource => resource.Quantity < 0))
            {
                return ([], "Resource quantities cannot be negative.");
            }

            var resourceIds = requestedResources
                .Select(resource => resource.ActionResourceId)
                .ToList();
            var resourcesById = await db.ActionResources
                .Where(resource => resourceIds.Contains(resource.Id))
                .ToDictionaryAsync(resource => resource.Id);

            if (resourcesById.Count != resourceIds.Count)
            {
                return ([], "One or more resources were not found.");
            }

            return (requestedResources
                .Select(resource => new ActionLogResource
                {
                    ActionResourceId = resource.ActionResourceId,
                    ActionResource = resourcesById[resource.ActionResourceId],
                    Quantity = resource.Quantity,
                    Unit = string.IsNullOrWhiteSpace(resource.Unit) ? null : resource.Unit.Trim()
                })
                .ToList(), null);
        }

        private static IEnumerable<CareActivityActionResource> GetConfiguredResources(CareActivity activity) =>
            activity.Actions
                .SelectMany(action => action.Resources)
                .GroupBy(resource => resource.ActionResourceId)
                .Select(group => group.First());

    }
}
