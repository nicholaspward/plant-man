using Microsoft.EntityFrameworkCore;
using plant_manager.Data;
using plant_manager.Data.Models;

namespace plant_manager.Endpoints
{
    public static class PlantLocationEndpoints
    {
        public static void MapPlantLocationEndpoints(this WebApplication app)
        {
            app.MapGet("/api/plant-locations", async (ApplicationDbContext db) =>
            {
                var locations = await db.PlantLocations
                    .OrderBy(location => location.Name)
                    .Select(location => PlantLocationDto.FromLocation(location))
                    .ToListAsync();

                return Results.Ok(locations);
            });

            app.MapPost("/api/plant-locations", async (SavePlantLocationRequest request, ApplicationDbContext db) =>
            {
                if (!EndpointHelpers.TryNormalizeRequired(request.Name, "Location name is required.", out var name, out var error))
                {
                    return error;
                }

                var exists = await db.NameExistsAsync<PlantLocation>(location => location.Name.ToLower() == name.ToLower());
                if (exists)
                {
                    return EndpointHelpers.Conflict("A location with this name already exists.");
                }

                var location = new PlantLocation
                {
                    Name = name,
                    Notes = EndpointHelpers.NormalizeOptional(request.Notes)
                };

                db.PlantLocations.Add(location);
                await db.SaveChangesAsync();

                return Results.Created($"/api/plant-locations/{location.Id}", PlantLocationDto.FromLocation(location));
            });

            app.MapPut("/api/plant-locations/{id:int}", async (int id, SavePlantLocationRequest request, ApplicationDbContext db) =>
            {
                if (!EndpointHelpers.TryNormalizeRequired(request.Name, "Location name is required.", out var name, out var error))
                {
                    return error;
                }

                var location = await db.PlantLocations.FindAsync(id);
                if (location is null)
                {
                    return Results.NotFound();
                }

                var exists = await db.NameExistsAsync<PlantLocation>(item =>
                    item.Id != id && item.Name.ToLower() == name.ToLower());
                if (exists)
                {
                    return EndpointHelpers.Conflict("A location with this name already exists.");
                }

                location.Name = name;
                location.Notes = EndpointHelpers.NormalizeOptional(request.Notes);

                await db.SaveChangesAsync();

                return Results.Ok(PlantLocationDto.FromLocation(location));
            });

            app.MapDelete("/api/plant-locations/{id:int}", async (int id, ApplicationDbContext db) =>
            {
                var location = await db.PlantLocations.FindAsync(id);
                if (location is null)
                {
                    return Results.NotFound();
                }

                var isInUse = await db.Plants.AnyAsync(plant => plant.LocationId == id);
                if (isInUse)
                {
                    return EndpointHelpers.Conflict("Location is assigned to one or more plants.");
                }

                db.PlantLocations.Remove(location);
                await db.SaveChangesAsync();

                return Results.NoContent();
            });
        }
    }
}
