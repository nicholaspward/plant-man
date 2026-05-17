using Microsoft.EntityFrameworkCore;
using plant_manager.Data;

namespace plant_manager.Endpoints
{
    public static class CareTaskEndpoints
    {
        public static void MapCareTaskEndpoints(this WebApplication app)
        {
            app.MapGet("/api/care-tasks/today", async (ApplicationDbContext db) =>
            {
                var today = DateOnly.FromDateTime(DateTime.UtcNow);
                var plants = await db.Plants
                    .Include(plant => plant.Taxon)
                    .OrderBy(plant => plant.Nickname)
                    .ToListAsync();

                var tasks = plants
                    .Select(plant => CareTaskDto.FromPlant(plant, today))
                    .Where(task => task.Status is "due" or "soon")
                    .ToList();

                return Results.Ok(tasks);
            });
        }
    }
}
