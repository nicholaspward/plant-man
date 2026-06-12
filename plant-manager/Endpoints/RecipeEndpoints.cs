using Microsoft.EntityFrameworkCore;
using plant_manager.Data;
using plant_manager.Data.Models;

namespace plant_manager.Endpoints
{
    public static class RecipeEndpoints
    {
        public static void MapRecipeEndpoints(this WebApplication app)
        {
            app.MapGet("/api/recipes", async (ApplicationDbContext db) =>
            {
                var recipes = await db.Recipes
                    .Include(recipe => recipe.OutputResource)
                    .Include(recipe => recipe.Components)
                    .ThenInclude(component => component.ActionResource)
                    .OrderBy(recipe => recipe.Name)
                    .Select(recipe => RecipeDto.FromRecipe(recipe))
                    .ToListAsync();

                return Results.Ok(recipes);
            });

            app.MapPost("/api/recipes", async (SaveRecipeRequest request, ApplicationDbContext db) =>
            {
                var validation = await ValidateRequest(request, db);
                if (validation.Error is not null)
                {
                    return Results.BadRequest(new { error = validation.Error });
                }

                var name = request.Name.Trim();
                var exists = await db.Recipes.AnyAsync(recipe => recipe.Name.ToLower() == name.ToLower());
                if (exists)
                {
                    return Results.Conflict(new { error = "A recipe with this name already exists." });
                }

                var recipe = new Recipe
                {
                    Name = name,
                    MeasurementMode = validation.MeasurementMode,
                    OutputResource = validation.OutputResourceName is null
                        ? null
                        : new ActionResource
                        {
                            Name = validation.OutputResourceName
                        },
                    Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim(),
                    Components = validation.Components
                };

                db.Recipes.Add(recipe);
                await db.SaveChangesAsync();

                return Results.Created($"/api/recipes/{recipe.Id}", RecipeDto.FromRecipe(recipe));
            });

            app.MapPut("/api/recipes/{id:int}", async (int id, SaveRecipeRequest request, ApplicationDbContext db) =>
            {
                var recipe = await db.Recipes
                    .Include(item => item.OutputResource)
                    .Include(item => item.Components)
                    .ThenInclude(component => component.ActionResource)
                    .FirstOrDefaultAsync(item => item.Id == id);
                if (recipe is null)
                {
                    return Results.NotFound();
                }

                var validation = await ValidateRequest(request, db, recipe.OutputResourceId);
                if (validation.Error is not null)
                {
                    return Results.BadRequest(new { error = validation.Error });
                }

                var name = request.Name.Trim();
                var exists = await db.Recipes.AnyAsync(item =>
                    item.Id != id && item.Name.ToLower() == name.ToLower());
                if (exists)
                {
                    return Results.Conflict(new { error = "A recipe with this name already exists." });
                }

                recipe.Name = name;
                recipe.MeasurementMode = validation.MeasurementMode;
                if (validation.OutputResourceName is null)
                {
                    recipe.OutputResourceId = null;
                    recipe.OutputResource = null;
                }
                else if (recipe.OutputResource is null)
                {
                    recipe.OutputResource = new ActionResource
                    {
                        Name = validation.OutputResourceName
                    };
                }
                else
                {
                    recipe.OutputResource.Name = validation.OutputResourceName;
                }
                recipe.Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim();
                db.RecipeComponents.RemoveRange(recipe.Components);
                recipe.Components = validation.Components;

                await db.SaveChangesAsync();

                return Results.Ok(RecipeDto.FromRecipe(recipe));
            });

            app.MapDelete("/api/recipes/{id:int}", async (int id, ApplicationDbContext db) =>
            {
                var recipe = await db.Recipes.FindAsync(id);
                if (recipe is null)
                {
                    return Results.NotFound();
                }

                db.Recipes.Remove(recipe);
                await db.SaveChangesAsync();

                return Results.NoContent();
            });
        }

        private static async Task<(List<RecipeComponent> Components, string MeasurementMode, string? OutputResourceName, string? Error)> ValidateRequest(
            SaveRecipeRequest request,
            ApplicationDbContext db,
            int? currentOutputResourceId = null)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return ([], "quantity", null, "Recipe name is required.");
            }

            var measurementMode = NormalizeMeasurementMode(request.MeasurementMode);
            if (measurementMode is null)
            {
                return ([], "quantity", null, "Recipe measurement mode is invalid.");
            }

            var outputResourceName = string.IsNullOrWhiteSpace(request.OutputResourceName)
                ? null
                : request.OutputResourceName.Trim();
            if (outputResourceName is null)
            {
                return ([], measurementMode, null, "Produced resource name is required.");
            }

            if (outputResourceName is not null)
            {
                var outputNameExists = await db.ActionResources.AnyAsync(resource =>
                    resource.Name.ToLower() == outputResourceName.ToLower()
                    && (currentOutputResourceId == null || resource.Id != currentOutputResourceId));
                if (outputNameExists)
                {
                    return ([], measurementMode, null, "A resource with this output name already exists.");
                }
            }

            var requestedComponents = request.Components?
                .GroupBy(component => component.ActionResourceId)
                .Select(group => group.First())
                .ToList();
            if (requestedComponents is null || requestedComponents.Count == 0)
            {
                return ([], measurementMode, outputResourceName, "Select at least one recipe component.");
            }

            if (requestedComponents.Any(component => component.ActionResourceId <= 0))
            {
                return ([], measurementMode, outputResourceName, "Select a resource for every recipe component.");
            }

            if (requestedComponents.Any(component => component.Quantity < 0))
            {
                return ([], measurementMode, outputResourceName, "Component quantities cannot be negative.");
            }

            if (measurementMode is "total_percent" or "bakers_percent"
                && requestedComponents.Any(component => component.Quantity is null))
            {
                return ([], measurementMode, outputResourceName, "Percent recipes require a value for every component.");
            }

            if (measurementMode == "total_percent"
                && requestedComponents.Sum(component => component.Quantity ?? 0) != 100)
            {
                return ([], measurementMode, outputResourceName, "Total percent recipes must add up to 100%.");
            }

            if (measurementMode == "bakers_percent"
                && requestedComponents.Count(component => component.Quantity == 100) != 1)
            {
                return ([], measurementMode, outputResourceName, "Baker's percent recipes need exactly one base component at 100%.");
            }

            var resourceIds = requestedComponents
                .Select(component => component.ActionResourceId)
                .ToList();
            var resourcesById = await db.ActionResources
                .Where(resource => resourceIds.Contains(resource.Id))
                .ToDictionaryAsync(resource => resource.Id);
            if (resourcesById.Count != resourceIds.Count)
            {
                return ([], measurementMode, outputResourceName, "One or more resources were not found.");
            }

            var components = requestedComponents
                .Select((componentRequest, index) => new RecipeComponent
                {
                    ActionResourceId = componentRequest.ActionResourceId,
                    ActionResource = resourcesById[componentRequest.ActionResourceId],
                    Quantity = componentRequest.Quantity,
                    Unit = measurementMode == "quantity"
                        ? string.IsNullOrWhiteSpace(componentRequest.Unit) ? null : componentRequest.Unit.Trim()
                        : "%",
                    Notes = string.IsNullOrWhiteSpace(componentRequest.Notes) ? null : componentRequest.Notes.Trim(),
                    SortOrder = index
                })
                .ToList();

            return (components, measurementMode, outputResourceName, null);
        }

        private static string? NormalizeMeasurementMode(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return "quantity";
            }

            return value.Trim().ToLowerInvariant() switch
            {
                "quantity" => "quantity",
                "total_percent" => "total_percent",
                "bakers_percent" => "bakers_percent",
                _ => null
            };
        }
    }
}
