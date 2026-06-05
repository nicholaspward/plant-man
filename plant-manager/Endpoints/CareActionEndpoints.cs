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
                    .OrderBy(action => action.Name)
                    .Select(action => CareActionDto.FromCareAction(action))
                    .ToListAsync();

                return Results.Ok(actions);
            });

            app.MapPost("/api/care-actions", async (SaveCareActionRequest request, ApplicationDbContext db) =>
            {
                if (!EndpointHelpers.TryNormalizeRequired(request.Name, "Action name is required.", out var name, out var error))
                {
                    return error;
                }

                var exists = await db.NameExistsAsync<CareAction>(action => action.Name.ToLower() == name.ToLower());
                if (exists)
                {
                    return EndpointHelpers.Conflict("An action with this name already exists.");
                }

                var action = new CareAction
                {
                    Name = name,
                    Description = EndpointHelpers.NormalizeOptional(request.Description)
                };

                db.CareActions.Add(action);
                await db.SaveChangesAsync();

                return Results.Created($"/api/care-actions/{action.Id}", CareActionDto.FromCareAction(action));
            });

            app.MapPut("/api/care-actions/{id:int}", async (int id, SaveCareActionRequest request, ApplicationDbContext db) =>
            {
                if (!EndpointHelpers.TryNormalizeRequired(request.Name, "Action name is required.", out var name, out var error))
                {
                    return error;
                }

                var action = await db.CareActions.FindAsync(id);
                if (action is null)
                {
                    return Results.NotFound();
                }

                var exists = await db.NameExistsAsync<CareAction>(item =>
                    item.Id != id && item.Name.ToLower() == name.ToLower());
                if (exists)
                {
                    return EndpointHelpers.Conflict("An action with this name already exists.");
                }

                action.Name = name;
                action.Description = EndpointHelpers.NormalizeOptional(request.Description);

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
                    return EndpointHelpers.Conflict("Action has care history.");
                }

                db.CareActions.Remove(action);
                await db.SaveChangesAsync();

                return Results.NoContent();
            });
        }
    }
}
