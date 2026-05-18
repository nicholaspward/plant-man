using Microsoft.EntityFrameworkCore;
using plant_manager.Data;
using plant_manager.Data.Models;

namespace plant_manager.Endpoints
{
    public static class CareActionEndpoints
    {
        public static void MapCareActionEndpoints(this WebApplication app)
        {
            app.MapGet("/api/care-actions", async (ApplicationDbContext db) =>
            {
                var actions = await db.CareActions
                    .OrderByDescending(action => action.IsEnabled)
                    .ThenBy(action => action.Name)
                    .Select(action => CareActionDto.FromCareAction(action))
                    .ToListAsync();

                return Results.Ok(actions);
            });

            app.MapPost("/api/care-actions", async (SaveCareActionRequest request, ApplicationDbContext db) =>
            {
                if (string.IsNullOrWhiteSpace(request.Name))
                {
                    return Results.BadRequest(new { error = "Action name is required." });
                }

                var name = request.Name.Trim();
                var exists = await db.CareActions.AnyAsync(action => action.Name.ToLower() == name.ToLower());
                if (exists)
                {
                    return Results.Conflict(new { error = "An action with this name already exists." });
                }

                var action = new CareAction
                {
                    Name = name,
                    Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
                    IsEnabled = request.IsEnabled
                };

                db.CareActions.Add(action);
                await db.SaveChangesAsync();

                return Results.Created($"/api/care-actions/{action.Id}", CareActionDto.FromCareAction(action));
            });

            app.MapPut("/api/care-actions/{id:int}", async (int id, SaveCareActionRequest request, ApplicationDbContext db) =>
            {
                if (string.IsNullOrWhiteSpace(request.Name))
                {
                    return Results.BadRequest(new { error = "Action name is required." });
                }

                var action = await db.CareActions.FindAsync(id);
                if (action is null)
                {
                    return Results.NotFound();
                }

                var name = request.Name.Trim();
                var exists = await db.CareActions.AnyAsync(item =>
                    item.Id != id && item.Name.ToLower() == name.ToLower());
                if (exists)
                {
                    return Results.Conflict(new { error = "An action with this name already exists." });
                }

                action.Name = name;
                action.Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();
                action.IsEnabled = request.IsEnabled;

                await db.SaveChangesAsync();

                return Results.Ok(CareActionDto.FromCareAction(action));
            });

            app.MapDelete("/api/care-actions/{id:int}", async (int id, ApplicationDbContext db) =>
            {
                var action = await db.CareActions.FindAsync(id);
                if (action is null)
                {
                    return Results.NotFound();
                }

                var hasLogs = await db.ActionLogs.AnyAsync(log => log.CareActionId == id);
                if (hasLogs)
                {
                    action.IsEnabled = false;
                    await db.SaveChangesAsync();
                    return Results.Conflict(new { error = "Action has care history, so it was disabled instead of deleted." });
                }

                db.CareActions.Remove(action);
                await db.SaveChangesAsync();

                return Results.NoContent();
            });
        }
    }
}
