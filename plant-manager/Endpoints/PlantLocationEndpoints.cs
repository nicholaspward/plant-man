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
                    .OrderByDescending(location => location.IsEnabled)
                    .ThenBy(location => location.Name)
                    .Select(location => PlantLocationDto.FromLocation(location))
                    .ToListAsync();

                return Results.Ok(locations);
            });

            app.MapPost("/api/plant-locations", async (SavePlantLocationRequest request, ApplicationDbContext db) =>
            {
                if (string.IsNullOrWhiteSpace(request.Name))
                {
                    return Results.BadRequest(new { error = "Location name is required." });
                }

                var name = request.Name.Trim();
                var exists = await db.PlantLocations.AnyAsync(location => location.Name.ToLower() == name.ToLower());
                if (exists)
                {
                    return Results.Conflict(new { error = "A location with this name already exists." });
                }

                var location = new PlantLocation
                {
                    Name = name,
                    Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim(),
                    IsEnabled = request.IsEnabled
                };

                db.PlantLocations.Add(location);
                await db.SaveChangesAsync();

                return Results.Created($"/api/plant-locations/{location.Id}", PlantLocationDto.FromLocation(location));
            });

            app.MapPut("/api/plant-locations/{id:int}", async (int id, SavePlantLocationRequest request, ApplicationDbContext db) =>
            {
                if (string.IsNullOrWhiteSpace(request.Name))
                {
                    return Results.BadRequest(new { error = "Location name is required." });
                }

                var location = await db.PlantLocations.FindAsync(id);
                if (location is null)
                {
                    return Results.NotFound();
                }

                var name = request.Name.Trim();
                var exists = await db.PlantLocations.AnyAsync(item =>
                    item.Id != id && item.Name.ToLower() == name.ToLower());
                if (exists)
                {
                    return Results.Conflict(new { error = "A location with this name already exists." });
                }

                location.Name = name;
                location.Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim();
                location.IsEnabled = request.IsEnabled;

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
                    location.IsEnabled = false;
                    await db.SaveChangesAsync();
                    return Results.Conflict(new { error = "Location is in use, so it was disabled instead of deleted." });
                }

                db.PlantLocations.Remove(location);
                await db.SaveChangesAsync();

                return Results.NoContent();
            });
        }
    }
}
