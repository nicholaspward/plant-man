using Microsoft.EntityFrameworkCore;
using plant_manager.Data;
using plant_manager.Data.Models;

namespace plant_manager.Endpoints
{
    public static class CareActivityEndpoints
    {
        public static void MapCareActivityEndpoints(this WebApplication app)
        {
            app.MapGet("/api/care-activities", async (ApplicationDbContext db) =>
            {
                var activities = await db.CareActivities
                    .Include(activity => activity.Actions)
                    .ThenInclude(action => action.CareAction)
                    .Include(activity => activity.Actions)
                    .ThenInclude(action => action.Resources)
                    .ThenInclude(resource => resource.ActionResource)
                    .OrderBy(activity => activity.Name)
                    .Select(activity => CareActivityDto.FromCareActivity(activity))
                    .ToListAsync();

                return Results.Ok(activities);
            });

            app.MapPost("/api/care-activities", async (SaveCareActivityRequest request, ApplicationDbContext db) =>
            {
                var validation = await ValidateRequest(request, db);
                if (validation.Error is not null)
                {
                    return Results.BadRequest(new { error = validation.Error });
                }

                var name = request.Name.Trim();
                var exists = await db.CareActivities.AnyAsync(activity => activity.Name.ToLower() == name.ToLower());
                if (exists)
                {
                    return Results.Conflict(new { error = "An activity with this name already exists." });
                }

                var activity = new CareActivity
                {
                    Name = name,
                    Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim(),
                    Actions = validation.Actions
                };

                db.CareActivities.Add(activity);
                await db.SaveChangesAsync();

                return Results.Created($"/api/care-activities/{activity.Id}", CareActivityDto.FromCareActivity(activity));
            });

            app.MapPut("/api/care-activities/{id:int}", async (int id, SaveCareActivityRequest request, ApplicationDbContext db) =>
            {
                var activity = await db.CareActivities
                    .Include(item => item.Actions)
                    .ThenInclude(action => action.CareAction)
                    .Include(item => item.Actions)
                    .ThenInclude(action => action.Resources)
                    .ThenInclude(resource => resource.ActionResource)
                    .FirstOrDefaultAsync(item => item.Id == id);
                if (activity is null)
                {
                    return Results.NotFound();
                }

                var validation = await ValidateRequest(request, db);
                if (validation.Error is not null)
                {
                    return Results.BadRequest(new { error = validation.Error });
                }

                var name = request.Name.Trim();
                var exists = await db.CareActivities.AnyAsync(item =>
                    item.Id != id && item.Name.ToLower() == name.ToLower());
                if (exists)
                {
                    return Results.Conflict(new { error = "An activity with this name already exists." });
                }

                activity.Name = name;
                activity.Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim();
                db.CareActivityActions.RemoveRange(activity.Actions);
                activity.Actions = validation.Actions;

                await db.SaveChangesAsync();

                return Results.Ok(CareActivityDto.FromCareActivity(activity));
            });

            app.MapDelete("/api/care-activities/{id:int}", async (int id, ApplicationDbContext db) =>
            {
                var activity = await db.CareActivities.FindAsync(id);
                if (activity is null)
                {
                    return Results.NotFound();
                }

                var hasHistory = await db.ActionLogs.AnyAsync(log => log.CareActivityId == id)
                    || await db.PlantCareSchedules.AnyAsync(schedule => schedule.CareActivityId == id);
                if (hasHistory)
                {
                    return Results.Conflict(new { error = "Activity is in use." });
                }

                db.CareActivities.Remove(activity);
                await db.SaveChangesAsync();

                return Results.NoContent();
            });
        }

        private static async Task<(List<CareActivityAction> Actions, string? Error)> ValidateRequest(
            SaveCareActivityRequest request,
            ApplicationDbContext db)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return ([], "Activity name is required.");
            }

            var requestedActions = request.Actions?
                .GroupBy(action => action.CareActionId)
                .Select(group => group.First())
                .ToList();
            if (requestedActions is null || requestedActions.Count == 0)
            {
                return ([], "Select at least one care action.");
            }

            if (requestedActions.Any(action => action.CareActionId <= 0))
            {
                return ([], "Select a care action for every activity action.");
            }

            var actionIds = requestedActions
                .Select(action => action.CareActionId)
                .ToList();
            var actionsById = await db.CareActions
                .Where(action => actionIds.Contains(action.Id))
                .ToDictionaryAsync(action => action.Id);
            if (actionsById.Count != actionIds.Count)
            {
                return ([], "One or more care actions were not found.");
            }

            var requestedResources = requestedActions
                .SelectMany(action => action.Resources ?? [])
                .GroupBy(resource => resource.ActionResourceId)
                .Select(group => group.First())
                .ToList();
            if (requestedResources.Any(resource => resource.ActionResourceId <= 0))
            {
                return ([], "Select a resource for every activity resource.");
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

            var activityActions = requestedActions
                .Select((actionRequest, index) => new CareActivityAction
                {
                    CareActionId = actionRequest.CareActionId,
                    CareAction = actionsById[actionRequest.CareActionId],
                    SortOrder = index,
                    Resources = (actionRequest.Resources ?? [])
                        .Where(resource => resource.ActionResourceId > 0)
                        .GroupBy(resource => resource.ActionResourceId)
                        .Select(group => group.First())
                        .Select(resource => new CareActivityActionResource
                        {
                            CareActionId = actionRequest.CareActionId,
                            ActionResourceId = resource.ActionResourceId,
                            ActionResource = resourcesById[resource.ActionResourceId],
                            Quantity = resource.Quantity,
                            Unit = string.IsNullOrWhiteSpace(resource.Unit) ? null : resource.Unit.Trim(),
                            Notes = string.IsNullOrWhiteSpace(resource.Notes) ? null : resource.Notes.Trim()
                        })
                        .ToList()
                })
                .ToList();

            return (activityActions, null);
        }
    }
}
