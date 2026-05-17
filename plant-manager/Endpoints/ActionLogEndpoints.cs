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
                    .OrderByDescending(log => log.PerformedOn)
                    .ThenByDescending(log => log.Id)
                    .Select(log => new ActionLogDto(
                        log.Id,
                        log.PlantId,
                        log.Plant.Nickname,
                        log.Action,
                        log.Notes,
                        log.PerformedOn))
                    .ToListAsync();

                return Results.Ok(logs);
            });

            app.MapPost("/api/action-logs", async (CreateActionLogRequest request, ApplicationDbContext db) =>
            {
                var plant = await db.Plants.FindAsync(request.PlantId);
                if (plant is null)
                {
                    return Results.BadRequest(new { error = "Plant was not found." });
                }

                var action = string.IsNullOrWhiteSpace(request.Action)
                    ? "Water"
                    : request.Action.Trim();

                var performedOn = request.PerformedOn ?? DateOnly.FromDateTime(DateTime.UtcNow);

                var log = new ActionLog
                {
                    PlantId = plant.Id,
                    Action = action,
                    Notes = request.Notes?.Trim(),
                    PerformedOn = performedOn
                };

                if (string.Equals(action, "Water", StringComparison.OrdinalIgnoreCase))
                {
                    plant.LastWateredOn = performedOn;
                }

                db.ActionLogs.Add(log);
                await db.SaveChangesAsync();

                log.Plant = plant;

                return Results.Created($"/api/action-logs/{log.Id}", ActionLogDto.FromActionLog(log));
            });
        }
    }
}
