import { useMemo, useState } from 'react';
import type { BulkCompleteCareTasksPayload, CareActivity, CareActivityActionResource, CareActivityRecipeComponent, CareTask, DismissCareTasksPayload, Plant, SnoozeCareTasksPayload } from '../domain';
import { SummaryStrip } from './Ui';

type CareMode = 'due' | 'upcoming' | 'adHoc';

type CareViewProps = {
  activities: CareActivity[];
  careTasks: CareTask[];
  error: string | null;
  isLoading: boolean;
  isSaving: boolean;
  plants: Plant[];
  onDismissCare: (payload: DismissCareTasksPayload) => void;
  onLogCare: (payload: BulkCompleteCareTasksPayload, requireDueSchedule: boolean) => void;
  onSnoozeCare: (payload: SnoozeCareTasksPayload) => void;
};

const modeOptions: { value: CareMode; label: string }[] = [
  { value: 'due', label: 'Due' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'adHoc', label: 'Ad Hoc' },
];

export function CareView({
  activities,
  careTasks,
  error,
  isLoading,
  isSaving,
  plants,
  onDismissCare,
  onLogCare,
  onSnoozeCare,
}: CareViewProps) {
  const [mode, setMode] = useState<CareMode>('due');
  const [activityId, setActivityId] = useState('');
  const [selectedPlantIds, setSelectedPlantIds] = useState<string[]>([]);
  const [plantQuery, setPlantQuery] = useState('');
  const [performedOn, setPerformedOn] = useState(() => new Date().toISOString().slice(0, 10));
  const [snoozedUntil, setSnoozedUntil] = useState(() => getTomorrowInputDate());
  const [notes, setNotes] = useState('');
  const [resourceEdits, setResourceEdits] = useState<Record<number, { quantity: string; unit: string }>>({});

  const modeTasks = careTasks.filter((task) => mode === 'due' ? task.status === 'due' : task.status === 'soon');
  const activityOptions = mode === 'adHoc'
    ? activities
    : activities.filter((activity) => modeTasks.some((task) => task.careActivityId === activity.id));
  const selectedActivity = activities.find((activity) => String(activity.id) === activityId)
    ?? activityOptions[0];
  const selectedActivityId = selectedActivity?.id ?? 0;
  const taskPlants = modeTasks.filter((task) => task.careActivityId === selectedActivityId);
  const visiblePlants = useMemo(
    () => filterPlants(mode === 'adHoc' ? plants : plantsForTasks(taskPlants, plants), plantQuery),
    [mode, plants, plantQuery, taskPlants],
  );
  const selectedPlantIdSet = new Set(selectedPlantIds);
  const activityResources = selectedActivity ? getActivityResources(selectedActivity) : [];

  function togglePlant(plantId: number, checked: boolean) {
    const value = String(plantId);
    setSelectedPlantIds((current) => checked
      ? [...new Set([...current, value])]
      : current.filter((id) => id !== value));
  }

  function changeMode(nextMode: CareMode) {
    setMode(nextMode);
    setActivityId('');
    setSelectedPlantIds([]);
    setPlantQuery('');
  }

  function changeActivity(nextActivityId: string) {
    setActivityId(nextActivityId);
    setSelectedPlantIds([]);
    setResourceEdits({});
  }

  function submit() {
    if (!selectedActivity) {
      return;
    }

    onLogCare({
      careActivityId: selectedActivity.id,
      plantIds: selectedPlantIds.map((id) => Number(id)),
      performedOn,
      notes: notes.trim() || null,
      resources: activityResources.map((resource) => ({
        actionResourceId: resource.actionResourceId,
        quantity: normalizeQuantity(resourceEdits[resource.actionResourceId]?.quantity, resource.quantity),
        unit: resourceEdits[resource.actionResourceId]?.unit.trim() || resource.unit,
      })),
    }, mode === 'due');

    setSelectedPlantIds([]);
    setNotes('');
  }

  function dismiss() {
    if (!selectedActivity) {
      return;
    }

    onDismissCare({
      careActivityId: selectedActivity.id,
      plantIds: selectedPlantIds.map((id) => Number(id)),
      dismissedOn: performedOn,
      notes: notes.trim() || null,
    });

    setSelectedPlantIds([]);
    setNotes('');
  }

  function snooze() {
    if (!selectedActivity) {
      return;
    }

    onSnoozeCare({
      careActivityId: selectedActivity.id,
      plantIds: selectedPlantIds.map((id) => Number(id)),
      snoozedUntil,
      notes: notes.trim() || null,
    });

    setSelectedPlantIds([]);
    setNotes('');
  }

  return (
    <>
      <SummaryStrip ariaLabel="Care summary">
        <p>{error ?? 'Choose care to perform, review the procedure, then log the work.'}</p>
      </SummaryStrip>

      <section className="work-panel" aria-labelledby="care-workflow-heading">
        <div className="section-heading">
          <div>
            <h2 id="care-workflow-heading">Care</h2>
          </div>
          <span className="schedule-count">{selectedPlantIds.length} selected</span>
        </div>

        <div className="care-mode-switch" role="tablist" aria-label="Care mode">
          {modeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={mode === option.value}
              disabled={isSaving}
              onClick={() => changeMode(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="plant-form">
          <label>
            Activity
            <select
              disabled={isSaving || activityOptions.length === 0}
              value={selectedActivity ? String(selectedActivity.id) : ''}
              onChange={(event) => changeActivity(event.target.value)}
            >
              {activityOptions.length === 0 ? (
                <option value="">No activities available</option>
              ) : null}
              {activityOptions.map((activity) => (
                <option key={activity.id} value={activity.id}>
                  {activity.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Date
            <input
              disabled={isSaving}
              type="date"
              value={performedOn}
              onChange={(event) => setPerformedOn(event.target.value)}
            />
          </label>
          {mode === 'due' ? (
            <label>
              Snooze until
              <input
                disabled={isSaving}
                type="date"
                value={snoozedUntil}
                onChange={(event) => setSnoozedUntil(event.target.value)}
              />
            </label>
          ) : null}
          <label>
            Search plants
            <input
              disabled={isSaving}
              type="search"
              value={plantQuery}
              onChange={(event) => setPlantQuery(event.target.value)}
            />
          </label>
        </div>

        <div className="care-layout">
          <div className="work-panel care-subpanel" aria-labelledby="care-plants-heading">
            <div className="section-heading">
              <h2 id="care-plants-heading">Plants</h2>
              <button
                className="text-button"
                type="button"
                disabled={isSaving || visiblePlants.length === 0}
                onClick={() => {
                  const allVisibleSelected = visiblePlants.every((plant) => selectedPlantIdSet.has(String(plant.id)));
                  setSelectedPlantIds(allVisibleSelected
                    ? selectedPlantIds.filter((id) => !visiblePlants.some((plant) => String(plant.id) === id))
                    : [...new Set([...selectedPlantIds, ...visiblePlants.map((plant) => String(plant.id))])]);
                }}
              >
                Select visible
              </button>
            </div>

            <div className="plant-list compact-plant-list">
              {!isLoading && visiblePlants.length === 0 ? (
                <p className="empty-state">{mode === 'adHoc' ? 'No plants match that search.' : 'No care tasks in this queue.'}</p>
              ) : null}

              {visiblePlants.map((plant) => {
                const task = taskPlants.find((item) => item.plantId === plant.id);
                return (
                  <label className="plant-row check-row" key={plant.id}>
                    <span>
                      <input
                        checked={selectedPlantIdSet.has(String(plant.id))}
                        disabled={isSaving}
                        type="checkbox"
                        onChange={(event) => togglePlant(plant.id, event.target.checked)}
                      />
                      <strong>{plant.nickname}</strong>
                      <small>{mode === 'adHoc' ? `${plant.taxon} - ${plant.location}` : task?.due ?? plant.nextCare}</small>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="work-panel care-subpanel" aria-labelledby="care-procedure-heading">
            <div className="section-heading">
              <h2 id="care-procedure-heading">Procedure</h2>
            </div>

            {!selectedActivity ? (
              <p className="empty-state">Select an activity.</p>
            ) : (
              <div className="detail-list">
                {selectedActivity.actions.map((action) => (
                  <div className="detail-row" key={action.careActionId}>
                    <div>
                      <h4>{action.name}</h4>
                      <p>{action.description ?? 'No description'}</p>
                      {action.resources.length === 0 ? (
                        <p>No resources configured.</p>
                      ) : action.resources.map((resource) => (
                        <div className="activity-resource-detail" key={resource.actionResourceId}>
                          <p>{formatResource(resource)}</p>
                          <div className="care-resource-edit">
                            <input
                              aria-label={`${resource.name} quantity`}
                              disabled={isSaving}
                              type="number"
                              min="0"
                              value={resourceEdits[resource.actionResourceId]?.quantity ?? formatNumber(resource.quantity)}
                              onChange={(event) => setResourceEdits((current) => ({
                                ...current,
                                [resource.actionResourceId]: {
                                  quantity: event.target.value,
                                  unit: current[resource.actionResourceId]?.unit ?? resource.unit ?? '',
                                },
                              }))}
                            />
                            <input
                              aria-label={`${resource.name} unit`}
                              disabled={isSaving}
                              value={resourceEdits[resource.actionResourceId]?.unit ?? resource.unit ?? ''}
                              onChange={(event) => setResourceEdits((current) => ({
                                ...current,
                                [resource.actionResourceId]: {
                                  quantity: current[resource.actionResourceId]?.quantity ?? formatNumber(resource.quantity),
                                  unit: event.target.value,
                                },
                              }))}
                            />
                          </div>
                          {resource.producedByRecipe ? (
                            <div className="recipe-procedure">
                              <h5>{resource.producedByRecipe.name}</h5>
                              <ol>
                                {resource.producedByRecipe.components.map((component) => (
                                  <li key={component.actionResourceId}>{formatRecipeComponent(component)}</li>
                                ))}
                              </ol>
                              {resource.producedByRecipe.notes ? <p>{resource.producedByRecipe.notes}</p> : null}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <label className="care-notes">
          Notes
          <textarea
            disabled={isSaving}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </label>

        <div className="form-actions">
          <button
            className="primary-action"
            type="button"
            disabled={isSaving || !selectedActivity || selectedPlantIds.length === 0}
            onClick={submit}
          >
            {isSaving ? 'Saving' : 'Log'}
          </button>
          {mode === 'due' ? (
            <>
              <button
                className="text-button"
                type="button"
                disabled={isSaving || !selectedActivity || selectedPlantIds.length === 0}
                onClick={snooze}
              >
                Snooze
              </button>
              <button
                className="text-button"
                type="button"
                disabled={isSaving || !selectedActivity || selectedPlantIds.length === 0}
                onClick={dismiss}
              >
                Dismiss
              </button>
            </>
          ) : null}
        </div>
      </section>
    </>
  );
}

function plantsForTasks(tasks: CareTask[], plants: Plant[]) {
  const taskPlantIds = new Set(tasks.map((task) => task.plantId));
  return plants.filter((plant) => taskPlantIds.has(plant.id));
}

function filterPlants(plants: Plant[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return plants;
  }

  return plants.filter((plant) => `${plant.nickname} ${plant.taxon} ${plant.location}`.toLowerCase().includes(normalizedQuery));
}

function getActivityResources(activity: CareActivity) {
  const resources = new Map<number, CareActivityActionResource>();
  for (const action of activity.actions) {
    for (const resource of action.resources) {
      if (!resources.has(resource.actionResourceId)) {
        resources.set(resource.actionResourceId, resource);
      }
    }
  }

  return [...resources.values()];
}

function normalizeQuantity(value: string | undefined, fallback: number | null) {
  if (value === undefined || value.trim() === '') {
    return fallback;
  }

  return Number(value);
}

function formatResource(resource: CareActivityActionResource) {
  const quantity = resource.quantity === null ? '' : `${resource.quantity} `;
  const unit = resource.unit ? `${resource.unit} ` : '';
  return `${quantity}${unit}${resource.name}`.trim();
}

function formatRecipeComponent(component: CareActivityRecipeComponent) {
  const quantity = component.quantity === null ? '' : `${component.quantity}`;
  const unit = component.unit ?? '';
  return `${component.name}: ${quantity}${unit ? ` ${unit}` : ''}`.trim();
}

function formatNumber(value: number | null) {
  return value === null ? '' : String(value);
}

function getTomorrowInputDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().slice(0, 10);
}
