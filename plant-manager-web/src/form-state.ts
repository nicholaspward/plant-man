import type {
  ActionResource,
  ActionResourcePayload,
  CareActivity,
  CareActivityPayload,
  CareAction,
  CareActionPayload,
  BulkPlantCareSchedulePayload,
  Recipe,
  RecipePayload,
  Plant,
  AssignPlantFlagPayload,
  PlantPayload,
  PlantFlagDefinition,
  PlantFlagDefinitionPayload,
  PlantGroup,
  PlantGroupPayload,
  PlantLocation,
  PlantLocationPayload,
  RecipeMeasurementMode,
  ScheduleEndsMode,
  ScheduleRecurrenceMode,
  ScheduleRepeatUnit,
  PlantTaxon,
  PlantTaxonPayload,
} from './domain';

export const emptyPlantForm = {
  nickname: '',
  birthday: '',
};

export const emptyTaxonForm = {
  name: '',
  genus: '',
  species: '',
  cultivar: '',
  variety: '',
  authority: '',
};

export const emptyLocationForm = {
  name: '',
  notes: '',
};

export const emptyPlantGroupForm = {
  name: '',
  plantIds: [] as string[],
  notes: '',
};

export const emptyActionForm = {
  name: '',
  description: '',
};

export const emptyResourceForm = {
  name: '',
  notes: '',
};

export const emptyActivityForm = {
  name: '',
  actions: [] as CareActivityActionFormState[],
  notes: '',
};

export const emptyRecipeForm = {
  name: '',
  type: 'Soil mixture',
  measurementMode: 'quantity' as RecipeMeasurementMode,
  outputResourceName: '',
  components: [] as RecipeComponentFormState[],
  notes: '',
};

export type CareActivityActionResourceFormState = {
  actionResourceId: string;
  quantity: string;
  unit: string;
  notes: string;
};

export type CareActivityActionFormState = {
  careActionId: string;
  resources: CareActivityActionResourceFormState[];
};

export type RecipeComponentFormState = {
  actionResourceId: string;
  quantity: string;
  unit: string;
  notes: string;
};

export const emptyFlagDefinitionForm = {
  name: '',
  color: '#f2f2f2',
};

export const emptyPlantFlagForm = {
  plantFlagDefinitionId: '',
  startedOn: '',
  notes: '',
};

export const emptyBulkScheduleForm = {
  careActivityId: '',
  everyDays: '7',
  scheduledFor: '',
  recurrenceMode: 'weekly',
  repeatEvery: '1',
  repeatUnit: 'week',
  repeatOnDays: [] as string[],
  endsMode: 'after',
  endsOn: '',
  endsAfterOccurrences: '12',
  plantIds: [] as string[],
};

export type PlantFormState = typeof emptyPlantForm;
export type TaxonFormState = typeof emptyTaxonForm;
export type LocationFormState = typeof emptyLocationForm;
export type PlantGroupFormState = typeof emptyPlantGroupForm;
export type ActionFormState = typeof emptyActionForm;
export type ResourceFormState = typeof emptyResourceForm;
export type ActivityFormState = typeof emptyActivityForm;
export type RecipeFormState = typeof emptyRecipeForm;
export type FlagDefinitionFormState = typeof emptyFlagDefinitionForm;
export type PlantFlagFormState = typeof emptyPlantFlagForm;
export type BulkScheduleFormState = typeof emptyBulkScheduleForm;
export type View = 'home' | 'plants' | 'plant-management' | 'schedules' | 'taxa' | 'locations' | 'groups' | 'actions' | 'resources' | 'recipes' | 'activities' | 'flags';

export function toPlantForm(plant: Plant): PlantFormState {
  return {
    nickname: plant.nickname,
    birthday: plant.birthday ?? '',
  };
}

export function toPlantPayload(form: PlantFormState): PlantPayload {
  return {
    nickname: form.nickname.trim(),
    birthday: form.birthday || null,
    taxonId: null,
    locationId: null,
    careSchedules: null,
  };
}

export function toLocationForm(location: PlantLocation): LocationFormState {
  return {
    name: location.name,
    notes: location.notes ?? '',
  };
}

export function toLocationPayload(form: LocationFormState): PlantLocationPayload {
  return {
    name: form.name.trim(),
    notes: form.notes.trim() || null,
  };
}

export function toPlantGroupForm(group: PlantGroup): PlantGroupFormState {
  return {
    name: group.name,
    plantIds: group.plants.map((plant) => String(plant.id)),
    notes: group.notes ?? '',
  };
}

export function toPlantGroupPayload(form: PlantGroupFormState): PlantGroupPayload {
  return {
    name: form.name.trim(),
    plantIds: form.plantIds.map((id) => Number(id)),
    notes: form.notes.trim() || null,
  };
}

export function toTaxonForm(taxon: PlantTaxon): TaxonFormState {
  return {
    name: taxon.name,
    genus: taxon.genus,
    species: taxon.species,
    cultivar: taxon.cultivar ?? '',
    variety: taxon.variety ?? '',
    authority: taxon.authority ?? '',
  };
}

export function toTaxonPayload(form: TaxonFormState): PlantTaxonPayload {
  return {
    name: form.name.trim(),
    genus: form.genus.trim(),
    species: form.species.trim(),
    cultivar: form.cultivar.trim() || null,
    variety: form.variety.trim() || null,
    authority: form.authority.trim() || null,
  };
}

export function toActionForm(action: CareAction): ActionFormState {
  return {
    name: action.name,
    description: action.description ?? '',
  };
}

export function toActionPayload(form: ActionFormState): CareActionPayload {
  return {
    name: form.name.trim(),
    description: form.description.trim() || null,
  };
}

export function toResourceForm(resource: ActionResource): ResourceFormState {
  return {
    name: resource.name,
    notes: resource.notes ?? '',
  };
}

export function toResourcePayload(form: ResourceFormState): ActionResourcePayload {
  return {
    name: form.name.trim(),
    notes: form.notes.trim() || null,
  };
}

export function toActivityForm(activity: CareActivity): ActivityFormState {
  return {
    name: activity.name,
    actions: activity.actions.map((action) => ({
      careActionId: String(action.careActionId),
      resources: action.resources.map((resource) => ({
        actionResourceId: String(resource.actionResourceId),
        quantity: resource.quantity === null ? '' : String(resource.quantity),
        unit: resource.unit ?? '',
        notes: resource.notes ?? '',
      })),
    })),
    notes: activity.notes ?? '',
  };
}

export function toActivityPayload(form: ActivityFormState): CareActivityPayload {
  return {
    name: form.name.trim(),
    actions: form.actions.map((action) => ({
      careActionId: Number(action.careActionId),
      resources: action.resources.map((resource) => ({
        actionResourceId: Number(resource.actionResourceId),
        quantity: resource.quantity.trim() ? Number(resource.quantity) : null,
        unit: resource.unit.trim() || null,
        notes: resource.notes.trim() || null,
      })),
    })),
    notes: form.notes.trim() || null,
  };
}

export function toRecipeForm(recipe: Recipe): RecipeFormState {
  return {
    name: recipe.name,
    type: recipe.type,
    measurementMode: recipe.measurementMode,
    outputResourceName: recipe.outputResource?.name ?? '',
    components: recipe.components.map((component) => ({
      actionResourceId: String(component.actionResourceId),
      quantity: component.quantity === null ? '' : String(component.quantity),
      unit: component.unit ?? '',
      notes: component.notes ?? '',
    })),
    notes: recipe.notes ?? '',
  };
}

export function toRecipePayload(form: RecipeFormState): RecipePayload {
  return {
    name: form.name.trim(),
    type: form.type.trim(),
    measurementMode: form.measurementMode,
    outputResourceName: form.outputResourceName.trim() || null,
    components: form.components.map((component) => ({
      actionResourceId: Number(component.actionResourceId),
      quantity: component.quantity.trim() ? Number(component.quantity) : null,
      unit: form.measurementMode === 'quantity' ? component.unit.trim() || null : '%',
      notes: component.notes.trim() || null,
    })),
    notes: form.notes.trim() || null,
  };
}

export function toFlagDefinitionForm(flag: PlantFlagDefinition): FlagDefinitionFormState {
  return {
    name: flag.name,
    color: flag.color,
  };
}

export function toFlagDefinitionPayload(form: FlagDefinitionFormState): PlantFlagDefinitionPayload {
  return {
    name: form.name.trim(),
    color: form.color.trim() || null,
  };
}

export function toPlantFlagPayload(form: PlantFlagFormState): AssignPlantFlagPayload {
  return {
    plantFlagDefinitionId: Number(form.plantFlagDefinitionId),
    startedOn: form.startedOn || null,
    notes: form.notes.trim() || null,
  };
}

export function toBulkSchedulePayload(form: BulkScheduleFormState): BulkPlantCareSchedulePayload {
  return {
    plantIds: form.plantIds.map((id) => Number(id)),
    careActivityId: Number(form.careActivityId),
    everyDays: Number(form.everyDays),
    scheduledFor: form.scheduledFor || null,
    recurrenceMode: form.recurrenceMode as ScheduleRecurrenceMode,
    repeatEvery: Number(form.repeatEvery),
    repeatUnit: form.repeatUnit as ScheduleRepeatUnit,
    repeatOnDays: form.repeatOnDays.length > 0 ? form.repeatOnDays.join(',') : null,
    endsMode: (form.recurrenceMode === 'none' ? 'after' : form.endsMode) as ScheduleEndsMode,
    endsOn: form.endsMode === 'on' ? form.endsOn || null : null,
    endsAfterOccurrences: form.recurrenceMode === 'none'
      ? 1
      : form.endsMode === 'after'
        ? Number(form.endsAfterOccurrences)
        : null,
  };
}

export function formatTaxon(taxon: PlantTaxon) {
  const botanical = `${taxon.genus} ${taxon.species}`.trim();
  return taxon.name === botanical ? taxon.name : `${taxon.name} (${botanical})`;
}
