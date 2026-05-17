export type CareStatus = 'due' | 'soon' | 'ok';

export type Plant = {
  id: number;
  nickname: string;
  taxonId: number;
  taxon: string;
  location: string;
  lastWateredOn: string | null;
  lastWatered: string;
  nextCare: string;
  waterEveryDays: number;
  status: CareStatus;
};

export type PlantTaxon = {
  id: number;
  name: string;
  genus: string;
  species: string;
  cultivar: string | null;
  variety: string | null;
  authority: string | null;
};

export type CareAction = {
  id: number;
  name: string;
  description: string | null;
  isEnabled: boolean;
};

export type ActionResource = {
  id: number;
  name: string;
  category: string | null;
  notes: string | null;
  isEnabled: boolean;
};

export type PlantPayload = {
  nickname: string;
  taxonId: number;
  location: string;
  lastWateredOn: string | null;
  waterEveryDays: number;
};

export type PlantTaxonPayload = {
  name: string;
  genus: string;
  species: string;
  cultivar: string | null;
  variety: string | null;
  authority: string | null;
};

export type CareActionPayload = {
  name: string;
  description: string | null;
  isEnabled: boolean;
};

export type ActionResourcePayload = {
  name: string;
  category: string | null;
  notes: string | null;
  isEnabled: boolean;
};

export type CareLogPayload = {
  plantId: number;
  action: string;
  notes: string | null;
  performedOn: string | null;
};

export type ActionLog = {
  id: number;
  plantId: number;
  plantName: string;
  action: string;
  notes: string | null;
  performedOn: string;
};

export type CareTask = {
  id: number;
  plantId: number;
  plantName: string;
  action: 'Water' | 'Fertilize' | 'Prune' | 'Inspect';
  due: string;
  status: CareStatus;
};
