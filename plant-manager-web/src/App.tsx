import { useState } from 'react';
import { ActionsView } from './components/ActionsView';
import { ActivitiesView } from './components/ActivitiesView';
import { FlagsView } from './components/FlagsView';
import { GroupsView } from './components/GroupsView';
import { HomeView } from './components/HomeView';
import { ImportExportView } from './components/ImportExportView';
import { LocationsView } from './components/LocationsView';
import { PlantManagementView } from './components/PlantManagementView';
import { PlantsView } from './components/PlantsView';
import { RecipesView } from './components/RecipesView';
import { ResourcesView } from './components/ResourcesView';
import { SchedulesView } from './components/SchedulesView';
import { TaxaView } from './components/TaxaView';
import { type View } from './form-state';
import { useAppActions } from './use-app-actions';
import { useAppEditors } from './use-app-editors';
import { useDashboardData } from './use-dashboard-data';

export function App() {
  const [view, setView] = useState<View>('home');
  const {
    actionResources,
    careActions,
    careActivities,
    careTasks,
    dueCount,
    error,
    isLoading,
    loadDashboard,
    loadCareModel,
    loadFlagsAndPlants,
    loadGroupsAndPlants,
    loadLocations,
    loadPlants,
    loadPlantsAndCareTasks,
    loadRecipesAndResources,
    loadTaxaAndPlants,
    plantFlagDefinitions,
    plantGroups,
    plantLocations,
    plantTaxa,
    plants,
    recipes,
    setError,
  } = useDashboardData();
  const editors = useAppEditors({
    actionResources,
    careActions,
    careActivities,
    plantFlagDefinitions,
    plantGroups,
    plantLocations,
    plantTaxa,
    plants,
    recipes,
  }, setView);
  const {
    actionForm,
    activeAction,
    activeActivity,
    activeFlagDefinition,
    activeLocation,
    activePlant,
    activePlantGroup,
    activeRecipe,
    activeResource,
    activeTaxon,
    activityForm,
    bulkScheduleForm,
    cancelEditing,
    cancelEditingAction,
    cancelEditingActivity,
    cancelEditingFlagDefinition,
    cancelEditingLocation,
    cancelEditingPlantGroup,
    cancelEditingRecipe,
    cancelEditingResource,
    cancelEditingTaxon,
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
    isTaxonEditorOpen,
    locationForm,
    openPlantDetail,
    openPlantReadOnlyDetail,
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
    selectedResource,
    selectedTaxon,
    selectManagedPlant,
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
    startAddingTaxon,
    startAddingTaxonFromPlantInfo,
    startEditingAction,
    startEditingActivity,
    startEditingFlagDefinition,
    startEditingLocation,
    startEditingPlant,
    startEditingPlantGroup,
    startEditingRecipe,
    startEditingResource,
    startEditingTaxon,
    taxonForm,
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
    updateTaxonForm,
  } = editors;
  const {
    assignFlagToSelectedPlant,
    applyCatalogImportFile,
    catalogImportResult,
    completeBulkTasks,
    completeTask,
    exportSpreadsheet,
    isExporting,
    isImportingCatalog,
    isSearchingPlantInfo,
    isSaving,
    importTaxonFromPlantInfo,
    hasSearchedPlantInfo,
    plantInfoQuery,
    plantInfoResults,
    removeAction,
    removeActivity,
    removeAssignedPlantFlag,
    removeBulkSchedule,
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
    saveTaxon,
    searchTaxonInfo,
    previewCatalogImportFile,
    setManagedPlantLocation,
    setManagedPlantTaxon,
    setPlantInfoQuery,
  } = useAppActions({
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
  });

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
              <button
                type="button"
                aria-current={view === 'import-export' ? 'page' : undefined}
                onClick={() => setView('import-export')}
              >
                Import / Export
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
            ) : view === 'import-export' ? (
              <ImportExportView
                catalogImportResult={catalogImportResult}
                error={error}
                isExporting={isExporting}
                isImportingCatalog={isImportingCatalog}
                onApplyCatalogImport={(file) => void applyCatalogImportFile(file)}
                onExport={() => void exportSpreadsheet()}
                onPreviewCatalogImport={(file) => void previewCatalogImportFile(file)}
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
                hasSearched={hasSearchedPlantInfo}
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
                onImportResult={(result) => void importTaxonFromPlantInfo(result)}
                onNew={startAddingTaxon}
                onOpenDetail={(taxon) => setSelectedTaxonId(taxon.id)}
                onPrefillResult={startAddingTaxonFromPlantInfo}
                onSave={() => void saveTaxon()}
                onSearch={(query) => void searchTaxonInfo(query)}
                onSearchQueryChange={setPlantInfoQuery}
                plantInfoResults={plantInfoResults}
                searchQuery={plantInfoQuery}
                isSearching={isSearchingPlantInfo}
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
    case 'import-export':
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
    case 'import-export':
      return 'Import / Export';
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
