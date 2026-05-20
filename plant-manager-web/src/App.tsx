import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  createActionResource,
  createCareActivity,
  createCareAction,
  createPlant,
  createPlantLocation,
  assignPlantFlag,
  completeCareTasksBulk,
  createPlantFlag,
  createPlantTaxon,
  deleteActionResource,
  deleteCareActivity,
  deleteCareAction,
  deletePlant,
  deletePlantFlag,
  deletePlantLocation,
  deletePlantTaxon,
  getActionResources,
  getCareActivities,
  getCareActions,
  getCareTasks,
  getPlants,
  getPlantFlags,
  getPlantLocations,
  getPlantTaxa,
  removePlantFlagAssignment,
  resolvePlantFlag,
  savePlantCareSchedulesBulk,
  updateActionResource,
  updateCareActivity,
  updateCareAction,
  updatePlant,
  updatePlantFlag,
  updatePlantLocation,
  updatePlantTaxon,
} from './api';
import { ActionsView } from './components/ActionsView';
import { ActivitiesView } from './components/ActivitiesView';
import { FlagsView } from './components/FlagsView';
import { HomeView } from './components/HomeView';
import { LocationsView } from './components/LocationsView';
import { PlantManagementView } from './components/PlantManagementView';
import { PlantsView } from './components/PlantsView';
import { ResourcesView } from './components/ResourcesView';
import { SchedulesView } from './components/SchedulesView';
import { TaxaView } from './components/TaxaView';
import type { ActionResource, CareActivity, CareAction, CareTask, Plant, PlantFlag, PlantFlagDefinition, PlantLocation, PlantTaxon } from './domain';
import {
  emptyActionForm,
  emptyActivityForm,
  emptyBulkScheduleForm,
  emptyFlagDefinitionForm,
  emptyLocationForm,
  emptyPlantForm,
  emptyPlantFlagForm,
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
  toPlantFlagPayload,
  toPlantForm,
  toPlantPayload,
  toResourceForm,
  toResourcePayload,
  toTaxonForm,
  toTaxonPayload,
  type ActionFormState,
  type ActivityFormState,
  type BulkScheduleFormState,
  type FlagDefinitionFormState,
  type LocationFormState,
  type PlantFlagFormState,
  type PlantFormState,
  type ResourceFormState,
  type TaxonFormState,
  type View,
} from './form-state';

export function App() {
  const [view, setView] = useState<View>('home');
  const [plants, setPlants] = useState<Plant[]>([]);
  const [plantTaxa, setPlantTaxa] = useState<PlantTaxon[]>([]);
  const [plantLocations, setPlantLocations] = useState<PlantLocation[]>([]);
  const [careActions, setCareActions] = useState<CareAction[]>([]);
  const [actionResources, setActionResources] = useState<ActionResource[]>([]);
  const [careActivities, setCareActivities] = useState<CareActivity[]>([]);
  const [plantFlagDefinitions, setPlantFlagDefinitions] = useState<PlantFlagDefinition[]>([]);
  const [careTasks, setCareTasks] = useState<CareTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingPlantId, setEditingPlantId] = useState<number | null>(null);
  const [editingTaxonId, setEditingTaxonId] = useState<number | null>(null);
  const [editingLocationId, setEditingLocationId] = useState<number | null>(null);
  const [editingActionId, setEditingActionId] = useState<number | null>(null);
  const [editingResourceId, setEditingResourceId] = useState<number | null>(null);
  const [editingActivityId, setEditingActivityId] = useState<number | null>(null);
  const [editingFlagDefinitionId, setEditingFlagDefinitionId] = useState<number | null>(null);
  const [isPlantEditorOpen, setIsPlantEditorOpen] = useState(false);
  const [isTaxonEditorOpen, setIsTaxonEditorOpen] = useState(false);
  const [isLocationEditorOpen, setIsLocationEditorOpen] = useState(false);
  const [isActionEditorOpen, setIsActionEditorOpen] = useState(false);
  const [isResourceEditorOpen, setIsResourceEditorOpen] = useState(false);
  const [isActivityEditorOpen, setIsActivityEditorOpen] = useState(false);
  const [isFlagDefinitionEditorOpen, setIsFlagDefinitionEditorOpen] = useState(false);
  const [selectedPlantId, setSelectedPlantId] = useState<number | null>(null);
  const [selectedTaxonId, setSelectedTaxonId] = useState<number | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [selectedActionId, setSelectedActionId] = useState<number | null>(null);
  const [selectedResourceId, setSelectedResourceId] = useState<number | null>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);
  const [selectedFlagDefinitionId, setSelectedFlagDefinitionId] = useState<number | null>(null);
  const [form, setForm] = useState<PlantFormState>(emptyPlantForm);
  const [taxonForm, setTaxonForm] = useState<TaxonFormState>(emptyTaxonForm);
  const [locationForm, setLocationForm] = useState<LocationFormState>(emptyLocationForm);
  const [actionForm, setActionForm] = useState<ActionFormState>(emptyActionForm);
  const [resourceForm, setResourceForm] = useState<ResourceFormState>(emptyResourceForm);
  const [activityForm, setActivityForm] = useState<ActivityFormState>(emptyActivityForm);
  const [flagDefinitionForm, setFlagDefinitionForm] = useState<FlagDefinitionFormState>(emptyFlagDefinitionForm);
  const [plantFlagForm, setPlantFlagForm] = useState<PlantFlagFormState>(emptyPlantFlagForm);
  const [bulkScheduleForm, setBulkScheduleForm] = useState<BulkScheduleFormState>(emptyBulkScheduleForm);
  const [plantSearch, setPlantSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function loadDashboard() {
    try {
      const [
        plantsResponse,
        tasksResponse,
        taxaResponse,
        locationsResponse,
        actionsResponse,
        resourcesResponse,
        activitiesResponse,
        flagsResponse,
      ] = await Promise.all([
        getPlants(),
        getCareTasks(),
        getPlantTaxa(),
        getPlantLocations(),
        getCareActions(),
        getActionResources(),
        getCareActivities(),
        getPlantFlags(),
      ]);

      setError(null);
      setPlants(plantsResponse);
      setCareTasks(tasksResponse);
      setPlantTaxa(taxaResponse);
      setPlantLocations(locationsResponse);
      setCareActions(actionsResponse);
      setActionResources(resourcesResponse);
      setCareActivities(activitiesResponse);
      setPlantFlagDefinitions(flagsResponse);
    } catch {
      setError('Could not reach the Plant-Man API. Start the backend and refresh.');
    } finally {
      setIsLoading(false);
    }
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
  const filteredPlants = useMemo(
    () => filterPlants(plants, plantSearch),
    [plants, plantSearch],
  );
  const filteredPlantIds = useMemo(
    () => new Set(filteredPlants.map((plant) => plant.id)),
    [filteredPlants],
  );
  const filteredCareTasks = useMemo(
    () => filterCareTasks(careTasks, filteredPlantIds, plantSearch),
    [careTasks, filteredPlantIds, plantSearch],
  );
  const visibleDueCount = useMemo(
    () => filteredCareTasks.filter((task) => task.status === 'due').length,
    [filteredCareTasks],
  );

  const activePlant = plants.find((plant) => plant.id === editingPlantId);
  const selectedPlant = plants.find((plant) => plant.id === selectedPlantId);
  const activeTaxon = plantTaxa.find((taxon) => taxon.id === editingTaxonId);
  const selectedTaxon = plantTaxa.find((taxon) => taxon.id === selectedTaxonId);
  const activeLocation = plantLocations.find((location) => location.id === editingLocationId);
  const selectedLocation = plantLocations.find((location) => location.id === selectedLocationId);
  const activeAction = careActions.find((action) => action.id === editingActionId);
  const selectedAction = careActions.find((action) => action.id === selectedActionId);
  const activeResource = actionResources.find((resource) => resource.id === editingResourceId);
  const selectedResource = actionResources.find((resource) => resource.id === selectedResourceId);
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

  function updateLocationForm(field: keyof LocationFormState, value: string | boolean) {
    setLocationForm((current) => ({ ...current, [field]: value }));
  }

  function updateActionForm(field: keyof ActionFormState, value: string | boolean) {
    setActionForm((current) => ({ ...current, [field]: value }));
  }

  function updateResourceForm(field: keyof ResourceFormState, value: string | boolean) {
    setResourceForm((current) => ({ ...current, [field]: value }));
  }

  function updateActivityForm(field: keyof ActivityFormState, value: ActivityFormState[keyof ActivityFormState]) {
    setActivityForm((current) => ({ ...current, [field]: value }));
  }

  function updateFlagDefinitionForm(field: keyof FlagDefinitionFormState, value: string | boolean) {
    setFlagDefinitionForm((current) => ({ ...current, [field]: value }));
  }

  function updatePlantFlagForm(field: keyof PlantFlagFormState, value: string) {
    setPlantFlagForm((current) => ({ ...current, [field]: value }));
  }

  function updateBulkScheduleForm(
    field: keyof BulkScheduleFormState,
    value: string | boolean | string[],
  ) {
    setBulkScheduleForm((current) => ({ ...current, [field]: value }));
  }

  function startAddingPlant() {
    setEditingPlantId(null);
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
      await loadDashboard();
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
        taxonId: nextValues.taxonId === undefined ? selectedPlant.taxonId : nextValues.taxonId,
        locationId: nextValues.locationId === undefined ? selectedPlant.locationId : nextValues.locationId,
        careSchedules: null,
      });
      await loadDashboard();
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
      await loadDashboard();
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
      await loadDashboard();
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
      await loadDashboard();
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
      await loadDashboard();
    } catch {
      setError('Could not save the location.');
    } finally {
      setIsSaving(false);
    }
  }

  async function removeLocation(location: PlantLocation) {
    const confirmed = window.confirm(`Delete ${location.name}? Locations in use will be disabled instead.`);
    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    try {
      await deletePlantLocation(location.id);
      if (editingLocationId === location.id) {
        cancelEditingLocation();
      }
      await loadDashboard();
    } catch {
      await loadDashboard();
      setError('Could not delete the location. If it is in use, it was disabled instead.');
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
      await loadDashboard();
    } catch {
      setError('Could not save the action.');
    } finally {
      setIsSaving(false);
    }
  }

  async function removeAction(action: CareAction) {
    const confirmed = window.confirm(`Delete ${action.name}? Actions with care history will be disabled instead.`);
    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    try {
      await deleteCareAction(action.id);
      if (editingActionId === action.id) {
        cancelEditingAction();
      }
      await loadDashboard();
    } catch {
      await loadDashboard();
      setError('Could not delete the action. If it has care history, it was disabled instead.');
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
      await loadDashboard();
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
      await loadDashboard();
    } catch {
      setError('Could not delete the resource.');
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
      await loadDashboard();
    } catch {
      setError('Could not save the activity.');
    } finally {
      setIsSaving(false);
    }
  }

  async function removeActivity(activity: CareActivity) {
    const confirmed = window.confirm(`Delete ${activity.name}? Activities in use will be disabled instead.`);
    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    try {
      await deleteCareActivity(activity.id);
      if (editingActivityId === activity.id) {
        cancelEditingActivity();
      }
      await loadDashboard();
    } catch {
      await loadDashboard();
      setError('Could not delete the activity. If it is in use, it was disabled instead.');
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
      await loadDashboard();
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
      await loadDashboard();
    } catch {
      setError('Could not apply the care schedule.');
    } finally {
      setIsSaving(false);
    }
  }

  async function removeFlagDefinition(flag: PlantFlagDefinition) {
    const confirmed = window.confirm(`Delete ${flag.name}? Flags assigned to plants will be disabled instead.`);
    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    try {
      await deletePlantFlag(flag.id);
      if (editingFlagDefinitionId === flag.id) {
        cancelEditingFlagDefinition();
      }
      await loadDashboard();
    } catch {
      await loadDashboard();
      setError('Could not delete the flag. If it is assigned to plants, it was disabled instead.');
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
      await loadDashboard();
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
      await loadDashboard();
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
      await loadDashboard();
    } catch {
      setError('Could not remove the plant flag.');
    } finally {
      setIsSaving(false);
    }
  }

  async function completeTask(task: CareTask) {
    const plant = plants.find((item) => item.id === task.plantId);
    if (plant && !plantMatchesSearch(plant, plantSearch)) {
      setPlantSearch('');
    }

    setIsSaving(true);
    try {
      await completeCareTasksBulk({
        careActivityId: task.careActivityId,
        plantIds: [task.plantId],
        performedOn: getTodayInputDate(),
        notes: '',
        resources: [],
      });
      await loadDashboard();
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
      await loadDashboard();
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
          <span className="catalog-subtitle">Plant Care Supply</span>
        </div>
        <label className="search-field">
          <Search size={20} />
          <span className="sr-only">Search plants</span>
          <input
            value={plantSearch}
            type="search"
            placeholder="Search plants"
            onChange={(event) => setPlantSearch(event.target.value)}
          />
        </label>
        <div className="catalog-contact">
          <strong>{plants.length}</strong>
          <span>plants tracked</span>
        </div>
      </header>

      <div className="catalog-layout">
        <aside className="catalog-sidebar">
          <h2>Concepts</h2>
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
              <button
                type="button"
                aria-current={view === 'actions' ? 'page' : undefined}
                onClick={() => setView('actions')}
              >
                Care Actions
              </button>
            </div>

            <div className="nav-group">
              <h3>Building Blocks</h3>
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
                aria-current={view === 'resources' ? 'page' : undefined}
                onClick={() => setView('resources')}
              >
                Resources
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
            <p>{plantLocations.filter((location) => location.isEnabled).length} active locations</p>
            <p>{careActivities.filter((activity) => activity.isEnabled).length} active activities</p>
            <p>{careActions.filter((action) => action.isEnabled).length} active actions</p>
            <p>{actionResources.filter((resource) => resource.isEnabled).length} active resources</p>
            <p>{plantFlagDefinitions.filter((flag) => flag.isEnabled).length} active flags</p>
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
                visiblePlants={filteredPlants}
                onCancel={cancelEditing}
                onDelete={(plant) => void removePlant(plant)}
                onEdit={startEditingPlant}
                onFieldChange={updateForm}
                onNew={startAddingPlant}
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
                plants={filteredPlants}
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
                isLoading={isLoading}
                isSaving={isSaving}
                plants={filteredPlants}
                onFieldChange={updateBulkScheduleForm}
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
                careTasks={filteredCareTasks}
                dueCount={plantSearch.trim() ? visibleDueCount : dueCount}
                error={error}
                isLoading={isLoading}
                isPlantSearchActive={Boolean(plantSearch.trim())}
                plants={filteredPlants}
                totalPlantCount={plants.length}
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
    case 'resources':
    case 'flags':
      return 'Building Blocks';
    case 'actions':
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
    case 'actions':
      return 'Care Actions';
    case 'activities':
      return 'Care Activities';
    case 'resources':
      return 'Resources';
    case 'flags':
      return 'Plant Flags';
    default:
      return 'Plant-Man';
  }
}

function filterPlants(plants: Plant[], search: string) {
  const normalizedSearch = search.trim().toLowerCase();
  if (!normalizedSearch) {
    return plants;
  }

  return plants.filter((plant) => plantMatchesSearch(plant, normalizedSearch));
}

function filterCareTasks(tasks: CareTask[], visiblePlantIds: Set<number>, search: string) {
  const normalizedSearch = search.trim().toLowerCase();
  if (!normalizedSearch) {
    return tasks;
  }

  return tasks.filter((task) => (
    visiblePlantIds.has(task.plantId)
    || task.action.toLowerCase().includes(normalizedSearch)
    || task.plantName.toLowerCase().includes(normalizedSearch)
    || task.status.toLowerCase().includes(normalizedSearch)
  ));
}

function plantMatchesSearch(plant: Plant, search: string) {
  const normalizedSearch = search.trim().toLowerCase();
  if (!normalizedSearch) {
    return true;
  }

  return [
    plant.nickname,
    plant.taxon,
    plant.location,
    plant.status,
    plant.nextCare,
    ...plant.flags.map((flag) => flag.name),
    ...plant.careSchedules.map((schedule) => schedule.action),
  ].some((value) => value.toLowerCase().includes(normalizedSearch));
}

function getTodayInputDate() {
  return new Date().toISOString().slice(0, 10);
}
