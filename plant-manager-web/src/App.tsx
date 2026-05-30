import { useEffect, useMemo, useState } from 'react';
import {
  createActionResource,
  createCareActivity,
  createCareAction,
  createPlant,
  createPlantGroup,
  createPlantLocation,
  createRecipe,
  assignPlantFlag,
  completeCareTasksBulk,
  createPlantFlag,
  createPlantTaxon,
  deleteActionResource,
  deleteCareActivity,
  deleteCareAction,
  deletePlant,
  deletePlantGroup,
  deletePlantFlag,
  deletePlantLocation,
  deletePlantTaxon,
  deleteRecipe,
  getActionResources,
  getCareActivities,
  getCareActions,
  getCareTasks,
  getPlants,
  getPlantFlags,
  getPlantGroups,
  getPlantLocations,
  getPlantTaxa,
  getRecipes,
  removePlantFlagAssignment,
  removePlantCareSchedulesBulk,
  resolvePlantFlag,
  savePlantCareSchedulesBulk,
  updateActionResource,
  updateCareActivity,
  updateCareAction,
  updatePlant,
  updatePlantGroup,
  updatePlantFlag,
  updatePlantLocation,
  updatePlantTaxon,
  updateRecipe,
} from './api';
import { ActionsView } from './components/ActionsView';
import { ActivitiesView } from './components/ActivitiesView';
import { FlagsView } from './components/FlagsView';
import { GroupsView } from './components/GroupsView';
import { HomeView } from './components/HomeView';
import { LocationsView } from './components/LocationsView';
import { PlantManagementView } from './components/PlantManagementView';
import { PlantsView } from './components/PlantsView';
import { RecipesView } from './components/RecipesView';
import { ResourcesView } from './components/ResourcesView';
import { SchedulesView } from './components/SchedulesView';
import { TaxaView } from './components/TaxaView';
import type { ActionResource, CareActivity, CareAction, CareTask, Plant, PlantFlag, PlantFlagDefinition, PlantGroup, PlantLocation, PlantTaxon, Recipe } from './domain';
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
  emptyTaxonForm,
  toActionForm,
  toActionPayload,
  toActivityForm,
  toActivityPayload,
  toBulkSchedulePayload,
  toFlagDefinitionForm,
  toFlagDefinitionPayload,
  toLocationForm,
  toLocationPayload,
  toPlantGroupForm,
  toPlantGroupPayload,
  toPlantFlagPayload,
  toPlantForm,
  toPlantPayload,
  toRecipeForm,
  toRecipePayload,
  toResourceForm,
  toResourcePayload,
  toTaxonForm,
  toTaxonPayload,
  type ActionFormState,
  type ActivityFormState,
  type BulkScheduleFormState,
  type FlagDefinitionFormState,
  type LocationFormState,
  type PlantGroupFormState,
  type PlantFlagFormState,
  type PlantFormState,
  type RecipeFormState,
  type ResourceFormState,
  type TaxonFormState,
  type View,
} from './form-state';

export function App() {
  const [view, setView] = useState<View>('home');
  const [plants, setPlants] = useState<Plant[]>([]);
  const [plantTaxa, setPlantTaxa] = useState<PlantTaxon[]>([]);
  const [plantLocations, setPlantLocations] = useState<PlantLocation[]>([]);
  const [plantGroups, setPlantGroups] = useState<PlantGroup[]>([]);
  const [careActions, setCareActions] = useState<CareAction[]>([]);
  const [actionResources, setActionResources] = useState<ActionResource[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [careActivities, setCareActivities] = useState<CareActivity[]>([]);
  const [plantFlagDefinitions, setPlantFlagDefinitions] = useState<PlantFlagDefinition[]>([]);
  const [careTasks, setCareTasks] = useState<CareTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingPlantId, setEditingPlantId] = useState<number | null>(null);
  const [editingTaxonId, setEditingTaxonId] = useState<number | null>(null);
  const [editingLocationId, setEditingLocationId] = useState<number | null>(null);
  const [editingPlantGroupId, setEditingPlantGroupId] = useState<number | null>(null);
  const [editingActionId, setEditingActionId] = useState<number | null>(null);
  const [editingResourceId, setEditingResourceId] = useState<number | null>(null);
  const [editingRecipeId, setEditingRecipeId] = useState<number | null>(null);
  const [editingActivityId, setEditingActivityId] = useState<number | null>(null);
  const [editingFlagDefinitionId, setEditingFlagDefinitionId] = useState<number | null>(null);
  const [isPlantEditorOpen, setIsPlantEditorOpen] = useState(false);
  const [isTaxonEditorOpen, setIsTaxonEditorOpen] = useState(false);
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
  const [taxonForm, setTaxonForm] = useState<TaxonFormState>(emptyTaxonForm);
  const [locationForm, setLocationForm] = useState<LocationFormState>(emptyLocationForm);
  const [plantGroupForm, setPlantGroupForm] = useState<PlantGroupFormState>(emptyPlantGroupForm);
  const [actionForm, setActionForm] = useState<ActionFormState>(emptyActionForm);
  const [resourceForm, setResourceForm] = useState<ResourceFormState>(emptyResourceForm);
  const [recipeForm, setRecipeForm] = useState<RecipeFormState>(emptyRecipeForm);
  const [activityForm, setActivityForm] = useState<ActivityFormState>(emptyActivityForm);
  const [flagDefinitionForm, setFlagDefinitionForm] = useState<FlagDefinitionFormState>(emptyFlagDefinitionForm);
  const [plantFlagForm, setPlantFlagForm] = useState<PlantFlagFormState>(emptyPlantFlagForm);
  const [bulkScheduleForm, setBulkScheduleForm] = useState<BulkScheduleFormState>(emptyBulkScheduleForm);
  const [error, setError] = useState<string | null>(null);

  async function loadDashboard() {
    try {
      const [
        plantsResponse,
        tasksResponse,
        taxaResponse,
        locationsResponse,
        groupsResponse,
        actionsResponse,
        resourcesResponse,
        recipesResponse,
        activitiesResponse,
        flagsResponse,
      ] = await Promise.all([
        getPlants(),
        getCareTasks(),
        getPlantTaxa(),
        getPlantLocations(),
        getPlantGroups(),
        getCareActions(),
        getActionResources(),
        getRecipes(),
        getCareActivities(),
        getPlantFlags(),
      ]);

      setError(null);
      setPlants(plantsResponse);
      setCareTasks(tasksResponse);
      setPlantTaxa(taxaResponse);
      setPlantLocations(locationsResponse);
      setPlantGroups(groupsResponse);
      setCareActions(actionsResponse);
      setActionResources(resourcesResponse);
      setRecipes(recipesResponse);
      setCareActivities(activitiesResponse);
      setPlantFlagDefinitions(flagsResponse);
    } catch {
      setError('Could not reach the Plant-Man API. Start the backend and refresh.');
    } finally {
      setIsLoading(false);
    }
  }

  async function loadLocations() {
    const locationsResponse = await getPlantLocations();

    setError(null);
    setPlantLocations(locationsResponse);
  }

  async function loadGroupsAndPlants() {
    const [groupsResponse, plantsResponse] = await Promise.all([
      getPlantGroups(),
      getPlants(),
    ]);

    setError(null);
    setPlantGroups(groupsResponse);
    setPlants(plantsResponse);
  }

  async function loadPlants() {
    const plantsResponse = await getPlants();

    setError(null);
    setPlants(plantsResponse);
  }

  async function loadPlantsAndCareTasks() {
    const [plantsResponse, tasksResponse] = await Promise.all([
      getPlants(),
      getCareTasks(),
    ]);

    setError(null);
    setPlants(plantsResponse);
    setCareTasks(tasksResponse);
  }

  async function loadTaxaAndPlants() {
    const [plantsResponse, taxaResponse] = await Promise.all([
      getPlants(),
      getPlantTaxa(),
    ]);

    setError(null);
    setPlants(plantsResponse);
    setPlantTaxa(taxaResponse);
  }

  async function loadFlagsAndPlants() {
    const [plantsResponse, flagsResponse] = await Promise.all([
      getPlants(),
      getPlantFlags(),
    ]);

    setError(null);
    setPlants(plantsResponse);
    setPlantFlagDefinitions(flagsResponse);
  }

  async function loadCareModel() {
    const [
      plantsResponse,
      tasksResponse,
      actionsResponse,
      resourcesResponse,
      recipesResponse,
      activitiesResponse,
    ] = await Promise.all([
      getPlants(),
      getCareTasks(),
      getCareActions(),
      getActionResources(),
      getRecipes(),
      getCareActivities(),
    ]);

    setError(null);
    setPlants(plantsResponse);
    setCareTasks(tasksResponse);
    setCareActions(actionsResponse);
    setActionResources(resourcesResponse);
    setRecipes(recipesResponse);
    setCareActivities(activitiesResponse);
  }

  async function loadRecipesAndResources() {
    const [recipesResponse, resourcesResponse] = await Promise.all([
      getRecipes(),
      getActionResources(),
    ]);

    setError(null);
    setRecipes(recipesResponse);
    setActionResources(resourcesResponse);
  }

  useEffect(() => {
    queueMicrotask(() => {
      void loadDashboard();
    });
  }, []);

  const dueCount = useMemo(
    () => careTasks.filter((task) => task.status === 'due').length,
    [careTasks],
  );

  const activePlant = plants.find((plant) => plant.id === editingPlantId);
  const selectedPlant = plants.find((plant) => plant.id === selectedPlantId);
  const activeTaxon = plantTaxa.find((taxon) => taxon.id === editingTaxonId);
  const selectedTaxon = plantTaxa.find((taxon) => taxon.id === selectedTaxonId);
  const activeLocation = plantLocations.find((location) => location.id === editingLocationId);
  const selectedLocation = plantLocations.find((location) => location.id === selectedLocationId);
  const activePlantGroup = plantGroups.find((group) => group.id === editingPlantGroupId);
  const activeAction = careActions.find((action) => action.id === editingActionId);
  const selectedAction = careActions.find((action) => action.id === selectedActionId);
  const activeResource = actionResources.find((resource) => resource.id === editingResourceId);
  const selectedResource = actionResources.find((resource) => resource.id === selectedResourceId);
  const activeRecipe = recipes.find((recipe) => recipe.id === editingRecipeId);
  const selectedRecipe = recipes.find((recipe) => recipe.id === selectedRecipeId);
  const activeActivity = careActivities.find((activity) => activity.id === editingActivityId);
  const selectedActivity = careActivities.find((activity) => activity.id === selectedActivityId);
  const activeFlagDefinition = plantFlagDefinitions.find((flag) => flag.id === editingFlagDefinitionId);
  const selectedFlagDefinition = plantFlagDefinitions.find((flag) => flag.id === selectedFlagDefinitionId);

  function updateForm(field: keyof PlantFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateTaxonForm(field: keyof TaxonFormState, value: string) {
    setTaxonForm((current) => ({ ...current, [field]: value }));
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

  function startAddingPlant() {
    setEditingPlantId(null);
    setSelectedPlantId(null);
    setForm(emptyPlantForm);
    setIsPlantEditorOpen(true);
    setView('plants');
  }

  function openPlantDetail(plant: Plant) {
    setSelectedPlantId(plant.id);
    setEditingPlantId(null);
    setForm(emptyPlantForm);
    setIsPlantEditorOpen(false);
    setView('plant-management');
  }

  function startEditingPlant(plant: Plant) {
    setSelectedPlantId(null);
    setEditingPlantId(plant.id);
    setForm(toPlantForm(plant));
    setIsPlantEditorOpen(true);
    setView('plants');
  }

  function cancelEditing() {
    setEditingPlantId(null);
    setForm(emptyPlantForm);
    setIsPlantEditorOpen(false);
  }

  function openPlantReadOnlyDetail(plant: Plant) {
    setSelectedPlantId(plant.id);
    setEditingPlantId(null);
    setForm(emptyPlantForm);
    setIsPlantEditorOpen(false);
    setView('plants');
  }

  function startAddingTaxon() {
    setEditingTaxonId(null);
    setSelectedTaxonId(null);
    setTaxonForm(emptyTaxonForm);
    setIsTaxonEditorOpen(true);
    setView('taxa');
  }

  function startEditingTaxon(taxon: PlantTaxon) {
    setSelectedTaxonId(null);
    setEditingTaxonId(taxon.id);
    setTaxonForm(toTaxonForm(taxon));
    setIsTaxonEditorOpen(true);
    setView('taxa');
  }

  function cancelEditingTaxon() {
    setEditingTaxonId(null);
    setTaxonForm(emptyTaxonForm);
    setIsTaxonEditorOpen(false);
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

  async function savePlant() {
    if (!form.nickname.trim()) {
      setError('Plant name is required.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = editingPlantId === null
        ? toPlantPayload(form)
        : {
            ...toPlantPayload(form),
            taxonId: activePlant?.taxonId ?? null,
            locationId: activePlant?.locationId ?? null,
          };
      if (editingPlantId === null) {
        await createPlant(payload);
      } else {
        await updatePlant(editingPlantId, payload);
      }
      cancelEditing();
      await loadPlantsAndCareTasks();
    } catch {
      setError('Could not save the plant.');
    } finally {
      setIsSaving(false);
    }
  }

  async function updateManagedPlant(nextValues: {
    taxonId?: number | null;
    locationId?: number | null;
  }) {
    if (!selectedPlant) {
      return;
    }

    setIsSaving(true);
    try {
      await updatePlant(selectedPlant.id, {
        nickname: selectedPlant.nickname,
        birthday: selectedPlant.birthday,
        taxonId: nextValues.taxonId === undefined ? selectedPlant.taxonId : nextValues.taxonId,
        locationId: nextValues.locationId === undefined ? selectedPlant.locationId : nextValues.locationId,
        careSchedules: null,
      });
      await loadPlants();
    } catch {
      setError('Could not update the plant assignment.');
    } finally {
      setIsSaving(false);
    }
  }

  function selectManagedPlant(plantId: string) {
    setSelectedPlantId(plantId ? Number(plantId) : null);
    setPlantFlagForm(emptyPlantFlagForm);
  }

  function setManagedPlantTaxon(taxonId: string) {
    void updateManagedPlant({ taxonId: taxonId ? Number(taxonId) : null });
  }

  function setManagedPlantLocation(locationId: string) {
    void updateManagedPlant({ locationId: locationId ? Number(locationId) : null });
  }

  async function removePlant(plant: Plant) {
    const confirmed = window.confirm(`Delete ${plant.nickname}? This also removes its care log.`);
    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    try {
      await deletePlant(plant.id);
      if (selectedPlantId === plant.id) {
        setSelectedPlantId(null);
      }
      if (editingPlantId === plant.id) {
        cancelEditing();
      }
      await loadPlantsAndCareTasks();
    } catch {
      setError('Could not delete the plant.');
    } finally {
      setIsSaving(false);
    }
  }

  async function saveTaxon() {
    if (!taxonForm.name.trim() || !taxonForm.genus.trim() || !taxonForm.species.trim()) {
      setError('Name, genus, and species are required.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = toTaxonPayload(taxonForm);
      if (editingTaxonId === null) {
        await createPlantTaxon(payload);
      } else {
        await updatePlantTaxon(editingTaxonId, payload);
      }
      cancelEditingTaxon();
      await loadTaxaAndPlants();
    } catch {
      setError('Could not save the taxon.');
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
      if (editingTaxonId === taxon.id) {
        cancelEditingTaxon();
      }
      await loadTaxaAndPlants();
    } catch {
      setError('Could not delete the taxon. It may still be used by a plant.');
    } finally {
      setIsSaving(false);
    }
  }

  async function saveLocation() {
    if (!locationForm.name.trim()) {
      setError('Location name is required.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = toLocationPayload(locationForm);
      if (editingLocationId === null) {
        await createPlantLocation(payload);
      } else {
        await updatePlantLocation(editingLocationId, payload);
      }
      cancelEditingLocation();
      await loadLocations();
    } catch {
      setError('Could not save the location.');
    } finally {
      setIsSaving(false);
    }
  }

  async function removeLocation(location: PlantLocation) {
    const confirmed = window.confirm(`Delete ${location.name}? Locations assigned to plants cannot be deleted.`);
    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    try {
      await deletePlantLocation(location.id);
      if (editingLocationId === location.id) {
        cancelEditingLocation();
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
    if (!plantGroupForm.name.trim()) {
      setError('Group name is required.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = toPlantGroupPayload(plantGroupForm);
      if (editingPlantGroupId === null) {
        await createPlantGroup(payload);
      } else {
        await updatePlantGroup(editingPlantGroupId, payload);
      }
      cancelEditingPlantGroup();
      await loadGroupsAndPlants();
    } catch {
      setError('Could not save the plant group.');
    } finally {
      setIsSaving(false);
    }
  }

  async function removePlantGroup(group: PlantGroup) {
    const confirmed = window.confirm(`Delete ${group.name}?`);
    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    try {
      await deletePlantGroup(group.id);
      if (editingPlantGroupId === group.id) {
        cancelEditingPlantGroup();
      }
      await loadGroupsAndPlants();
    } catch {
      setError('Could not delete the plant group.');
    } finally {
      setIsSaving(false);
    }
  }

  async function saveAction() {
    if (!actionForm.name.trim()) {
      setError('Action name is required.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = toActionPayload(actionForm);
      if (editingActionId === null) {
        await createCareAction(payload);
      } else {
        await updateCareAction(editingActionId, payload);
      }
      cancelEditingAction();
      await loadCareModel();
    } catch {
      setError('Could not save the action.');
    } finally {
      setIsSaving(false);
    }
  }

  async function removeAction(action: CareAction) {
    const confirmed = window.confirm(`Delete ${action.name}? Actions with care history cannot be deleted.`);
    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    try {
      await deleteCareAction(action.id);
      if (editingActionId === action.id) {
        cancelEditingAction();
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
    if (!resourceForm.name.trim()) {
      setError('Resource name is required.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = toResourcePayload(resourceForm);
      if (editingResourceId === null) {
        await createActionResource(payload);
      } else {
        await updateActionResource(editingResourceId, payload);
      }
      cancelEditingResource();
      await loadCareModel();
      await loadRecipesAndResources();
    } catch {
      setError('Could not save the resource.');
    } finally {
      setIsSaving(false);
    }
  }

  async function removeResource(resource: ActionResource) {
    const confirmed = window.confirm(`Delete ${resource.name}?`);
    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    try {
      await deleteActionResource(resource.id);
      if (editingResourceId === resource.id) {
        cancelEditingResource();
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
    if (!recipeForm.name.trim() || !recipeForm.type.trim() || !recipeForm.outputResourceName.trim() || recipeForm.components.length === 0) {
      setError('Recipe name, type, produced resource, and at least one component are required.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = toRecipePayload(recipeForm);
      if (editingRecipeId === null) {
        await createRecipe(payload);
      } else {
        await updateRecipe(editingRecipeId, payload);
      }
      cancelEditingRecipe();
      await loadRecipesAndResources();
    } catch {
      setError('Could not save the recipe.');
    } finally {
      setIsSaving(false);
    }
  }

  async function removeRecipe(recipe: Recipe) {
    const confirmed = window.confirm(`Delete ${recipe.name}?`);
    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    try {
      await deleteRecipe(recipe.id);
      if (selectedRecipeId === recipe.id) {
        setSelectedRecipeId(null);
      }
      if (editingRecipeId === recipe.id) {
        cancelEditingRecipe();
      }
      await loadRecipesAndResources();
    } catch {
      setError('Could not delete the recipe.');
    } finally {
      setIsSaving(false);
    }
  }

  async function saveActivity() {
    if (!activityForm.name.trim() || activityForm.actions.length === 0) {
      setError('Activity name and at least one action are required.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = toActivityPayload(activityForm);
      if (editingActivityId === null) {
        await createCareActivity(payload);
      } else {
        await updateCareActivity(editingActivityId, payload);
      }
      cancelEditingActivity();
      await loadCareModel();
    } catch {
      setError('Could not save the activity.');
    } finally {
      setIsSaving(false);
    }
  }

  async function removeActivity(activity: CareActivity) {
    const confirmed = window.confirm(`Delete ${activity.name}? Activities in use cannot be deleted.`);
    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    try {
      await deleteCareActivity(activity.id);
      if (editingActivityId === activity.id) {
        cancelEditingActivity();
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
    if (!flagDefinitionForm.name.trim()) {
      setError('Flag name is required.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = toFlagDefinitionPayload(flagDefinitionForm);
      if (editingFlagDefinitionId === null) {
        await createPlantFlag(payload);
      } else {
        await updatePlantFlag(editingFlagDefinitionId, payload);
      }
      cancelEditingFlagDefinition();
      await loadFlagsAndPlants();
    } catch {
      setError('Could not save the plant flag.');
    } finally {
      setIsSaving(false);
    }
  }

  async function saveBulkSchedule() {
    if (!bulkScheduleForm.careActivityId || bulkScheduleForm.plantIds.length === 0) {
      setError('Select an activity and at least one plant.');
      return;
    }

    setIsSaving(true);
    try {
      await savePlantCareSchedulesBulk(toBulkSchedulePayload(bulkScheduleForm));
      setBulkScheduleForm(emptyBulkScheduleForm);
      await loadPlantsAndCareTasks();
    } catch {
      setError('Could not apply the care schedule.');
    } finally {
      setIsSaving(false);
    }
  }

  async function removeBulkSchedule() {
    if (!bulkScheduleForm.careActivityId || bulkScheduleForm.plantIds.length === 0) {
      setError('Select an activity and at least one plant.');
      return;
    }

    setIsSaving(true);
    try {
      await removePlantCareSchedulesBulk(toBulkSchedulePayload(bulkScheduleForm));
      setBulkScheduleForm(emptyBulkScheduleForm);
      await loadPlantsAndCareTasks();
    } catch {
      setError('Could not remove the care schedule.');
    } finally {
      setIsSaving(false);
    }
  }

  async function removeFlagDefinition(flag: PlantFlagDefinition) {
    const confirmed = window.confirm(`Delete ${flag.name}? Flags assigned to plants cannot be deleted.`);
    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    try {
      await deletePlantFlag(flag.id);
      if (editingFlagDefinitionId === flag.id) {
        cancelEditingFlagDefinition();
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
    if (!selectedPlantId || !plantFlagForm.plantFlagDefinitionId) {
      setError('Select a plant and flag first.');
      return;
    }

    setIsSaving(true);
    try {
      await assignPlantFlag(selectedPlantId, toPlantFlagPayload(plantFlagForm));
      setPlantFlagForm(emptyPlantFlagForm);
      await loadPlants();
    } catch {
      setError('Could not attach the plant flag.');
    } finally {
      setIsSaving(false);
    }
  }

  async function resolveAssignedPlantFlag(flag: PlantFlag) {
    if (!selectedPlantId) {
      return;
    }

    setIsSaving(true);
    try {
      await resolvePlantFlag(selectedPlantId, flag.id);
      await loadPlants();
    } catch {
      setError('Could not resolve the plant flag.');
    } finally {
      setIsSaving(false);
    }
  }

  async function removeAssignedPlantFlag(flag: PlantFlag) {
    if (!selectedPlantId) {
      return;
    }

    const confirmed = window.confirm(`Remove ${flag.name} from this plant?`);
    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    try {
      await removePlantFlagAssignment(selectedPlantId, flag.id);
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

  return (
    <div className="app-shell">
      <header className="catalog-header">
        <div className="catalog-brand">
          <span className="catalog-logo">Plant-Man</span>
          <span className="catalog-subtitle">Plant care workbench</span>
        </div>
        <div className="catalog-contact">
          <strong>{plants.length}</strong>
          <span>plants tracked</span>
        </div>
      </header>

      <div className="catalog-layout">
        <aside className="catalog-sidebar">
          <h2>Workbench</h2>
          <nav className="catalog-nav" aria-label="Primary navigation">
            <div className="nav-group">
              <h3>Operations</h3>
              <button
                type="button"
                aria-current={view === 'home' ? 'page' : undefined}
                onClick={() => setView('home')}
              >
                Dashboard
              </button>
              <button
                type="button"
                aria-current={view === 'plants' ? 'page' : undefined}
                onClick={() => setView('plants')}
              >
                Plants
              </button>
              <button
                type="button"
                aria-current={view === 'plant-management' ? 'page' : undefined}
                onClick={() => setView('plant-management')}
              >
                Plant Management
              </button>
            </div>

            <div className="nav-group">
              <h3>Care</h3>
              <button
                type="button"
                aria-current={view === 'schedules' ? 'page' : undefined}
                onClick={() => setView('schedules')}
              >
                Scheduler
              </button>
              <button
                type="button"
                aria-current={view === 'activities' ? 'page' : undefined}
                onClick={() => setView('activities')}
              >
                Care Activities
              </button>
            </div>

            <div className="nav-group">
              <h3>Catalogs</h3>
              <button
                type="button"
                aria-current={view === 'taxa' ? 'page' : undefined}
                onClick={() => setView('taxa')}
              >
                Plant Taxa
              </button>
              <button
                type="button"
                aria-current={view === 'locations' ? 'page' : undefined}
                onClick={() => setView('locations')}
              >
                Locations
              </button>
              <button
                type="button"
                aria-current={view === 'groups' ? 'page' : undefined}
                onClick={() => setView('groups')}
              >
                Groups
              </button>
              <button
                type="button"
                aria-current={view === 'resources' ? 'page' : undefined}
                onClick={() => setView('resources')}
              >
                Resources
              </button>
              <button
                type="button"
                aria-current={view === 'recipes' ? 'page' : undefined}
                onClick={() => setView('recipes')}
              >
                Recipes
              </button>
              <button
                type="button"
                aria-current={view === 'actions' ? 'page' : undefined}
                onClick={() => setView('actions')}
              >
                Actions
              </button>
              <button
                type="button"
                aria-current={view === 'flags' ? 'page' : undefined}
                onClick={() => setView('flags')}
              >
                Plant Flags
              </button>
            </div>
          </nav>

          <section className="catalog-help" aria-label="Catalog status">
            <h3>Catalog Status</h3>
            <p>{dueCount} due</p>
            <p>{plantLocations.length} locations</p>
            <p>{plantGroups.length} groups</p>
            <p>{careActivities.length} activities</p>
            <p>{careActions.length} actions</p>
            <p>{actionResources.length} resources</p>
            <p>{recipes.length} recipes</p>
            <p>{plantFlagDefinitions.length} flags</p>
          </section>
        </aside>

        <div className="catalog-main">
          <div className="catalog-page-title">
            <p className="eyebrow">{getViewEyebrow(view)}</p>
            <h1>{getViewTitle(view)}</h1>
          </div>

          <main className="content">
            {view === 'plants' ? (
              <PlantsView
                activePlantName={activePlant?.nickname}
                error={error}
                form={form}
                isLoading={isLoading}
                isPlantEditorOpen={isPlantEditorOpen}
                isSaving={isSaving}
                plants={plants}
                selectedPlant={selectedPlant}
                onCancel={cancelEditing}
                onCloseDetail={() => setSelectedPlantId(null)}
                onDelete={(plant) => void removePlant(plant)}
                onEdit={startEditingPlant}
                onFieldChange={updateForm}
                onNew={startAddingPlant}
                onOpenDetail={openPlantReadOnlyDetail}
                onSave={() => void savePlant()}
              />
            ) : view === 'plant-management' ? (
              <PlantManagementView
                error={error}
                isLoading={isLoading}
                isSaving={isSaving}
                plantFlagDefinitions={plantFlagDefinitions}
                plantFlagForm={plantFlagForm}
                plantLocations={plantLocations}
                plantTaxa={plantTaxa}
                plants={plants}
                selectedPlant={selectedPlant}
                selectedPlantId={selectedPlantId}
                onAssignFlag={() => void assignFlagToSelectedPlant()}
                onFieldChange={updatePlantFlagForm}
                onRemoveFlag={(flag) => void removeAssignedPlantFlag(flag)}
                onResolveFlag={(flag) => void resolveAssignedPlantFlag(flag)}
                onSelectPlant={selectManagedPlant}
                onSetLocation={setManagedPlantLocation}
                onSetTaxon={setManagedPlantTaxon}
              />
            ) : view === 'schedules' ? (
              <SchedulesView
                activities={careActivities}
                error={error}
                form={bulkScheduleForm}
                groups={plantGroups}
                isLoading={isLoading}
                isSaving={isSaving}
                plants={plants}
                onFieldChange={updateBulkScheduleForm}
                onRemove={() => void removeBulkSchedule()}
                onSave={() => void saveBulkSchedule()}
              />
            ) : view === 'taxa' ? (
              <TaxaView
                activeTaxonName={activeTaxon?.name}
                error={error}
                form={taxonForm}
                isEditorOpen={isTaxonEditorOpen}
                isLoading={isLoading}
                isSaving={isSaving}
                selectedTaxon={selectedTaxon}
                taxa={plantTaxa}
                onCancel={cancelEditingTaxon}
                onCloseDetail={() => setSelectedTaxonId(null)}
                onDelete={(taxon) => void removeTaxon(taxon)}
                onEdit={startEditingTaxon}
                onFieldChange={updateTaxonForm}
                onNew={startAddingTaxon}
                onOpenDetail={(taxon) => setSelectedTaxonId(taxon.id)}
                onSave={() => void saveTaxon()}
              />
            ) : view === 'locations' ? (
              <LocationsView
                activeLocationName={activeLocation?.name}
                error={error}
                form={locationForm}
                isEditorOpen={isLocationEditorOpen}
                isLoading={isLoading}
                isSaving={isSaving}
                locations={plantLocations}
                selectedLocation={selectedLocation}
                onCancel={cancelEditingLocation}
                onCloseDetail={() => setSelectedLocationId(null)}
                onDelete={(location) => void removeLocation(location)}
                onEdit={startEditingLocation}
                onFieldChange={updateLocationForm}
                onNew={startAddingLocation}
                onOpenDetail={(location) => setSelectedLocationId(location.id)}
                onSave={() => void saveLocation()}
              />
            ) : view === 'groups' ? (
              <GroupsView
                activeGroupName={activePlantGroup?.name}
                error={error}
                form={plantGroupForm}
                groups={plantGroups}
                isEditorOpen={isPlantGroupEditorOpen}
                isLoading={isLoading}
                isSaving={isSaving}
                plants={plants}
                onCancel={cancelEditingPlantGroup}
                onDelete={(group) => void removePlantGroup(group)}
                onEdit={startEditingPlantGroup}
                onFieldChange={updatePlantGroupForm}
                onNew={startAddingPlantGroup}
                onSave={() => void savePlantGroup()}
              />
            ) : view === 'actions' ? (
              <ActionsView
                activeActionName={activeAction?.name}
                actions={careActions}
                error={error}
                form={actionForm}
                isEditorOpen={isActionEditorOpen}
                isLoading={isLoading}
                isSaving={isSaving}
                selectedAction={selectedAction}
                onCancel={cancelEditingAction}
                onCloseDetail={() => setSelectedActionId(null)}
                onDelete={(action) => void removeAction(action)}
                onEdit={startEditingAction}
                onFieldChange={updateActionForm}
                onNew={startAddingAction}
                onOpenDetail={(action) => setSelectedActionId(action.id)}
                onSave={() => void saveAction()}
              />
            ) : view === 'activities' ? (
              <ActivitiesView
                actions={careActions}
                activeActivityName={activeActivity?.name}
                activities={careActivities}
                error={error}
                form={activityForm}
                isEditorOpen={isActivityEditorOpen}
                isLoading={isLoading}
                isSaving={isSaving}
                selectedActivity={selectedActivity}
                onCancel={cancelEditingActivity}
                onCloseDetail={() => setSelectedActivityId(null)}
                onDelete={(activity) => void removeActivity(activity)}
                onEdit={startEditingActivity}
                onFieldChange={updateActivityForm}
                onNew={startAddingActivity}
                onOpenDetail={(activity) => setSelectedActivityId(activity.id)}
                onSave={() => void saveActivity()}
                resources={actionResources}
              />
            ) : view === 'resources' ? (
              <ResourcesView
                activeResourceName={activeResource?.name}
                error={error}
                form={resourceForm}
                isEditorOpen={isResourceEditorOpen}
                isLoading={isLoading}
                isSaving={isSaving}
                selectedResource={selectedResource}
                onCancel={cancelEditingResource}
                onCloseDetail={() => setSelectedResourceId(null)}
                onDelete={(resource) => void removeResource(resource)}
                onEdit={startEditingResource}
                onFieldChange={updateResourceForm}
                onNew={startAddingResource}
                onOpenDetail={(resource) => setSelectedResourceId(resource.id)}
                onSave={() => void saveResource()}
                resources={actionResources}
              />
            ) : view === 'recipes' ? (
              <RecipesView
                activeRecipeName={activeRecipe?.name}
                error={error}
                form={recipeForm}
                isEditorOpen={isRecipeEditorOpen}
                isLoading={isLoading}
                isSaving={isSaving}
                recipes={recipes}
                resources={actionResources}
                selectedRecipe={selectedRecipe}
                onCancel={cancelEditingRecipe}
                onCloseDetail={() => setSelectedRecipeId(null)}
                onDelete={(recipe) => void removeRecipe(recipe)}
                onEdit={startEditingRecipe}
                onFieldChange={updateRecipeForm}
                onNew={startAddingRecipe}
                onOpenDetail={(recipe) => setSelectedRecipeId(recipe.id)}
                onSave={() => void saveRecipe()}
              />
            ) : view === 'flags' ? (
              <FlagsView
                activeFlagName={activeFlagDefinition?.name}
                error={error}
                flags={plantFlagDefinitions}
                form={flagDefinitionForm}
                isEditorOpen={isFlagDefinitionEditorOpen}
                isLoading={isLoading}
                isSaving={isSaving}
                selectedFlag={selectedFlagDefinition}
                onCancel={cancelEditingFlagDefinition}
                onCloseDetail={() => setSelectedFlagDefinitionId(null)}
                onDelete={(flag) => void removeFlagDefinition(flag)}
                onEdit={startEditingFlagDefinition}
                onFieldChange={updateFlagDefinitionForm}
                onNew={startAddingFlagDefinition}
                onOpenDetail={(flag) => setSelectedFlagDefinitionId(flag.id)}
                onSave={() => void saveFlagDefinition()}
              />
            ) : (
              <HomeView
                careTasks={careTasks}
                dueCount={dueCount}
                error={error}
                groups={plantGroups}
                isLoading={isLoading}
                plants={plants}
                onCompleteBulkTasks={(tasks) => void completeBulkTasks(tasks)}
                onCompleteTask={(task) => void completeTask(task)}
                onNewPlant={startAddingPlant}
                onOpenPlant={openPlantDetail}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function getViewEyebrow(view: View) {
  switch (view) {
    case 'home':
      return 'Operations';
    case 'plants':
    case 'plant-management':
      return 'Operations';
    case 'schedules':
      return 'Care';
    case 'taxa':
    case 'locations':
    case 'groups':
    case 'resources':
    case 'recipes':
    case 'actions':
    case 'flags':
      return 'Catalogs';
    case 'activities':
      return 'Care';
    default:
      return 'Operations';
  }
}

function getViewTitle(view: View) {
  switch (view) {
    case 'plants':
      return 'Plants';
    case 'plant-management':
      return 'Plant Management';
    case 'schedules':
      return 'Scheduler';
    case 'taxa':
      return 'Plant Taxa';
    case 'locations':
      return 'Locations';
    case 'groups':
      return 'Groups';
    case 'actions':
      return 'Actions';
    case 'activities':
      return 'Care Activities';
    case 'resources':
      return 'Resources';
    case 'recipes':
      return 'Recipes';
    case 'flags':
      return 'Plant Flags';
    default:
      return 'Dashboard';
  }
}

function getTodayInputDate() {
  return new Date().toISOString().slice(0, 10);
}
