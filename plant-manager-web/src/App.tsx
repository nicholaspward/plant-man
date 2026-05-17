import { BookOpen, Home, ListChecks, Package, Search, Sprout } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  createActionResource,
  createCareAction,
  createPlant,
  createPlantTaxon,
  deleteActionResource,
  deleteCareAction,
  deletePlant,
  deletePlantTaxon,
  getActionLogs,
  getActionResources,
  getCareActions,
  getCareTasks,
  getPlants,
  getPlantTaxa,
  logCare,
  updateActionResource,
  updateCareAction,
  updatePlant,
  updatePlantTaxon,
} from './api';
import { ActionsView } from './components/ActionsView';
import { HomeView } from './components/HomeView';
import { PlantsView } from './components/PlantsView';
import { ResourcesView } from './components/ResourcesView';
import { TaxaView } from './components/TaxaView';
import type { ActionLog, ActionResource, CareAction, CareTask, Plant, PlantTaxon } from './domain';
import {
  emptyActionForm,
  emptyCareLogForm,
  emptyPlantForm,
  emptyResourceForm,
  emptyTaxonForm,
  formatTaxon,
  toActionForm,
  toActionPayload,
  toPlantForm,
  toPlantPayload,
  toResourceForm,
  toResourcePayload,
  toTaxonForm,
  toTaxonPayload,
  type ActionFormState,
  type CareLogFormState,
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
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]);
  const [careTasks, setCareTasks] = useState<CareTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingPlantId, setEditingPlantId] = useState<number | null>(null);
  const [editingTaxonId, setEditingTaxonId] = useState<number | null>(null);
  const [editingActionId, setEditingActionId] = useState<number | null>(null);
  const [editingResourceId, setEditingResourceId] = useState<number | null>(null);
  const [form, setForm] = useState<PlantFormState>(emptyPlantForm);
  const [taxonForm, setTaxonForm] = useState<TaxonFormState>(emptyTaxonForm);
  const [actionForm, setActionForm] = useState<ActionFormState>(emptyActionForm);
  const [resourceForm, setResourceForm] = useState<ResourceFormState>(emptyResourceForm);
  const [careLogForm, setCareLogForm] = useState<CareLogFormState>(emptyCareLogForm);
  const [plantTaxonSearch, setPlantTaxonSearch] = useState('');
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
        logsResponse,
      ] = await Promise.all([
        getPlants(),
        getCareTasks(),
        getPlantTaxa(),
        getCareActions(),
        getActionResources(),
        getActionLogs(),
      ]);

      setError(null);
      setPlants(plantsResponse);
      setCareTasks(tasksResponse);
      setPlantTaxa(taxaResponse);
      setCareActions(actionsResponse);
      setActionResources(resourcesResponse);
      setActionLogs(logsResponse);
    } catch {
      setError('Could not reach the Plant-Man API. Start the backend and refresh.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  const dueCount = useMemo(
    () => careTasks.filter((task) => task.status === 'due').length,
    [careTasks],
  );

  const activePlant = plants.find((plant) => plant.id === editingPlantId);
  const activeTaxon = plantTaxa.find((taxon) => taxon.id === editingTaxonId);
  const activeAction = careActions.find((action) => action.id === editingActionId);
  const activeResource = actionResources.find((resource) => resource.id === editingResourceId);

  function updateForm(field: keyof PlantFormState, value: string) {
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

  function updateCareLogForm(field: keyof CareLogFormState, value: string) {
    setCareLogForm((current) => ({ ...current, [field]: value }));
  }

  function updateQuickTaxonForm(field: keyof TaxonFormState, value: string) {
    setQuickTaxonForm((current) => ({ ...current, [field]: value }));
  }

  function startAddingPlant() {
    setEditingPlantId(null);
    setForm(emptyPlantForm);
    setPlantTaxonSearch('');
    setQuickTaxonForm(emptyTaxonForm);
    setView('plants');
  }

  function startEditingPlant(plant: Plant) {
    const taxon = plantTaxa.find((item) => item.id === plant.taxonId);
    setEditingPlantId(plant.id);
    setForm(toPlantForm(plant));
    setPlantTaxonSearch(taxon ? formatTaxon(taxon) : plant.taxon);
    setQuickTaxonForm(emptyTaxonForm);
    setView('plants');
  }

  function cancelEditing() {
    setEditingPlantId(null);
    setForm(emptyPlantForm);
    setPlantTaxonSearch('');
    setQuickTaxonForm(emptyTaxonForm);
  }

  function selectPlantTaxon(taxon: PlantTaxon) {
    setForm((current) => ({
      ...current,
      nickname: current.nickname.trim() ? current.nickname : taxon.name,
      taxonId: String(taxon.id),
    }));
    setPlantTaxonSearch(formatTaxon(taxon));
  }

  function startAddingTaxon() {
    setEditingTaxonId(null);
    setTaxonForm(emptyTaxonForm);
    setView('taxa');
  }

  function startEditingTaxon(taxon: PlantTaxon) {
    setEditingTaxonId(taxon.id);
    setTaxonForm(toTaxonForm(taxon));
    setView('taxa');
  }

  function cancelEditingTaxon() {
    setEditingTaxonId(null);
    setTaxonForm(emptyTaxonForm);
  }

  function startAddingAction() {
    setEditingActionId(null);
    setActionForm(emptyActionForm);
    setView('actions');
  }

  function startEditingAction(action: CareAction) {
    setEditingActionId(action.id);
    setActionForm(toActionForm(action));
    setView('actions');
  }

  function cancelEditingAction() {
    setEditingActionId(null);
    setActionForm(emptyActionForm);
  }

  function startAddingResource() {
    setEditingResourceId(null);
    setResourceForm(emptyResourceForm);
    setView('resources');
  }

  function startEditingResource(resource: ActionResource) {
    setEditingResourceId(resource.id);
    setResourceForm(toResourceForm(resource));
    setView('resources');
  }

  function cancelEditingResource() {
    setEditingResourceId(null);
    setResourceForm(emptyResourceForm);
  }

  function startLoggingCare(plant?: Plant) {
    const enabledAction = careActions.find((action) => action.isEnabled);
    setCareLogForm((current) => ({
      ...current,
      plantId: plant ? String(plant.id) : current.plantId,
      action: current.action || enabledAction?.name || 'Water',
    }));
    setView('plants');
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

  async function completeTask(task: CareTask) {
    await logCare({
      plantId: task.plantId,
      action: task.action,
      notes: null,
      performedOn: null,
    });
    await loadDashboard();
  }

  async function saveCareLog() {
    if (!careLogForm.plantId || !careLogForm.action.trim()) {
      setError('Plant and action are required to log care.');
      return;
    }

    setIsSaving(true);
    try {
      await logCare({
        plantId: Number(careLogForm.plantId),
        action: careLogForm.action.trim(),
        notes: careLogForm.notes.trim() || null,
        performedOn: careLogForm.performedOn || null,
      });
      setCareLogForm(emptyCareLogForm);
      await loadDashboard();
    } catch {
      setError('Could not log care.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div>
          <p className="eyebrow">{getViewEyebrow(view)}</p>
          <h1>{getViewTitle(view)}</h1>
        </div>
        <button className="icon-button" type="button" aria-label="Search plants">
          <Search size={20} />
        </button>
      </header>

      <main className="content">
        {view === 'plants' ? (
          <PlantsView
            activePlantName={activePlant?.nickname}
            actionLogs={actionLogs}
            careActions={careActions}
            careLogForm={careLogForm}
            error={error}
            form={form}
            isLoading={isLoading}
            isSaving={isSaving}
            plantTaxa={plantTaxa}
            plants={plants}
            onCancel={cancelEditing}
            onDelete={(plant) => void removePlant(plant)}
            onEdit={startEditingPlant}
            onLogCare={() => void saveCareLog()}
            onLogCareFieldChange={updateCareLogForm}
            onFieldChange={updateForm}
            onNew={startAddingPlant}
            onQuickTaxonFieldChange={updateQuickTaxonForm}
            onSave={() => void savePlant()}
            onSaveQuickTaxon={() => void createAndSelectPlantTaxon()}
            onSelectTaxon={selectPlantTaxon}
            onStartLogCare={startLoggingCare}
            onTaxonSearchChange={setPlantTaxonSearch}
            quickTaxonForm={quickTaxonForm}
            taxonSearch={plantTaxonSearch}
            isCreatingTaxon={isCreatingPlantTaxon}
          />
        ) : view === 'taxa' ? (
          <TaxaView
            activeTaxonName={activeTaxon?.name}
            error={error}
            form={taxonForm}
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
        ) : (
          <HomeView
            careTasks={careTasks}
            dueCount={dueCount}
            error={error}
            isLoading={isLoading}
            plants={plants}
            onCompleteTask={(task) => void completeTask(task)}
            onNewPlant={startAddingPlant}
          />
        )}
      </main>

      <nav className="bottom-nav" aria-label="Primary navigation">
        <button
          type="button"
          aria-current={view === 'home' ? 'page' : undefined}
          onClick={() => setView('home')}
        >
          <Home size={19} />
          Home
        </button>
        <button
          type="button"
          aria-current={view === 'plants' ? 'page' : undefined}
          onClick={() => setView('plants')}
        >
          <Sprout size={19} />
          Plants
        </button>
        <button
          type="button"
          aria-current={view === 'taxa' ? 'page' : undefined}
          onClick={() => setView('taxa')}
        >
          <BookOpen size={19} />
          Taxa
        </button>
        <button
          type="button"
          aria-current={view === 'actions' ? 'page' : undefined}
          onClick={() => setView('actions')}
        >
          <ListChecks size={19} />
          Actions
        </button>
        <button
          type="button"
          aria-current={view === 'resources' ? 'page' : undefined}
          onClick={() => setView('resources')}
        >
          <Package size={19} />
          Resources
        </button>
      </nav>
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
    default:
      return 'Plant-Man';
  }
}
