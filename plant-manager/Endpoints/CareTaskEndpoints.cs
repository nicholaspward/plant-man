using Microsoft.EntityFrameworkCore;
using plant_manager.Data;

namespace plant_manager.Endpoints
{
    public static class CareTaskEndpoints
    {
        public static void MapCareTaskEndpoints(this WebApplication app)
        {
            async Task<IResult> GetUpcomingCareTasks(ApplicationDbContext db)
            {
                var today = DateOnly.FromDateTime(DateTime.UtcNow);
                var schedules = await db.PlantCareSchedules
                    .Include(schedule => schedule.Plant)
                    .Include(schedule => schedule.CareAction)
                    .Where(schedule => schedule.IsEnabled && schedule.CareAction.IsEnabled)
                    .OrderBy(schedule => schedule.Plant.Nickname)
                    .ThenBy(schedule => schedule.CareAction.Name)
                    .ToListAsync();
                var latestLogs = await db.ActionLogs
                    .GroupBy(log => new { log.PlantId, log.CareActionId })
                    .Select(group => new
                    {
                        group.Key.PlantId,
                        group.Key.CareActionId,
                        LastPerformedOn = group.Max(log => log.PerformedOn)
                    })
                    .ToListAsync();
                var latestLogLookup = latestLogs.ToDictionary(
                    log => (log.PlantId, log.CareActionId),
                    log => (DateOnly?)log.LastPerformedOn);

                var tasks = schedules
                    .Select(schedule => CareTaskDto.FromSchedule(
                        schedule,
                        latestLogLookup.GetValueOrDefault((schedule.PlantId, schedule.CareActionId)),
                        today))
                    .Where(task => task.Status is "due" or "soon")
                    .ToList();

                return Results.Ok(tasks);
            }

            app.MapGet("/api/care-tasks/upcoming", GetUpcomingCareTasks);
            app.MapGet("/api/care-tasks/today", GetUpcomingCareTasks);
        }
    }
}
