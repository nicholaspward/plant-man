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
                    .Include(plant => plant.CareSchedules)
                    .ThenInclude(schedule => schedule.CareAction)
                    .Include(plant => plant.ActionLogs)
                    .Include(plant => plant.Flags)
                    .ThenInclude(flag => flag.Definition)
                    .OrderBy(plant => plant.Nickname)
                    .ToListAsync();

                return Results.Ok(plants.Select(PlantDto.FromPlant));
            });

            app.MapGet("/api/plants/{id:int}", async (int id, ApplicationDbContext db) =>
            {
                var plant = await db.Plants
                    .Include(item => item.Taxon)
                    .Include(plant => plant.CareSchedules)
                    .ThenInclude(schedule => schedule.CareAction)
                    .Include(plant => plant.ActionLogs)
                    .Include(plant => plant.Flags)
                    .ThenInclude(flag => flag.Definition)
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
                    TaxonId = request.TaxonId
                };

                db.Plants.Add(plant);
                await db.SaveChangesAsync();

                plant.Taxon = taxon;
                var scheduleError = await ApplyCareSchedules(plant, request.CareSchedules, db);
                if (scheduleError is not null)
                {
                    return Results.BadRequest(new { error = scheduleError });
                }

                await db.SaveChangesAsync();

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
                    .Include(item => item.CareSchedules)
                    .ThenInclude(schedule => schedule.CareAction)
                    .Include(item => item.ActionLogs)
                    .Include(item => item.Flags)
                    .ThenInclude(flag => flag.Definition)
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
                var scheduleError = await ApplyCareSchedules(plant, request.CareSchedules, db);
                if (scheduleError is not null)
                {
                    return Results.BadRequest(new { error = scheduleError });
                }

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

        private static async Task<string?> ApplyCareSchedules(
            Plant plant,
            IReadOnlyList<SavePlantCareScheduleRequest>? requestedSchedules,
            ApplicationDbContext db)
        {
            var schedules = requestedSchedules?.ToList();
            if (schedules is null)
            {
                var waterAction = await db.CareActions
                    .FirstOrDefaultAsync(action => action.Name.ToLower() == "water");
                if (waterAction is null)
                {
                    return null;
                }

                schedules =
                [
                    new SavePlantCareScheduleRequest(
                        waterAction.Id,
                        7,
                        true)
                ];
            }

            var normalizedSchedules = schedules
                .GroupBy(schedule => schedule.CareActionId)
                .Select(group => group.First())
                .Where(schedule => schedule.CareActionId > 0)
                .ToList();
            var actionIds = normalizedSchedules
                .Select(schedule => schedule.CareActionId)
                .ToList();
            var actionsById = await db.CareActions
                .Where(action => actionIds.Contains(action.Id))
                .ToDictionaryAsync(action => action.Id);

            if (actionsById.Count != actionIds.Count)
            {
                return "One or more care actions were not found.";
            }

            var requestedActionIds = actionIds.ToHashSet();
            var schedulesToRemove = plant.CareSchedules
                .Where(schedule => !requestedActionIds.Contains(schedule.CareActionId))
                .ToList();
            db.PlantCareSchedules.RemoveRange(schedulesToRemove);

            foreach (var requestedSchedule in normalizedSchedules)
            {
                var schedule = plant.CareSchedules
                    .FirstOrDefault(item => item.CareActionId == requestedSchedule.CareActionId);
                if (schedule is null)
                {
                    schedule = new PlantCareSchedule
                    {
                        PlantId = plant.Id,
                        CareActionId = requestedSchedule.CareActionId,
                        CareAction = actionsById[requestedSchedule.CareActionId]
                    };
                    plant.CareSchedules.Add(schedule);
                }

                schedule.EveryDays = Math.Clamp(requestedSchedule.EveryDays ?? 7, 1, 365);
                schedule.IsEnabled = requestedSchedule.IsEnabled;
            }

            return null;
        }
    }
}
