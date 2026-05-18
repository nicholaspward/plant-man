import {
  CalendarClock,
  ClipboardCheck,
  Edit3,
  Eye,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import type {
  ActionResource,
  CareAction,
  CareStatus,
  CareTask,
  Plant,
  PlantFlag,
  PlantFlagDefinition,
  PlantTaxon,
} from '../domain';
import type {
  CareLogFormState,
  CareLogResourceFormState,
  PlantCareScheduleFormState,
  PlantFlagFormState,
  PlantFormState,
  TaxonFormState,
} from '../form-state';
import { formatTaxon } from '../form-state';

type PlantsViewProps = {
  activePlantName?: string;
  actionResources: ActionResource[];
  careActions: CareAction[];
  careTasks: CareTask[];
  careLogForm: CareLogFormState;
  editingActionLogId: number | null;
  error: string | null;
  form: PlantFormState;
  isCareLogEditorOpen: boolean;
  isLoading: boolean;
  isPlantEditorOpen: boolean;
  isSaving: boolean;
  plantFlagDefinitions: PlantFlagDefinition[];
  plantFlagForm: PlantFlagFormState;
  plantTaxa: PlantTaxon[];
  plants: Plant[];
  selectedPlant?: Plant;
  visiblePlants: Plant[];
  onCancel: () => void;
  onCancelCareLog: () => void;
  onClosePlantDetail: () => void;
  onCompleteTask: (task: CareTask) => void;
  onDelete: (plant: Plant) => void;
  onEdit: (plant: Plant) => void;
  onFieldChange: (field: keyof PlantFormState, value: string | PlantCareScheduleFormState[]) => void;
  onLogCare: () => void;
  onLogCareFieldChange: (
    field: keyof CareLogFormState,
    value: string | CareLogResourceFormState[],
  ) => void;
  onNew: () => void;
  onOpenDetail: (plant: Plant) => void;
  onQuickTaxonFieldChange: (field: keyof TaxonFormState, value: string) => void;
  onPlantFlagFieldChange: (field: keyof PlantFlagFormState, value: string) => void;
  onAssignFlag: () => void;
  onResolveFlag: (flag: PlantFlag) => void;
  onRemoveFlag: (flag: PlantFlag) => void;
  onSave: () => void;
  onSaveQuickTaxon: () => void;
  onSelectTaxon: (taxon: PlantTaxon) => void;
  onStartLogCare: (plant?: Plant) => void;
  quickTaxonForm: TaxonFormState;
  isCreatingTaxon: boolean;
};

export function PlantsView({
  activePlantName,
  actionResources,
  careActions,
  careTasks,
  careLogForm,
  editingActionLogId,
  error,
  form,
  isCareLogEditorOpen,
  isLoading,
  isPlantEditorOpen,
  isSaving,
  plantFlagDefinitions,
  plantFlagForm,
  plantTaxa,
  plants,
  selectedPlant,
  visiblePlants,
  onCancel,
  onCancelCareLog,
  onClosePlantDetail,
  onCompleteTask,
  onDelete,
  onEdit,
  onFieldChange,
  onLogCare,
  onLogCareFieldChange,
  onNew,
  onOpenDetail,
  onQuickTaxonFieldChange,
  onPlantFlagFieldChange,
  onAssignFlag,
  onResolveFlag,
  onRemoveFlag,
  onSave,
  onSaveQuickTaxon,
  onSelectTaxon,
  onStartLogCare,
  quickTaxonForm,
  isCreatingTaxon,
}: PlantsViewProps) {
  const enabledCareActions = careActions.filter((action) => action.isEnabled);
  const enabledActionResources = actionResources.filter((resource) => resource.isEnabled);
  const selectedPlantTasks = selectedPlant
    ? careTasks.filter((task) => task.plantId === selectedPlant.id)
    : [];
  const selectedPlantTaxon = selectedPlant
    ? plantTaxa.find((taxon) => taxon.id === selectedPlant.taxonId)
    : undefined;
  const selectedPlantSchedules =
    selectedPlant?.careSchedules.filter((schedule) => schedule.isEnabled) ?? [];
  const enabledFlagDefinitions = plantFlagDefinitions.filter((flag) => flag.isEnabled);
  const selectedPlantActiveFlags = selectedPlant?.flags.filter((flag) => flag.resolvedOn === null) ?? [];
  const selectedPlantResolvedFlags = selectedPlant?.flags.filter((flag) => flag.resolvedOn !== null) ?? [];

  return (
    <>
      <section className="summary-panel" aria-labelledby="plants-summary-heading">
        <div>
          <p className="eyebrow">Plant inventory</p>
          <h2 id="plants-summary-heading">
            {isLoading ? 'Loading plants' : `${plants.length} plants tracked`}
          </h2>
          <p>{error ?? 'Add, update, or remove plants from your collection.'}</p>
        </div>
        <div className="row-actions">
          <button className="small-action" type="button" onClick={() => onStartLogCare()}>
            <ClipboardCheck size={16} />
            Log care
          </button>
          <button className="primary-action" type="button" onClick={onNew}>
            <Plus size={18} />
            New plant
          </button>
        </div>
      </section>

      {selectedPlant ? (
        <section className="editor-panel plant-detail-panel" aria-labelledby="plant-detail-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Plant focus</p>
              <h2 id="plant-detail-heading">{selectedPlant.nickname}</h2>
            </div>
            <div className="row-actions">
              <button
                className="icon-button compact"
                type="button"
                aria-label={`Log care for ${selectedPlant.nickname}`}
                onClick={() => onStartLogCare(selectedPlant)}
              >
                <ClipboardCheck size={17} />
              </button>
              <button
                className="icon-button compact"
                type="button"
                aria-label={`Edit ${selectedPlant.nickname}`}
                onClick={() => onEdit(selectedPlant)}
              >
                <Edit3 size={17} />
              </button>
              <button
                className="icon-button compact"
                type="button"
                aria-label="Close plant detail"
                onClick={onClosePlantDetail}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="plant-detail-meta">
            <div>
              <span>Taxon</span>
              <strong>{selectedPlantTaxon ? formatTaxon(selectedPlantTaxon) : selectedPlant.taxon}</strong>
            </div>
            <div>
              <span>Location</span>
              <strong>{selectedPlant.location || 'No location'}</strong>
            </div>
            <div>
              <span>Next care</span>
              <strong>{selectedPlant.nextCare}</strong>
            </div>
            <div>
              <span>Active flags</span>
              {selectedPlantActiveFlags.length === 0 ? (
                <strong>None</strong>
              ) : (
                <div className="flag-list compact">
                  {selectedPlantActiveFlags.map((flag) => (
                    <span className="flag-chip" key={flag.id} style={{ backgroundColor: flag.color }}>
                      {flag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="plant-detail-grid">
            <section className="detail-section" aria-labelledby="plant-detail-schedules">
              <div className="detail-section-heading">
                <CalendarClock size={17} />
                <h3 id="plant-detail-schedules">Schedules</h3>
              </div>
              {selectedPlantSchedules.length === 0 ? (
                <p className="empty-state">No schedules enabled.</p>
              ) : (
                <div className="detail-list">
                  {selectedPlantSchedules.map((schedule) => (
                    <div className="detail-row" key={schedule.id}>
                      <div>
                        <h4>{schedule.action}</h4>
                        <p>
                          Every {schedule.everyDays} days - Last {schedule.lastPerformed}
                        </p>
                      </div>
                      <span className={`status-pill ${schedule.status}`}>
                        {statusLabel[schedule.status]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="detail-section" aria-labelledby="plant-detail-tasks">
              <div className="detail-section-heading">
                <ClipboardCheck size={17} />
                <h3 id="plant-detail-tasks">Next Tasks</h3>
              </div>
              {selectedPlantTasks.length === 0 ? (
                <p className="empty-state">No upcoming tasks.</p>
              ) : (
                <div className="detail-list">
                  {selectedPlantTasks.map((task) => (
                    <div className="detail-row" key={task.id}>
                      <div>
                        <h4>{task.action}</h4>
                        <p>{task.due}</p>
                      </div>
                      <div className="row-actions">
                        <span className={`status-pill ${task.status}`}>
                          {statusLabel[task.status]}
                        </span>
                        <button
                          className="small-action"
                          type="button"
                          onClick={() => onCompleteTask(task)}
                        >
                          <ClipboardCheck size={16} />
                          Log
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="detail-section detail-section-wide" aria-labelledby="plant-detail-flags">
              <div className="detail-section-heading">
                <ClipboardCheck size={17} />
                <h3 id="plant-detail-flags">Plant Flags</h3>
              </div>

              <div className="flag-assignment-form">
                <label>
                  Flag
                  <select
                    value={plantFlagForm.plantFlagDefinitionId}
                    onChange={(event) => onPlantFlagFieldChange('plantFlagDefinitionId', event.target.value)}
                  >
                    <option value="">Select a flag</option>
                    {enabledFlagDefinitions.map((flag) => (
                      <option key={flag.id} value={flag.id}>
                        {flag.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Severity
                  <select
                    value={plantFlagForm.severity}
                    onChange={(event) => onPlantFlagFieldChange('severity', event.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
                <label>
                  Started
                  <input
                    type="date"
                    value={plantFlagForm.startedOn}
                    onChange={(event) => onPlantFlagFieldChange('startedOn', event.target.value)}
                  />
                </label>
                <label>
                  Notes
                  <input
                    value={plantFlagForm.notes}
                    onChange={(event) => onPlantFlagFieldChange('notes', event.target.value)}
                  />
                </label>
                <button
                  className="small-action"
                  type="button"
                  disabled={isSaving || enabledFlagDefinitions.length === 0}
                  onClick={onAssignFlag}
                >
                  <Plus size={16} />
                  Add flag
                </button>
              </div>

              {selectedPlantActiveFlags.length === 0 ? (
                <p className="empty-state">No active flags.</p>
              ) : (
                <div className="detail-list">
                  {selectedPlantActiveFlags.map((flag) => (
                    <div className="detail-row" key={flag.id}>
                      <div>
                        <h4>
                          <span className="flag-chip" style={{ backgroundColor: flag.color }}>
                            {flag.name}
                          </span>
                        </h4>
                        <p>
                          {flag.category} - {flag.severity} - Started {formatDate(flag.startedOn)}
                          {flag.notes ? ` - ${flag.notes}` : ''}
                        </p>
                      </div>
                      <div className="row-actions">
                        <button className="small-action" type="button" disabled={isSaving} onClick={() => onResolveFlag(flag)}>
                          Resolve
                        </button>
                        <button className="icon-button compact danger" type="button" aria-label={`Remove ${flag.name}`} disabled={isSaving} onClick={() => onRemoveFlag(flag)}>
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedPlantResolvedFlags.length > 0 ? (
                <div className="detail-list resolved-flags">
                  {selectedPlantResolvedFlags.slice(0, 4).map((flag) => (
                    <div className="detail-row" key={flag.id}>
                      <div>
                        <h4>{flag.name}</h4>
                        <p>
                          Resolved {flag.resolvedOn ? formatDate(flag.resolvedOn) : ''}
                          {flag.notes ? ` - ${flag.notes}` : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>

          </div>
        </section>
      ) : null}

      {isCareLogEditorOpen ? (
      <section className="editor-panel" aria-labelledby="care-log-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Manual entry</p>
            <h2 id="care-log-heading">{editingActionLogId === null ? 'Log care' : 'Edit care log'}</h2>
          </div>
          <button className="icon-button compact" type="button" aria-label="Clear care log" onClick={onCancelCareLog}>
            <X size={18} />
          </button>
        </div>

        <div className="plant-form">
          <label>
            Plant
            <select
              value={careLogForm.plantId}
              onChange={(event) => onLogCareFieldChange('plantId', event.target.value)}
            >
              <option value="">Select a plant</option>
              {plants.map((plant) => (
                <option key={plant.id} value={plant.id}>
                  {plant.nickname}
                </option>
              ))}
            </select>
          </label>
          <label>
            Action
            <select
              value={careLogForm.careActionId}
              onChange={(event) => onLogCareFieldChange('careActionId', event.target.value)}
            >
              <option value="">Select an action</option>
              {enabledCareActions.length === 0 ? (
                <option value="">No enabled actions</option>
              ) : null}
              {enabledCareActions.map((action) => (
                <option key={action.id} value={action.id}>
                  {action.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Date
            <input
              type="date"
              value={careLogForm.performedOn}
              onChange={(event) => onLogCareFieldChange('performedOn', event.target.value)}
            />
          </label>
          <label>
            Notes
            <input
              value={careLogForm.notes}
              onChange={(event) => onLogCareFieldChange('notes', event.target.value)}
            />
          </label>
          <fieldset className="resource-picker">
            <legend>Resources</legend>
            {enabledActionResources.length === 0 ? (
              <p className="empty-state">No enabled resources.</p>
            ) : null}
            {enabledActionResources.map((resource) => {
              const resourceId = String(resource.id);
              const selectedResource = careLogForm.resources.find(
                (item) => item.actionResourceId === resourceId,
              );

              return (
                <div className="resource-entry" key={resource.id}>
                  <label className="check-option">
                    <input
                      checked={Boolean(selectedResource)}
                      type="checkbox"
                      onChange={(event) => {
                        const nextResources = event.target.checked
                          ? [
                              ...careLogForm.resources,
                              { actionResourceId: resourceId, quantity: '', unit: '' },
                            ]
                          : careLogForm.resources.filter((item) => item.actionResourceId !== resourceId);
                        onLogCareFieldChange('resources', nextResources);
                      }}
                    />
                    <span>{resource.name}</span>
                  </label>
                  {selectedResource ? (
                    <div className="resource-amount">
                      <label>
                        Qty
                        <input
                          min="0"
                          step="0.01"
                          type="number"
                          value={selectedResource.quantity}
                          onChange={(event) => onLogCareFieldChange(
                            'resources',
                            careLogForm.resources.map((item) => item.actionResourceId === resourceId
                              ? { ...item, quantity: event.target.value }
                              : item),
                          )}
                        />
                      </label>
                      <label>
                        Unit
                        <input
                          value={selectedResource.unit}
                          onChange={(event) => onLogCareFieldChange(
                            'resources',
                            careLogForm.resources.map((item) => item.actionResourceId === resourceId
                              ? { ...item, unit: event.target.value }
                              : item),
                          )}
                        />
                      </label>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </fieldset>
        </div>

        <div className="form-actions">
          <button className="primary-action" type="button" disabled={isSaving || enabledCareActions.length === 0} onClick={onLogCare}>
            <ClipboardCheck size={18} />
            {isSaving ? 'Saving' : editingActionLogId === null ? 'Log care' : 'Update log'}
          </button>
          {editingActionLogId === null ? null : (
            <button className="text-button" type="button" onClick={onCancelCareLog}>
              Cancel
            </button>
          )}
        </div>
      </section>
      ) : null}

      {isPlantEditorOpen ? (
      <section className="editor-panel" aria-labelledby="plant-editor-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{activePlantName ? 'Editing' : 'New plant'}</p>
            <h2 id="plant-editor-heading">{activePlantName ?? 'Plant details'}</h2>
          </div>
          <button className="icon-button compact" type="button" aria-label="Clear form" onClick={onCancel}>
            <X size={18} />
          </button>
        </div>

        <div className="plant-form">
          <label>
            Nickname
            <input
              value={form.nickname}
              onChange={(event) => onFieldChange('nickname', event.target.value)}
            />
          </label>
          <div className="taxon-picker">
            <label>
              Taxon
              <select
                value={form.taxonId}
                onChange={(event) => {
                  const taxon = plantTaxa.find((item) => String(item.id) === event.target.value);
                  if (taxon) {
                    onSelectTaxon(taxon);
                    return;
                  }

                  onFieldChange('taxonId', '');
                }}
              >
                <option value="">Select a taxon</option>
                {plantTaxa.map((taxon) => (
                  <option key={taxon.id} value={taxon.id}>
                    {formatTaxon(taxon)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Location
            <input
              value={form.location}
              onChange={(event) => onFieldChange('location', event.target.value)}
            />
          </label>
          <fieldset className="resource-picker schedule-picker">
            <legend>Care schedules</legend>
            {enabledCareActions.length === 0 ? (
              <p className="empty-state">No enabled actions.</p>
            ) : null}
            {enabledCareActions.map((action) => {
              const actionId = String(action.id);
              const selectedSchedule = form.careSchedules.find(
                (schedule) => schedule.careActionId === actionId,
              );

              return (
                <div className="resource-entry" key={action.id}>
                  <label className="check-option">
                    <input
                      checked={Boolean(selectedSchedule?.isEnabled)}
                      type="checkbox"
                      onChange={(event) => {
                        const existingSchedules = form.careSchedules.filter(
                          (schedule) => schedule.careActionId !== actionId,
                        );
                        const nextSchedule = {
                          careActionId: actionId,
                          everyDays: selectedSchedule?.everyDays || '7',
                          isEnabled: event.target.checked,
                        };
                        onFieldChange('careSchedules', [...existingSchedules, nextSchedule]);
                      }}
                    />
                    <span>{action.name}</span>
                  </label>
                  {selectedSchedule?.isEnabled ? (
                    <div className="resource-amount schedule-interval">
                      <label>
                        Every days
                        <input
                          min="1"
                          max="365"
                          type="number"
                          value={selectedSchedule.everyDays}
                          onChange={(event) => onFieldChange(
                            'careSchedules',
                            form.careSchedules.map((schedule) => schedule.careActionId === actionId
                              ? { ...schedule, everyDays: event.target.value }
                              : schedule),
                          )}
                        />
                      </label>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </fieldset>
        </div>

        <div className="quick-taxon" aria-labelledby="quick-taxon-heading">
          <div>
            <p className="eyebrow">Missing from the list?</p>
            <h3 id="quick-taxon-heading">Create taxon</h3>
          </div>
          <div className="quick-taxon-fields">
            <label>
              Common name
              <input
                value={quickTaxonForm.name}
                onChange={(event) => onQuickTaxonFieldChange('name', event.target.value)}
              />
            </label>
            <label>
              Genus
              <input
                value={quickTaxonForm.genus}
                onChange={(event) => onQuickTaxonFieldChange('genus', event.target.value)}
              />
            </label>
            <label>
              Species
              <input
                value={quickTaxonForm.species}
                onChange={(event) => onQuickTaxonFieldChange('species', event.target.value)}
              />
            </label>
          </div>
          <button className="small-action" type="button" disabled={isCreatingTaxon} onClick={onSaveQuickTaxon}>
            <Plus size={16} />
            {isCreatingTaxon ? 'Adding' : 'Add and select'}
          </button>
        </div>

        <div className="form-actions">
          <button className="primary-action" type="button" disabled={isSaving} onClick={onSave}>
            <Save size={18} />
            {isSaving ? 'Saving' : 'Save plant'}
          </button>
          <button className="text-button" type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </section>
      ) : null}

      <section className="section" aria-labelledby="plants-list-heading">
        <div className="section-heading">
          <h2 id="plants-list-heading">All Plants</h2>
        </div>

        <div className="plant-list">
          {!isLoading && plants.length === 0 ? (
            <p className="empty-state">No plants yet.</p>
          ) : null}

          {!isLoading && plants.length > 0 && visiblePlants.length === 0 ? (
            <p className="empty-state">No plants match the search.</p>
          ) : null}

          {visiblePlants.map((plant) => (
            <article className="plant-row" key={plant.id}>
              <div>
                <h3>{plant.nickname}</h3>
                <p>{plant.taxon} - {plant.location}</p>
                {plant.flags.filter((flag) => flag.resolvedOn === null).length > 0 ? (
                  <div className="flag-list">
                    {plant.flags
                      .filter((flag) => flag.resolvedOn === null)
                      .map((flag) => (
                        <span className="flag-chip" key={flag.id} style={{ backgroundColor: flag.color }}>
                          {flag.name}
                        </span>
                      ))}
                  </div>
                ) : null}
              </div>
              <div className="row-actions">
                <button className="icon-button compact" type="button" aria-label={`View ${plant.nickname}`} onClick={() => onOpenDetail(plant)}>
                  <Eye size={17} />
                </button>
                <button className="icon-button compact" type="button" aria-label={`Edit ${plant.nickname}`} onClick={() => onEdit(plant)}>
                  <Edit3 size={17} />
                </button>
                <button className="icon-button compact" type="button" aria-label={`Log care for ${plant.nickname}`} onClick={() => onStartLogCare(plant)}>
                  <ClipboardCheck size={17} />
                </button>
                <button className="icon-button compact danger" type="button" aria-label={`Delete ${plant.nickname}`} onClick={() => onDelete(plant)}>
                  <Trash2 size={17} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

const statusLabel: Record<CareStatus, string> = {
  due: 'Due',
  soon: 'Soon',
  ok: 'Ok',
  unscheduled: 'Unscheduled',
};

function formatDate(date: string) {
  const [year, month, day] = date.split('-');
  if (!year || !month || !day) {
    return date;
  }

  return `${month}/${day}/${year}`;
}
