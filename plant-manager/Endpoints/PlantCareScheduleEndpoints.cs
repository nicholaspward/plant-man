using Microsoft.EntityFrameworkCore;
using plant_manager.Data;
using plant_manager.Data.Models;

namespace plant_manager.Endpoints
{
    public static class PlantCareScheduleEndpoints
    {
        public static void MapPlantCareScheduleEndpoints(this WebApplication app)
        {
            app.MapPost("/api/plant-care-schedules/bulk", async (
                BulkSavePlantCareScheduleRequest request,
                ApplicationDbContext db) =>
            {
                var plantIds = request.PlantIds
                    .Where(id => id > 0)
                    .Distinct()
                    .ToList();
                if (plantIds.Count == 0)
                {
                    return Results.BadRequest(new { error = "At least one plant is required." });
                }

                var activity = await db.CareActivities
                    .Include(item => item.Actions)
                    .ThenInclude(action => action.CareAction)
                    .FirstOrDefaultAsync(item => item.Id == request.CareActivityId);
                if (activity is null)
                {
                    return Results.BadRequest(new { error = "Care activity was not found." });
                }

                var primaryAction = activity.PrimaryAction();
                if (!activity.IsEnabled || primaryAction is null || activity.Actions.Any(action => !action.CareAction.IsEnabled))
                {
                    return Results.BadRequest(new { error = "Disabled activities cannot be scheduled." });
                }

                var plants = await db.Plants
                    .Include(plant => plant.CareSchedules)
                    .Where(plant => plantIds.Contains(plant.Id))
                    .ToListAsync();
                if (plants.Count != plantIds.Count)
                {
                    return Results.BadRequest(new { error = "One or more plants were not found." });
                }

                var everyDays = Math.Clamp(request.EveryDays ?? 7, 1, 365);
                foreach (var plant in plants)
                {
                    var schedule = plant.CareSchedules
                        .FirstOrDefault(item => item.CareActivityId == activity.Id);
                    if (schedule is null)
                    {
                        schedule = new PlantCareSchedule
                        {
                            PlantId = plant.Id,
                            CareActionId = primaryAction.Id,
                            CareActivityId = activity.Id
                        };
                        plant.CareSchedules.Add(schedule);
                    }

                    schedule.CareActionId = primaryAction.Id;
                    schedule.CareActivityId = activity.Id;
                    schedule.EveryDays = everyDays;
                    schedule.IsEnabled = request.IsEnabled;
                }

                await db.SaveChangesAsync();

                return Results.Ok(new { updated = plants.Count });
            });
        }
    }
}
