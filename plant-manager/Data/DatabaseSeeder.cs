using Microsoft.EntityFrameworkCore;
using plant_manager.Data.Models;

namespace plant_manager.Data
{
    public static class DatabaseSeeder
    {
        private static readonly CareAction[] StarterCareActions =
        [
            new() { Name = "Water", Description = "Hydrate a plant or refresh its reservoir." },
            new() { Name = "Repot", Description = "Move a plant into a new container or medium." },
            new() { Name = "Fertilize", Description = "Apply nutrients or plant food." },
            new() { Name = "Prune", Description = "Trim leaves, stems, roots, or spent growth." },
            new() { Name = "Inspect", Description = "Check for pests, health changes, or growth." }
        ];

        private static readonly ActionResource[] StarterResources =
        [
            new() { Name = "Water", Category = "Consumable", Notes = "Plain watering resource." },
            new() { Name = "Potting Mix", Category = "Medium", Notes = "General purpose houseplant medium." },
            new() { Name = "Orchid Bark", Category = "Medium", Notes = "Chunky amendment for airflow and drainage." },
            new() { Name = "Perlite", Category = "Medium", Notes = "Lightweight amendment for drainage and aeration." },
            new() { Name = "Fertilizer", Category = "Fertilizer", Notes = "General plant nutrient." },
            new() { Name = "Nursery Pot", Category = "Container", Notes = "Basic plastic grow pot." },
            new() { Name = "Neem Oil", Category = "Treatment", Notes = "Common pest treatment." },
            new() { Name = "Pruners", Category = "Equipment", Notes = "Cutting tool for pruning or cleanup." }
        ];

        private static readonly StarterCareActivity[] StarterCareActivities =
        [
            new("Water", [new("Water", ["Water"])]),
            new("Repot with Potting Mix", [new("Repot", ["Potting Mix"])]),
            new("Fertilize", [new("Fertilize", ["Fertilizer"])]),
            new("Prune", [new("Prune", ["Pruners"])]),
            new("Inspect", [new("Inspect", [])])
        ];

        private static readonly PlantFlagDefinition[] StarterFlagDefinitions =
        [
            new() { Name = "Spider mites", Color = "#ffe4e1" },
            new() { Name = "Fungus gnats", Color = "#fff4cc" },
            new() { Name = "Dying", Color = "#ffd6d6" },
            new() { Name = "Quarantine", Color = "#e8eef8" },
            new() { Name = "Needs repotting", Color = "#e9f5e7" },
            new() { Name = "Watch closely", Color = "#eeeeee" }
        ];

        private static readonly StarterTaxon[] StarterTaxa =
        [
            new("Chinese Money Plant", "Pilea", "peperomioides"),
            new("Croton Petra", "Codiaeum", "variegatum"),
            new("Parallel Peperomia", "Peperomia", "tetragona"),
            new("Marble Peperomia", "Peperomia", "obtusifolia"),
            new("Silver Squill", "Ledebouria", "socialis"),
            new("Fiddle-leaf Fig", "Ficus", "lyrata"),
            new("Ficus Audrey", "Ficus", "benghalensis"),
            new("Dumbcane", "Dieffenbachia", "seguine"),
            new("Kris Plant", "Alocasia", "sanderiana"),
            new("Lucky Bamboo", "Dracaena", "sanderiana"),
            new("Common Ivy", "Hedera", "helix"),
            new("Peacock Plant", "Goeppertia", "makoyana"),
            new("False Shamrock", "Oxalis", "triangularis"),
            new("Pinstripe Plant", "Goeppertia", "ornata"),
            new("Monstera Thai Constellation", "Monstera", "deliciosa"),
            new("Pothos", "Epipremnum", "aureum"),
            new("Moth orchid", "Phalaenopsis", "hybrid"),
            new("Money Tree", "Pachira", "aquatica")
        ];

        private static readonly StarterPlant[] StarterPlants =
        [
            new("Chinese Money Plant 1", "Chinese Money Plant", "Plant cart"),
            new("Chinese Money Plant 2", "Chinese Money Plant", "Plant cart"),
            new("Chinese Money Plant 3", "Chinese Money Plant", "Plant cart"),
            new("Croton Petra", "Croton Petra", "Plant cart"),
            new("Parallel Peperomia", "Parallel Peperomia", "Plant cart"),
            new("Marble Peperomia", "Marble Peperomia", "Plant cart"),
            new("Silver Squill", "Silver Squill", "Plant cart"),
            new("Fiddle-leaf Fig", "Fiddle-leaf Fig", "Living room"),
            new("Ficus Audrey", "Ficus Audrey", "Plant cart"),
            new("Dumbcane 1", "Dumbcane", "Plant cart"),
            new("Dumbcane 2", "Dumbcane", "Plant cart"),
            new("Kris Plant", "Kris Plant", "Plant cart"),
            new("Lucky Bamboo", "Lucky Bamboo", "Plant cart"),
            new("Common Ivy 1", "Common Ivy", "Plant cart"),
            new("Common Ivy 2", "Common Ivy", "Plant cart"),
            new("Peacock Plant 1", "Peacock Plant", "Plant cart"),
            new("Peacock Plant 2", "Peacock Plant", "Plant cart"),
            new("False Shamrock", "False Shamrock", "Plant cart"),
            new("Pinstripe Plant", "Pinstripe Plant", "Computer desk"),
            new("Monstera Thai Constellation", "Monstera Thai Constellation", "Plant cart"),
            new("Pothos", "Pothos", "Plant cart"),
            new("Moth orchid", "Moth orchid", "Plant cart"),
            new("Money Tree", "Money Tree", "Computer desk")
        ];

        public static void Seed(ApplicationDbContext db)
        {
            SeedCareActions(db);
            SeedActionResources(db);
            SeedCareActivities(db);
            SeedPlantFlags(db);
            SeedStarterTaxa(db);
            SeedPlantLocations(db);
            SeedStarterPlants(db);
        }

        private static void SeedCareActions(ApplicationDbContext db)
        {
            var existingActionNames = db.CareActions
                .Select(action => action.Name)
                .ToList();

            var missingActions = StarterCareActions
                .Where(starterAction => !existingActionNames.Any(existingName =>
                    string.Equals(existingName, starterAction.Name, StringComparison.OrdinalIgnoreCase)))
                .Select(starterAction => new CareAction
                {
                    Name = starterAction.Name,
                    Description = starterAction.Description,
                    IsEnabled = starterAction.IsEnabled
                })
                .ToList();

            if (missingActions.Count == 0)
            {
                return;
            }

            db.CareActions.AddRange(missingActions);
            db.SaveChanges();
        }

        private static void SeedActionResources(ApplicationDbContext db)
        {
            var existingResourceNames = db.ActionResources
                .Select(resource => resource.Name)
                .ToList();

            var missingResources = StarterResources
                .Where(starterResource => !existingResourceNames.Any(existingName =>
                    string.Equals(existingName, starterResource.Name, StringComparison.OrdinalIgnoreCase)))
                .Select(starterResource => new ActionResource
                {
                    Name = starterResource.Name,
                    Category = starterResource.Category,
                    Notes = starterResource.Notes,
                    IsEnabled = starterResource.IsEnabled
                })
                .ToList();

            if (missingResources.Count == 0)
            {
                return;
            }

            db.ActionResources.AddRange(missingResources);
            db.SaveChanges();
        }

        private static void SeedCareActivities(ApplicationDbContext db)
        {
            var existingActivityNames = db.CareActivities
                .Select(activity => activity.Name)
                .ToList();
            var actionsByName = db.CareActions.ToDictionary(action => action.Name, StringComparer.OrdinalIgnoreCase);
            var resourcesByName = db.ActionResources.ToDictionary(resource => resource.Name, StringComparer.OrdinalIgnoreCase);

            var missingActivities = StarterCareActivities
                .Where(starterActivity => !existingActivityNames.Any(existingName =>
                    string.Equals(existingName, starterActivity.Name, StringComparison.OrdinalIgnoreCase)))
                .Select(starterActivity =>
                {
                    var actions = starterActivity.Actions
                        .Select((starterAction, index) => actionsByName.TryGetValue(starterAction.Name, out var action)
                            ? new CareActivityAction
                            {
                                CareActionId = action.Id,
                                CareAction = action,
                                SortOrder = index,
                                Resources = starterAction.ResourceNames
                                    .Select(resourceName => resourcesByName.TryGetValue(resourceName, out var resource)
                                        ? new CareActivityActionResource
                                        {
                                            ActionResourceId = resource.Id,
                                            ActionResource = resource
                                        }
                                        : null)
                                    .OfType<CareActivityActionResource>()
                                    .ToList()
                            }
                            : null)
                        .OfType<CareActivityAction>()
                        .ToList();
                    if (actions.Count != starterActivity.Actions.Count
                        || actions.Zip(starterActivity.Actions).Any(pair => pair.First.Resources.Count != pair.Second.ResourceNames.Count))
                    {
                        return null;
                    }

                    return new CareActivity
                    {
                        Name = starterActivity.Name,
                        IsEnabled = true,
                        Actions = actions
                    };
                })
                .OfType<CareActivity>()
                .ToList();

            if (missingActivities.Count == 0)
            {
                return;
            }

            db.CareActivities.AddRange(missingActivities);
            db.SaveChanges();
        }

        private static void SeedPlantFlags(ApplicationDbContext db)
        {
            var existingFlagNames = db.PlantFlagDefinitions
                .Select(flag => flag.Name)
                .ToList();

            var missingFlags = StarterFlagDefinitions
                .Where(starterFlag => !existingFlagNames.Any(existingName =>
                    string.Equals(existingName, starterFlag.Name, StringComparison.OrdinalIgnoreCase)))
                .Select(starterFlag => new PlantFlagDefinition
                {
                    Name = starterFlag.Name,
                    Color = starterFlag.Color,
                    IsEnabled = starterFlag.IsEnabled
                })
                .ToList();

            if (missingFlags.Count == 0)
            {
                return;
            }

            db.PlantFlagDefinitions.AddRange(missingFlags);
            db.SaveChanges();
        }

        private static void SeedStarterTaxa(ApplicationDbContext db)
        {
            var existingTaxa = db.PlantTaxa.ToList();
            var missingTaxa = StarterTaxa
                .Where(starterTaxon => !existingTaxa.Any(existingTaxon =>
                    string.Equals(existingTaxon.Name, starterTaxon.Name, StringComparison.OrdinalIgnoreCase)
                    && string.Equals(existingTaxon.Genus, starterTaxon.Genus, StringComparison.OrdinalIgnoreCase)
                    && string.Equals(existingTaxon.Species, starterTaxon.Species, StringComparison.OrdinalIgnoreCase)))
                .Select(starterTaxon => new PlantTaxon
                {
                    Name = starterTaxon.Name,
                    Genus = starterTaxon.Genus,
                    Species = starterTaxon.Species
                })
                .ToList();

            if (missingTaxa.Count == 0)
            {
                return;
            }

            db.PlantTaxa.AddRange(missingTaxa);
            db.SaveChanges();
        }

        private static void SeedStarterPlants(ApplicationDbContext db)
        {
            if (db.Plants.Any())
            {
                return;
            }

            var taxaByName = db.PlantTaxa.ToDictionary(taxon => taxon.Name, StringComparer.OrdinalIgnoreCase);
            var locationsByName = db.PlantLocations.ToDictionary(location => location.Name, StringComparer.OrdinalIgnoreCase);
            var flagsByName = db.PlantFlagDefinitions.ToDictionary(flag => flag.Name, StringComparer.OrdinalIgnoreCase);

            PlantTaxon Taxon(string name) => taxaByName[name];
            PlantLocation Location(string name) => locationsByName[name];

            var starterPlants = StarterPlants
                .Select(starterPlant => new Plant
                {
                    Nickname = starterPlant.Nickname,
                    Taxon = Taxon(starterPlant.TaxonName),
                    Location = Location(starterPlant.Location)
                })
                .ToList();

            db.Plants.AddRange(starterPlants);
            db.SaveChanges();

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var starterFlags = new List<PlantFlag>();

            void AddFlag(string plantNickname, string flagName)
            {
                if (!flagsByName.TryGetValue(flagName, out var flag))
                {
                    return;
                }

                var plant = starterPlants.FirstOrDefault(item =>
                    string.Equals(item.Nickname, plantNickname, StringComparison.OrdinalIgnoreCase));
                if (plant is null)
                {
                    return;
                }

                starterFlags.Add(new PlantFlag
                {
                    PlantId = plant.Id,
                    PlantFlagDefinitionId = flag.Id,
                    StartedOn = today
                });
            }

            AddFlag("Pinstripe Plant", "Dying");
            AddFlag("Pinstripe Plant", "Spider mites");
            AddFlag("Pinstripe Plant", "Quarantine");
            AddFlag("Chinese Money Plant 1", "Quarantine");
            AddFlag("Chinese Money Plant 2", "Quarantine");
            AddFlag("Chinese Money Plant 3", "Quarantine");
            AddFlag("Ficus Audrey", "Needs repotting");

            db.PlantFlags.AddRange(starterFlags);
            db.SaveChanges();
        }

        private static void SeedPlantLocations(ApplicationDbContext db)
        {
            var starterLocationNames = StarterPlants
                .Select(plant => plant.Location)
                .Append("Unassigned")
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();
            var existingLocationNames = db.PlantLocations
                .Select(location => location.Name)
                .ToList();

            var missingLocations = starterLocationNames
                .Where(starterLocation => !existingLocationNames.Any(existingName =>
                    string.Equals(existingName, starterLocation, StringComparison.OrdinalIgnoreCase)))
                .Select(starterLocation => new PlantLocation
                {
                    Name = starterLocation,
                    IsEnabled = true
                })
                .ToList();

            if (missingLocations.Count == 0)
            {
                return;
            }

            db.PlantLocations.AddRange(missingLocations);
            db.SaveChanges();
        }

        private sealed record StarterTaxon(string Name, string Genus, string Species);

        private sealed record StarterCareActivity(string Name, IReadOnlyList<StarterCareActivityAction> Actions);

        private sealed record StarterCareActivityAction(string Name, IReadOnlyList<string> ResourceNames);

        private sealed record StarterPlant(
            string Nickname,
            string TaxonName,
            string Location);
    }
}
