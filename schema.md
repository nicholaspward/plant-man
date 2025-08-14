# Plant-man overview

## Class: `Plant`
This class represents the plant to be managed, the fundamental object of our interest around which all of this software revolves. Contains instance-specific info.

| Attribute | Type | Description | Example |
|-|-|-|-|
| `id` | `int` | Primary key | 15 |
| `plant_id` | `int` | Foreign Key | 0 |
| `name` | `string` | Given name | "Big Fatty" |
| `date_acquired` | `datetime` | Date acquired | 2025-08-14T14:30:45.0000000

---

## Class: `Plant Specification`
Contains mostly static info about the *species*, which every plant of this type shares

| Attribute | Type | Description | Example |
|-|-|-|-|
| `id` | `int` | Primary key | 0 |
| `name` | `string` | Common Name | Sunflower |
| `genus` | `string` | Genus | *Helianthus* |
| `species` | `string` | Species | *annus* |
| `cultivar` | `string` | Cultivar | |
| `variety` | `string` | Variety | |
| `authority` | `string` | Authority | L. |

## Class: `Group`
This is generic way to logically 'group' plants.

| Attribute | Type | Description | Example |
|-|-|-|-|
| `id` | `int` | Primary Key | 0 |
| `name` | `string` | Given name | Location: Plant cart |

---

## Class: `Plant-Group Relationship`
Records plant group membership. A plant may belong to many groups, and groups may contain many plants.

| Attribute | Type | Description | Example |
|-|-|-|-|
| `id` | `int` | Primary key | 0 |
| `group_id` | `int` | Group ID (fk) | 0 |
| `plant_id` | `int` | Plant ID (fk)| 15 |

---

## Class: `Action`
An action is work performed on a plant, e.g. watering, fertilizing, pruning, etc.

| Attribute | Type | Description | Example |
|-|-|-|-|
| `id` | `int` | Primary key | 0 |
| `name` | `string` | Name of the Action | Water |
| `description` | `string` | Describe the action | give the plant some water! |


## Class: `Action Log`
Record which actions were performed on which plant or plant group

| Attribute | Type | Description | Example |
|-|-|-|-|
| `id` | `int` | Primary key | 0 |
| `action_id` | `int` | Action ID (fk) | 0 |
| `plant_id` | `int` | Plant ID (fk) | null |
| `group_id` | `int` | Group ID (fk) | 0 |
| `notes` | `string` | Notes | Dumped 500 gallons of electrolytes on it |

