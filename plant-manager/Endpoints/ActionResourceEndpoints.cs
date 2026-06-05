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
                    .Include(resource => resource.ProducedByRecipe)
                    .OrderBy(resource => resource.Name)
                    .Select(resource => ActionResourceDto.FromActionResource(resource))
                    .ToListAsync();

                return Results.Ok(resources);
            });

            app.MapPost("/api/action-resources", async (SaveActionResourceRequest request, ApplicationDbContext db) =>
            {
                if (!EndpointHelpers.TryNormalizeRequired(request.Name, "Resource name is required.", out var name, out var error))
                {
                    return error;
                }

                var exists = await db.NameExistsAsync<ActionResource>(resource => resource.Name.ToLower() == name.ToLower());
                if (exists)
                {
                    return EndpointHelpers.Conflict("A resource with this name already exists.");
                }

                var resource = new ActionResource
                {
                    Name = name,
                    Notes = EndpointHelpers.NormalizeOptional(request.Notes)
                };

                db.ActionResources.Add(resource);
                await db.SaveChangesAsync();

                return Results.Created($"/api/action-resources/{resource.Id}", ActionResourceDto.FromActionResource(resource));
            });

            app.MapPut("/api/action-resources/{id:int}", async (int id, SaveActionResourceRequest request, ApplicationDbContext db) =>
            {
                if (!EndpointHelpers.TryNormalizeRequired(request.Name, "Resource name is required.", out var name, out var error))
                {
                    return error;
                }

                var resource = await db.ActionResources.FindAsync(id);
                if (resource is null)
                {
                    return Results.NotFound();
                }

                var exists = await db.NameExistsAsync<ActionResource>(item =>
                    item.Id != id && item.Name.ToLower() == name.ToLower());
                if (exists)
                {
                    return EndpointHelpers.Conflict("A resource with this name already exists.");
                }

                resource.Name = name;
                resource.Notes = EndpointHelpers.NormalizeOptional(request.Notes);

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
                    || await db.CareActivityActionResources.AnyAsync(activityResource => activityResource.ActionResourceId == id)
                    || await db.RecipeComponents.AnyAsync(component => component.ActionResourceId == id);
                if (isInUse)
                {
                    return EndpointHelpers.Conflict("Resource is in use.");
                }

                db.ActionResources.Remove(resource);
                await db.SaveChangesAsync();

                return Results.NoContent();
            });
        }
    }
}
