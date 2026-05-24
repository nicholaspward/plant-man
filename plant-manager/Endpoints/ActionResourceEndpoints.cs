using Microsoft.EntityFrameworkCore;
using plant_manager.Data;
using plant_manager.Data.Models;

namespace plant_manager.Endpoints
{
    public static class ActionResourceEndpoints
    {
        public static void MapActionResourceEndpoints(this WebApplication app)
        {
            app.MapGet("/api/action-resources", async (ApplicationDbContext db) =>
            {
                var resources = await db.ActionResources
                    .OrderBy(resource => resource.Name)
                    .Select(resource => ActionResourceDto.FromActionResource(resource))
                    .ToListAsync();

                return Results.Ok(resources);
            });

            app.MapPost("/api/action-resources", async (SaveActionResourceRequest request, ApplicationDbContext db) =>
            {
                if (string.IsNullOrWhiteSpace(request.Name))
                {
                    return Results.BadRequest(new { error = "Resource name is required." });
                }

                var name = request.Name.Trim();
                var exists = await db.ActionResources.AnyAsync(resource => resource.Name.ToLower() == name.ToLower());
                if (exists)
                {
                    return Results.Conflict(new { error = "A resource with this name already exists." });
                }

                var resource = new ActionResource
                {
                    Name = name,
                    Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim()
                };

                db.ActionResources.Add(resource);
                await db.SaveChangesAsync();

                return Results.Created($"/api/action-resources/{resource.Id}", ActionResourceDto.FromActionResource(resource));
            });

            app.MapPut("/api/action-resources/{id:int}", async (int id, SaveActionResourceRequest request, ApplicationDbContext db) =>
            {
                if (string.IsNullOrWhiteSpace(request.Name))
                {
                    return Results.BadRequest(new { error = "Resource name is required." });
                }

                var resource = await db.ActionResources.FindAsync(id);
                if (resource is null)
                {
                    return Results.NotFound();
                }

                var name = request.Name.Trim();
                var exists = await db.ActionResources.AnyAsync(item =>
                    item.Id != id && item.Name.ToLower() == name.ToLower());
                if (exists)
                {
                    return Results.Conflict(new { error = "A resource with this name already exists." });
                }

                resource.Name = name;
                resource.Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim();

                await db.SaveChangesAsync();

                return Results.Ok(ActionResourceDto.FromActionResource(resource));
            });

            app.MapDelete("/api/action-resources/{id:int}", async (int id, ApplicationDbContext db) =>
            {
                var resource = await db.ActionResources.FindAsync(id);
                if (resource is null)
                {
                    return Results.NotFound();
                }

                var isInUse = await db.ActionLogResources.AnyAsync(logResource => logResource.ActionResourceId == id)
                    || await db.CareActivityActionResources.AnyAsync(activityResource => activityResource.ActionResourceId == id);
                if (isInUse)
                {
                    return Results.Conflict(new { error = "Resource is in use." });
                }

                db.ActionResources.Remove(resource);
                await db.SaveChangesAsync();

                return Results.NoContent();
            });
        }
    }
}
