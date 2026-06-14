using Microsoft.EntityFrameworkCore;
using plant_manager.Data.Models;

namespace plant_manager.Data
{
    public static class SeedData
    {
        public static async Task SeedDevelopmentDataAsync(this ApplicationDbContext db)
        {
            if (await db.Plants.AnyAsync())
            {
                return;
            }

            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            var taxa = new
            {
                Monstera = new PlantTaxon
                {
                    Name = "Swiss Cheese Plant",
                    Genus = "Monstera",
                    Species = "deliciosa",
                    Family = "Araceae",
                    CommonName = "Swiss Cheese Plant",
                    ExternalSource = "gbif",
                    ExternalId = "2871984"
                },
                Ficus = new PlantTaxon
                {
                    Name = "Fiddle-leaf Fig",
                    Genus = "Ficus",
                    Species = "lyrata",
                    Family = "Moraceae",
                    CommonName = "Fiddle-leaf Fig",
                    ExternalSource = "gbif",
                    ExternalId = "5361909"
                },
                Alocasia = new PlantTaxon
                {
                    Name = "Kris Plant",
                    Genus = "Alocasia",
                    Species = "sanderiana",
                    Family = "Araceae",
                    CommonName = "Kris Plant",
                    ExternalSource = "gbif",
                    ExternalId = "2879681"
                },
                Peperomia = new PlantTaxon
                {
                    Name = "Marble Peperomia",
                    Genus = "Peperomia",
                    Species = "obtusifolia",
                    Cultivar = "Marble",
                    Family = "Piperaceae",
                    CommonName = "Marble Peperomia",
                    ExternalSource = "gbif",
                    ExternalId = "4189935"
                },
                Pothos = new PlantTaxon
                {
                    Name = "Pothos",
                    Genus = "Epipremnum",
                    Species = "aureum",
                    Family = "Araceae",
                    CommonName = "Pothos",
                    ExternalSource = "gbif",
                    ExternalId = "2868275"
                },
                Orchid = new PlantTaxon
                {
                    Name = "Moth Orchid",
                    Genus = "Phalaenopsis",
                    Species = "hybrid",
                    Family = "Orchidaceae",
                    CommonName = "Moth Orchid",
                    ExternalSource = "gbif",
                    ExternalId = "2879487"
                }
            };

            var locations = new
            {
                LivingRoom = new PlantLocation { Name = "Living Room", Notes = "Bright indirect light near the east window." },
                Office = new PlantLocation { Name = "Office", Notes = "Grow light shelf." },
                Kitchen = new PlantLocation { Name = "Kitchen", Notes = "Higher humidity and morning light." },
                Quarantine = new PlantLocation { Name = "Quarantine Shelf", Notes = "Temporary isolation and observation." }
            };

            var actions = new
            {
                Water = new CareAction { Name = "Water", Description = "Apply water or prepared solution." },
                Fertilize = new CareAction { Name = "Fertilize", Description = "Apply nutrients at the selected dilution." },
                Inspect = new CareAction { Name = "Inspect", Description = "Check foliage, roots, and pest pressure." },
                Repot = new CareAction { Name = "Repot", Description = "Refresh substrate or move to a larger pot." },
                Prune = new CareAction { Name = "Prune", Description = "Trim damaged or overgrown foliage." }
            };

            var resources = new
            {
                Water = new ActionResource { Name = "Water", Notes = "Room-temperature filtered water." },
                Fertilizer = new ActionResource { Name = "Liquid Fertilizer", Notes = "Balanced houseplant concentrate." },
                PottingMix = new ActionResource { Name = "Potting Mix", Notes = "General indoor plant substrate." },
                OrchidBark = new ActionResource { Name = "Orchid Bark", Notes = "Chunky aeration component." },
                Perlite = new ActionResource { Name = "Perlite", Notes = "Lightweight aeration component." },
                NeemOil = new ActionResource { Name = "Neem Oil", Notes = "Pest treatment concentrate." },
                Shears = new ActionResource { Name = "Clean Shears", Notes = "Sterilized cutting tool." }
            };

            var nutrientMix = new Recipe
            {
                Name = "Gentle Nutrient Mix",
                MeasurementMode = "bakers_percent",
                OutputResource = new ActionResource
                {
                    Name = "Gentle Nutrient Mix",
                    Notes = "Seed recipe output used by fertilizing activities."
                },
                Notes = "Water is the 100% base; fertilizer is measured against that base.",
                Components =
                [
                    new RecipeComponent
                    {
                        ActionResource = resources.Water,
                        Quantity = 100,
                        Unit = "%",
                        Notes = "Base",
                        SortOrder = 0
                    },
                    new RecipeComponent
                    {
                        ActionResource = resources.Fertilizer,
                        Quantity = 5,
                        Unit = "%",
                        Notes = "Light feeding strength",
                        SortOrder = 1
                    }
                ]
            };

            var waterActivity = new CareActivity
            {
                Name = "Water",
                Notes = "Routine watering based on substrate dryness.",
                Actions =
                [
                    new CareActivityAction
                    {
                        CareAction = actions.Water,
                        SortOrder = 0,
                        Resources =
                        [
                            new CareActivityActionResource
                            {
                                ActionResource = resources.Water,
                                Quantity = 500,
                                Unit = "ml",
                                Notes = "Adjust by pot size."
                            }
                        ]
                    }
                ]
            };

            var fertilizeActivity = new CareActivity
            {
                Name = "Fertilize",
                Notes = "Light feeding during active growth.",
                Actions =
                [
                    new CareActivityAction
                    {
                        CareAction = actions.Fertilize,
                        SortOrder = 0,
                        Resources =
                        [
                            new CareActivityActionResource
                            {
                                ActionResource = nutrientMix.OutputResource,
                                Quantity = 250,
                                Unit = "ml",
                                Notes = "Use after watering if soil is very dry."
                            }
                        ]
                    }
                ]
            };

            var inspectActivity = new CareActivity
            {
                Name = "Pest Check",
                Notes = "Inspect leaves, stems, and soil surface.",
                Actions =
                [
                    new CareActivityAction
                    {
                        CareAction = actions.Inspect,
                        SortOrder = 0,
                        Resources =
                        [
                            new CareActivityActionResource
                            {
                                ActionResource = resources.NeemOil,
                                Quantity = 0,
                                Unit = "ml",
                                Notes = "Only use if pests are found."
                            }
                        ]
                    }
                ]
            };

            var repotActivity = new CareActivity
            {
                Name = "Repot",
                Notes = "Refresh substrate and inspect roots.",
                Actions =
                [
                    new CareActivityAction
                    {
                        CareAction = actions.Repot,
                        SortOrder = 0,
                        Resources =
                        [
                            new CareActivityActionResource { ActionResource = resources.PottingMix, Quantity = 1, Unit = "L" },
                            new CareActivityActionResource { ActionResource = resources.OrchidBark, Quantity = 0.5m, Unit = "L" },
                            new CareActivityActionResource { ActionResource = resources.Perlite, Quantity = 0.5m, Unit = "L" }
                        ]
                    }
                ]
            };

            var pruneActivity = new CareActivity
            {
                Name = "Prune",
                Notes = "Remove damaged foliage and shape growth.",
                Actions =
                [
                    new CareActivityAction
                    {
                        CareAction = actions.Prune,
                        SortOrder = 0,
                        Resources =
                        [
                            new CareActivityActionResource { ActionResource = resources.Shears, Quantity = 1, Unit = "tool" }
                        ]
                    }
                ]
            };

            var flags = new
            {
                Attention = new PlantFlagDefinition { Name = "Attention", Color = "#FFAB00" },
                Recovering = new PlantFlagDefinition { Name = "Recovering", Color = "#36B37E" },
                Quarantine = new PlantFlagDefinition { Name = "Quarantine", Color = "#FF5630" },
                Wishlist = new PlantFlagDefinition { Name = "Wishlist", Color = "#6554C0" }
            };

            var plants = new
            {
                Monstera = new Plant
                {
                    Nickname = "Elara",
                    Birthday = today.AddDays(-420),
                    Taxon = taxa.Monstera,
                    Location = locations.LivingRoom
                },
                Ficus = new Plant
                {
                    Nickname = "Darrow",
                    Birthday = today.AddDays(-260),
                    Taxon = taxa.Ficus,
                    Location = locations.LivingRoom
                },
                Kris = new Plant
                {
                    Nickname = "Tamsin",
                    Birthday = today.AddDays(-120),
                    Taxon = taxa.Alocasia,
                    Location = locations.Quarantine
                },
                Peperomia = new Plant
                {
                    Nickname = "Rowan",
                    Birthday = today.AddDays(-95),
                    Taxon = taxa.Peperomia,
                    Location = locations.Office
                },
                Pothos = new Plant
                {
                    Nickname = "Juno",
                    Birthday = today.AddDays(-700),
                    Taxon = taxa.Pothos,
                    Location = locations.Kitchen
                },
                Orchid = new Plant
                {
                    Nickname = "Lyric",
                    Birthday = today.AddDays(-35),
                    Taxon = taxa.Orchid,
                    Location = locations.Office
                }
            };

            var groups = new
            {
                LivingRoom = new PlantGroup
                {
                    Name = "Living Room Group",
                    Notes = "Larger statement plants.",
                    Memberships =
                    [
                        new PlantGroupMembership { Plant = plants.Monstera },
                        new PlantGroupMembership { Plant = plants.Ficus }
                    ]
                },
                Humidity = new PlantGroup
                {
                    Name = "Humidity Lovers",
                    Notes = "Plants that prefer steadier humidity.",
                    Memberships =
                    [
                        new PlantGroupMembership { Plant = plants.Kris },
                        new PlantGroupMembership { Plant = plants.Orchid },
                        new PlantGroupMembership { Plant = plants.Peperomia }
                    ]
                },
                EasyCare = new PlantGroup
                {
                    Name = "Easy Care",
                    Notes = "Reliable low-maintenance plants.",
                    Memberships =
                    [
                        new PlantGroupMembership { Plant = plants.Pothos },
                        new PlantGroupMembership { Plant = plants.Peperomia }
                    ]
                }
            };

            plants.Ficus.Flags.Add(new PlantFlag
            {
                Definition = flags.Attention,
                StartedOn = today.AddDays(-3),
                Notes = "Watch for leaf drop after relocation."
            });
            plants.Kris.Flags.Add(new PlantFlag
            {
                Definition = flags.Quarantine,
                StartedOn = today.AddDays(-8),
                Notes = "New arrival. Inspect before moving near other plants."
            });
            plants.Orchid.Flags.Add(new PlantFlag
            {
                Definition = flags.Recovering,
                StartedOn = today.AddDays(-15),
                ResolvedOn = today.AddDays(-2),
                Notes = "Recovered after bloom spike trim."
            });

            waterActivity.PlantCareSchedules =
            [
                new PlantCareSchedule
                {
                    CareAction = actions.Water,
                    EveryDays = 7,
                    ScheduledFor = today.AddDays(-7),
                    RecurrenceMode = "weekly",
                    RepeatEvery = 1,
                    RepeatUnit = "week",
                    EndsMode = "never",
                    Assignments =
                    [
                        new PlantCareScheduleAssignment { Plant = plants.Monstera },
                        new PlantCareScheduleAssignment { Plant = plants.Ficus },
                        new PlantCareScheduleAssignment { Plant = plants.Pothos }
                    ]
                },
                new PlantCareSchedule
                {
                    CareAction = actions.Water,
                    EveryDays = 4,
                    ScheduledFor = today.AddDays(-4),
                    RecurrenceMode = "custom",
                    RepeatEvery = 4,
                    RepeatUnit = "day",
                    EndsMode = "never",
                    Assignments =
                    [
                        new PlantCareScheduleAssignment { Plant = plants.Kris },
                        new PlantCareScheduleAssignment { Plant = plants.Peperomia },
                        new PlantCareScheduleAssignment { Plant = plants.Orchid }
                    ]
                }
            ];

            fertilizeActivity.PlantCareSchedules =
            [
                new PlantCareSchedule
                {
                    CareAction = actions.Fertilize,
                    EveryDays = 30,
                    ScheduledFor = today.AddDays(5),
                    RecurrenceMode = "monthly",
                    RepeatEvery = 1,
                    RepeatUnit = "month",
                    EndsMode = "never",
                    Assignments =
                    [
                        new PlantCareScheduleAssignment { Plant = plants.Monstera },
                        new PlantCareScheduleAssignment { Plant = plants.Pothos },
                        new PlantCareScheduleAssignment { Plant = plants.Peperomia }
                    ]
                }
            ];

            inspectActivity.PlantCareSchedules =
            [
                new PlantCareSchedule
                {
                    CareAction = actions.Inspect,
                    EveryDays = 14,
                    ScheduledFor = today.AddDays(-2),
                    RecurrenceMode = "weekly",
                    RepeatEvery = 1,
                    RepeatUnit = "week",
                    EndsMode = "after",
                    EndsAfterOccurrences = 8,
                    Assignments =
                    [
                        new PlantCareScheduleAssignment { Plant = plants.Kris },
                        new PlantCareScheduleAssignment { Plant = plants.Ficus }
                    ]
                }
            ];

            repotActivity.PlantCareSchedules =
            [
                new PlantCareSchedule
                {
                    CareAction = actions.Repot,
                    EveryDays = 365,
                    ScheduledFor = today.AddDays(45),
                    RecurrenceMode = "none",
                    RepeatEvery = 1,
                    RepeatUnit = "week",
                    EndsMode = "after",
                    EndsAfterOccurrences = 1,
                    Assignments =
                    [
                        new PlantCareScheduleAssignment { Plant = plants.Ficus }
                    ]
                }
            ];

            plants.Monstera.ActionLogs.Add(new ActionLog
            {
                CareAction = actions.Water,
                CareActivity = waterActivity,
                ActionNameSnapshot = waterActivity.Name,
                PerformedOn = today.AddDays(-7),
                Notes = "Thorough soak; pot drained well.",
                Resources =
                [
                    new ActionLogResource { ActionResource = resources.Water, Quantity = 650, Unit = "ml" }
                ]
            });
            plants.Pothos.ActionLogs.Add(new ActionLog
            {
                CareAction = actions.Water,
                CareActivity = waterActivity,
                ActionNameSnapshot = waterActivity.Name,
                PerformedOn = today.AddDays(-10),
                Notes = "Let dry longer next round.",
                Resources =
                [
                    new ActionLogResource { ActionResource = resources.Water, Quantity = 400, Unit = "ml" }
                ]
            });
            plants.Peperomia.ActionLogs.Add(new ActionLog
            {
                CareAction = actions.Inspect,
                CareActivity = inspectActivity,
                ActionNameSnapshot = inspectActivity.Name,
                PerformedOn = today.AddDays(-1),
                Notes = "No pests observed.",
                Resources = []
            });
            plants.Monstera.ActionLogs.Add(new ActionLog
            {
                CareAction = actions.Fertilize,
                CareActivity = fertilizeActivity,
                ActionNameSnapshot = fertilizeActivity.Name,
                PerformedOn = today.AddDays(-28),
                Notes = "Light feed during new leaf growth.",
                Resources =
                [
                    new ActionLogResource { ActionResource = nutrientMix.OutputResource, Quantity = 250, Unit = "ml" }
                ]
            });

            db.PlantTaxa.AddRange(taxa.Monstera, taxa.Ficus, taxa.Alocasia, taxa.Peperomia, taxa.Pothos, taxa.Orchid);
            db.PlantLocations.AddRange(locations.LivingRoom, locations.Office, locations.Kitchen, locations.Quarantine);
            db.CareActions.AddRange(actions.Water, actions.Fertilize, actions.Inspect, actions.Repot, actions.Prune);
            db.ActionResources.AddRange(resources.Water, resources.Fertilizer, resources.PottingMix, resources.OrchidBark, resources.Perlite, resources.NeemOil, resources.Shears);
            db.Recipes.Add(nutrientMix);
            db.CareActivities.AddRange(waterActivity, fertilizeActivity, inspectActivity, repotActivity, pruneActivity);
            db.PlantFlagDefinitions.AddRange(flags.Attention, flags.Recovering, flags.Quarantine, flags.Wishlist);
            db.Plants.AddRange(plants.Monstera, plants.Ficus, plants.Kris, plants.Peperomia, plants.Pothos, plants.Orchid);
            db.PlantGroups.AddRange(groups.LivingRoom, groups.Humidity, groups.EasyCare);

            await db.SaveChangesAsync();
        }
    }
}
