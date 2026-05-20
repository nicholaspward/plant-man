import { Edit3, Eye, Plus, Save, Trash2, X } from 'lucide-react';
import type { CareAction } from '../domain';
import type { ActionFormState } from '../form-state';

type ActionsViewProps = {
  activeActionName?: string;
  actions: CareAction[];
  error: string | null;
  form: ActionFormState;
  isEditorOpen: boolean;
  isLoading: boolean;
  isSaving: boolean;
  selectedAction?: CareAction;
  onCancel: () => void;
  onCloseDetail: () => void;
  onDelete: (action: CareAction) => void;
  onEdit: (action: CareAction) => void;
  onFieldChange: (field: keyof ActionFormState, value: string | boolean) => void;
  onNew: () => void;
  onOpenDetail: (action: CareAction) => void;
  onSave: () => void;
};

export function ActionsView({
  activeActionName,
  actions,
  error,
  form,
  isEditorOpen,
  isLoading,
  isSaving,
  selectedAction,
  onCancel,
  onCloseDetail,
  onDelete,
  onEdit,
  onFieldChange,
  onNew,
  onOpenDetail,
  onSave,
}: ActionsViewProps) {
  const enabledCount = actions.filter((action) => action.isEnabled).length;

  return (
    <>
      <section className="summary-panel" aria-labelledby="actions-summary-heading">
        <div>
          <p className="eyebrow">Care menu</p>
          <h2 id="actions-summary-heading">
            {isLoading ? 'Loading actions' : `${enabledCount} actions enabled`}
          </h2>
          <p>{error ?? 'Configure the care actions available when logging plant work.'}</p>
        </div>
        <button className="primary-action" type="button" onClick={onNew}>
          <Plus size={18} />
          New action
        </button>
      </section>

      {selectedAction && !isEditorOpen ? (
        <section className="editor-panel" aria-labelledby="action-detail-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Action detail</p>
              <h2 id="action-detail-heading">{selectedAction.name}</h2>
            </div>
            <div className="row-actions">
              <button className="icon-button compact" type="button" aria-label={`Edit ${selectedAction.name}`} onClick={() => onEdit(selectedAction)}>
                <Edit3 size={17} />
              </button>
              <button className="icon-button compact" type="button" aria-label="Close action detail" onClick={onCloseDetail}>
                <X size={18} />
              </button>
            </div>
          </div>
          <div className="plant-detail-meta">
            <div>
              <span>Description</span>
              <strong>{selectedAction.description ?? 'No description'}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{selectedAction.isEnabled ? 'Enabled' : 'Disabled'}</strong>
            </div>
          </div>
        </section>
      ) : null}

      {isEditorOpen ? (
      <section className="editor-panel" aria-labelledby="action-editor-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{activeActionName ? 'Editing' : 'New action'}</p>
            <h2 id="action-editor-heading">{activeActionName ?? 'Action details'}</h2>
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
          <label>
            Description
            <input
              value={form.description}
              onChange={(event) => onFieldChange('description', event.target.value)}
            />
          </label>
          <label className="toggle-field">
            <input
              checked={form.isEnabled}
              type="checkbox"
              onChange={(event) => onFieldChange('isEnabled', event.target.checked)}
            />
            Enabled
          </label>
        </div>

        <div className="form-actions">
          <button className="primary-action" type="button" disabled={isSaving} onClick={onSave}>
            <Save size={18} />
            {isSaving ? 'Saving' : 'Save action'}
          </button>
          <button className="text-button" type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </section>
      ) : null}

      <section className="section" aria-labelledby="actions-list-heading">
        <div className="section-heading">
          <h2 id="actions-list-heading">All Actions</h2>
        </div>

        <div className="plant-list">
          {!isLoading && actions.length === 0 ? (
            <p className="empty-state">No actions yet.</p>
          ) : null}

          {actions.map((action) => (
            <article className="plant-row" key={action.id}>
              <div>
                <h3>{action.name}</h3>
                <p>
                  {action.description ?? 'No description'}
                  {' - '}
                  {action.isEnabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <div className="row-actions">
                <button className="icon-button compact" type="button" aria-label={`View ${action.name}`} onClick={() => onOpenDetail(action)}>
                  <Eye size={17} />
                </button>
                <button className="icon-button compact" type="button" aria-label={`Edit ${action.name}`} onClick={() => onEdit(action)}>
                  <Edit3 size={17} />
                </button>
                <button className="icon-button compact danger" type="button" aria-label={`Delete ${action.name}`} onClick={() => onDelete(action)}>
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
