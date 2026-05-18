import type {
  ActionResource,
  ActionResourcePayload,
  CareAction,
  CareActionPayload,
  Plant,
  AssignPlantFlagPayload,
  PlantPayload,
  PlantFlagDefinition,
  PlantFlagDefinitionPayload,
  PlantTaxon,
  PlantTaxonPayload,
} from './domain';

export const emptyPlantForm = {
  nickname: '',
  taxonId: '',
  location: '',
  careSchedules: [] as PlantCareScheduleFormState[],
};

export type PlantCareScheduleFormState = {
  careActionId: string;
  everyDays: string;
  isEnabled: boolean;
};

export const emptyTaxonForm = {
  name: '',
  genus: '',
  species: '',
  cultivar: '',
  variety: '',
  authority: '',
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

export const emptyFlagDefinitionForm = {
  name: '',
  category: 'Pest',
  color: '#f2f2f2',
  isEnabled: true,
};

export const emptyPlantFlagForm = {
  plantFlagDefinitionId: '',
  severity: 'medium',
  startedOn: '',
  notes: '',
};

export type CareLogResourceFormState = {
  actionResourceId: string;
  quantity: string;
  unit: string;
};

export const emptyCareLogForm = {
  plantId: '',
  careActionId: '',
  performedOn: '',
  notes: '',
  resources: [] as CareLogResourceFormState[],
};

export type PlantFormState = typeof emptyPlantForm;
export type TaxonFormState = typeof emptyTaxonForm;
export type ActionFormState = typeof emptyActionForm;
export type ResourceFormState = typeof emptyResourceForm;
export type FlagDefinitionFormState = typeof emptyFlagDefinitionForm;
export type PlantFlagFormState = typeof emptyPlantFlagForm;
export type CareLogFormState = typeof emptyCareLogForm;
export type View = 'home' | 'plants' | 'taxa' | 'actions' | 'resources' | 'flags';

export function toPlantForm(plant: Plant): PlantFormState {
  return {
    nickname: plant.nickname,
    taxonId: String(plant.taxonId),
    location: plant.location,
    careSchedules: plant.careSchedules.map((schedule) => ({
      careActionId: String(schedule.careActionId),
      everyDays: String(schedule.everyDays),
      isEnabled: schedule.isEnabled,
    })),
  };
}

export function toPlantPayload(form: PlantFormState): PlantPayload {
  return {
    nickname: form.nickname.trim(),
    taxonId: Number(form.taxonId),
    location: form.location.trim(),
    careSchedules: form.careSchedules.map((schedule) => ({
      careActionId: Number(schedule.careActionId),
      everyDays: Number(schedule.everyDays),
      isEnabled: schedule.isEnabled,
    })),
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

export function toFlagDefinitionForm(flag: PlantFlagDefinition): FlagDefinitionFormState {
  return {
    name: flag.name,
    category: flag.category,
    color: flag.color,
    isEnabled: flag.isEnabled,
  };
}

export function toFlagDefinitionPayload(form: FlagDefinitionFormState): PlantFlagDefinitionPayload {
  return {
    name: form.name.trim(),
    category: form.category.trim() || null,
    color: form.color.trim() || null,
    isEnabled: form.isEnabled,
  };
}

export function toPlantFlagPayload(form: PlantFlagFormState): AssignPlantFlagPayload {
  return {
    plantFlagDefinitionId: Number(form.plantFlagDefinitionId),
    severity: form.severity || null,
    startedOn: form.startedOn || null,
    notes: form.notes.trim() || null,
  };
}

export function formatTaxon(taxon: PlantTaxon) {
  const botanical = `${taxon.genus} ${taxon.species}`.trim();
  return taxon.name === botanical ? taxon.name : `${taxon.name} (${botanical})`;
}
