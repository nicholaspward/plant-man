import type {
  ActionResource,
  ActionResourcePayload,
  CareAction,
  CareActionPayload,
  Plant,
  PlantPayload,
  PlantTaxon,
  PlantTaxonPayload,
} from './domain';

export const emptyPlantForm = {
  nickname: '',
  taxonId: '',
  location: '',
  lastWateredOn: '',
  waterEveryDays: '7',
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

export const emptyCareLogForm = {
  plantId: '',
  action: 'Water',
  performedOn: '',
  notes: '',
};

export type PlantFormState = typeof emptyPlantForm;
export type TaxonFormState = typeof emptyTaxonForm;
export type ActionFormState = typeof emptyActionForm;
export type ResourceFormState = typeof emptyResourceForm;
export type CareLogFormState = typeof emptyCareLogForm;
export type View = 'home' | 'plants' | 'taxa' | 'actions' | 'resources';

export function toPlantForm(plant: Plant): PlantFormState {
  return {
    nickname: plant.nickname,
    taxonId: String(plant.taxonId),
    location: plant.location,
    lastWateredOn: plant.lastWateredOn ?? '',
    waterEveryDays: String(plant.waterEveryDays),
  };
}

export function toPlantPayload(form: PlantFormState): PlantPayload {
  return {
    nickname: form.nickname.trim(),
    taxonId: Number(form.taxonId),
    location: form.location.trim(),
    lastWateredOn: form.lastWateredOn || null,
    waterEveryDays: Number(form.waterEveryDays),
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

export function formatTaxon(taxon: PlantTaxon) {
  const botanical = `${taxon.genus} ${taxon.species}`.trim();
  return taxon.name === botanical ? taxon.name : `${taxon.name} (${botanical})`;
}
