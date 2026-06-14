import { useState } from 'react';
import { ActionsView } from './components/ActionsView';
import { ActivitiesView } from './components/ActivitiesView';
import { CareView } from './components/CareView';
import { CareHistoryView } from './components/CareHistoryView';
import { FlagsView } from './components/FlagsView';
import { GroupsView } from './components/GroupsView';
import { HomeView } from './components/HomeView';
import { ImportExportView } from './components/ImportExportView';
import { LocationsView } from './components/LocationsView';
import { PlantManagementView } from './components/PlantManagementView';
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
    careHistory,
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
    plantCareSchedules,
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
    cancelEditingSchedule,
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
    startEditingAction,
    startEditingActivity,
    startEditingFlagDefinition,
    startEditingLocation,
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
  } = editors;
  const {
    assignFlagToSelectedPlant,
    applyCatalogImportFile,
    catalogImportResult,
    completeBulkTasks,
    completeTask,
    dismissCare,
    exportSpreadsheet,
    isExporting,
    isImportingCatalog,
    isSearchingPlantInfo,
    isSaving,
    logCare,
    importTaxonFromPlantInfo,
    hasSearchedPlantInfo,
    plantInfoQuery,
    plantInfoResults,
    removeAction,
    removeActivity,
    removeAssignedPlantFlag,
    removeCareHistoryEvent,
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
    snoozeCare,
    updateCareHistoryEvent,
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
                aria-current={view === 'care' ? 'page' : undefined}
                onClick={() => setView('care')}
              >
                Care
              </button>
              <button
                type="button"
                aria-current={view === 'care-history' ? 'page' : undefined}
                onClick={() => setView('care-history')}
              >
                Care History
              </button>
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
                Taxa
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
                Flags
              </button>
            </div>
          </nav>

          <section className="catalog-help" aria-label="Catalog status">
            <h3>Catalog Status</h3>
            <p>{dueCount} due</p>
            <p>{plantTaxa.length} taxa</p>
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
          <main className="content">
            {view === 'plant-management' ? (
              <PlantManagementView
                activePlantName={activePlant?.nickname}
                error={error}
                form={form}
                isPlantEditorOpen={isPlantEditorOpen}
                isLoading={isLoading}
                isSaving={isSaving}
                plantFlagDefinitions={plantFlagDefinitions}
                plantFlagForm={plantFlagForm}
                plantLocations={plantLocations}
                plantTaxa={plantTaxa}
                plants={plants}
                selectedPlant={selectedPlant}
                onAssignFlag={() => void assignFlagToSelectedPlant()}
                onCancelPlant={cancelEditing}
                onDeletePlant={(plant) => void removePlant(plant)}
                onFieldChange={updatePlantFlagForm}
                onNewPlant={startAddingPlant}
                onPlantFieldChange={updateForm}
                onRemoveFlag={(flag) => void removeAssignedPlantFlag(flag)}
                onResolveFlag={(flag) => void resolveAssignedPlantFlag(flag)}
                onSavePlant={() => void savePlant()}
                onSelectPlant={selectManagedPlant}
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
                editingScheduleId={editingScheduleId}
                isLoading={isLoading}
                isSaving={isSaving}
                plants={plants}
                schedules={plantCareSchedules}
                onCancel={cancelEditingSchedule}
                onDelete={removeSchedule}
                onEdit={startEditingSchedule}
                onFieldChange={updateBulkScheduleForm}
                onNew={startNewSchedule}
                onSave={() => void saveBulkSchedule()}
              />
            ) : view === 'care' ? (
              <CareView
                activities={careActivities}
                careTasks={careTasks}
                error={error}
                isLoading={isLoading}
                isSaving={isSaving}
                plants={plants}
                onDismissCare={(payload) => void dismissCare(payload)}
                onLogCare={(payload, requireDueSchedule) => void logCare(payload, requireDueSchedule)}
                onSnoozeCare={(payload) => void snoozeCare(payload)}
              />
            ) : view === 'care-history' ? (
              <CareHistoryView
                activities={careActivities}
                events={careHistory}
                error={error}
                isLoading={isLoading}
                isSaving={isSaving}
                plants={plants}
                onDelete={(event) => void removeCareHistoryEvent(event)}
                onUpdate={(event, payload) => void updateCareHistoryEvent(event, payload)}
              />
            ) : view === 'taxa' ? (
              <TaxaView
                error={error}
                hasSearched={hasSearchedPlantInfo}
                isLoading={isLoading}
                isSaving={isSaving}
                selectedTaxon={selectedTaxon}
                taxa={plantTaxa}
                onCloseDetail={() => setSelectedTaxonId(null)}
                onDelete={(taxon) => void removeTaxon(taxon)}
                onImportResult={(result) => void importTaxonFromPlantInfo(result)}
                onOpenDetail={(taxon) => setSelectedTaxonId(taxon.id)}
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
                error={error}
                isLoading={isLoading}
                plants={plants}
                onOpenCare={() => setView('care')}
                onOpenPlants={() => setView('plant-management')}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
