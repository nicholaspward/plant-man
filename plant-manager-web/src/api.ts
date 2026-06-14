import type {
  ActionResource,
  ActionResourcePayload,
  CareActivity,
  CareActivityPayload,
  CareAction,
  CareActionPayload,
  CatalogImportResult,
  BulkCompleteCareTasksPayload,
  CareTask,
  BulkPlantCareSchedulePayload,
  DismissCareTasksPayload,
  Recipe,
  RecipePayload,
  Plant,
  PlantCareScheduleRule,
  PlantInfoSearchResult,
  AssignPlantFlagPayload,
  PlantPayload,
  PlantFlag,
  PlantFlagDefinition,
  PlantFlagDefinitionPayload,
  PlantGroup,
  PlantGroupPayload,
  PlantLocation,
  PlantLocationPayload,
  PlantTaxon,
} from './domain';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function downloadSpreadsheetExport() {
  const response = await fetch(`${apiBaseUrl}/api/export/spreadsheet`);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  const blob = await response.blob();
  const disposition = response.headers.get('Content-Disposition') ?? '';
  const encodedFileNameMatch = /filename\*=UTF-8''([^;]+)/i.exec(disposition);
  const fileNameMatch = /filename="?([^";]+)"?/i.exec(disposition);
  const fileName = encodedFileNameMatch
    ? decodeURIComponent(encodedFileNameMatch[1])
    : fileNameMatch?.[1] ?? 'plant-man-export.xlsx';
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function uploadCatalogImport(path: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<CatalogImportResult>;
}

export async function previewCatalogImport(file: File) {
  return uploadCatalogImport('/api/import/catalog/preview', file);
}

export async function applyCatalogImport(file: File) {
  return uploadCatalogImport('/api/import/catalog/apply', file);
}

export async function getPlants() {
  return request<Plant[]>('/api/plants');
}

export async function getPlantTaxa() {
  return request<PlantTaxon[]>('/api/plant-taxa');
}

export async function searchPlantInfo(query: string) {
  return request<PlantInfoSearchResult[]>(`/api/plant-info/search?q=${encodeURIComponent(query)}`);
}

export async function getPlantLocations() {
  return request<PlantLocation[]>('/api/plant-locations');
}

export async function createPlantLocation(payload: PlantLocationPayload) {
  return request<PlantLocation>('/api/plant-locations', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updatePlantLocation(id: number, payload: PlantLocationPayload) {
  return request<PlantLocation>(`/api/plant-locations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deletePlantLocation(id: number) {
  return request<void>(`/api/plant-locations/${id}`, {
    method: 'DELETE',
  });
}

export async function getPlantGroups() {
  return request<PlantGroup[]>('/api/plant-groups');
}

export async function createPlantGroup(payload: PlantGroupPayload) {
  return request<PlantGroup>('/api/plant-groups', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updatePlantGroup(id: number, payload: PlantGroupPayload) {
  return request<PlantGroup>(`/api/plant-groups/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deletePlantGroup(id: number) {
  return request<void>(`/api/plant-groups/${id}`, {
    method: 'DELETE',
  });
}

export async function importPlantTaxon(payload: PlantInfoSearchResult) {
  return request<PlantTaxon>('/api/plant-taxa/import', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deletePlantTaxon(id: number) {
  return request<void>(`/api/plant-taxa/${id}`, {
    method: 'DELETE',
  });
}

export async function getCareActions() {
  return request<CareAction[]>('/api/care-actions');
}

export async function createCareAction(payload: CareActionPayload) {
  return request<CareAction>('/api/care-actions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateCareAction(id: number, payload: CareActionPayload) {
  return request<CareAction>(`/api/care-actions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteCareAction(id: number) {
  return request<void>(`/api/care-actions/${id}`, {
    method: 'DELETE',
  });
}

export async function getActionResources() {
  return request<ActionResource[]>('/api/action-resources');
}

export async function createActionResource(payload: ActionResourcePayload) {
  return request<ActionResource>('/api/action-resources', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateActionResource(id: number, payload: ActionResourcePayload) {
  return request<ActionResource>(`/api/action-resources/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteActionResource(id: number) {
  return request<void>(`/api/action-resources/${id}`, {
    method: 'DELETE',
  });
}

export async function getRecipes() {
  return request<Recipe[]>('/api/recipes');
}

export async function createRecipe(payload: RecipePayload) {
  return request<Recipe>('/api/recipes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateRecipe(id: number, payload: RecipePayload) {
  return request<Recipe>(`/api/recipes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteRecipe(id: number) {
  return request<void>(`/api/recipes/${id}`, {
    method: 'DELETE',
  });
}

export async function getCareActivities() {
  return request<CareActivity[]>('/api/care-activities');
}

export async function createCareActivity(payload: CareActivityPayload) {
  return request<CareActivity>('/api/care-activities', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateCareActivity(id: number, payload: CareActivityPayload) {
  return request<CareActivity>(`/api/care-activities/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteCareActivity(id: number) {
  return request<void>(`/api/care-activities/${id}`, {
    method: 'DELETE',
  });
}

export async function createPlant(payload: PlantPayload) {
  return request<Plant>('/api/plants', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updatePlant(id: number, payload: PlantPayload) {
  return request<Plant>(`/api/plants/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deletePlant(id: number) {
  return request<void>(`/api/plants/${id}`, {
    method: 'DELETE',
  });
}

export async function getPlantFlags() {
  return request<PlantFlagDefinition[]>('/api/plant-flags');
}

export async function createPlantFlag(payload: PlantFlagDefinitionPayload) {
  return request<PlantFlagDefinition>('/api/plant-flags', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updatePlantFlag(id: number, payload: PlantFlagDefinitionPayload) {
  return request<PlantFlagDefinition>(`/api/plant-flags/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deletePlantFlag(id: number) {
  return request<void>(`/api/plant-flags/${id}`, {
    method: 'DELETE',
  });
}

export async function assignPlantFlag(plantId: number, payload: AssignPlantFlagPayload) {
  return request<PlantFlag>(`/api/plants/${plantId}/flags`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function resolvePlantFlag(plantId: number, flagId: number) {
  return request<PlantFlag>(`/api/plants/${plantId}/flags/${flagId}/resolve`, {
    method: 'POST',
  });
}

export async function removePlantFlagAssignment(plantId: number, flagId: number) {
  return request<void>(`/api/plants/${plantId}/flags/${flagId}`, {
    method: 'DELETE',
  });
}

export async function getCareTasks() {
  return request<CareTask[]>('/api/care-tasks/upcoming');
}

export async function getPlantCareSchedules() {
  return request<PlantCareScheduleRule[]>('/api/plant-care-schedules');
}

export async function createPlantCareSchedule(payload: BulkPlantCareSchedulePayload) {
  return request<PlantCareScheduleRule>('/api/plant-care-schedules', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updatePlantCareSchedule(id: number, payload: BulkPlantCareSchedulePayload) {
  return request<PlantCareScheduleRule>(`/api/plant-care-schedules/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deletePlantCareSchedule(id: number) {
  return request<void>(`/api/plant-care-schedules/${id}`, {
    method: 'DELETE',
  });
}

export async function completeCareTasksBulk(payload: BulkCompleteCareTasksPayload) {
  return request<{ completed: number }>('/api/care-tasks/complete-bulk', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function dismissCareTasksBulk(payload: DismissCareTasksPayload) {
  return request<{ dismissed: number }>('/api/care-tasks/dismiss-bulk', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function createActionLogsBulk(payload: BulkCompleteCareTasksPayload) {
  return request<{ completed: number }>('/api/action-logs/bulk', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
