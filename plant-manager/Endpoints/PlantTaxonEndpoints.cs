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
                var validation = ValidateTaxonRequest(request);
                if (validation.Error is not null)
                {
                    return EndpointHelpers.BadRequest(validation.Error);
                }

                var taxon = new PlantTaxon
                {
                    Name = validation.Name,
                    Genus = validation.Genus,
                    Species = validation.Species,
                    Cultivar = validation.Cultivar,
                    Variety = validation.Variety,
                    Authority = validation.Authority,
                    Family = validation.Family,
                    CommonName = validation.CommonName,
                    ExternalSource = validation.ExternalSource,
                    ExternalId = validation.ExternalId
                };

                db.PlantTaxa.Add(taxon);
                await db.SaveChangesAsync();

                return Results.Created($"/api/plant-taxa/{taxon.Id}", PlantTaxonDto.FromTaxon(taxon));
            });

            app.MapPut("/api/plant-taxa/{id:int}", async (int id, SavePlantTaxonRequest request, ApplicationDbContext db) =>
            {
                var validation = ValidateTaxonRequest(request);
                if (validation.Error is not null)
                {
                    return EndpointHelpers.BadRequest(validation.Error);
                }

                var taxon = await db.PlantTaxa.FindAsync(id);
                if (taxon is null)
                {
                    return Results.NotFound();
                }

                taxon.Name = validation.Name;
                taxon.Genus = validation.Genus;
                taxon.Species = validation.Species;
                taxon.Cultivar = validation.Cultivar;
                taxon.Variety = validation.Variety;
                taxon.Authority = validation.Authority;
                taxon.Family = validation.Family;
                taxon.CommonName = validation.CommonName;
                taxon.ExternalSource = validation.ExternalSource;
                taxon.ExternalId = validation.ExternalId;

                await db.SaveChangesAsync();

                return Results.Ok(PlantTaxonDto.FromTaxon(taxon));
            });

            app.MapPost("/api/plant-taxa/import", async (ImportPlantTaxonRequest request, ApplicationDbContext db) =>
            {
                if (!string.Equals(request.Source, "gbif", StringComparison.OrdinalIgnoreCase))
                {
                    return EndpointHelpers.BadRequest("Only GBIF imports are supported.");
                }

                if (!EndpointHelpers.TryNormalizeRequired(request.ExternalId, "External ID is required.", out var externalId, out var error)
                    || !EndpointHelpers.TryNormalizeRequired(request.ScientificName, "Scientific name is required.", out var scientificName, out error))
                {
                    return error;
                }

                var existingExternalTaxon = await db.PlantTaxa.FirstOrDefaultAsync(taxon =>
                    taxon.ExternalSource == "gbif" && taxon.ExternalId == externalId);
                if (existingExternalTaxon is not null)
                {
                    return Results.Ok(PlantTaxonDto.FromTaxon(existingExternalTaxon));
                }

                var genus = EndpointHelpers.NormalizeOptional(request.Genus) ?? FirstScientificNamePart(scientificName);
                var species = SpecificEpithet(EndpointHelpers.NormalizeOptional(request.Species))
                    ?? SecondScientificNamePart(request.CanonicalName ?? scientificName);
                if (string.IsNullOrWhiteSpace(genus) || string.IsNullOrWhiteSpace(species))
                {
                    return EndpointHelpers.BadRequest("GBIF result needs genus and species before it can be imported.");
                }

                var commonName = EndpointHelpers.NormalizeOptional(request.CommonName);
                var canonicalName = EndpointHelpers.NormalizeOptional(request.CanonicalName) ?? scientificName;
                var name = commonName ?? canonicalName;
                var localNameExists = await db.NameExistsAsync<PlantTaxon>(taxon => taxon.Name.ToLower() == name.ToLower());
                if (localNameExists)
                {
                    return EndpointHelpers.Conflict("A taxon with this name already exists.");
                }

                var taxon = new PlantTaxon
                {
                    Name = name,
                    Genus = genus,
                    Species = species,
                    Family = EndpointHelpers.NormalizeOptional(request.Family),
                    CommonName = commonName,
                    ExternalSource = "gbif",
                    ExternalId = externalId
                };

                db.PlantTaxa.Add(taxon);
                await db.SaveChangesAsync();

                return Results.Created($"/api/plant-taxa/{taxon.Id}", PlantTaxonDto.FromTaxon(taxon));
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
                    return EndpointHelpers.Conflict("Taxon is used by one or more plants.");
                }

                db.PlantTaxa.Remove(taxon);
                await db.SaveChangesAsync();

                return Results.NoContent();
            });
        }

        private static (
            string Name,
            string Genus,
            string Species,
            string? Cultivar,
            string? Variety,
            string? Authority,
            string? Family,
            string? CommonName,
            string? ExternalSource,
            string? ExternalId,
            string? Error) ValidateTaxonRequest(SavePlantTaxonRequest request)
        {
            if (!EndpointHelpers.TryNormalizeRequired(request.Name, "Name, genus, and species are required.", out var name, out _)
                || !EndpointHelpers.TryNormalizeRequired(request.Genus, "Name, genus, and species are required.", out var genus, out _)
                || !EndpointHelpers.TryNormalizeRequired(request.Species, "Name, genus, and species are required.", out var species, out _))
            {
                return (string.Empty, string.Empty, string.Empty, null, null, null, null, null, null, null, "Name, genus, and species are required.");
            }

            return (
                name,
                genus,
                species,
                EndpointHelpers.NormalizeOptional(request.Cultivar),
                EndpointHelpers.NormalizeOptional(request.Variety),
                EndpointHelpers.NormalizeOptional(request.Authority),
                EndpointHelpers.NormalizeOptional(request.Family),
                EndpointHelpers.NormalizeOptional(request.CommonName),
                EndpointHelpers.NormalizeOptional(request.ExternalSource),
                EndpointHelpers.NormalizeOptional(request.ExternalId),
                null);
        }

        private static string? FirstScientificNamePart(string scientificName) =>
            scientificName.Split(' ', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault();

        private static string? SecondScientificNamePart(string scientificName) =>
            scientificName.Split(' ', StringSplitOptions.RemoveEmptyEntries).Skip(1).FirstOrDefault();

        private static string? SpecificEpithet(string? species)
        {
            if (string.IsNullOrWhiteSpace(species))
            {
                return null;
            }

            return species.Split(' ', StringSplitOptions.RemoveEmptyEntries).Skip(1).FirstOrDefault() ?? species;
        }
    }
}
