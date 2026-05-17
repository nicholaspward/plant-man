using Microsoft.EntityFrameworkCore;
using plant_manager.Data;
using plant_manager.Data.Models;

namespace plant_manager.Endpoints
{
    public static class PlantEndpoints
    {
        public static void MapPlantEndpoints(this WebApplication app)
        {
            app.MapGet("/api/plants", async (ApplicationDbContext db) =>
            {
                var plants = await db.Plants
                    .Include(plant => plant.Taxon)
                    .OrderBy(plant => plant.Nickname)
                    .Select(plant => PlantDto.FromPlant(plant))
                    .ToListAsync();

                return Results.Ok(plants);
            });

            app.MapGet("/api/plants/{id:int}", async (int id, ApplicationDbContext db) =>
            {
                var plant = await db.Plants
                    .Include(item => item.Taxon)
                    .FirstOrDefaultAsync(item => item.Id == id);

                return plant is null
                    ? Results.NotFound()
                    : Results.Ok(PlantDto.FromPlant(plant));
            });

            app.MapPost("/api/plants", async (CreatePlantRequest request, ApplicationDbContext db) =>
            {
                if (string.IsNullOrWhiteSpace(request.Nickname))
                {
                    return Results.BadRequest(new { error = "Nickname is required." });
                }

                var taxon = await db.PlantTaxa.FindAsync(request.TaxonId);
                if (taxon is null)
                {
                    return Results.BadRequest(new { error = "Taxon was not found." });
                }

                var plant = new Plant
                {
                    Nickname = request.Nickname.Trim(),
                    Location = string.IsNullOrWhiteSpace(request.Location) ? "Unassigned" : request.Location.Trim(),
                    TaxonId = request.TaxonId,
                    LastWateredOn = request.LastWateredOn,
                    WaterEveryDays = Math.Clamp(request.WaterEveryDays ?? 7, 1, 365)
                };

                db.Plants.Add(plant);
                await db.SaveChangesAsync();

                plant.Taxon = taxon;

                return Results.Created($"/api/plants/{plant.Id}", PlantDto.FromPlant(plant));
            });

            app.MapPut("/api/plants/{id:int}", async (int id, UpdatePlantRequest request, ApplicationDbContext db) =>
            {
                if (string.IsNullOrWhiteSpace(request.Nickname))
                {
                    return Results.BadRequest(new { error = "Nickname is required." });
                }

                var plant = await db.Plants
                    .Include(item => item.Taxon)
                    .FirstOrDefaultAsync(item => item.Id == id);

                if (plant is null)
                {
                    return Results.NotFound();
                }

                var taxon = await db.PlantTaxa.FindAsync(request.TaxonId);
                if (taxon is null)
                {
                    return Results.BadRequest(new { error = "Taxon was not found." });
                }

                plant.Nickname = request.Nickname.Trim();
                plant.Location = string.IsNullOrWhiteSpace(request.Location) ? "Unassigned" : request.Location.Trim();
                plant.TaxonId = request.TaxonId;
                plant.Taxon = taxon;
                plant.LastWateredOn = request.LastWateredOn;
                plant.WaterEveryDays = Math.Clamp(request.WaterEveryDays ?? 7, 1, 365);

                await db.SaveChangesAsync();

                return Results.Ok(PlantDto.FromPlant(plant));
            });

            app.MapDelete("/api/plants/{id:int}", async (int id, ApplicationDbContext db) =>
            {
                var plant = await db.Plants.FindAsync(id);
                if (plant is null)
                {
                    return Results.NotFound();
                }

                db.Plants.Remove(plant);
                await db.SaveChangesAsync();

                return Results.NoContent();
            });
        }
    }
}
