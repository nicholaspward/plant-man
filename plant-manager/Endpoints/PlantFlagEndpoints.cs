using Microsoft.EntityFrameworkCore;
using plant_manager.Data;
using plant_manager.Data.Models;

namespace plant_manager.Endpoints
{
    public static class PlantFlagEndpoints
    {
        public static void MapPlantFlagEndpoints(this WebApplication app)
        {
            app.MapGet("/api/plant-flags", async (ApplicationDbContext db) =>
            {
                var definitions = await db.PlantFlagDefinitions
                    .OrderBy(definition => definition.Name)
                    .Select(definition => PlantFlagDefinitionDto.FromDefinition(definition))
                    .ToListAsync();

                return Results.Ok(definitions);
            });

            app.MapPost("/api/plant-flags", async (SavePlantFlagDefinitionRequest request, ApplicationDbContext db) =>
            {
                if (!EndpointHelpers.TryNormalizeRequired(request.Name, "Flag name is required.", out var name, out var error))
                {
                    return error;
                }

                var exists = await db.NameExistsAsync<PlantFlagDefinition>(definition =>
                    definition.Name.ToLower() == name.ToLower());
                if (exists)
                {
                    return EndpointHelpers.Conflict("A flag with this name already exists.");
                }

                var definition = new PlantFlagDefinition
                {
                    Name = name,
                    Color = NormalizeColor(request.Color)
                };

                db.PlantFlagDefinitions.Add(definition);
                await db.SaveChangesAsync();

                return Results.Created($"/api/plant-flags/{definition.Id}", PlantFlagDefinitionDto.FromDefinition(definition));
            });

            app.MapPut("/api/plant-flags/{id:int}", async (int id, SavePlantFlagDefinitionRequest request, ApplicationDbContext db) =>
            {
                if (!EndpointHelpers.TryNormalizeRequired(request.Name, "Flag name is required.", out var name, out var error))
                {
                    return error;
                }

                var definition = await db.PlantFlagDefinitions.FindAsync(id);
                if (definition is null)
                {
                    return Results.NotFound();
                }

                var exists = await db.NameExistsAsync<PlantFlagDefinition>(item =>
                    item.Id != id && item.Name.ToLower() == name.ToLower());
                if (exists)
                {
                    return EndpointHelpers.Conflict("A flag with this name already exists.");
                }

                definition.Name = name;
                definition.Color = NormalizeColor(request.Color);

                await db.SaveChangesAsync();

                return Results.Ok(PlantFlagDefinitionDto.FromDefinition(definition));
            });

            app.MapDelete("/api/plant-flags/{id:int}", async (int id, ApplicationDbContext db) =>
            {
                var definition = await db.PlantFlagDefinitions.FindAsync(id);
                if (definition is null)
                {
                    return Results.NotFound();
                }

                var isUsed = await db.PlantFlags.AnyAsync(flag => flag.PlantFlagDefinitionId == id);
                if (isUsed)
                {
                    return EndpointHelpers.Conflict("Flag is assigned to plants.");
                }

                db.PlantFlagDefinitions.Remove(definition);
                await db.SaveChangesAsync();

                return Results.NoContent();
            });

            app.MapPost("/api/plants/{plantId:int}/flags", async (
                int plantId,
                AssignPlantFlagRequest request,
                ApplicationDbContext db) =>
            {
                var plant = await db.Plants.FindAsync(plantId);
                if (plant is null)
                {
                    return Results.NotFound();
                }

                var definition = await db.PlantFlagDefinitions.FindAsync(request.PlantFlagDefinitionId);
                if (definition is null)
                {
                    return Results.BadRequest(new { error = "Flag was not found." });
                }

                var hasActiveFlag = await db.PlantFlags.AnyAsync(flag =>
                    flag.PlantId == plantId
                    && flag.PlantFlagDefinitionId == request.PlantFlagDefinitionId
                    && flag.ResolvedOn == null);
                if (hasActiveFlag)
                {
                    return EndpointHelpers.Conflict("This plant already has that active flag.");
                }

                var flag = new PlantFlag
                {
                    PlantId = plantId,
                    PlantFlagDefinitionId = request.PlantFlagDefinitionId,
                    Definition = definition,
                    StartedOn = request.StartedOn ?? DateOnly.FromDateTime(DateTime.UtcNow),
                    Notes = NormalizeNotes(request.Notes)
                };

                db.PlantFlags.Add(flag);
                await db.SaveChangesAsync();

                return Results.Created($"/api/plants/{plantId}/flags/{flag.Id}", PlantFlagDto.FromPlantFlag(flag));
            });

            app.MapPut("/api/plants/{plantId:int}/flags/{flagId:int}", async (
                int plantId,
                int flagId,
                UpdatePlantFlagRequest request,
                ApplicationDbContext db) =>
            {
                var flag = await db.PlantFlags
                    .Include(item => item.Definition)
                    .FirstOrDefaultAsync(item => item.Id == flagId && item.PlantId == plantId);
                if (flag is null)
                {
                    return Results.NotFound();
                }

                flag.StartedOn = request.StartedOn ?? flag.StartedOn;
                flag.ResolvedOn = request.ResolvedOn;
                flag.Notes = NormalizeNotes(request.Notes);

                await db.SaveChangesAsync();

                return Results.Ok(PlantFlagDto.FromPlantFlag(flag));
            });

            app.MapPost("/api/plants/{plantId:int}/flags/{flagId:int}/resolve", async (
                int plantId,
                int flagId,
                ApplicationDbContext db) =>
            {
                var flag = await db.PlantFlags
                    .Include(item => item.Definition)
                    .FirstOrDefaultAsync(item => item.Id == flagId && item.PlantId == plantId);
                if (flag is null)
                {
                    return Results.NotFound();
                }

                flag.ResolvedOn = DateOnly.FromDateTime(DateTime.UtcNow);
                await db.SaveChangesAsync();

                return Results.Ok(PlantFlagDto.FromPlantFlag(flag));
            });

            app.MapDelete("/api/plants/{plantId:int}/flags/{flagId:int}", async (
                int plantId,
                int flagId,
                ApplicationDbContext db) =>
            {
                var flag = await db.PlantFlags
                    .FirstOrDefaultAsync(item => item.Id == flagId && item.PlantId == plantId);
                if (flag is null)
                {
                    return Results.NotFound();
                }

                db.PlantFlags.Remove(flag);
                await db.SaveChangesAsync();

                return Results.NoContent();
            });
        }

        private static string NormalizeColor(string? color) =>
            string.IsNullOrWhiteSpace(color) ? "#f2f2f2" : color.Trim();

        private static string? NormalizeNotes(string? notes) =>
            EndpointHelpers.NormalizeOptional(notes);
    }
}
