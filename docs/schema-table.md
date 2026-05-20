# Plant-Man Schema

Current working schema for the React + Minimal API app.

## `Plant`

A plant object tracked by the user.

| Field | Type | Required | Notes |
| - | - | - | - |
| `id` | `int` | Yes | Primary key |
| `taxon_id` | `int` | No | Optional foreign key to `PlantTaxon` |
| `location_id` | `int` | No | Optional foreign key to `PlantLocation` |
| `nickname` | `string` | Yes | User-facing plant name |

## `PlantTaxon`

Reference data for plant identity.

| Field | Type | Required | Notes |
| - | - | - | - |
| `id` | `int` | Yes | Primary key |
| `name` | `string` | Yes | Common or display name |
| `genus` | `string` | Yes | Botanical genus |
| `species` | `string` | Yes | Botanical species |
| `cultivar` | `string` | No | Optional cultivar |
| `variety` | `string` | No | Optional variety |
| `authority` | `string` | No | Optional authority |

## `PlantLocation`

Reference data for where plants live.

| Field | Type | Required | Notes |
| - | - | - | - |
| `id` | `int` | Yes | Primary key |
| `name` | `string` | Yes | User-facing location name |
| `notes` | `string` | No | Optional details |
| `is_enabled` | `bool` | Yes | Whether the location is available for new assignments |

## `CareAction`

A reusable care verb, such as water, prune, fertilize, inspect, or repot.

| Field | Type | Required | Notes |
| - | - | - | - |
| `id` | `int` | Yes | Primary key |
| `name` | `string` | Yes | User-facing action name |
| `description` | `string` | No | Optional explanation |
| `is_enabled` | `bool` | Yes | Whether the action is available for use |

## `ActionResource`

A resource used while performing care.

| Field | Type | Required | Notes |
| - | - | - | - |
| `id` | `int` | Yes | Primary key |
| `name` | `string` | Yes | Resource name |
| `category` | `string` | No | Optional grouping, such as `Fertilizer`, `Medium`, `Treatment`, `Equipment`, or `Container` |
| `notes` | `string` | No | Optional details |
| `is_enabled` | `bool` | Yes | Whether the resource is available for use |

## `CareActivity`

A configurable care activity made from one or more care actions.

| Field | Type | Required | Notes |
| - | - | - | - |
| `id` | `int` | Yes | Primary key |
| `name` | `string` | Yes | User-facing activity name |
| `notes` | `string` | No | Optional details |
| `is_enabled` | `bool` | Yes | Whether the activity is available for schedules and logs |

## `CareActivityAction`

Join data connecting a care activity to each included care action.

| Field | Type | Required | Notes |
| - | - | - | - |
| `care_activity_id` | `int` | Yes | Foreign key to `CareActivity` |
| `care_action_id` | `int` | Yes | Foreign key to `CareAction` |
| `sort_order` | `int` | Yes | Stable display order for the activity builder |

## `CareActivityActionResource`

Join data connecting an activity action to the resources it uses.

| Field | Type | Required | Notes |
| - | - | - | - |
| `care_activity_id` | `int` | Yes | Part of the foreign key to `CareActivityAction` |
| `care_action_id` | `int` | Yes | Part of the foreign key to `CareActivityAction` |
| `action_resource_id` | `int` | Yes | Foreign key to `ActionResource` |
| `quantity` | `decimal` | No | Optional amount |
| `unit` | `string` | No | Optional unit |
| `notes` | `string` | No | Optional resource-specific instructions |

## `PlantCareSchedule`

A per-plant recurring schedule for one care activity. Scheduler is the UI owner for these assignments.

| Field | Type | Required | Notes |
| - | - | - | - |
| `id` | `int` | Yes | Primary key |
| `plant_id` | `int` | Yes | Foreign key to `Plant` |
| `care_action_id` | `int` | Yes | Snapshot/compatibility foreign key to the primary care action |
| `care_activity_id` | `int` | Yes | Foreign key to `CareActivity` |
| `every_days` | `int` | Yes | Recurrence interval |
| `is_enabled` | `bool` | Yes | Whether this schedule contributes to care tasks |

## `ActionLog`

A record of care performed for a plant.

| Field | Type | Required | Notes |
| - | - | - | - |
| `id` | `int` | Yes | Primary key |
| `plant_id` | `int` | Yes | Foreign key to `Plant` |
| `care_action_id` | `int` | Yes | Snapshot/compatibility foreign key to the primary care action |
| `care_activity_id` | `int` | Yes | Foreign key to `CareActivity` |
| `action_name_snapshot` | `string` | Yes | Historical display name |
| `notes` | `string` | No | Optional observation |
| `performed_on` | `date` | Yes | Date care was completed |

## `ActionLogResource`

Join data connecting an action log to the resources used.

| Field | Type | Required | Notes |
| - | - | - | - |
| `action_log_id` | `int` | Yes | Foreign key to `ActionLog` |
| `action_resource_id` | `int` | Yes | Foreign key to `ActionResource` |
| `quantity` | `decimal` | No | Optional amount used |
| `unit` | `string` | No | Optional unit |

## `PlantFlagDefinition`

A reusable plant flag.

| Field | Type | Required | Notes |
| - | - | - | - |
| `id` | `int` | Yes | Primary key |
| `name` | `string` | Yes | Flag name |
| `color` | `string` | Yes | Display color |
| `is_enabled` | `bool` | Yes | Whether the flag can be assigned |

## `PlantFlag`

An assigned flag on a plant.

| Field | Type | Required | Notes |
| - | - | - | - |
| `id` | `int` | Yes | Primary key |
| `plant_id` | `int` | Yes | Foreign key to `Plant` |
| `plant_flag_definition_id` | `int` | Yes | Foreign key to `PlantFlagDefinition` |
| `started_on` | `date` | Yes | Date the flag became active |
| `resolved_on` | `date` | No | Date the flag was resolved |
| `notes` | `string` | No | Optional details |
