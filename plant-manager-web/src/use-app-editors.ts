import { useState } from 'react';
import type {
  ActionResource,
  CareActivity,
  CareAction,
  Plant,
  PlantCareScheduleRule,
  PlantFlagDefinition,
  PlantGroup,
  PlantLocation,
  PlantTaxon,
  Recipe,
} from './domain';
import {
  emptyActionForm,
  emptyActivityForm,
  emptyBulkScheduleForm,
  emptyFlagDefinitionForm,
  emptyLocationForm,
  emptyPlantForm,
  emptyPlantGroupForm,
  emptyPlantFlagForm,
  emptyRecipeForm,
  emptyResourceForm,
  toActionForm,
  toActivityForm,
  toBulkScheduleForm,
  toFlagDefinitionForm,
  toLocationForm,
  toPlantForm,
  toPlantGroupForm,
  toRecipeForm,
  toResourceForm,
  type ActionFormState,
  type ActivityFormState,
  type BulkScheduleFormState,
  type FlagDefinitionFormState,
  type LocationFormState,
  type PlantFormState,
  type PlantGroupFormState,
  type PlantFlagFormState,
  type RecipeFormState,
  type ResourceFormState,
  type View,
} from './form-state';

type AppEditorData = {
  actionResources: ActionResource[];
  careActions: CareAction[];
  careActivities: CareActivity[];
  plantFlagDefinitions: PlantFlagDefinition[];
  plantGroups: PlantGroup[];
  plantLocations: PlantLocation[];
  plantTaxa: PlantTaxon[];
  plants: Plant[];
  recipes: Recipe[];
};

export function useAppEditors(data: AppEditorData, setView: (view: View) => void) {
  const [editingPlantId, setEditingPlantId] = useState<number | null>(null);
  const [editingLocationId, setEditingLocationId] = useState<number | null>(null);
  const [editingPlantGroupId, setEditingPlantGroupId] = useState<number | null>(null);
  const [editingActionId, setEditingActionId] = useState<number | null>(null);
  const [editingResourceId, setEditingResourceId] = useState<number | null>(null);
  const [editingRecipeId, setEditingRecipeId] = useState<number | null>(null);
  const [editingActivityId, setEditingActivityId] = useState<number | null>(null);
  const [editingFlagDefinitionId, setEditingFlagDefinitionId] = useState<number | null>(null);
  const [editingScheduleId, setEditingScheduleId] = useState<number | null>(null);
  const [isPlantEditorOpen, setIsPlantEditorOpen] = useState(false);
  const [isLocationEditorOpen, setIsLocationEditorOpen] = useState(false);
  const [isPlantGroupEditorOpen, setIsPlantGroupEditorOpen] = useState(false);
  const [isActionEditorOpen, setIsActionEditorOpen] = useState(false);
  const [isResourceEditorOpen, setIsResourceEditorOpen] = useState(false);
  const [isRecipeEditorOpen, setIsRecipeEditorOpen] = useState(false);
  const [isActivityEditorOpen, setIsActivityEditorOpen] = useState(false);
  const [isFlagDefinitionEditorOpen, setIsFlagDefinitionEditorOpen] = useState(false);
  const [selectedPlantId, setSelectedPlantId] = useState<number | null>(null);
  const [selectedTaxonId, setSelectedTaxonId] = useState<number | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [selectedActionId, setSelectedActionId] = useState<number | null>(null);
  const [selectedResourceId, setSelectedResourceId] = useState<number | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);
  const [selectedFlagDefinitionId, setSelectedFlagDefinitionId] = useState<number | null>(null);
  const [form, setForm] = useState<PlantFormState>(emptyPlantForm);
  const [locationForm, setLocationForm] = useState<LocationFormState>(emptyLocationForm);
  const [plantGroupForm, setPlantGroupForm] = useState<PlantGroupFormState>(emptyPlantGroupForm);
  const [actionForm, setActionForm] = useState<ActionFormState>(emptyActionForm);
  const [resourceForm, setResourceForm] = useState<ResourceFormState>(emptyResourceForm);
  const [recipeForm, setRecipeForm] = useState<RecipeFormState>(emptyRecipeForm);
  const [activityForm, setActivityForm] = useState<ActivityFormState>(emptyActivityForm);
  const [flagDefinitionForm, setFlagDefinitionForm] = useState<FlagDefinitionFormState>(emptyFlagDefinitionForm);
  const [plantFlagForm, setPlantFlagForm] = useState<PlantFlagFormState>(emptyPlantFlagForm);
  const [bulkScheduleForm, setBulkScheduleForm] = useState<BulkScheduleFormState>(emptyBulkScheduleForm);

  const activePlant = data.plants.find((plant) => plant.id === editingPlantId);
  const selectedPlant = data.plants.find((plant) => plant.id === selectedPlantId);
  const selectedTaxon = data.plantTaxa.find((taxon) => taxon.id === selectedTaxonId);
  const activeLocation = data.plantLocations.find((location) => location.id === editingLocationId);
  const selectedLocation = data.plantLocations.find((location) => location.id === selectedLocationId);
  const activePlantGroup = data.plantGroups.find((group) => group.id === editingPlantGroupId);
  const activeAction = data.careActions.find((action) => action.id === editingActionId);
  const selectedAction = data.careActions.find((action) => action.id === selectedActionId);
  const activeResource = data.actionResources.find((resource) => resource.id === editingResourceId);
  const selectedResource = data.actionResources.find((resource) => resource.id === selectedResourceId);
  const activeRecipe = data.recipes.find((recipe) => recipe.id === editingRecipeId);
  const selectedRecipe = data.recipes.find((recipe) => recipe.id === selectedRecipeId);
  const activeActivity = data.careActivities.find((activity) => activity.id === editingActivityId);
  const selectedActivity = data.careActivities.find((activity) => activity.id === selectedActivityId);
  const activeFlagDefinition = data.plantFlagDefinitions.find((flag) => flag.id === editingFlagDefinitionId);
  const selectedFlagDefinition = data.plantFlagDefinitions.find((flag) => flag.id === selectedFlagDefinitionId);

  function updateForm(field: keyof PlantFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateLocationForm(field: keyof LocationFormState, value: string) {
    setLocationForm((current) => ({ ...current, [field]: value }));
  }

  function updatePlantGroupForm(field: keyof PlantGroupFormState, value: string | string[]) {
    setPlantGroupForm((current) => ({ ...current, [field]: value }));
  }

  function updateActionForm(field: keyof ActionFormState, value: string) {
    setActionForm((current) => ({ ...current, [field]: value }));
  }

  function updateResourceForm(field: keyof ResourceFormState, value: string) {
    setResourceForm((current) => ({ ...current, [field]: value }));
  }

  function updateActivityForm(field: keyof ActivityFormState, value: ActivityFormState[keyof ActivityFormState]) {
    setActivityForm((current) => ({ ...current, [field]: value }));
  }

  function updateRecipeForm(field: keyof RecipeFormState, value: RecipeFormState[keyof RecipeFormState]) {
    setRecipeForm((current) => ({ ...current, [field]: value }));
  }

  function updateFlagDefinitionForm(field: keyof FlagDefinitionFormState, value: string) {
    setFlagDefinitionForm((current) => ({ ...current, [field]: value }));
  }

  function updatePlantFlagForm(field: keyof PlantFlagFormState, value: string) {
    setPlantFlagForm((current) => ({ ...current, [field]: value }));
  }

  function updateBulkScheduleForm(
    field: keyof BulkScheduleFormState,
    value: string | string[],
  ) {
    setBulkScheduleForm((current) => ({ ...current, [field]: value }));
  }

  function startNewSchedule() {
    setEditingScheduleId(null);
    setBulkScheduleForm(emptyBulkScheduleForm);
    setView('schedules');
  }

  function startEditingSchedule(schedule: PlantCareScheduleRule) {
    setEditingScheduleId(schedule.id);
    setBulkScheduleForm(toBulkScheduleForm(schedule));
    setView('schedules');
  }

  function cancelEditingSchedule() {
    setEditingScheduleId(null);
    setBulkScheduleForm(emptyBulkScheduleForm);
  }

  function startAddingPlant() {
    setEditingPlantId(null);
    setSelectedPlantId(null);
    setForm(emptyPlantForm);
    setIsPlantEditorOpen(true);
    setView('plant-management');
  }

  function openPlantDetail(plant: Plant) {
    setSelectedPlantId(plant.id);
    setEditingPlantId(null);
    setForm(emptyPlantForm);
    setIsPlantEditorOpen(false);
    setView('plant-management');
  }

  function startEditingPlant(plant: Plant) {
    setSelectedPlantId(plant.id);
    setEditingPlantId(plant.id);
    setForm(toPlantForm(plant));
    setIsPlantEditorOpen(true);
    setView('plant-management');
  }

  function cancelEditing() {
    setEditingPlantId(null);
    setSelectedPlantId(null);
    setForm(emptyPlantForm);
    setIsPlantEditorOpen(false);
    setPlantFlagForm(emptyPlantFlagForm);
  }

  function startAddingLocation() {
    setEditingLocationId(null);
    setSelectedLocationId(null);
    setLocationForm(emptyLocationForm);
    setIsLocationEditorOpen(true);
    setView('locations');
  }

  function startEditingLocation(location: PlantLocation) {
    setSelectedLocationId(null);
    setEditingLocationId(location.id);
    setLocationForm(toLocationForm(location));
    setIsLocationEditorOpen(true);
    setView('locations');
  }

  function cancelEditingLocation() {
    setEditingLocationId(null);
    setLocationForm(emptyLocationForm);
    setIsLocationEditorOpen(false);
  }

  function startAddingPlantGroup() {
    setEditingPlantGroupId(null);
    setPlantGroupForm(emptyPlantGroupForm);
    setIsPlantGroupEditorOpen(true);
    setView('groups');
  }

  function startEditingPlantGroup(group: PlantGroup) {
    setEditingPlantGroupId(group.id);
    setPlantGroupForm(toPlantGroupForm(group));
    setIsPlantGroupEditorOpen(true);
    setView('groups');
  }

  function cancelEditingPlantGroup() {
    setEditingPlantGroupId(null);
    setPlantGroupForm(emptyPlantGroupForm);
    setIsPlantGroupEditorOpen(false);
  }

  function startAddingAction() {
    setEditingActionId(null);
    setSelectedActionId(null);
    setActionForm(emptyActionForm);
    setIsActionEditorOpen(true);
    setView('actions');
  }

  function startEditingAction(action: CareAction) {
    setSelectedActionId(null);
    setEditingActionId(action.id);
    setActionForm(toActionForm(action));
    setIsActionEditorOpen(true);
    setView('actions');
  }

  function cancelEditingAction() {
    setEditingActionId(null);
    setActionForm(emptyActionForm);
    setIsActionEditorOpen(false);
  }

  function startAddingResource() {
    setEditingResourceId(null);
    setSelectedResourceId(null);
    setResourceForm(emptyResourceForm);
    setIsResourceEditorOpen(true);
    setView('resources');
  }

  function startEditingResource(resource: ActionResource) {
    setSelectedResourceId(null);
    setEditingResourceId(resource.id);
    setResourceForm(toResourceForm(resource));
    setIsResourceEditorOpen(true);
    setView('resources');
  }

  function cancelEditingResource() {
    setEditingResourceId(null);
    setResourceForm(emptyResourceForm);
    setIsResourceEditorOpen(false);
  }

  function startAddingRecipe() {
    setEditingRecipeId(null);
    setSelectedRecipeId(null);
    setRecipeForm(emptyRecipeForm);
    setIsRecipeEditorOpen(true);
    setView('recipes');
  }

  function startEditingRecipe(recipe: Recipe) {
    setSelectedRecipeId(null);
    setEditingRecipeId(recipe.id);
    setRecipeForm(toRecipeForm(recipe));
    setIsRecipeEditorOpen(true);
    setView('recipes');
  }

  function cancelEditingRecipe() {
    setEditingRecipeId(null);
    setRecipeForm(emptyRecipeForm);
    setIsRecipeEditorOpen(false);
  }

  function startAddingActivity() {
    setEditingActivityId(null);
    setSelectedActivityId(null);
    setActivityForm(emptyActivityForm);
    setIsActivityEditorOpen(true);
    setView('activities');
  }

  function startEditingActivity(activity: CareActivity) {
    setSelectedActivityId(null);
    setEditingActivityId(activity.id);
    setActivityForm(toActivityForm(activity));
    setIsActivityEditorOpen(true);
    setView('activities');
  }

  function cancelEditingActivity() {
    setEditingActivityId(null);
    setActivityForm(emptyActivityForm);
    setIsActivityEditorOpen(false);
  }

  function startAddingFlagDefinition() {
    setEditingFlagDefinitionId(null);
    setSelectedFlagDefinitionId(null);
    setFlagDefinitionForm(emptyFlagDefinitionForm);
    setIsFlagDefinitionEditorOpen(true);
    setView('flags');
  }

  function startEditingFlagDefinition(flag: PlantFlagDefinition) {
    setSelectedFlagDefinitionId(null);
    setEditingFlagDefinitionId(flag.id);
    setFlagDefinitionForm(toFlagDefinitionForm(flag));
    setIsFlagDefinitionEditorOpen(true);
    setView('flags');
  }

  function cancelEditingFlagDefinition() {
    setEditingFlagDefinitionId(null);
    setFlagDefinitionForm(emptyFlagDefinitionForm);
    setIsFlagDefinitionEditorOpen(false);
  }

  function selectManagedPlant(plantId: string) {
    const plant = data.plants.find((item) => item.id === Number(plantId));
    if (!plant) {
      setSelectedPlantId(null);
      setEditingPlantId(null);
      setForm(emptyPlantForm);
      setIsPlantEditorOpen(false);
      setPlantFlagForm(emptyPlantFlagForm);
      return;
    }

    setSelectedPlantId(plant.id);
    setEditingPlantId(plant.id);
    setForm(toPlantForm(plant));
    setIsPlantEditorOpen(true);
    setPlantFlagForm(emptyPlantFlagForm);
    setView('plant-management');
  }

  return {
    actionForm,
    activeAction,
    activeActivity,
    activeFlagDefinition,
    activeLocation,
    activePlant,
    activePlantGroup,
    activeRecipe,
    activeResource,
    activityForm,
    bulkScheduleForm,
    cancelEditingSchedule,
    cancelEditing,
    cancelEditingAction,
    cancelEditingActivity,
    cancelEditingFlagDefinition,
    cancelEditingLocation,
    cancelEditingPlantGroup,
    cancelEditingRecipe,
    cancelEditingResource,
    editingActionId,
    editingActivityId,
    editingFlagDefinitionId,
    editingLocationId,
    editingPlantGroupId,
    editingPlantId,
    editingRecipeId,
    editingResourceId,
    editingScheduleId,
    flagDefinitionForm,
    form,
    isActionEditorOpen,
    isActivityEditorOpen,
    isFlagDefinitionEditorOpen,
    isLocationEditorOpen,
    isPlantEditorOpen,
    isPlantGroupEditorOpen,
    isRecipeEditorOpen,
    isResourceEditorOpen,
    locationForm,
    openPlantDetail,
    plantFlagForm,
    plantGroupForm,
    recipeForm,
    resourceForm,
    selectedAction,
    selectedActivity,
    selectedFlagDefinition,
    selectedLocation,
    selectedPlant,
    selectedPlantId,
    selectedRecipe,
    selectedRecipeId,
    selectedResource,
    selectedTaxon,
    selectManagedPlant,
    setBulkScheduleForm,
    setEditingActionId,
    setEditingActivityId,
    setEditingFlagDefinitionId,
    setEditingLocationId,
    setEditingPlantGroupId,
    setEditingPlantId,
    setEditingRecipeId,
    setEditingResourceId,
    setEditingScheduleId,
    setPlantFlagForm,
    setSelectedActionId,
    setSelectedActivityId,
    setSelectedFlagDefinitionId,
    setSelectedLocationId,
    setSelectedPlantId,
    setSelectedRecipeId,
    setSelectedResourceId,
    setSelectedTaxonId,
    startAddingAction,
    startAddingActivity,
    startAddingFlagDefinition,
    startAddingLocation,
    startAddingPlant,
    startAddingPlantGroup,
    startAddingRecipe,
    startAddingResource,
    startEditingAction,
    startEditingActivity,
    startEditingFlagDefinition,
    startEditingLocation,
    startEditingPlant,
    startEditingPlantGroup,
    startEditingRecipe,
    startEditingResource,
    startEditingSchedule,
    startNewSchedule,
    updateActionForm,
    updateActivityForm,
    updateBulkScheduleForm,
    updateFlagDefinitionForm,
    updateForm,
    updateLocationForm,
    updatePlantFlagForm,
    updatePlantGroupForm,
    updateRecipeForm,
    updateResourceForm,
  };
}
