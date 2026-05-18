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

        private static readonly PlantFlagDefinition[] StarterFlagDefinitions =
        [
            new() { Name = "Spider mites", Category = "Pest", Color = "#ffe4e1" },
            new() { Name = "Fungus gnats", Category = "Pest", Color = "#fff4cc" },
            new() { Name = "Quarantine", Category = "Workflow", Color = "#e8eef8" },
            new() { Name = "Needs repotting", Category = "Condition", Color = "#e9f5e7" },
            new() { Name = "Watch closely", Category = "Workflow", Color = "#eeeeee" }
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

        public static void Seed(ApplicationDbContext db)
        {
            SeedCareActions(db);
            SeedActionResources(db);
            SeedPlantFlags(db);
            SeedStarterTaxa(db);
            SeedStarterPlants(db);
            SeedDefaultCareSchedules(db);
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

        private static void SeedDefaultCareSchedules(ApplicationDbContext db)
        {
            var waterAction = db.CareActions
                .FirstOrDefault(action => action.Name == "Water");
            if (waterAction is null)
            {
                return;
            }

            var plantsMissingWaterSchedule = db.Plants
                .Include(plant => plant.CareSchedules)
                .Where(plant => !plant.CareSchedules.Any(schedule => schedule.CareActionId == waterAction.Id))
                .ToList();

            foreach (var plant in plantsMissingWaterSchedule)
            {
                plant.CareSchedules.Add(new PlantCareSchedule
                {
                    CareActionId = waterAction.Id,
                    EveryDays = 7,
                    IsEnabled = true
                });
            }

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
                    Category = starterFlag.Category,
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

            PlantTaxon Taxon(string name) => taxaByName[name];

            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            var starterPlants = new[]
            {
                new
                {
                    Plant = new Plant
                    {
                        Nickname = "Pothos",
                        Taxon = Taxon("Pothos"),
                        Location = "Living room"
                    },
                    InitialWateredOn = today.AddDays(-7),
                    WaterIntervalDays = 7
                },
                new
                {
                    Plant = new Plant
                    {
                        Nickname = "Money Tree",
                        Taxon = Taxon("Money Tree"),
                        Location = "Bedroom"
                    },
                    InitialWateredOn = today.AddDays(-13),
                    WaterIntervalDays = 14
                },
                new
                {
                    Plant = new Plant
                    {
                        Nickname = "Chinese Money Plant",
                        Taxon = Taxon("Chinese Money Plant"),
                        Location = "Kitchen"
                    },
                    InitialWateredOn = today.AddDays(-2),
                    WaterIntervalDays = 6
                }
            };

            db.Plants.AddRange(starterPlants.Select(starterPlant => starterPlant.Plant));
            db.SaveChanges();

            var waterAction = db.CareActions.FirstOrDefault(action => action.Name == "Water");
            if (waterAction is null)
            {
                return;
            }

            foreach (var starterPlant in starterPlants)
            {
                starterPlant.Plant.CareSchedules.Add(new PlantCareSchedule
                {
                    CareActionId = waterAction.Id,
                    EveryDays = starterPlant.WaterIntervalDays,
                    IsEnabled = true
                });
                db.ActionLogs.Add(new ActionLog
                {
                    PlantId = starterPlant.Plant.Id,
                    CareActionId = waterAction.Id,
                    ActionNameSnapshot = waterAction.Name,
                    Notes = "Starter watering history.",
                    PerformedOn = starterPlant.InitialWateredOn
                });
            }

            db.SaveChanges();
        }

        private sealed record StarterTaxon(string Name, string Genus, string Species);
    }
}
