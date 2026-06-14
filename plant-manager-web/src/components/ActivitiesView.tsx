import { useMemo, useState } from 'react';
import type { ActionResource, CareAction, CareActivity, CareActivityRecipeComponent } from '../domain';
import type { ActivityFormState } from '../form-state';
import { CatalogFilterSection, ClosePanelButton, DetailActions, EntityList, RecordActions, SummaryActionButton, SummaryStrip } from './Ui';

type ActivitiesViewProps = {
  actions: CareAction[];
  activeActivityName?: string;
  activities: CareActivity[];
  error: string | null;
  form: ActivityFormState;
  isEditorOpen: boolean;
  isLoading: boolean;
  isSaving: boolean;
  selectedActivity?: CareActivity;
  onCancel: () => void;
  onCloseDetail: () => void;
  onDelete: (activity: CareActivity) => void;
  onEdit: (activity: CareActivity) => void;
  onFieldChange: <Field extends keyof ActivityFormState>(
    field: Field,
    value: ActivityFormState[Field],
  ) => void;
  onNew: () => void;
  onOpenDetail: (activity: CareActivity) => void;
  onSave: () => void;
  resources: ActionResource[];
};

export function ActivitiesView({
  actions,
  activeActivityName,
  activities,
  error,
  form,
  isEditorOpen,
  isLoading,
  isSaving,
  selectedActivity,
  onCancel,
  onCloseDetail,
  onDelete,
  onEdit,
  onFieldChange,
  onNew,
  onOpenDetail,
  onSave,
  resources,
}: ActivitiesViewProps) {
  const [filterQuery, setFilterQuery] = useState('');
  const filteredActivities = useMemo(() => {
    const query = filterQuery.trim().toLowerCase();
    if (!query) {
      return activities;
    }

    return activities.filter((activity) =>
      `${activity.name} ${activity.notes ?? ''} ${formatActivitySummary(activity)}`.toLowerCase().includes(query)
    );
  }, [activities, filterQuery]);

  function updateAction(index: number, nextAction: ActivityFormState['actions'][number]) {
    onFieldChange(
      'actions',
      form.actions.map((action, actionIndex) => actionIndex === index ? nextAction : action),
    );
  }

  function addAction() {
    onFieldChange('actions', [...form.actions, { careActionId: '', resources: [] }]);
  }

  function removeAction(index: number) {
    onFieldChange('actions', form.actions.filter((_, actionIndex) => actionIndex !== index));
  }

  function hasIncompleteActions() {
    return form.actions.some((action) =>
      !action.careActionId || action.resources.some((resource) => !resource.actionResourceId)
    );
  }

  return (
    <>
      <SummaryStrip
        ariaLabel="Activities summary"
        action={<SummaryActionButton onClick={onNew}>New</SummaryActionButton>}
      >
        <p>{error ?? 'Configure reusable care bundles with actions and per-action resources.'}</p>
      </SummaryStrip>

      <CatalogFilterSection
        value={filterQuery}
        placeholder="Search activities"
        onChange={setFilterQuery}
      />

      <EntityList
        ariaLabel="Activities"
        emptyMessage={activities.length === 0 ? 'No activities yet.' : 'No activities match this search.'}
        getKey={(activity) => activity.id}
        isLoading={isLoading}
        items={filteredActivities}
        renderActions={(activity) => (
          <RecordActions
            deleteLabel={`Delete ${activity.name}`}
            editLabel={`Edit ${activity.name}`}
            viewLabel={`View ${activity.name}`}
            onDelete={() => onDelete(activity)}
            onEdit={() => onEdit(activity)}
            onView={() => onOpenDetail(activity)}
          />
        )}
        renderContent={(activity) => (
          <>
            <h3>{activity.name}</h3>
            <p>{formatActivitySummary(activity)}</p>
          </>
        )}
      />

      {selectedActivity && !isEditorOpen ? (
        <section className="work-panel" aria-labelledby="activity-detail-heading">
          <div className="section-heading">
            <div>
              <h2 id="activity-detail-heading">{selectedActivity.name}</h2>
            </div>
            <DetailActions
              closeLabel="Close activity detail"
              editLabel={`Edit ${selectedActivity.name}`}
              onClose={onCloseDetail}
              onEdit={() => onEdit(selectedActivity)}
            />
          </div>
          <div className="plant-detail-meta">
            <div>
              <span>Notes</span>
              <strong>{selectedActivity.notes ?? 'No notes'}</strong>
            </div>
          </div>
          <div className="detail-list">
            {selectedActivity.actions.length === 0 ? (
              <p className="empty-state">No actions configured.</p>
            ) : selectedActivity.actions.map((activityAction) => (
              <div className="detail-row" key={activityAction.careActionId}>
                <div>
                  <h4>{activityAction.name}</h4>
                  <p>{activityAction.description ?? 'No description'}</p>
                  {activityAction.resources.length > 0 ? (
                    <div className="activity-resource-detail-list">
                      {activityAction.resources.map((resource) => (
                        <div className="activity-resource-detail" key={resource.actionResourceId}>
                          <p>{formatActivityResource(resource)}</p>
                          {resource.producedByRecipe ? (
                            <div className="recipe-procedure">
                              <h5>{resource.producedByRecipe.name}</h5>
                              {resource.producedByRecipe.components.length > 0 ? (
                                <ol>
                                  {resource.producedByRecipe.components.map((component) => (
                                    <li key={component.actionResourceId}>
                                      {formatRecipeComponent(component)}
                                    </li>
                                  ))}
                                </ol>
                              ) : (
                                <p>No recipe components configured.</p>
                              )}
                              {resource.producedByRecipe.notes ? (
                                <p>{resource.producedByRecipe.notes}</p>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No resources</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {isEditorOpen ? (
      <section className="work-panel" aria-labelledby="activity-editor-heading">
        <div className="section-heading">
          <div>
            <h2 id="activity-editor-heading">{activeActivityName ?? 'New activity'}</h2>
          </div>
          <ClosePanelButton onClick={onCancel} />
        </div>

        <div className="plant-form">
          <label>
            Name
            <input
              value={form.name}
              onChange={(event) => onFieldChange('name', event.target.value)}
            />
          </label>
          <fieldset className="resource-picker schedule-picker">
            <legend>Actions and resources</legend>
            <div className="activity-action-list">
              {form.actions.length === 0 ? (
                <p className="empty-state">No actions configured.</p>
              ) : (
                <div className="activity-builder-header" aria-hidden="true">
                  <span>Action</span>
                  <span>Resources</span>
                  <span />
                </div>
              )}

              {form.actions.map((selectedAction, actionIndex) => {
                const selectedActionIds = new Set(
                  form.actions
                    .filter((_, index) => index !== actionIndex)
                    .map((action) => action.careActionId),
                );

                return (
                  <div className="activity-config-row" key={`${selectedAction.careActionId}-${actionIndex}`}>
                    <div className="activity-action-cell">
                      <select
                        aria-label="Action"
                        value={selectedAction.careActionId}
                        onChange={(event) => updateAction(
                          actionIndex,
                          { ...selectedAction, careActionId: event.target.value },
                        )}
                      >
                        <option value="">Select an action</option>
                        {actions
                          .filter((action) => !selectedActionIds.has(String(action.id)))
                          .map((action) => (
                            <option key={action.id} value={action.id}>
                              {action.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="activity-resource-list">
                      {selectedAction.resources.length === 0 ? (
                        <p className="empty-state">No resources configured for this action.</p>
                      ) : (
                        <div className="activity-resource-header" aria-hidden="true">
                          <span>Resource</span>
                          <span>Qty</span>
                          <span>Unit</span>
                          <span>Notes</span>
                          <span />
                        </div>
                      )}

                      {selectedAction.resources.map((selectedResource, resourceIndex) => {
                        const selectedResourceIds = new Set(
                          selectedAction.resources
                            .filter((_, index) => index !== resourceIndex)
                            .map((resource) => resource.actionResourceId),
                        );

                        return (
                          <div className="activity-resource-row" key={`${selectedResource.actionResourceId}-${resourceIndex}`}>
                            <select
                              aria-label="Resource"
                              value={selectedResource.actionResourceId}
                              onChange={(event) => updateAction(
                                actionIndex,
                                {
                                  ...selectedAction,
                                  resources: selectedAction.resources.map((resource, index) => index === resourceIndex
                                    ? { ...resource, actionResourceId: event.target.value }
                                    : resource),
                                },
                              )}
                            >
                              <option value="">Select a resource</option>
                              {resources
                                .filter((resource) => !selectedResourceIds.has(String(resource.id)))
                                .map((resource) => (
                                  <option key={resource.id} value={resource.id}>
                                    {resource.name}
                                  </option>
                                ))}
                            </select>
                            <input
                              aria-label="Quantity"
                              min="0"
                              step="0.01"
                              type="number"
                              value={selectedResource.quantity}
                              onChange={(event) => updateAction(
                                actionIndex,
                                {
                                  ...selectedAction,
                                  resources: selectedAction.resources.map((resource, index) => index === resourceIndex
                                    ? { ...resource, quantity: event.target.value }
                                    : resource),
                                },
                              )}
                            />
                            <input
                              aria-label="Unit"
                              value={selectedResource.unit}
                              onChange={(event) => updateAction(
                                actionIndex,
                                {
                                  ...selectedAction,
                                  resources: selectedAction.resources.map((resource, index) => index === resourceIndex
                                    ? { ...resource, unit: event.target.value }
                                    : resource),
                                },
                              )}
                            />
                            <input
                              aria-label="Resource notes"
                              value={selectedResource.notes}
                              onChange={(event) => updateAction(
                                actionIndex,
                                {
                                  ...selectedAction,
                                  resources: selectedAction.resources.map((resource, index) => index === resourceIndex
                                    ? { ...resource, notes: event.target.value }
                                    : resource),
                                },
                              )}
                            />
                            <button
                              className="icon-button compact danger"
                              type="button"
                              aria-label="Remove resource"
                              onClick={() => updateAction(
                                actionIndex,
                                {
                                  ...selectedAction,
                                  resources: selectedAction.resources.filter((_, index) => index !== resourceIndex),
                                },
                              )}
                            >
                              Remove
                            </button>
                          </div>
                        );
                      })}

                      <button
                        className="small-action"
                        type="button"
                        disabled={resources.length === 0}
                        onClick={() => updateAction(
                          actionIndex,
                          {
                            ...selectedAction,
                            resources: [
                              ...selectedAction.resources,
                              { actionResourceId: '', quantity: '', unit: '', notes: '' },
                            ],
                          },
                        )}
                      >
                        Add resource
                      </button>
                    </div>

                    <button
                      className="icon-button compact danger"
                      type="button"
                      aria-label="Remove action"
                      onClick={() => removeAction(actionIndex)}
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
            <button
              className="small-action"
              type="button"
              disabled={actions.length === 0}
              onClick={addAction}
            >
              Add action
            </button>
          </fieldset>
          <label>
            Notes
            <input
              value={form.notes}
              onChange={(event) => onFieldChange('notes', event.target.value)}
            />
          </label>
        </div>

        <div className="form-actions">
          <button className="primary-action" type="button" disabled={isSaving || form.actions.length === 0 || hasIncompleteActions()} onClick={onSave}>
            {isSaving ? 'Saving' : 'Save'}
          </button>
          <button className="text-button" type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </section>
      ) : null}

    </>
  );
}

function formatActivitySummary(activity: CareActivity) {
  if (activity.actions.length === 0) {
    return activity.action;
  }

  return activity.actions
    .map((action) => {
      const resourceNames = action.resources.map((resource) => resource.name);
      return resourceNames.length === 0
        ? `${action.name}: no resources`
        : `${action.name}: ${resourceNames.join(', ')}`;
    })
    .join(' | ');
}

function formatActivityResource(resource: CareActivity['actions'][number]['resources'][number]) {
  const amount = resource.quantity === null
    ? ''
    : ` (${resource.quantity}${resource.unit ? ` ${resource.unit}` : ''})`;
  return `${resource.name}${amount}`;
}

function formatRecipeComponent(component: CareActivityRecipeComponent) {
  const amount = component.quantity === null
    ? ''
    : ` (${component.quantity}${component.unit ? ` ${component.unit}` : ''})`;
  const notes = component.notes ? ` - ${component.notes}` : '';
  return `${component.name}${amount}${notes}`;
}
