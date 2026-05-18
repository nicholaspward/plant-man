import type {
  ActionResource,
  ActionResourcePayload,
  ActionLog,
  CareAction,
  CareActionPayload,
  CareLogPayload,
  CareTask,
  Plant,
  AssignPlantFlagPayload,
  PlantPayload,
  PlantFlag,
  PlantFlagDefinition,
  PlantFlagDefinitionPayload,
  PlantTaxon,
  PlantTaxonPayload,
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

export async function getPlants() {
  return request<Plant[]>('/api/plants');
}

export async function getPlantTaxa() {
  return request<PlantTaxon[]>('/api/plant-taxa');
}

export async function createPlantTaxon(payload: PlantTaxonPayload) {
  return request<PlantTaxon>('/api/plant-taxa', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updatePlantTaxon(id: number, payload: PlantTaxonPayload) {
  return request<PlantTaxon>(`/api/plant-taxa/${id}`, {
    method: 'PUT',
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

export async function getActionLogs() {
  return request<ActionLog[]>('/api/action-logs');
}

export async function logCare(payload: CareLogPayload) {
  return request('/api/action-logs', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateActionLog(id: number, payload: CareLogPayload) {
  return request<ActionLog>(`/api/action-logs/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      ...payload,
      performedOn: payload.performedOn ?? new Date().toISOString().slice(0, 10),
    }),
  });
}

export async function deleteActionLog(id: number) {
  return request<void>(`/api/action-logs/${id}`, {
    method: 'DELETE',
  });
}
