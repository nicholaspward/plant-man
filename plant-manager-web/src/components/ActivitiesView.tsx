import { Edit3, Eye, Plus, Save, Trash2, X } from 'lucide-react';
import type { ActionResource, CareAction, CareActivity } from '../domain';
import type { ActivityFormState } from '../form-state';

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
      <section className="summary-panel" aria-labelledby="activities-summary-heading">
        <div>
          <p className="eyebrow">Care activities</p>
          <h2 id="activities-summary-heading">
            {isLoading ? 'Loading activities' : `${activities.length} activities`}
          </h2>
          <p>{error ?? 'Configure reusable care bundles with actions and per-action resources.'}</p>
        </div>
        <button className="primary-action" type="button" onClick={onNew}>
          <Plus size={18} />
          New activity
        </button>
      </section>

      {selectedActivity && !isEditorOpen ? (
        <section className="editor-panel" aria-labelledby="activity-detail-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Activity detail</p>
              <h2 id="activity-detail-heading">{selectedActivity.name}</h2>
            </div>
            <div className="row-actions">
              <button className="icon-button compact" type="button" aria-label={`Edit ${selectedActivity.name}`} onClick={() => onEdit(selectedActivity)}>
                <Edit3 size={17} />
              </button>
              <button className="icon-button compact" type="button" aria-label="Close activity detail" onClick={onCloseDetail}>
                <X size={18} />
              </button>
            </div>
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
                    <p>
                      {activityAction.resources.map((resource) => {
                        const amount = resource.quantity === null
                          ? ''
                          : ` (${resource.quantity}${resource.unit ? ` ${resource.unit}` : ''})`;
                        return `${resource.name}${amount}`;
                      }).join(', ')}
                    </p>
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
      <section className="editor-panel" aria-labelledby="activity-editor-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{activeActivityName ? 'Editing' : 'New activity'}</p>
            <h2 id="activity-editor-heading">{activeActivityName ?? 'Activity details'}</h2>
          </div>
          <button className="icon-button compact" type="button" aria-label="Clear form" onClick={onCancel}>
            <X size={18} />
          </button>
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
                              <Trash2 size={17} />
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
                        <Plus size={16} />
                        Add resource
                      </button>
                    </div>

                    <button
                      className="icon-button compact danger"
                      type="button"
                      aria-label="Remove action"
                      onClick={() => removeAction(actionIndex)}
                    >
                      <Trash2 size={17} />
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
              <Plus size={16} />
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
            <Save size={18} />
            {isSaving ? 'Saving' : 'Save activity'}
          </button>
          <button className="text-button" type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </section>
      ) : null}

      <section className="section" aria-labelledby="activities-list-heading">
        <div className="section-heading">
          <h2 id="activities-list-heading">All Activities</h2>
        </div>

        <div className="plant-list">
          {!isLoading && activities.length === 0 ? (
            <p className="empty-state">No activities yet.</p>
          ) : null}

          {activities.map((activity) => (
            <article className="plant-row" key={activity.id}>
              <div>
                <h3>{activity.name}</h3>
                <p>{formatActivitySummary(activity)}</p>
              </div>
              <div className="row-actions">
                <button className="icon-button compact" type="button" aria-label={`View ${activity.name}`} onClick={() => onOpenDetail(activity)}>
                  <Eye size={17} />
                </button>
                <button className="icon-button compact" type="button" aria-label={`Edit ${activity.name}`} onClick={() => onEdit(activity)}>
                  <Edit3 size={17} />
                </button>
                <button className="icon-button compact danger" type="button" aria-label={`Delete ${activity.name}`} onClick={() => onDelete(activity)}>
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
