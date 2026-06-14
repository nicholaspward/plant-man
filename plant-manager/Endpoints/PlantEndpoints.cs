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
                    .Include(plant => plant.Location)
                    .Include(plant => plant.CareScheduleAssignments)
                    .ThenInclude(assignment => assignment.PlantCareSchedule)
                    .ThenInclude(schedule => schedule.CareAction)
                    .Include(plant => plant.CareScheduleAssignments)
                    .ThenInclude(assignment => assignment.PlantCareSchedule)
                    .ThenInclude(schedule => schedule.CareActivity)
                    .ThenInclude(activity => activity.Actions)
                    .ThenInclude(action => action.CareAction)
                    .Include(plant => plant.CareScheduleAssignments)
                    .ThenInclude(assignment => assignment.PlantCareSchedule)
                    .ThenInclude(schedule => schedule.CareActivity)
                    .ThenInclude(activity => activity.Actions)
                    .ThenInclude(action => action.Resources)
                    .ThenInclude(resource => resource.ActionResource)
                    .Include(plant => plant.CareScheduleAssignments)
                    .ThenInclude(assignment => assignment.PlantCareSchedule)
                    .ThenInclude(schedule => schedule.Assignments)
                    .ThenInclude(assignment => assignment.Plant)
                    .ThenInclude(plant => plant.ActionLogs)
                    .Include(plant => plant.CareScheduleAssignments)
                    .ThenInclude(assignment => assignment.PlantCareSchedule)
                    .ThenInclude(schedule => schedule.Assignments)
                    .ThenInclude(assignment => assignment.Plant)
                    .ThenInclude(plant => plant.CareDismissals)
                    .Include(plant => plant.CareScheduleAssignments)
                    .ThenInclude(assignment => assignment.PlantCareSchedule)
                    .ThenInclude(schedule => schedule.Assignments)
                    .ThenInclude(assignment => assignment.Plant)
                    .ThenInclude(plant => plant.CareSnoozes)
                    .Include(plant => plant.ActionLogs)
                    .ThenInclude(log => log.Resources)
                    .ThenInclude(resource => resource.ActionResource)
                    .Include(plant => plant.CareDismissals)
                    .Include(plant => plant.CareSnoozes)
                    .Include(plant => plant.Flags)
                    .ThenInclude(flag => flag.Definition)
                    .Include(plant => plant.GroupMemberships)
                    .ThenInclude(membership => membership.PlantGroup)
                    .OrderBy(plant => plant.Nickname)
                    .ToListAsync();

                return Results.Ok(plants.Select(PlantDto.FromPlant));
            });

            app.MapGet("/api/plants/{id:int}", async (int id, ApplicationDbContext db) =>
            {
                var plant = await db.Plants
                    .Include(item => item.Taxon)
                    .Include(item => item.Location)
                    .Include(plant => plant.CareScheduleAssignments)
                    .ThenInclude(assignment => assignment.PlantCareSchedule)
                    .ThenInclude(schedule => schedule.CareAction)
                    .Include(plant => plant.CareScheduleAssignments)
                    .ThenInclude(assignment => assignment.PlantCareSchedule)
                    .ThenInclude(schedule => schedule.CareActivity)
                    .ThenInclude(activity => activity.Actions)
                    .ThenInclude(action => action.CareAction)
                    .Include(plant => plant.CareScheduleAssignments)
                    .ThenInclude(assignment => assignment.PlantCareSchedule)
                    .ThenInclude(schedule => schedule.CareActivity)
                    .ThenInclude(activity => activity.Actions)
                    .ThenInclude(action => action.Resources)
                    .ThenInclude(resource => resource.ActionResource)
                    .Include(plant => plant.CareScheduleAssignments)
                    .ThenInclude(assignment => assignment.PlantCareSchedule)
                    .ThenInclude(schedule => schedule.Assignments)
                    .ThenInclude(assignment => assignment.Plant)
                    .ThenInclude(plant => plant.ActionLogs)
                    .Include(plant => plant.CareScheduleAssignments)
                    .ThenInclude(assignment => assignment.PlantCareSchedule)
                    .ThenInclude(schedule => schedule.Assignments)
                    .ThenInclude(assignment => assignment.Plant)
                    .ThenInclude(plant => plant.CareDismissals)
                    .Include(plant => plant.CareScheduleAssignments)
                    .ThenInclude(assignment => assignment.PlantCareSchedule)
                    .ThenInclude(schedule => schedule.Assignments)
                    .ThenInclude(assignment => assignment.Plant)
                    .ThenInclude(plant => plant.CareSnoozes)
                    .Include(plant => plant.ActionLogs)
                    .ThenInclude(log => log.Resources)
                    .ThenInclude(resource => resource.ActionResource)
                    .Include(plant => plant.CareDismissals)
                    .Include(plant => plant.CareSnoozes)
                    .Include(plant => plant.Flags)
                    .ThenInclude(flag => flag.Definition)
                    .Include(plant => plant.GroupMemberships)
                    .ThenInclude(membership => membership.PlantGroup)
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

                var taxon = request.TaxonId is null ? null : await db.PlantTaxa.FindAsync(request.TaxonId);
                if (request.TaxonId is not null && taxon is null)
                {
                    return Results.BadRequest(new { error = "Taxon was not found." });
                }
                if (taxon is not null && !IsGbifTaxon(taxon))
                {
                    return Results.BadRequest(new { error = "Taxon must be imported from GBIF." });
                }

                var location = request.LocationId is null ? null : await db.PlantLocations.FindAsync(request.LocationId);
                if (request.LocationId is not null && location is null)
                {
                    return Results.BadRequest(new { error = "Location was not found." });
                }

                var plant = new Plant
                {
                    Nickname = request.Nickname.Trim(),
                    Birthday = request.Birthday,
                    TaxonId = request.TaxonId,
                    LocationId = request.LocationId
                };

                db.Plants.Add(plant);
                await db.SaveChangesAsync();

                plant.Taxon = taxon;
                plant.Location = location;
                var scheduleError = request.CareSchedules is null
                    ? null
                    : await ApplyCareSchedules(plant, request.CareSchedules, db);
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
                    .Include(item => item.Location)
                    .Include(item => item.CareScheduleAssignments)
                    .ThenInclude(assignment => assignment.PlantCareSchedule)
                    .ThenInclude(schedule => schedule.CareAction)
                    .Include(item => item.CareScheduleAssignments)
                    .ThenInclude(assignment => assignment.PlantCareSchedule)
                    .ThenInclude(schedule => schedule.CareActivity)
                    .ThenInclude(activity => activity.Actions)
                    .ThenInclude(action => action.CareAction)
                    .Include(item => item.CareScheduleAssignments)
                    .ThenInclude(assignment => assignment.PlantCareSchedule)
                    .ThenInclude(schedule => schedule.CareActivity)
                    .ThenInclude(activity => activity.Actions)
                    .ThenInclude(action => action.Resources)
                    .ThenInclude(resource => resource.ActionResource)
                    .Include(item => item.CareScheduleAssignments)
                    .ThenInclude(assignment => assignment.PlantCareSchedule)
                    .ThenInclude(schedule => schedule.Assignments)
                    .ThenInclude(assignment => assignment.Plant)
                    .ThenInclude(plant => plant.ActionLogs)
                    .Include(item => item.CareScheduleAssignments)
                    .ThenInclude(assignment => assignment.PlantCareSchedule)
                    .ThenInclude(schedule => schedule.Assignments)
                    .ThenInclude(assignment => assignment.Plant)
                    .ThenInclude(plant => plant.CareDismissals)
                    .Include(item => item.CareScheduleAssignments)
                    .ThenInclude(assignment => assignment.PlantCareSchedule)
                    .ThenInclude(schedule => schedule.Assignments)
                    .ThenInclude(assignment => assignment.Plant)
                    .ThenInclude(plant => plant.CareSnoozes)
                    .Include(item => item.ActionLogs)
                    .ThenInclude(log => log.Resources)
                    .ThenInclude(resource => resource.ActionResource)
                    .Include(item => item.CareDismissals)
                    .Include(item => item.CareSnoozes)
                    .Include(item => item.Flags)
                    .ThenInclude(flag => flag.Definition)
                    .Include(item => item.GroupMemberships)
                    .ThenInclude(membership => membership.PlantGroup)
                    .FirstOrDefaultAsync(item => item.Id == id);

                if (plant is null)
                {
                    return Results.NotFound();
                }

                var taxon = request.TaxonId is null ? null : await db.PlantTaxa.FindAsync(request.TaxonId);
                if (request.TaxonId is not null && taxon is null)
                {
                    return Results.BadRequest(new { error = "Taxon was not found." });
                }
                if (taxon is not null && !IsGbifTaxon(taxon))
                {
                    return Results.BadRequest(new { error = "Taxon must be imported from GBIF." });
                }

                var location = request.LocationId is null ? null : await db.PlantLocations.FindAsync(request.LocationId);
                if (request.LocationId is not null && location is null)
                {
                    return Results.BadRequest(new { error = "Location was not found." });
                }

                plant.Nickname = request.Nickname.Trim();
                plant.Birthday = request.Birthday;
                plant.TaxonId = request.TaxonId;
                plant.LocationId = request.LocationId;
                plant.Taxon = taxon;
                plant.Location = location;
                var scheduleError = request.CareSchedules is null
                    ? null
                    : await ApplyCareSchedules(plant, request.CareSchedules, db);
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
                var waterActivity = await db.CareActivities
                    .FirstOrDefaultAsync(activity => activity.Name.ToLower() == "water");
                if (waterActivity is null)
                {
                    return null;
                }

                schedules =
                [
                    new SavePlantCareScheduleRequest(
                        waterActivity.Id,
                        null,
                        7,
                        null,
                        "weekly",
                        1,
                        "week",
                        null,
                        "after",
                        null,
                        12)
                ];
            }

            var normalizedSchedules = schedules
                .GroupBy(schedule => schedule.CareActivityId)
                .Select(group => group.First())
                .Where(schedule => schedule.CareActivityId > 0)
                .ToList();
            var activityIds = normalizedSchedules
                .Select(schedule => schedule.CareActivityId)
                .ToList();
            var activitiesById = await db.CareActivities
                .Include(activity => activity.Actions)
                .ThenInclude(action => action.CareAction)
                .Include(activity => activity.Actions)
                .ThenInclude(action => action.Resources)
                .ThenInclude(resource => resource.ActionResource)
                .Where(activity => activityIds.Contains(activity.Id))
                .ToDictionaryAsync(activity => activity.Id);

            if (activitiesById.Count != activityIds.Count)
            {
                return "One or more care activities were not found.";
            }

            if (activitiesById.Values.Any(activity =>
                activity.PrimaryAction() is null))
            {
                return "Care activities must have at least one action.";
            }

            var requestedActivityIds = activityIds.ToHashSet();
            var assignmentsToRemove = plant.CareScheduleAssignments
                .Where(assignment => !requestedActivityIds.Contains(assignment.PlantCareSchedule.CareActivityId))
                .ToList();
            db.PlantCareScheduleAssignments.RemoveRange(assignmentsToRemove);

            foreach (var requestedSchedule in normalizedSchedules)
            {
                var activity = activitiesById[requestedSchedule.CareActivityId];
                var primaryAction = activity.PrimaryAction()!;
                var assignment = plant.CareScheduleAssignments
                    .FirstOrDefault(item => item.PlantCareSchedule.CareActivityId == requestedSchedule.CareActivityId);
                var schedule = assignment?.PlantCareSchedule;
                if (assignment is null)
                {
                    schedule = new PlantCareSchedule
                    {
                        CareActionId = primaryAction.Id,
                        CareActivityId = activity.Id,
                        CareAction = primaryAction,
                        CareActivity = activity,
                        Assignments =
                        [
                            new PlantCareScheduleAssignment
                            {
                                PlantId = plant.Id,
                                Plant = plant
                            }
                        ]
                    };
                    db.PlantCareSchedules.Add(schedule);
                }
                if (schedule is null)
                {
                    continue;
                }

                schedule.CareActionId = primaryAction.Id;
                schedule.CareActivityId = activity.Id;
                schedule.CareAction = primaryAction;
                schedule.CareActivity = activity;
                PlantCareScheduleEndpoints.ApplyRecurrence(schedule, PlantCareScheduleEndpoints.NormalizeRecurrence(
                    requestedSchedule.RecurrenceMode,
                    requestedSchedule.RepeatEvery,
                    requestedSchedule.RepeatUnit,
                    requestedSchedule.RepeatOnDays,
                    requestedSchedule.EndsMode,
                    requestedSchedule.EndsOn,
                    requestedSchedule.EndsAfterOccurrences,
                    requestedSchedule.ScheduledFor,
                    requestedSchedule.EveryDays));
            }

            return null;
        }

        private static bool IsGbifTaxon(PlantTaxon taxon) =>
            string.Equals(taxon.ExternalSource, "gbif", StringComparison.OrdinalIgnoreCase)
            && !string.IsNullOrWhiteSpace(taxon.ExternalId);
    }
}
