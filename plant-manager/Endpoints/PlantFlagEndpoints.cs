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
                    .OrderByDescending(definition => definition.IsEnabled)
                    .ThenBy(definition => definition.Name)
                    .Select(definition => PlantFlagDefinitionDto.FromDefinition(definition))
                    .ToListAsync();

                return Results.Ok(definitions);
            });

            app.MapPost("/api/plant-flags", async (SavePlantFlagDefinitionRequest request, ApplicationDbContext db) =>
            {
                if (string.IsNullOrWhiteSpace(request.Name))
                {
                    return Results.BadRequest(new { error = "Flag name is required." });
                }

                var name = request.Name.Trim();
                var exists = await db.PlantFlagDefinitions.AnyAsync(definition =>
                    definition.Name.ToLower() == name.ToLower());
                if (exists)
                {
                    return Results.Conflict(new { error = "A flag with this name already exists." });
                }

                var definition = new PlantFlagDefinition
                {
                    Name = name,
                    Color = NormalizeColor(request.Color),
                    IsEnabled = request.IsEnabled
                };

                db.PlantFlagDefinitions.Add(definition);
                await db.SaveChangesAsync();

                return Results.Created($"/api/plant-flags/{definition.Id}", PlantFlagDefinitionDto.FromDefinition(definition));
            });

            app.MapPut("/api/plant-flags/{id:int}", async (int id, SavePlantFlagDefinitionRequest request, ApplicationDbContext db) =>
            {
                if (string.IsNullOrWhiteSpace(request.Name))
                {
                    return Results.BadRequest(new { error = "Flag name is required." });
                }

                var name = request.Name.Trim();
                var definition = await db.PlantFlagDefinitions.FindAsync(id);
                if (definition is null)
                {
                    return Results.NotFound();
                }

                var exists = await db.PlantFlagDefinitions.AnyAsync(item =>
                    item.Id != id && item.Name.ToLower() == name.ToLower());
                if (exists)
                {
                    return Results.Conflict(new { error = "A flag with this name already exists." });
                }

                definition.Name = name;
                definition.Color = NormalizeColor(request.Color);
                definition.IsEnabled = request.IsEnabled;

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
                    definition.IsEnabled = false;
                    await db.SaveChangesAsync();
                    return Results.Conflict(new { error = "Flag is assigned to plants, so it was disabled instead of deleted." });
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
                if (definition is null || !definition.IsEnabled)
                {
                    return Results.BadRequest(new { error = "Flag was not found or is disabled." });
                }

                var hasActiveFlag = await db.PlantFlags.AnyAsync(flag =>
                    flag.PlantId == plantId
                    && flag.PlantFlagDefinitionId == request.PlantFlagDefinitionId
                    && flag.ResolvedOn == null);
                if (hasActiveFlag)
                {
                    return Results.Conflict(new { error = "This plant already has that active flag." });
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
            string.IsNullOrWhiteSpace(notes) ? null : notes.Trim();
    }
}
