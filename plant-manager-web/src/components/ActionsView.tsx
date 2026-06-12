import { useMemo, useState } from 'react';
import type { CareAction } from '../domain';
import type { ActionFormState } from '../form-state';
import { CatalogFilterSection, ClosePanelButton, DetailActions, EntityList, RecordActions, SummaryActionButton, SummaryStrip } from './Ui';

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
  onFieldChange: (field: keyof ActionFormState, value: string) => void;
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
  const [filterQuery, setFilterQuery] = useState('');
  const filteredActions = useMemo(() => {
    const query = filterQuery.trim().toLowerCase();
    if (!query) {
      return actions;
    }

    return actions.filter((action) =>
      `${action.name} ${action.description ?? ''}`.toLowerCase().includes(query)
    );
  }, [actions, filterQuery]);

  return (
    <>
      <SummaryStrip
        ariaLabel="Actions summary"
        action={<SummaryActionButton onClick={onNew}>New</SummaryActionButton>}
      >
        <p>{error ?? 'Configure the care actions available when logging plant work.'}</p>
      </SummaryStrip>

      <CatalogFilterSection
        value={filterQuery}
        placeholder="Search actions"
        onChange={setFilterQuery}
      />

      <EntityList
        ariaLabel="Actions"
        emptyMessage={actions.length === 0 ? 'No actions yet.' : 'No actions match this search.'}
        getKey={(action) => action.id}
        isLoading={isLoading}
        items={filteredActions}
        renderActions={(action) => (
          <RecordActions
            deleteLabel={`Delete ${action.name}`}
            editLabel={`Edit ${action.name}`}
            viewLabel={`View ${action.name}`}
            onDelete={() => onDelete(action)}
            onEdit={() => onEdit(action)}
            onView={() => onOpenDetail(action)}
          />
        )}
        renderContent={(action) => (
          <>
            <h3>{action.name}</h3>
            <p>{action.description ?? 'No description'}</p>
          </>
        )}
      />

      {selectedAction && !isEditorOpen ? (
        <section className="work-panel" aria-labelledby="action-detail-heading">
          <div className="section-heading">
            <div>
              <h2 id="action-detail-heading">{selectedAction.name}</h2>
            </div>
            <DetailActions
              closeLabel="Close action detail"
              editLabel={`Edit ${selectedAction.name}`}
              onClose={onCloseDetail}
              onEdit={() => onEdit(selectedAction)}
            />
          </div>
          <div className="plant-detail-meta">
            <div>
              <span>Description</span>
              <strong>{selectedAction.description ?? 'No description'}</strong>
            </div>
          </div>
        </section>
      ) : null}

      {isEditorOpen ? (
      <section className="work-panel" aria-labelledby="action-editor-heading">
        <div className="section-heading">
          <div>
            <h2 id="action-editor-heading">{activeActionName ?? 'New action'}</h2>
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
          <label>
            Description
            <input
              value={form.description}
              onChange={(event) => onFieldChange('description', event.target.value)}
            />
          </label>
        </div>

        <div className="form-actions">
          <button className="primary-action" type="button" disabled={isSaving} onClick={onSave}>
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
