import type {
  ActionResource,
  ActionResourcePayload,
  CareActivity,
  CareActivityPayload,
  CareAction,
  CareActionPayload,
  BulkPlantCareSchedulePayload,
  Plant,
  AssignPlantFlagPayload,
  PlantPayload,
  PlantFlagDefinition,
  PlantFlagDefinitionPayload,
  PlantLocation,
  PlantLocationPayload,
  ScheduleEndsMode,
  ScheduleRecurrenceMode,
  ScheduleRepeatUnit,
  PlantTaxon,
  PlantTaxonPayload,
} from './domain';

export const emptyPlantForm = {
  nickname: '',
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
  isEnabled: true,
};

export const emptyActionForm = {
  name: '',
  description: '',
  isEnabled: true,
};

export const emptyResourceForm = {
  name: '',
  category: '',
  notes: '',
  isEnabled: true,
};

export const emptyActivityForm = {
  name: '',
  actions: [] as CareActivityActionFormState[],
  notes: '',
  isEnabled: true,
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

export const emptyFlagDefinitionForm = {
  name: '',
  color: '#f2f2f2',
  isEnabled: true,
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
  isEnabled: true,
  plantIds: [] as string[],
};

export type PlantFormState = typeof emptyPlantForm;
export type TaxonFormState = typeof emptyTaxonForm;
export type LocationFormState = typeof emptyLocationForm;
export type ActionFormState = typeof emptyActionForm;
export type ResourceFormState = typeof emptyResourceForm;
export type ActivityFormState = typeof emptyActivityForm;
export type FlagDefinitionFormState = typeof emptyFlagDefinitionForm;
export type PlantFlagFormState = typeof emptyPlantFlagForm;
export type BulkScheduleFormState = typeof emptyBulkScheduleForm;
export type View = 'home' | 'plants' | 'plant-management' | 'schedules' | 'taxa' | 'locations' | 'actions' | 'resources' | 'activities' | 'flags';

export function toPlantForm(plant: Plant): PlantFormState {
  return {
    nickname: plant.nickname,
  };
}

export function toPlantPayload(form: PlantFormState): PlantPayload {
  return {
    nickname: form.nickname.trim(),
    taxonId: null,
    locationId: null,
    careSchedules: null,
  };
}

export function toLocationForm(location: PlantLocation): LocationFormState {
  return {
    name: location.name,
    notes: location.notes ?? '',
    isEnabled: location.isEnabled,
  };
}

export function toLocationPayload(form: LocationFormState): PlantLocationPayload {
  return {
    name: form.name.trim(),
    notes: form.notes.trim() || null,
    isEnabled: form.isEnabled,
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
    isEnabled: action.isEnabled,
  };
}

export function toActionPayload(form: ActionFormState): CareActionPayload {
  return {
    name: form.name.trim(),
    description: form.description.trim() || null,
    isEnabled: form.isEnabled,
  };
}

export function toResourceForm(resource: ActionResource): ResourceFormState {
  return {
    name: resource.name,
    category: resource.category ?? '',
    notes: resource.notes ?? '',
    isEnabled: resource.isEnabled,
  };
}

export function toResourcePayload(form: ResourceFormState): ActionResourcePayload {
  return {
    name: form.name.trim(),
    category: form.category.trim() || null,
    notes: form.notes.trim() || null,
    isEnabled: form.isEnabled,
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
    isEnabled: activity.isEnabled,
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
    isEnabled: form.isEnabled,
  };
}

export function toFlagDefinitionForm(flag: PlantFlagDefinition): FlagDefinitionFormState {
  return {
    name: flag.name,
    color: flag.color,
    isEnabled: flag.isEnabled,
  };
}

export function toFlagDefinitionPayload(form: FlagDefinitionFormState): PlantFlagDefinitionPayload {
  return {
    name: form.name.trim(),
    color: form.color.trim() || null,
    isEnabled: form.isEnabled,
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
    isEnabled: form.isEnabled,
  };
}

export function formatTaxon(taxon: PlantTaxon) {
  const botanical = `${taxon.genus} ${taxon.species}`.trim();
  return taxon.name === botanical ? taxon.name : `${taxon.name} (${botanical})`;
}
