import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  createActionResource,
  createCareAction,
  createPlant,
  assignPlantFlag,
  createPlantFlag,
  createPlantTaxon,
  deleteActionResource,
  deleteCareAction,
  deletePlant,
  deletePlantFlag,
  deletePlantTaxon,
  getActionResources,
  getCareActions,
  getCareTasks,
  getPlants,
  getPlantFlags,
  getPlantTaxa,
  logCare,
  removePlantFlagAssignment,
  resolvePlantFlag,
  updateActionLog,
  updateActionResource,
  updateCareAction,
  updatePlant,
  updatePlantFlag,
  updatePlantTaxon,
} from './api';
import { ActionsView } from './components/ActionsView';
import { FlagsView } from './components/FlagsView';
import { HomeView } from './components/HomeView';
import { PlantsView } from './components/PlantsView';
import { ResourcesView } from './components/ResourcesView';
import { TaxaView } from './components/TaxaView';
import type { ActionResource, CareAction, CareTask, Plant, PlantFlag, PlantFlagDefinition, PlantTaxon } from './domain';
import {
  emptyActionForm,
  emptyCareLogForm,
  emptyFlagDefinitionForm,
  emptyPlantForm,
  emptyPlantFlagForm,
  emptyResourceForm,
  emptyTaxonForm,
  toActionForm,
  toActionPayload,
  toFlagDefinitionForm,
  toFlagDefinitionPayload,
  toPlantFlagPayload,
  toPlantForm,
  toPlantPayload,
  toResourceForm,
  toResourcePayload,
  toTaxonForm,
  toTaxonPayload,
  type ActionFormState,
  type CareLogResourceFormState,
  type CareLogFormState,
  type FlagDefinitionFormState,
  type PlantCareScheduleFormState,
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
  const [careActions, setCareActions] = useState<CareAction[]>([]);
  const [actionResources, setActionResources] = useState<ActionResource[]>([]);
  const [plantFlagDefinitions, setPlantFlagDefinitions] = useState<PlantFlagDefinition[]>([]);
  const [careTasks, setCareTasks] = useState<CareTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingPlantId, setEditingPlantId] = useState<number | null>(null);
  const [editingTaxonId, setEditingTaxonId] = useState<number | null>(null);
  const [editingActionId, setEditingActionId] = useState<number | null>(null);
  const [editingResourceId, setEditingResourceId] = useState<number | null>(null);
  const [editingFlagDefinitionId, setEditingFlagDefinitionId] = useState<number | null>(null);
  const [editingActionLogId, setEditingActionLogId] = useState<number | null>(null);
  const [isPlantEditorOpen, setIsPlantEditorOpen] = useState(false);
  const [isCareLogEditorOpen, setIsCareLogEditorOpen] = useState(false);
  const [isTaxonEditorOpen, setIsTaxonEditorOpen] = useState(false);
  const [isActionEditorOpen, setIsActionEditorOpen] = useState(false);
  const [isResourceEditorOpen, setIsResourceEditorOpen] = useState(false);
  const [isFlagDefinitionEditorOpen, setIsFlagDefinitionEditorOpen] = useState(false);
  const [selectedPlantId, setSelectedPlantId] = useState<number | null>(null);
  const [form, setForm] = useState<PlantFormState>(emptyPlantForm);
  const [taxonForm, setTaxonForm] = useState<TaxonFormState>(emptyTaxonForm);
  const [actionForm, setActionForm] = useState<ActionFormState>(emptyActionForm);
  const [resourceForm, setResourceForm] = useState<ResourceFormState>(emptyResourceForm);
  const [flagDefinitionForm, setFlagDefinitionForm] = useState<FlagDefinitionFormState>(emptyFlagDefinitionForm);
  const [plantFlagForm, setPlantFlagForm] = useState<PlantFlagFormState>(emptyPlantFlagForm);
  const [careLogForm, setCareLogForm] = useState<CareLogFormState>(emptyCareLogForm);
  const [plantSearch, setPlantSearch] = useState('');
  const [quickTaxonForm, setQuickTaxonForm] = useState<TaxonFormState>(emptyTaxonForm);
  const [isCreatingPlantTaxon, setIsCreatingPlantTaxon] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadDashboard() {
    try {
      const [
        plantsResponse,
        tasksResponse,
        taxaResponse,
        actionsResponse,
        resourcesResponse,
        flagsResponse,
      ] = await Promise.all([
        getPlants(),
        getCareTasks(),
        getPlantTaxa(),
        getCareActions(),
        getActionResources(),
        getPlantFlags(),
      ]);

      setError(null);
      setPlants(plantsResponse);
      setCareTasks(tasksResponse);
      setPlantTaxa(taxaResponse);
      setCareActions(actionsResponse);
      setActionResources(resourcesResponse);
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
  const activeAction = careActions.find((action) => action.id === editingActionId);
  const activeResource = actionResources.find((resource) => resource.id === editingResourceId);
  const activeFlagDefinition = plantFlagDefinitions.find((flag) => flag.id === editingFlagDefinitionId);

  function updateForm(field: keyof PlantFormState, value: string | PlantCareScheduleFormState[]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateTaxonForm(field: keyof TaxonFormState, value: string) {
    setTaxonForm((current) => ({ ...current, [field]: value }));
  }

  function updateActionForm(field: keyof ActionFormState, value: string | boolean) {
    setActionForm((current) => ({ ...current, [field]: value }));
  }

  function updateResourceForm(field: keyof ResourceFormState, value: string | boolean) {
    setResourceForm((current) => ({ ...current, [field]: value }));
  }

  function updateFlagDefinitionForm(field: keyof FlagDefinitionFormState, value: string | boolean) {
    setFlagDefinitionForm((current) => ({ ...current, [field]: value }));
  }

  function updatePlantFlagForm(field: keyof PlantFlagFormState, value: string) {
    setPlantFlagForm((current) => ({ ...current, [field]: value }));
  }

  function updateCareLogForm(
    field: keyof CareLogFormState,
    value: string | CareLogResourceFormState[],
  ) {
    setCareLogForm((current) => ({ ...current, [field]: value }));
  }

  function updateQuickTaxonForm(field: keyof TaxonFormState, value: string) {
    setQuickTaxonForm((current) => ({ ...current, [field]: value }));
  }

  function startAddingPlant() {
    setEditingPlantId(null);
    setForm({
      ...emptyPlantForm,
      careSchedules: getDefaultPlantCareSchedules(careActions),
    });
    setQuickTaxonForm(emptyTaxonForm);
    setIsPlantEditorOpen(true);
    setIsCareLogEditorOpen(false);
    setView('plants');
  }

  function openPlantDetail(plant: Plant) {
    setSelectedPlantId(plant.id);
    setView('plants');
  }

  function closePlantDetail() {
    setSelectedPlantId(null);
  }

  function startEditingPlant(plant: Plant) {
    setSelectedPlantId(plant.id);
    setEditingPlantId(plant.id);
    setForm(toPlantForm(plant));
    setQuickTaxonForm(emptyTaxonForm);
    setIsPlantEditorOpen(true);
    setIsCareLogEditorOpen(false);
    setView('plants');
  }

  function cancelEditing() {
    setEditingPlantId(null);
    setForm(emptyPlantForm);
    setQuickTaxonForm(emptyTaxonForm);
    setIsPlantEditorOpen(false);
  }

  function selectPlantTaxon(taxon: PlantTaxon) {
    setForm((current) => ({
      ...current,
      nickname: current.nickname.trim() ? current.nickname : taxon.name,
      taxonId: String(taxon.id),
    }));
  }

  function startAddingTaxon() {
    setEditingTaxonId(null);
    setTaxonForm(emptyTaxonForm);
    setIsTaxonEditorOpen(true);
    setView('taxa');
  }

  function startEditingTaxon(taxon: PlantTaxon) {
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

  function startAddingAction() {
    setEditingActionId(null);
    setActionForm(emptyActionForm);
    setIsActionEditorOpen(true);
    setView('actions');
  }

  function startEditingAction(action: CareAction) {
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
    setResourceForm(emptyResourceForm);
    setIsResourceEditorOpen(true);
    setView('resources');
  }

  function startEditingResource(resource: ActionResource) {
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

  function startAddingFlagDefinition() {
    setEditingFlagDefinitionId(null);
    setFlagDefinitionForm(emptyFlagDefinitionForm);
    setIsFlagDefinitionEditorOpen(true);
    setView('flags');
  }

  function startEditingFlagDefinition(flag: PlantFlagDefinition) {
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

  function startLoggingCare(plant?: Plant) {
    const enabledAction = careActions.find((action) => action.isEnabled);
    if (plant) {
      setSelectedPlantId(plant.id);
    }
    setEditingActionLogId(null);
    setCareLogForm((current) => ({
      ...current,
      plantId: plant ? String(plant.id) : current.plantId,
      careActionId: current.careActionId || (enabledAction ? String(enabledAction.id) : ''),
    }));
    setIsCareLogEditorOpen(true);
    setIsPlantEditorOpen(false);
    setView('plants');
  }

  function cancelCareLog() {
    setEditingActionLogId(null);
    setCareLogForm(emptyCareLogForm);
    setIsCareLogEditorOpen(false);
  }

  async function savePlant() {
    if (!form.nickname.trim() || !form.taxonId) {
      setError('Nickname and taxon are required.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = toPlantPayload(form);
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

  async function createAndSelectPlantTaxon() {
    if (!quickTaxonForm.name.trim() || !quickTaxonForm.genus.trim() || !quickTaxonForm.species.trim()) {
      setError('Name, genus, and species are required for a new taxon.');
      return;
    }

    setIsCreatingPlantTaxon(true);
    try {
      const taxon = await createPlantTaxon(toTaxonPayload(quickTaxonForm));
      selectPlantTaxon(taxon);
      setQuickTaxonForm(emptyTaxonForm);
      await loadDashboard();
    } catch {
      setError('Could not create the taxon.');
    } finally {
      setIsCreatingPlantTaxon(false);
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
      setError('Could not assign the plant flag.');
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

  function completeTask(task: CareTask) {
    const plant = plants.find((item) => item.id === task.plantId);
    setEditingActionLogId(null);
    setSelectedPlantId(task.plantId);
    setCareLogForm({
      plantId: String(task.plantId),
      careActionId: String(task.careActionId),
      performedOn: getTodayInputDate(),
      notes: '',
      resources: [],
    });
    setIsCareLogEditorOpen(true);
    setIsPlantEditorOpen(false);
    if (plant && !plantMatchesSearch(plant, plantSearch)) {
      setPlantSearch('');
    }
    setView('plants');
  }

  async function saveCareLog() {
    if (!careLogForm.plantId || !careLogForm.careActionId) {
      setError('Plant and action are required to log care.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        plantId: Number(careLogForm.plantId),
        careActionId: Number(careLogForm.careActionId),
        notes: careLogForm.notes.trim() || null,
        performedOn: careLogForm.performedOn || null,
        resources: careLogForm.resources.map((resource) => ({
          actionResourceId: Number(resource.actionResourceId),
          quantity: resource.quantity.trim() ? Number(resource.quantity) : null,
          unit: resource.unit.trim() || null,
        })),
      };

      if (editingActionLogId === null) {
        await logCare(payload);
      } else {
        await updateActionLog(editingActionLogId, payload);
      }

      cancelCareLog();
      await loadDashboard();
    } catch {
      setError('Could not log care.');
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
          <h2>Choose a Category</h2>
          <nav className="catalog-nav" aria-label="Primary navigation">
            <button
              type="button"
              aria-current={view === 'home' ? 'page' : undefined}
              onClick={() => setView('home')}
            >
              Care Queue
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
              aria-current={view === 'taxa' ? 'page' : undefined}
              onClick={() => setView('taxa')}
            >
              Plant Taxa
            </button>
            <button
              type="button"
              aria-current={view === 'actions' ? 'page' : undefined}
              onClick={() => setView('actions')}
            >
              Care Actions
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
          </nav>

          <section className="catalog-help" aria-label="Catalog status">
            <h3>Catalog Status</h3>
            <p>{dueCount} due</p>
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
                actionResources={actionResources}
                careActions={careActions}
                careTasks={filteredCareTasks}
                careLogForm={careLogForm}
                editingActionLogId={editingActionLogId}
                error={error}
                form={form}
                isCareLogEditorOpen={isCareLogEditorOpen}
                isLoading={isLoading}
                isPlantEditorOpen={isPlantEditorOpen}
                isSaving={isSaving}
                plantFlagDefinitions={plantFlagDefinitions}
                plantFlagForm={plantFlagForm}
                plantTaxa={plantTaxa}
                plants={plants}
                selectedPlant={selectedPlant}
                visiblePlants={filteredPlants}
                onCancel={cancelEditing}
                onCancelCareLog={cancelCareLog}
                onClosePlantDetail={closePlantDetail}
                onDelete={(plant) => void removePlant(plant)}
                onEdit={startEditingPlant}
                onCompleteTask={completeTask}
                onLogCare={() => void saveCareLog()}
                onLogCareFieldChange={updateCareLogForm}
                onFieldChange={updateForm}
                onNew={startAddingPlant}
                onOpenDetail={openPlantDetail}
                onQuickTaxonFieldChange={updateQuickTaxonForm}
                onPlantFlagFieldChange={updatePlantFlagForm}
                onAssignFlag={() => void assignFlagToSelectedPlant()}
                onResolveFlag={(flag) => void resolveAssignedPlantFlag(flag)}
                onRemoveFlag={(flag) => void removeAssignedPlantFlag(flag)}
                onSave={() => void savePlant()}
                onSaveQuickTaxon={() => void createAndSelectPlantTaxon()}
                onSelectTaxon={selectPlantTaxon}
                onStartLogCare={startLoggingCare}
                quickTaxonForm={quickTaxonForm}
                isCreatingTaxon={isCreatingPlantTaxon}
              />
            ) : view === 'taxa' ? (
              <TaxaView
                activeTaxonName={activeTaxon?.name}
                error={error}
                form={taxonForm}
                isEditorOpen={isTaxonEditorOpen}
                isLoading={isLoading}
                isSaving={isSaving}
                taxa={plantTaxa}
                onCancel={cancelEditingTaxon}
                onDelete={(taxon) => void removeTaxon(taxon)}
                onEdit={startEditingTaxon}
                onFieldChange={updateTaxonForm}
                onNew={startAddingTaxon}
                onSave={() => void saveTaxon()}
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
                onCancel={cancelEditingAction}
                onDelete={(action) => void removeAction(action)}
                onEdit={startEditingAction}
                onFieldChange={updateActionForm}
                onNew={startAddingAction}
                onSave={() => void saveAction()}
              />
            ) : view === 'resources' ? (
              <ResourcesView
                activeResourceName={activeResource?.name}
                error={error}
                form={resourceForm}
                isEditorOpen={isResourceEditorOpen}
                isLoading={isLoading}
                isSaving={isSaving}
                onCancel={cancelEditingResource}
                onDelete={(resource) => void removeResource(resource)}
                onEdit={startEditingResource}
                onFieldChange={updateResourceForm}
                onNew={startAddingResource}
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
                onCancel={cancelEditingFlagDefinition}
                onDelete={(flag) => void removeFlagDefinition(flag)}
                onEdit={startEditingFlagDefinition}
                onFieldChange={updateFlagDefinitionForm}
                onNew={startAddingFlagDefinition}
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
                onCompleteTask={completeTask}
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
    case 'plants':
      return 'Collection';
    case 'taxa':
      return 'Reference';
    case 'actions':
    case 'resources':
    case 'flags':
      return 'Care setup';
    default:
      return 'Today';
  }
}

function getViewTitle(view: View) {
  switch (view) {
    case 'plants':
      return 'Plants';
    case 'taxa':
      return 'Plant Taxa';
    case 'actions':
      return 'Care Actions';
    case 'resources':
      return 'Resources';
    case 'flags':
      return 'Plant Flags';
    default:
      return 'Plant-Man';
  }
}

function getDefaultPlantCareSchedules(careActions: CareAction[]): PlantCareScheduleFormState[] {
  const waterAction = careActions.find(
    (action) => action.isEnabled && action.name.toLowerCase() === 'water',
  );

  return waterAction
    ? [{
        careActionId: String(waterAction.id),
        everyDays: '7',
        isEnabled: true,
      }]
    : [];
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
    ...plant.flags.map((flag) => flag.category),
    ...plant.careSchedules.map((schedule) => schedule.action),
  ].some((value) => value.toLowerCase().includes(normalizedSearch));
}

function getTodayInputDate() {
  return new Date().toISOString().slice(0, 10);
}
