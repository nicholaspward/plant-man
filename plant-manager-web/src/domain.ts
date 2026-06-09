export type CareStatus = 'due' | 'soon' | 'ok' | 'unscheduled';

export type Plant = {
  id: number;
  nickname: string;
  birthday: string | null;
  taxonId: number | null;
  taxon: string;
  locationId: number | null;
  location: string;
  nextCare: string;
  status: CareStatus;
  flags: PlantFlag[];
  groups: PlantGroupSummary[];
  actionLogs: ActionLog[];
  careSchedules: PlantCareSchedule[];
};

export type PlantCareSchedule = {
  id: number;
  careActivityId: number;
  careActionId: number;
  action: string;
  everyDays: number;
  scheduledFor: string | null;
  recurrenceMode: ScheduleRecurrenceMode;
  repeatEvery: number;
  repeatUnit: ScheduleRepeatUnit;
  repeatOnDays: string | null;
  endsMode: ScheduleEndsMode;
  endsOn: string | null;
  endsAfterOccurrences: number | null;
  lastPerformedOn: string | null;
  lastPerformed: string;
  nextCare: string;
  status: CareStatus;
};

export type ScheduleRecurrenceMode = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
export type ScheduleRepeatUnit = 'day' | 'week' | 'month' | 'year';
export type ScheduleEndsMode = 'on' | 'after';
export type RecipeMeasurementMode = 'quantity' | 'total_percent' | 'bakers_percent';

export type PlantTaxon = {
  id: number;
  name: string;
  genus: string;
  species: string;
  cultivar: string | null;
  variety: string | null;
  authority: string | null;
  family: string | null;
  commonName: string | null;
  externalSource: string | null;
  externalId: string | null;
};

export type PlantInfoSearchResult = {
  source: string;
  externalId: string;
  scientificName: string;
  canonicalName: string | null;
  commonName: string | null;
  rank: string | null;
  status: string | null;
  family: string | null;
  genus: string | null;
  species: string | null;
  commonNames: string[];
};

export type PlantLocation = {
  id: number;
  name: string;
  notes: string | null;
};

export type PlantGroupSummary = {
  id: number;
  name: string;
};

export type PlantGroupMember = {
  id: number;
  nickname: string;
};

export type PlantGroup = {
  id: number;
  name: string;
  plants: PlantGroupMember[];
  notes: string | null;
};

export type CareAction = {
  id: number;
  name: string;
  description: string | null;
};

export type ActionResource = {
  id: number;
  name: string;
  notes: string | null;
  producedByRecipe: RecipeSummary | null;
};

export type ActionResourceSummary = {
  id: number;
  name: string;
};

export type RecipeSummary = {
  id: number;
  name: string;
  type: string;
  measurementMode: RecipeMeasurementMode;
};

export type Recipe = {
  id: number;
  name: string;
  type: string;
  measurementMode: RecipeMeasurementMode;
  outputResource: ActionResourceSummary | null;
  components: RecipeComponent[];
  notes: string | null;
};

export type RecipeComponent = {
  actionResourceId: number;
  name: string;
  quantity: number | null;
  unit: string | null;
  notes: string | null;
  sortOrder: number;
};

export type CareActivity = {
  id: number;
  name: string;
  careActionId: number;
  action: string;
  actions: CareActivityAction[];
  notes: string | null;
};

export type CareActivityAction = {
  careActionId: number;
  name: string;
  description: string | null;
  sortOrder: number;
  resources: CareActivityActionResource[];
};

export type CareActivityActionResource = {
  actionResourceId: number;
  name: string;
  quantity: number | null;
  unit: string | null;
  notes: string | null;
};

export type PlantFlagDefinition = {
  id: number;
  name: string;
  color: string;
};

export type PlantFlag = {
  id: number;
  plantFlagDefinitionId: number;
  name: string;
  color: string;
  startedOn: string;
  resolvedOn: string | null;
  notes: string | null;
};

export type ActionLog = {
  id: number;
  plantId: number;
  plantName: string;
  careActivityId: number;
  careActionId: number;
  action: string;
  notes: string | null;
  performedOn: string;
  resources: ActionLogResource[];
};

export type ActionLogResource = {
  actionResourceId: number;
  name: string;
  quantity: number | null;
  unit: string | null;
};

export type PlantPayload = {
  nickname: string;
  birthday: string | null;
  taxonId: number | null;
  locationId: number | null;
  careSchedules: PlantCareSchedulePayload[] | null;
};

export type PlantCareSchedulePayload = {
  careActivityId: number;
  everyDays: number;
  scheduledFor: string | null;
  recurrenceMode: ScheduleRecurrenceMode;
  repeatEvery: number;
  repeatUnit: ScheduleRepeatUnit;
  repeatOnDays: string | null;
  endsMode: ScheduleEndsMode;
  endsOn: string | null;
  endsAfterOccurrences: number | null;
};

export type BulkPlantCareSchedulePayload = {
  plantIds: number[];
  careActivityId: number;
  everyDays: number;
  scheduledFor: string | null;
  recurrenceMode: ScheduleRecurrenceMode;
  repeatEvery: number;
  repeatUnit: ScheduleRepeatUnit;
  repeatOnDays: string | null;
  endsMode: ScheduleEndsMode;
  endsOn: string | null;
  endsAfterOccurrences: number | null;
};

export type PlantTaxonPayload = {
  name: string;
  genus: string;
  species: string;
  cultivar: string | null;
  variety: string | null;
  authority: string | null;
  family: string | null;
  commonName: string | null;
  externalSource: string | null;
  externalId: string | null;
};

export type PlantLocationPayload = {
  name: string;
  notes: string | null;
};

export type PlantGroupPayload = {
  name: string;
  plantIds: number[];
  notes: string | null;
};

export type CareActionPayload = {
  name: string;
  description: string | null;
};

export type ActionResourcePayload = {
  name: string;
  notes: string | null;
};

export type CareActivityPayload = {
  name: string;
  actions: CareActivityActionPayload[];
  notes: string | null;
};

export type CareActivityActionPayload = {
  careActionId: number;
  resources: CareActivityActionResourcePayload[];
};

export type CareActivityActionResourcePayload = {
  actionResourceId: number;
  quantity: number | null;
  unit: string | null;
  notes: string | null;
};

export type RecipePayload = {
  name: string;
  type: string;
  measurementMode: RecipeMeasurementMode;
  outputResourceName: string | null;
  components: RecipeComponentPayload[];
  notes: string | null;
};

export type RecipeComponentPayload = {
  actionResourceId: number;
  quantity: number | null;
  unit: string | null;
  notes: string | null;
};

export type PlantFlagDefinitionPayload = {
  name: string;
  color: string | null;
};

export type AssignPlantFlagPayload = {
  plantFlagDefinitionId: number;
  startedOn: string | null;
  notes: string | null;
};

export type BulkCompleteCareTasksPayload = {
  careActivityId: number;
  plantIds: number[];
  notes: string | null;
  performedOn: string | null;
  resources: CareLogResourcePayload[];
};

export type CareLogResourcePayload = {
  actionResourceId: number;
  quantity: number | null;
  unit: string | null;
};

export type CareTask = {
  id: number;
  plantId: number;
  plantName: string;
  careActivityId: number;
  careActionId: number;
  action: string;
  dueDate: string | null;
  due: string;
  status: CareStatus;
};
