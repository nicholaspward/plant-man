# Plant-Man Minimal Schema

This is the current working schema for the fresh React + Minimal API baseline.

## `PlantTaxon`

Reference data for a plant taxon. This may represent a species, cultivar, variety, hybrid, or other useful identification level.

| Field | Type | Required | Notes |
| - | - | - | - |
| `id` | `int` | Yes | Primary key |
| `name` | `string` | Yes | Common name |
| `genus` | `string` | Yes | Botanical genus |
| `species` | `string` | Yes | Botanical species |
| `cultivar` | `string` | No | Optional cultivar |
| `variety` | `string` | No | Optional variety |
| `authority` | `string` | No | Optional authority |

## `Plant`

A plant owned or tracked by the user.

| Field | Type | Required | Notes |
| - | - | - | - |
| `id` | `int` | Yes | Primary key |
| `taxon_id` | `int` | Yes | Foreign key to `PlantTaxon` |
| `nickname` | `string` | Yes | User-facing plant name |
| `location` | `string` | Yes | Where the plant lives |

## `PlantCareSchedule`

A per-plant recurring schedule for one care action.

| Field | Type | Required | Notes |
| - | - | - | - |
| `id` | `int` | Yes | Primary key |
| `plant_id` | `int` | Yes | Foreign key to `Plant` |
| `care_action_id` | `int` | Yes | Foreign key to `CareAction` |
| `every_days` | `int` | Yes | Recurrence interval |
| `is_enabled` | `bool` | Yes | Whether this schedule contributes to care tasks |

## `ActionLog`

A record of care performed for a plant.

| Field | Type | Required | Notes |
| - | - | - | - |
| `id` | `int` | Yes | Primary key |
| `plant_id` | `int` | Yes | Foreign key to `Plant` |
| `care_action_id` | `int` | Yes | Foreign key to `CareAction` |
| `action_name_snapshot` | `string` | Yes | Historical display name, such as `Water`, preserved if the action is renamed |
| `notes` | `string` | No | Optional observation |
| `performed_on` | `date` | Yes | Date care was completed |

## `CareAction`

A configurable type of care the user can log for a plant, such as watering, repotting, fertilizing, pruning, or inspection.

| Field | Type | Required | Notes |
| - | - | - | - |
| `id` | `int` | Yes | Primary key |
| `name` | `string` | Yes | User-facing action name |
| `description` | `string` | No | Optional explanation of the action |
| `is_enabled` | `bool` | Yes | Whether the action is available for use |

## `ActionResource`

A resource used while performing an action. This can be a consumable, material, product, piece of equipment, container, light, or other item relevant to the action.

| Field | Type | Required | Notes |
| - | - | - | - |
| `id` | `int` | Yes | Primary key |
| `name` | `string` | Yes | Resource name |
| `category` | `string` | No | Optional grouping, such as `Fertilizer`, `Medium`, `Treatment`, `Equipment`, or `Container` |
| `notes` | `string` | No | Optional details |
| `is_enabled` | `bool` | Yes | Whether the resource is available for use |

## `ActionLogResource`

Join data connecting an action log to the resources used during that action.

| Field | Type | Required | Notes |
| - | - | - | - |
| `action_log_id` | `int` | Yes | Foreign key to `ActionLog` |
| `action_resource_id` | `int` | Yes | Foreign key to `ActionResource` |
| `quantity` | `decimal` | No | Optional amount used |
| `unit` | `string` | No | Optional unit, such as `ml`, `tbsp`, or `g` |

## Deferred Ideas

These concepts are still promising, but they are intentionally out of the first working baseline:

- user accounts
- groups or rooms
- grow media and blends
- richer taxon profiles
