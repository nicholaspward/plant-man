using Microsoft.EntityFrameworkCore;
using plant_manager.Data;
using plant_manager.Data.Models;

namespace plant_manager.Endpoints
{
    public static class PlantTaxonEndpoints
    {
        public static void MapPlantTaxonEndpoints(this WebApplication app)
        {
            app.MapGet("/api/plant-taxa", async (ApplicationDbContext db) =>
            {
                var taxa = await db.PlantTaxa
                    .OrderBy(item => item.Name)
                    .Select(item => PlantTaxonDto.FromTaxon(item))
                    .ToListAsync();

                return Results.Ok(taxa);
            });

            app.MapPost("/api/plant-taxa", async (SavePlantTaxonRequest request, ApplicationDbContext db) =>
            {
                if (string.IsNullOrWhiteSpace(request.Name)
                    || string.IsNullOrWhiteSpace(request.Genus)
                    || string.IsNullOrWhiteSpace(request.Species))
                {
                    return Results.BadRequest(new { error = "Name, genus, and species are required." });
                }

                var taxon = new PlantTaxon
                {
                    Name = request.Name.Trim(),
                    Genus = request.Genus.Trim(),
                    Species = request.Species.Trim(),
                    Cultivar = string.IsNullOrWhiteSpace(request.Cultivar) ? null : request.Cultivar.Trim(),
                    Variety = string.IsNullOrWhiteSpace(request.Variety) ? null : request.Variety.Trim(),
                    Authority = string.IsNullOrWhiteSpace(request.Authority) ? null : request.Authority.Trim()
                };

                db.PlantTaxa.Add(taxon);
                await db.SaveChangesAsync();

                return Results.Created($"/api/plant-taxa/{taxon.Id}", PlantTaxonDto.FromTaxon(taxon));
            });

            app.MapPut("/api/plant-taxa/{id:int}", async (int id, SavePlantTaxonRequest request, ApplicationDbContext db) =>
            {
                if (string.IsNullOrWhiteSpace(request.Name)
                    || string.IsNullOrWhiteSpace(request.Genus)
                    || string.IsNullOrWhiteSpace(request.Species))
                {
                    return Results.BadRequest(new { error = "Name, genus, and species are required." });
                }

                var taxon = await db.PlantTaxa.FindAsync(id);
                if (taxon is null)
                {
                    return Results.NotFound();
                }

                taxon.Name = request.Name.Trim();
                taxon.Genus = request.Genus.Trim();
                taxon.Species = request.Species.Trim();
                taxon.Cultivar = string.IsNullOrWhiteSpace(request.Cultivar) ? null : request.Cultivar.Trim();
                taxon.Variety = string.IsNullOrWhiteSpace(request.Variety) ? null : request.Variety.Trim();
                taxon.Authority = string.IsNullOrWhiteSpace(request.Authority) ? null : request.Authority.Trim();

                await db.SaveChangesAsync();

                return Results.Ok(PlantTaxonDto.FromTaxon(taxon));
            });

            app.MapDelete("/api/plant-taxa/{id:int}", async (int id, ApplicationDbContext db) =>
            {
                var taxon = await db.PlantTaxa.FindAsync(id);
                if (taxon is null)
                {
                    return Results.NotFound();
                }

                var isUsedByPlant = await db.Plants.AnyAsync(plant => plant.TaxonId == id);
                if (isUsedByPlant)
                {
                    return Results.Conflict(new { error = "Taxon is used by one or more plants." });
                }

                db.PlantTaxa.Remove(taxon);
                await db.SaveChangesAsync();

                return Results.NoContent();
            });
        }
    }
}
