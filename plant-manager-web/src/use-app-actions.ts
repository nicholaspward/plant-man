import { useEffect, useRef, useState } from 'react';
import {
  applyCatalogImport,
  assignPlantFlag,
  completeCareTasksBulk,
  createActionResource,
  createCareAction,
  createCareActivity,
  createActionLogsBulk,
  createPlantCareSchedule,
  createPlant,
  createPlantFlag,
  createPlantGroup,
  createPlantLocation,
  createRecipe,
  deleteActionResource,
  deleteCareAction,
  deleteCareActivity,
  deletePlant,
  deletePlantCareSchedule,
  deletePlantFlag,
  deletePlantGroup,
  deletePlantLocation,
  deletePlantTaxon,
  deleteRecipe,
  dismissCareTasksBulk,
  downloadSpreadsheetExport,
  importPlantTaxon,
  previewCatalogImport,
  removePlantFlagAssignment,
  resolvePlantFlag,
  searchPlantInfo,
  updateActionResource,
  updateCareAction,
  updateCareActivity,
  updatePlant,
  updatePlantCareSchedule,
  updatePlantFlag,
  updatePlantGroup,
  updatePlantLocation,
  updateRecipe,
} from './api';
import type { BulkCompleteCareTasksPayload, CareTask, CatalogImportResult, DismissCareTasksPayload, Plant, PlantCareScheduleRule, PlantFlag, PlantInfoSearchResult, PlantTaxon } from './domain';
import {
  emptyPlantFlagForm,
  toActionPayload,
  toActivityPayload,
  toBulkSchedulePayload,
  toFlagDefinitionPayload,
  toLocationPayload,
  toPlantGroupPayload,
  toPlantFlagPayload,
  toPlantPayload,
  toRecipePayload,
  toResourcePayload,
} from './form-state';
import type { useAppEditors } from './use-app-editors';
import type { useDashboardData } from './use-dashboard-data';

const plantInfoSearchDebounceMs = 150;
const plantInfoSearchMinLength = 2;

type Editors = ReturnType<typeof useAppEditors>;
type DashboardData = ReturnType<typeof useDashboardData>;

type AppActionOptions = {
  editors: Editors;
  loadDashboard: DashboardData['loadDashboard'];
  loadCareModel: DashboardData['loadCareModel'];
  loadFlagsAndPlants: DashboardData['loadFlagsAndPlants'];
  loadGroupsAndPlants: DashboardData['loadGroupsAndPlants'];
  loadLocations: DashboardData['loadLocations'];
  loadPlants: DashboardData['loadPlants'];
  loadPlantsAndCareTasks: DashboardData['loadPlantsAndCareTasks'];
  loadRecipesAndResources: DashboardData['loadRecipesAndResources'];
  loadTaxaAndPlants: DashboardData['loadTaxaAndPlants'];
  setError: DashboardData['setError'];
};

export function useAppActions({
  editors,
  loadDashboard,
  loadCareModel,
  loadFlagsAndPlants,
  loadGroupsAndPlants,
  loadLocations,
  loadPlants,
  loadPlantsAndCareTasks,
  loadRecipesAndResources,
  loadTaxaAndPlants,
  setError,
}: AppActionOptions) {
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImportingCatalog, setIsImportingCatalog] = useState(false);
  const [catalogImportResult, setCatalogImportResult] = useState<CatalogImportResult | null>(null);
  const [isSearchingPlantInfo, setIsSearchingPlantInfo] = useState(false);
  const [plantInfoQuery, setPlantInfoQuery] = useState('');
  const [plantInfoResults, setPlantInfoResults] = useState<PlantInfoSearchResult[]>([]);
  const [hasSearchedPlantInfo, setHasSearchedPlantInfo] = useState(false);
  const latestPlantInfoSearchId = useRef(0);
  const lastCompletedPlantInfoQuery = useRef('');

  useEffect(() => {
    const query = plantInfoQuery.trim();
    if (query.length === 0) {
      latestPlantInfoSearchId.current += 1;
      lastCompletedPlantInfoQuery.current = '';
      setPlantInfoResults([]);
      setHasSearchedPlantInfo(false);
      setIsSearchingPlantInfo(false);
      return;
    }

    if (query.length < plantInfoSearchMinLength) {
      latestPlantInfoSearchId.current += 1;
      lastCompletedPlantInfoQuery.current = '';
      setPlantInfoResults([]);
      setHasSearchedPlantInfo(false);
      setIsSearchingPlantInfo(false);
      return;
    }

    if (query !== lastCompletedPlantInfoQuery.current) {
      setIsSearchingPlantInfo(true);
    }

    const timeout = window.setTimeout(() => {
      void searchTaxonInfo(query, { updateQuery: false });
    }, plantInfoSearchDebounceMs);

    return () => window.clearTimeout(timeout);
  }, [plantInfoQuery]);

  async function savePlant() {
    if (!editors.form.nickname.trim()) {
      setError('Plant name is required.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = toPlantPayload(editors.form);
      if (editors.editingPlantId === null) {
        await createPlant(payload);
      } else {
        await updatePlant(editors.editingPlantId, payload);
      }
      editors.cancelEditing();
      await loadPlantsAndCareTasks();
    } catch {
      setError('Could not save the plant.');
    } finally {
      setIsSaving(false);
    }
  }

  async function removePlant(plant: Plant) {
    const confirmed = window.confirm(`Delete ${plant.nickname}? This also removes its care log.`);
    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    try {
      await deletePlant(plant.id);
      if (editors.selectedPlantId === plant.id) {
        editors.setSelectedPlantId(null);
      }
      if (editors.editingPlantId === plant.id) {
        editors.cancelEditing();
      }
      await loadPlantsAndCareTasks();
    } catch {
      setError('Could not delete the plant.');
    } finally {
      setIsSaving(false);
    }
  }

  async function exportSpreadsheet() {
    setIsExporting(true);
    try {
      setError(null);
      await downloadSpreadsheetExport();
    } catch {
      setError('Could not export the spreadsheet.');
    } finally {
      setIsExporting(false);
    }
  }

  async function previewCatalogImportFile(file: File) {
    setIsImportingCatalog(true);
    try {
      setError(null);
      const result = await previewCatalogImport(file);
      setCatalogImportResult(result);
    } catch {
      setError('Could not preview the catalog import.');
    } finally {
      setIsImportingCatalog(false);
    }
  }

  async function applyCatalogImportFile(file: File) {
    setIsImportingCatalog(true);
    try {
      setError(null);
      const result = await applyCatalogImport(file);
      setCatalogImportResult(result);
      if (result.applied) {
        await loadDashboard();
      } else {
        setError('Fix the spreadsheet issues before applying the import.');
      }
    } catch {
      setError('Could not apply the catalog import.');
    } finally {
      setIsImportingCatalog(false);
    }
  }

  async function searchTaxonInfo(
    queryOverride?: string,
    options: { updateQuery?: boolean } = {},
  ) {
    const query = queryOverride ?? plantInfoQuery;
    if (options.updateQuery ?? true) {
      setPlantInfoQuery(query);
    }

    const trimmedQuery = query.trim();
    if (trimmedQuery.length < plantInfoSearchMinLength) {
      setError('Search needs at least 2 characters.');
      return;
    }

    if (trimmedQuery === lastCompletedPlantInfoQuery.current) {
      return;
    }

    const searchId = latestPlantInfoSearchId.current + 1;
    latestPlantInfoSearchId.current = searchId;
    setIsSearchingPlantInfo(true);
    try {
      setError(null);
      setHasSearchedPlantInfo(true);
      const results = await searchPlantInfo(trimmedQuery);
      if (latestPlantInfoSearchId.current === searchId) {
        lastCompletedPlantInfoQuery.current = trimmedQuery;
        setPlantInfoResults(results);
      }
    } catch {
      if (latestPlantInfoSearchId.current === searchId) {
        setError('Could not search offline plant info.');
      }
    } finally {
      if (latestPlantInfoSearchId.current === searchId) {
        setIsSearchingPlantInfo(false);
      }
    }
  }

  async function importTaxonFromPlantInfo(result: PlantInfoSearchResult) {
    setIsSaving(true);
    try {
      await importPlantTaxon(result);
      setPlantInfoResults([]);
      setPlantInfoQuery('');
      setHasSearchedPlantInfo(false);
      await loadTaxaAndPlants();
    } catch {
      setError('Could not import the GBIF taxon.');
    } finally {
      setIsSaving(false);
    }
  }

  async function removeTaxon(taxon: PlantTaxon) {
    const confirmed = window.confirm(`Delete ${taxon.name}? Taxa used by plants cannot be deleted.`);
    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    try {
      await deletePlantTaxon(taxon.id);
      await loadTaxaAndPlants();
    } catch {
      setError('Could not delete the taxon. It may still be used by a plant.');
    } finally {
      setIsSaving(false);
    }
  }

  async function saveLocation() {
    if (!editors.locationForm.name.trim()) {
      setError('Location name is required.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = toLocationPayload(editors.locationForm);
      if (editors.editingLocationId === null) {
        await createPlantLocation(payload);
      } else {
        await updatePlantLocation(editors.editingLocationId, payload);
      }
      editors.cancelEditingLocation();
      await loadLocations();
    } catch {
      setError('Could not save the location.');
    } finally {
      setIsSaving(false);
    }
  }

  async function removeLocation(location: Parameters<typeof editors.startEditingLocation>[0]) {
    const confirmed = window.confirm(`Delete ${location.name}? Locations assigned to plants cannot be deleted.`);
    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    try {
      await deletePlantLocation(location.id);
      if (editors.editingLocationId === location.id) {
        editors.cancelEditingLocation();
      }
      await loadLocations();
    } catch {
      await loadLocations();
      setError('Could not delete the location. It may still be assigned to a plant.');
    } finally {
      setIsSaving(false);
    }
  }

  async function savePlantGroup() {
    if (!editors.plantGroupForm.name.trim()) {
      setError('Group name is required.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = toPlantGroupPayload(editors.plantGroupForm);
      if (editors.editingPlantGroupId === null) {
        await createPlantGroup(payload);
      } else {
        await updatePlantGroup(editors.editingPlantGroupId, payload);
      }
      editors.cancelEditingPlantGroup();
      await loadGroupsAndPlants();
    } catch {
      setError('Could not save the plant group.');
    } finally {
      setIsSaving(false);
    }
  }

  async function removePlantGroup(group: Parameters<typeof editors.startEditingPlantGroup>[0]) {
    const confirmed = window.confirm(`Delete ${group.name}?`);
    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    try {
      await deletePlantGroup(group.id);
      if (editors.editingPlantGroupId === group.id) {
        editors.cancelEditingPlantGroup();
      }
      await loadGroupsAndPlants();
    } catch {
      setError('Could not delete the plant group.');
    } finally {
      setIsSaving(false);
    }
  }

  async function saveAction() {
    if (!editors.actionForm.name.trim()) {
      setError('Action name is required.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = toActionPayload(editors.actionForm);
      if (editors.editingActionId === null) {
        await createCareAction(payload);
      } else {
        await updateCareAction(editors.editingActionId, payload);
      }
      editors.cancelEditingAction();
      await loadCareModel();
    } catch {
      setError('Could not save the action.');
    } finally {
      setIsSaving(false);
    }
  }

  async function removeAction(action: Parameters<typeof editors.startEditingAction>[0]) {
    const confirmed = window.confirm(`Delete ${action.name}? Actions with care history cannot be deleted.`);
    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    try {
      await deleteCareAction(action.id);
      if (editors.editingActionId === action.id) {
        editors.cancelEditingAction();
      }
      await loadCareModel();
    } catch {
      await loadCareModel();
      setError('Could not delete the action. It may still have care history.');
    } finally {
      setIsSaving(false);
    }
  }

  async function saveResource() {
    if (!editors.resourceForm.name.trim()) {
      setError('Resource name is required.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = toResourcePayload(editors.resourceForm);
      if (editors.editingResourceId === null) {
        await createActionResource(payload);
      } else {
        await updateActionResource(editors.editingResourceId, payload);
      }
      editors.cancelEditingResource();
      await loadCareModel();
      await loadRecipesAndResources();
    } catch {
      setError('Could not save the resource.');
    } finally {
      setIsSaving(false);
    }
  }

  async function removeResource(resource: Parameters<typeof editors.startEditingResource>[0]) {
    const confirmed = window.confirm(`Delete ${resource.name}?`);
    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    try {
      await deleteActionResource(resource.id);
      if (editors.editingResourceId === resource.id) {
        editors.cancelEditingResource();
      }
      await loadCareModel();
      await loadRecipesAndResources();
    } catch {
      setError('Could not delete the resource.');
    } finally {
      setIsSaving(false);
    }
  }

  async function saveRecipe() {
    if (!editors.recipeForm.name.trim() || !editors.recipeForm.outputResourceName.trim() || editors.recipeForm.components.length === 0) {
      setError('Recipe name, produced resource, and at least one component are required.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = toRecipePayload(editors.recipeForm);
      if (editors.editingRecipeId === null) {
        await createRecipe(payload);
      } else {
        await updateRecipe(editors.editingRecipeId, payload);
      }
      editors.cancelEditingRecipe();
      await loadRecipesAndResources();
    } catch {
      setError('Could not save the recipe.');
    } finally {
      setIsSaving(false);
    }
  }

  async function removeRecipe(recipe: Parameters<typeof editors.startEditingRecipe>[0]) {
    const confirmed = window.confirm(`Delete ${recipe.name}?`);
    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    try {
      await deleteRecipe(recipe.id);
      if (editors.selectedRecipeId === recipe.id) {
        editors.setSelectedRecipeId(null);
      }
      if (editors.editingRecipeId === recipe.id) {
        editors.cancelEditingRecipe();
      }
      await loadRecipesAndResources();
    } catch {
      setError('Could not delete the recipe.');
    } finally {
      setIsSaving(false);
    }
  }

  async function saveActivity() {
    if (!editors.activityForm.name.trim() || editors.activityForm.actions.length === 0) {
      setError('Activity name and at least one action are required.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = toActivityPayload(editors.activityForm);
      if (editors.editingActivityId === null) {
        await createCareActivity(payload);
      } else {
        await updateCareActivity(editors.editingActivityId, payload);
      }
      editors.cancelEditingActivity();
      await loadCareModel();
    } catch {
      setError('Could not save the activity.');
    } finally {
      setIsSaving(false);
    }
  }

  async function removeActivity(activity: Parameters<typeof editors.startEditingActivity>[0]) {
    const confirmed = window.confirm(`Delete ${activity.name}? Activities in use cannot be deleted.`);
    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    try {
      await deleteCareActivity(activity.id);
      if (editors.editingActivityId === activity.id) {
        editors.cancelEditingActivity();
      }
      await loadCareModel();
    } catch {
      await loadCareModel();
      setError('Could not delete the activity. It may still be in use.');
    } finally {
      setIsSaving(false);
    }
  }

  async function saveFlagDefinition() {
    if (!editors.flagDefinitionForm.name.trim()) {
      setError('Flag name is required.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = toFlagDefinitionPayload(editors.flagDefinitionForm);
      if (editors.editingFlagDefinitionId === null) {
        await createPlantFlag(payload);
      } else {
        await updatePlantFlag(editors.editingFlagDefinitionId, payload);
      }
      editors.cancelEditingFlagDefinition();
      await loadFlagsAndPlants();
    } catch {
      setError('Could not save the plant flag.');
    } finally {
      setIsSaving(false);
    }
  }

  async function saveBulkSchedule() {
    if (!editors.bulkScheduleForm.careActivityId || editors.bulkScheduleForm.plantIds.length === 0) {
      setError('Select an activity and at least one plant.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = toBulkSchedulePayload(editors.bulkScheduleForm);
      if (editors.editingScheduleId === null) {
        await createPlantCareSchedule(payload);
      } else {
        await updatePlantCareSchedule(editors.editingScheduleId, payload);
      }
      editors.cancelEditingSchedule();
      await loadPlantsAndCareTasks();
    } catch {
      setError('Could not save the care schedule.');
    } finally {
      setIsSaving(false);
    }
  }

  async function removeSchedule(schedule: PlantCareScheduleRule) {
    const confirmed = window.confirm(`Delete ${schedule.action} schedule?`);
    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    try {
      await deletePlantCareSchedule(schedule.id);
      if (editors.editingScheduleId === schedule.id) {
        editors.cancelEditingSchedule();
      }
      await loadPlantsAndCareTasks();
    } catch {
      setError('Could not delete the care schedule.');
    } finally {
      setIsSaving(false);
    }
  }

  async function removeFlagDefinition(flag: Parameters<typeof editors.startEditingFlagDefinition>[0]) {
    const confirmed = window.confirm(`Delete ${flag.name}? Flags assigned to plants cannot be deleted.`);
    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    try {
      await deletePlantFlag(flag.id);
      if (editors.editingFlagDefinitionId === flag.id) {
        editors.cancelEditingFlagDefinition();
      }
      await loadFlagsAndPlants();
    } catch {
      await loadFlagsAndPlants();
      setError('Could not delete the flag. It may still be assigned to a plant.');
    } finally {
      setIsSaving(false);
    }
  }

  async function assignFlagToSelectedPlant() {
    if (!editors.selectedPlantId || !editors.plantFlagForm.plantFlagDefinitionId) {
      setError('Select a plant and flag first.');
      return;
    }

    setIsSaving(true);
    try {
      await assignPlantFlag(editors.selectedPlantId, toPlantFlagPayload(editors.plantFlagForm));
      editors.setPlantFlagForm(emptyPlantFlagForm);
      await loadPlants();
    } catch {
      setError('Could not attach the plant flag.');
    } finally {
      setIsSaving(false);
    }
  }

  async function resolveAssignedPlantFlag(flag: PlantFlag) {
    if (!editors.selectedPlantId) {
      return;
    }

    setIsSaving(true);
    try {
      await resolvePlantFlag(editors.selectedPlantId, flag.id);
      await loadPlants();
    } catch {
      setError('Could not resolve the plant flag.');
    } finally {
      setIsSaving(false);
    }
  }

  async function removeAssignedPlantFlag(flag: PlantFlag) {
    if (!editors.selectedPlantId) {
      return;
    }

    const confirmed = window.confirm(`Remove ${flag.name} from this plant?`);
    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    try {
      await removePlantFlagAssignment(editors.selectedPlantId, flag.id);
      await loadPlants();
    } catch {
      setError('Could not remove the plant flag.');
    } finally {
      setIsSaving(false);
    }
  }

  async function completeTask(task: CareTask) {
    setIsSaving(true);
    try {
      await completeCareTasksBulk({
        careActivityId: task.careActivityId,
        plantIds: [task.plantId],
        performedOn: getTodayInputDate(),
        notes: '',
        resources: [],
      });
      await loadPlantsAndCareTasks();
    } catch {
      setError('Could not log the care task.');
    } finally {
      setIsSaving(false);
    }
  }

  async function completeBulkTasks(tasks: CareTask[]) {
    const dueTasks = tasks.filter((task) => task.status === 'due');
    if (dueTasks.length === 0) {
      return;
    }

    const action = dueTasks[0].action;
    const confirmed = window.confirm(`Log ${action} for ${dueTasks.length} due plants?`);
    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    try {
      await completeCareTasksBulk({
        careActivityId: dueTasks[0].careActivityId,
        plantIds: dueTasks.map((task) => task.plantId),
        performedOn: getTodayInputDate(),
        notes: '',
        resources: [],
      });
      await loadPlantsAndCareTasks();
    } catch {
      setError('Could not log the due tasks.');
    } finally {
      setIsSaving(false);
    }
  }

  async function logCare(payload: BulkCompleteCareTasksPayload, requireDueSchedule: boolean) {
    if (payload.plantIds.length === 0 || !payload.careActivityId) {
      setError('Select an activity and at least one plant.');
      return;
    }

    setIsSaving(true);
    try {
      if (requireDueSchedule) {
        await completeCareTasksBulk(payload);
      } else {
        await createActionLogsBulk(payload);
      }
      await loadPlantsAndCareTasks();
    } catch {
      setError('Could not log care.');
    } finally {
      setIsSaving(false);
    }
  }

  async function dismissCare(payload: DismissCareTasksPayload) {
    if (payload.plantIds.length === 0 || !payload.careActivityId) {
      setError('Select an activity and at least one plant.');
      return;
    }

    setIsSaving(true);
    try {
      await dismissCareTasksBulk(payload);
      await loadPlantsAndCareTasks();
    } catch {
      setError('Could not dismiss care.');
    } finally {
      setIsSaving(false);
    }
  }

  return {
    assignFlagToSelectedPlant,
    applyCatalogImportFile,
    catalogImportResult,
    completeBulkTasks,
    completeTask,
    exportSpreadsheet,
    dismissCare,
    isImportingCatalog,
    hasSearchedPlantInfo,
    isExporting,
    isSearchingPlantInfo,
    isSaving,
    logCare,
    importTaxonFromPlantInfo,
    plantInfoQuery,
    plantInfoResults,
    removeAction,
    removeActivity,
    removeAssignedPlantFlag,
    removeSchedule,
    removeFlagDefinition,
    removeLocation,
    removePlant,
    removePlantGroup,
    removeRecipe,
    removeResource,
    removeTaxon,
    resolveAssignedPlantFlag,
    saveAction,
    saveActivity,
    saveBulkSchedule,
    saveFlagDefinition,
    saveLocation,
    savePlant,
    savePlantGroup,
    saveRecipe,
    saveResource,
    searchTaxonInfo,
    previewCatalogImportFile,
    setPlantInfoQuery,
  };
}

function getTodayInputDate() {
  return new Date().toISOString().slice(0, 10);
}
