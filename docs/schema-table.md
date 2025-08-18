## Entities
### `Plant`
Represents an **individual plant**. Contains instance-specific information and references a shared plant species

| Attribute | Type | Nullable | Description | Example |
| - | - | - | - | - |
| `id` | `int` | NO | Primary key | 15 |
| `species_id` | `int` | NO | FK to [PlantSpecies](#plantspecies) | 1 |
| `name` | `string` | YES | Given/nickname for the plant | "Big Fatty" |
| `date_acquired` | `datetime` | YES | Date acquired | 2025-08-14T14:30:45Z |

---

### `PlantSpecies`
Represents **species-level data**. Shared, mostly static characteristics for plants of the same type

| Attribute | Type | Nullable | Description | Example |
| - | - | - | - | - |
| `id` | `int` | NO | Primary key | 1 |
| `name` | `string` | NO | Common name | Sunflower |
| `genus` | `string` | NO | Genus | *Helianthus* |
| `species` | `string` | NO | Species | *annuus* |
| `cultivar` | `string` | YES | Cultivar | |
| `variety` | `string` | YES | Variety | |
| `authority` | `string` | YES | Authority name | L. |

---

### `Group`
Logical grouping of plants (e.g., location, category).

| Attribute | Type | Nullable | Description | Example |
| - | - | - | - | - |
| `id` | `int` | NO | Primary key | 3 |
| `name` | `string` | NO | Group name | "Location: Plant Cart" |

---

### `PlantGroup`
**Junction table** implementing a many-to-many relationship between [Plant](#plant) and [Group](#group)

| Attribute | Type | Nullable | Description | Example |
| - | - | - | - | - |
| `id` | `int` | NO | Primary key | 1 |
| `group_id` | `int` | NO | FK to [Group](#group) | 3 |
| `plant_id` | `int` | NO | FK to [Plant](#plant) | 15 |

---

### `Action`
An **action** is a type of care or maintenance performed on a plant (e.g., watering, fertilizing, pruning)

| Attribute | Type | Nullable | Description | Example |
| - | - | - | - | - |
| `id` | `int` | NO | Primary key | 4 |
| `name` | `string` | NO | Action name | Water |
| `description` | `string` | YES | Action description | "Give the plant some water" |

---

### `ActionLog`
Records **which actions** were performed on **which plants or groups**

| Attribute | Type | Nullable | Description | Example |
| - | - | - | - | - |
| `id` | `int` | NO | Primary key | 22 |
| `action_id` | `int` | NO | FK to [Action](#action) | 4 |
| `plant_id` | `int` | YES | FK to [Plant](#plant) | NULL |
| `group_id` | `int` | YES | FK to [Group](#group) | 3 |
| `plan_id` | `int` | YES | FK to [MaintenancePlan](#maintenanceplan) | NULL |
| `notes` | `string` | YES | Notes on the action performed | "Dumped 500 gallons of electrolytes" |

---

### `MaintenancePlan`
Defines a **recurring set of actions** to be applied to a plant or group (e.g., “Water every 15 days”)

| Attribute | Type | Nullable | Description | Example |
| - | - | - | - | - |
| `id` | `int` | NO | Primary key | 7 |
| `plant_id` | `int` | YES | FK to [Plant](#plant) | NULL |
| `group_id` | `int` | YES | FK to [Group](#group) | 3 |
| `maintenance_plan_action_id` | `int` | NO | FK to [MaintenancePlanAction](#maintenanceplanaction) | 11 |

---

### `MaintenancePlanAction`
Links a [MaintenancePlan](#maintenanceplan) to the [Action](#action) to perform and specifies a schedule

| Attribute | Type | Nullable | Description | Example |
| - | - | - | - | - |
| `id` | `int` | NO | Primary key | 11 |
| `maintenance_plan_id` | `int` | NO | FK to [MaintenancePlan](#maintenanceplan) | 7 |
| `action_id` | `int` | NO | FK to [Action](#action) | 4 |
| `schedule` | `string` | NO | Execution interval (CRON format) | `0 0 */2 * *` |

---

### `Tool`
Represents a **tool** used to complete an action (e.g., “warm water” for a watering action)

| Attribute | Type | Nullable | Description | Example |
| - | - | - | - | - |
| `id` | `int` | NO | Primary key | 5 |
| `name` | `string` | NO | Tool name | Warm Water |
| `description` | `string` | YES | Tool description | "Like bath water" |

---

### `ToolAction`
**Junction table** implementing a many-to-many relationship between [Tool](#tool) and [Action](#action)

| Attribute | Type | Nullable | Description | Example |
| - | - | - | - | - |
| `id` | `int` | NO | Primary key | 2 |
| `tool_id` | `int` | NO | FK to [Tool](#tool) | 5 |
| `action_id` | `int` | NO | FK to [Action](#action) | 4 |

---

### `ToolAttribute`
Defines a **custom attribute** of a tool (e.g., “pH”, “temperature”)

| Attribute | Type | Nullable | Description | Example |
| - | - | - | - | - |
| `id` | `int` | NO | Primary key | 8 |
| `name` | `string` | NO | Attribute name | Acidity |
| `description` | `string` | YES | Description of attribute | "Water acidity, measured in pH" |

---

### `ToolAttributeValue`
Stores the value of a specific [ToolAttribute](#toolattribute) for a given [Tool](#tool)

| Attribute | Type | Nullable | Description | Example |
| - | - | - | - | - |
| `id` | `int` | NO | Primary key | 14 |
| `tool_attribute_id` | `int` | NO | FK to [ToolAttribute](#toolattribute) | 8 |
| `tool_id` | `int` | NO | FK to [Tool](#tool) | 5 |
| `value_string` | `string` | YES | Text value | "Slightly acidic" |
| `value_number` | `float` | YES | Numeric value | 7.0 |


### `GrowMedium`
Material used as the substrate in which a [Plant](#plant) is grown

| Attribute | Type | Nullable | Description | Example |
| - | - | - | - | - |
| `id` | `int` | NO | Primary key | 8 |
| `name` | `string` | NO | Given name | "Coco Coir" |
| `description` | `string` | YES | Short description | "good aeration and drainage" |
| `water_retention` | `int` | YES | Relative rating (1–5) of water retention capacity | 2 | 
| `aeration` | `int` | YES | Relative rating (1–5) of aeration potential | 5 |

---

### `GrowMediumBlend`
Enables composing custom blends of [GrowMedium](#growmedium) 

| Attribute | Type | Nullable | Description | Example |
| - | - | - | - | - |
| `id` | `int` | NO | Primary key | 2 |
| `parent_id` | `int` | NO | Foreign key | 12 |
| `child_id` | `int` | NO | Foreign key | 11 |
| `proportion` | `float` | NO | Fractional contribution of the child medium to the parent blend (0–1) | 0.2 |


