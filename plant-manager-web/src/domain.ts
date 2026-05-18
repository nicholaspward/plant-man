export type CareStatus = 'due' | 'soon' | 'ok' | 'unscheduled';

export type Plant = {
  id: number;
  nickname: string;
  taxonId: number;
  taxon: string;
  location: string;
  nextCare: string;
  status: CareStatus;
  flags: PlantFlag[];
  careSchedules: PlantCareSchedule[];
};

export type PlantCareSchedule = {
  id: number;
  careActionId: number;
  action: string;
  everyDays: number;
  lastPerformedOn: string | null;
  lastPerformed: string;
  nextCare: string;
  status: CareStatus;
  isEnabled: boolean;
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

export type PlantFlagDefinition = {
  id: number;
  name: string;
  category: string;
  color: string;
  isEnabled: boolean;
};

export type PlantFlag = {
  id: number;
  plantFlagDefinitionId: number;
  name: string;
  category: string;
  color: string;
  severity: 'low' | 'medium' | 'high';
  startedOn: string;
  resolvedOn: string | null;
  notes: string | null;
};

export type ActionLogResource = {
  actionResourceId: number;
  name: string;
  category: string | null;
  quantity: number | null;
  unit: string | null;
};

export type PlantPayload = {
  nickname: string;
  taxonId: number;
  location: string;
  careSchedules: PlantCareSchedulePayload[];
};

export type PlantCareSchedulePayload = {
  careActionId: number;
  everyDays: number;
  isEnabled: boolean;
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

export type PlantFlagDefinitionPayload = {
  name: string;
  category: string | null;
  color: string | null;
  isEnabled: boolean;
};

export type AssignPlantFlagPayload = {
  plantFlagDefinitionId: number;
  severity: string | null;
  startedOn: string | null;
  notes: string | null;
};

export type CareLogPayload = {
  plantId: number;
  careActionId: number;
  notes: string | null;
  performedOn: string | null;
  resources: CareLogResourcePayload[];
};

export type CareLogResourcePayload = {
  actionResourceId: number;
  quantity: number | null;
  unit: string | null;
};

export type ActionLog = {
  id: number;
  plantId: number;
  plantName: string;
  careActionId: number;
  action: string;
  notes: string | null;
  performedOn: string;
  resources: ActionLogResource[];
};

export type CareTask = {
  id: number;
  plantId: number;
  plantName: string;
  careActionId: number;
  action: string;
  due: string;
  status: CareStatus;
};
