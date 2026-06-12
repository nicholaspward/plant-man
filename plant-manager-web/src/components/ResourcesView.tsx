import { useMemo, useState } from 'react';
import type { ActionResource } from '../domain';
import type { ResourceFormState } from '../form-state';
import { CatalogFilterSection, ClosePanelButton, DetailActions, EntityList, RecordActions, SummaryActionButton, SummaryStrip } from './Ui';

type ResourcesViewProps = {
  activeResourceName?: string;
  error: string | null;
  form: ResourceFormState;
  isEditorOpen: boolean;
  isLoading: boolean;
  isSaving: boolean;
  selectedResource?: ActionResource;
  onCancel: () => void;
  onCloseDetail: () => void;
  onDelete: (resource: ActionResource) => void;
  onEdit: (resource: ActionResource) => void;
  onFieldChange: (field: keyof ResourceFormState, value: string) => void;
  onNew: () => void;
  onOpenDetail: (resource: ActionResource) => void;
  onSave: () => void;
  resources: ActionResource[];
};

export function ResourcesView({
  activeResourceName,
  error,
  form,
  isEditorOpen,
  isLoading,
  isSaving,
  selectedResource,
  onCancel,
  onCloseDetail,
  onDelete,
  onEdit,
  onFieldChange,
  onNew,
  onOpenDetail,
  onSave,
  resources,
}: ResourcesViewProps) {
  const [filterQuery, setFilterQuery] = useState('');
  const filteredResources = useMemo(() => {
    const query = filterQuery.trim().toLowerCase();
    if (!query) {
      return resources;
    }

    return resources.filter((resource) =>
      `${resource.name} ${resource.notes ?? ''} ${resource.producedByRecipe?.name ?? ''}`.toLowerCase().includes(query)
    );
  }, [filterQuery, resources]);

  return (
    <>
      <SummaryStrip
        ariaLabel="Resources summary"
        action={<SummaryActionButton onClick={onNew}>New</SummaryActionButton>}
      >
        <p>{error ?? 'Configure materials, products, tools, and containers used during care.'}</p>
      </SummaryStrip>

      <CatalogFilterSection
        value={filterQuery}
        placeholder="Search resources"
        onChange={setFilterQuery}
      />

      <EntityList
        ariaLabel="Resources"
        emptyMessage={resources.length === 0 ? 'No resources yet.' : 'No resources match this search.'}
        getKey={(resource) => resource.id}
        isLoading={isLoading}
        items={filteredResources}
        renderActions={(resource) => (
          <RecordActions
            deleteLabel={`Delete ${resource.name}`}
            editLabel={`Edit ${resource.name}`}
            viewLabel={`View ${resource.name}`}
            onDelete={() => onDelete(resource)}
            onEdit={() => onEdit(resource)}
            onView={() => onOpenDetail(resource)}
          />
        )}
        renderContent={(resource) => (
          <>
            <h3>{resource.name}</h3>
            <p>
              {resource.producedByRecipe
                ? `Produced by ${resource.producedByRecipe.name}`
                : resource.notes ?? 'No notes'}
            </p>
          </>
        )}
      />

      {selectedResource && !isEditorOpen ? (
        <section className="work-panel" aria-labelledby="resource-detail-heading">
          <div className="section-heading">
            <div>
              <h2 id="resource-detail-heading">{selectedResource.name}</h2>
            </div>
            <DetailActions
              closeLabel="Close resource detail"
              editLabel={`Edit ${selectedResource.name}`}
              onClose={onCloseDetail}
              onEdit={() => onEdit(selectedResource)}
            />
          </div>
          <div className="plant-detail-meta">
            <div>
              <span>Notes</span>
              <strong>{selectedResource.notes ?? 'No notes'}</strong>
            </div>
            {selectedResource.producedByRecipe ? (
              <div>
                <span>Produced by recipe</span>
                <strong>{selectedResource.producedByRecipe.name}</strong>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {isEditorOpen ? (
      <section className="work-panel" aria-labelledby="resource-editor-heading">
        <div className="section-heading">
          <div>
            <h2 id="resource-editor-heading">{activeResourceName ?? 'New resource'}</h2>
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
            Notes
            <input
              value={form.notes}
              onChange={(event) => onFieldChange('notes', event.target.value)}
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
