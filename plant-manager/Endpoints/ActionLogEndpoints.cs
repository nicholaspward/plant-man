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
                    .Include(log => log.Resources)
                    .ThenInclude(resource => resource.ActionResource)
                    .OrderByDescending(log => log.PerformedOn)
                    .ThenByDescending(log => log.Id)
                    .ToListAsync();

                return Results.Ok(logs.Select(ActionLogDto.FromActionLog));
            });

            app.MapPost("/api/action-logs", async (CreateActionLogRequest request, ApplicationDbContext db) =>
            {
                var plant = await db.Plants.FindAsync(request.PlantId);
                if (plant is null)
                {
                    return Results.BadRequest(new { error = "Plant was not found." });
                }

                var action = await db.CareActions.FindAsync(request.CareActionId);
                if (action is null)
                {
                    return Results.BadRequest(new { error = "Care action was not found." });
                }

                if (!action.IsEnabled)
                {
                    return Results.BadRequest(new { error = "Disabled actions cannot be logged." });
                }

                var performedOn = request.PerformedOn ?? DateOnly.FromDateTime(DateTime.UtcNow);
                var (resources, resourceError) = await BuildLogResources(request.Resources, db);
                if (resourceError is not null)
                {
                    return Results.BadRequest(new { error = resourceError });
                }

                var log = new ActionLog
                {
                    PlantId = plant.Id,
                    CareActionId = action.Id,
                    CareAction = action,
                    ActionNameSnapshot = action.Name,
                    Notes = request.Notes?.Trim(),
                    PerformedOn = performedOn,
                    Resources = resources
                };

                db.ActionLogs.Add(log);
                await db.SaveChangesAsync();

                log.Plant = plant;

                return Results.Created($"/api/action-logs/{log.Id}", ActionLogDto.FromActionLog(log));
            });

            app.MapPut("/api/action-logs/{id:int}", async (int id, UpdateActionLogRequest request, ApplicationDbContext db) =>
            {
                var log = await db.ActionLogs
                    .Include(item => item.Plant)
                    .Include(item => item.Resources)
                    .FirstOrDefaultAsync(item => item.Id == id);
                if (log is null)
                {
                    return Results.NotFound();
                }

                var oldPlantId = log.PlantId;
                var oldCareActionId = log.CareActionId;

                var plant = await db.Plants.FindAsync(request.PlantId);
                if (plant is null)
                {
                    return Results.BadRequest(new { error = "Plant was not found." });
                }

                var action = await db.CareActions.FindAsync(request.CareActionId);
                if (action is null)
                {
                    return Results.BadRequest(new { error = "Care action was not found." });
                }

                if (!action.IsEnabled)
                {
                    return Results.BadRequest(new { error = "Disabled actions cannot be logged." });
                }

                var (resources, resourceError) = await BuildLogResources(request.Resources, db);
                if (resourceError is not null)
                {
                    return Results.BadRequest(new { error = resourceError });
                }

                db.ActionLogResources.RemoveRange(log.Resources);

                log.PlantId = plant.Id;
                log.Plant = plant;
                log.CareActionId = action.Id;
                log.CareAction = action;
                log.ActionNameSnapshot = action.Name;
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
        }

        private static async Task<(List<ActionLogResource> Resources, string? Error)> BuildLogResources(
            IReadOnlyList<ActionLogResourceRequest>? requestResources,
            ApplicationDbContext db)
        {
            var requestedResources = requestResources?
                .GroupBy(resource => resource.ActionResourceId)
                .Select(group => group.First())
                .ToList() ?? [];

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

            if (resourcesById.Values.Any(resource => !resource.IsEnabled))
            {
                return ([], "Disabled resources cannot be logged.");
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

    }
}
