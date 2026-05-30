using Microsoft.EntityFrameworkCore;
using plant_manager.Data;
using plant_manager.Data.Models;

namespace plant_manager.Endpoints
{
    public static class PlantGroupEndpoints
    {
        public static void MapPlantGroupEndpoints(this WebApplication app)
        {
            app.MapGet("/api/plant-groups", async (ApplicationDbContext db) =>
            {
                var groups = await db.PlantGroups
                    .Include(group => group.Memberships)
                    .ThenInclude(membership => membership.Plant)
                    .OrderBy(group => group.Name)
                    .Select(group => PlantGroupDto.FromGroup(group))
                    .ToListAsync();

                return Results.Ok(groups);
            });

            app.MapPost("/api/plant-groups", async (SavePlantGroupRequest request, ApplicationDbContext db) =>
            {
                var validation = await ValidateRequest(request, db);
                if (validation.Error is not null)
                {
                    return Results.BadRequest(new { error = validation.Error });
                }

                var name = request.Name.Trim();
                var exists = await db.PlantGroups.AnyAsync(group => group.Name.ToLower() == name.ToLower());
                if (exists)
                {
                    return Results.Conflict(new { error = "A plant group with this name already exists." });
                }

                var group = new PlantGroup
                {
                    Name = name,
                    Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim(),
                    Memberships = validation.PlantIds
                        .Select(plantId => new PlantGroupMembership { PlantId = plantId })
                        .ToList()
                };

                db.PlantGroups.Add(group);
                await db.SaveChangesAsync();

                await db.Entry(group)
                    .Collection(item => item.Memberships)
                    .Query()
                    .Include(membership => membership.Plant)
                    .LoadAsync();

                return Results.Created($"/api/plant-groups/{group.Id}", PlantGroupDto.FromGroup(group));
            });

            app.MapPut("/api/plant-groups/{id:int}", async (int id, SavePlantGroupRequest request, ApplicationDbContext db) =>
            {
                var group = await db.PlantGroups
                    .Include(item => item.Memberships)
                    .ThenInclude(membership => membership.Plant)
                    .FirstOrDefaultAsync(item => item.Id == id);
                if (group is null)
                {
                    return Results.NotFound();
                }

                var validation = await ValidateRequest(request, db);
                if (validation.Error is not null)
                {
                    return Results.BadRequest(new { error = validation.Error });
                }

                var name = request.Name.Trim();
                var exists = await db.PlantGroups.AnyAsync(item =>
                    item.Id != id && item.Name.ToLower() == name.ToLower());
                if (exists)
                {
                    return Results.Conflict(new { error = "A plant group with this name already exists." });
                }

                group.Name = name;
                group.Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim();
                db.PlantGroupMemberships.RemoveRange(group.Memberships);
                group.Memberships = validation.PlantIds
                    .Select(plantId => new PlantGroupMembership
                    {
                        PlantGroupId = group.Id,
                        PlantId = plantId
                    })
                    .ToList();

                await db.SaveChangesAsync();

                await db.Entry(group)
                    .Collection(item => item.Memberships)
                    .Query()
                    .Include(membership => membership.Plant)
                    .LoadAsync();

                return Results.Ok(PlantGroupDto.FromGroup(group));
            });

            app.MapDelete("/api/plant-groups/{id:int}", async (int id, ApplicationDbContext db) =>
            {
                var group = await db.PlantGroups.FindAsync(id);
                if (group is null)
                {
                    return Results.NotFound();
                }

                db.PlantGroups.Remove(group);
                await db.SaveChangesAsync();

                return Results.NoContent();
            });
        }

        private static async Task<(List<int> PlantIds, string? Error)> ValidateRequest(
            SavePlantGroupRequest request,
            ApplicationDbContext db)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return ([], "Group name is required.");
            }

            var plantIds = request.PlantIds?
                .Where(id => id > 0)
                .Distinct()
                .ToList() ?? [];

            if (plantIds.Count > 0)
            {
                var existingPlantCount = await db.Plants.CountAsync(plant => plantIds.Contains(plant.Id));
                if (existingPlantCount != plantIds.Count)
                {
                    return ([], "One or more plants were not found.");
                }
            }

            return (plantIds, null);
        }
    }
}
