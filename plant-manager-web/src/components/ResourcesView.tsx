import { Edit3, Eye, Plus, Save, Trash2, X } from 'lucide-react';
import type { ActionResource } from '../domain';
import type { ResourceFormState } from '../form-state';

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
  return (
    <>
      <section className="summary-panel" aria-labelledby="resources-summary-heading">
        <div>
          <p className="eyebrow">Resource library</p>
          <h2 id="resources-summary-heading">
            {isLoading ? 'Loading resources' : `${resources.length} resources`}
          </h2>
          <p>{error ?? 'Configure materials, products, tools, and containers used during care.'}</p>
        </div>
        <button className="primary-action" type="button" onClick={onNew}>
          <Plus size={18} />
          New resource
        </button>
      </section>

      {selectedResource && !isEditorOpen ? (
        <section className="editor-panel" aria-labelledby="resource-detail-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Resource detail</p>
              <h2 id="resource-detail-heading">{selectedResource.name}</h2>
            </div>
            <div className="row-actions">
              <button className="icon-button compact" type="button" aria-label={`Edit ${selectedResource.name}`} onClick={() => onEdit(selectedResource)}>
                <Edit3 size={17} />
              </button>
              <button className="icon-button compact" type="button" aria-label="Close resource detail" onClick={onCloseDetail}>
                <X size={18} />
              </button>
            </div>
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
      <section className="editor-panel" aria-labelledby="resource-editor-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{activeResourceName ? 'Editing' : 'New resource'}</p>
            <h2 id="resource-editor-heading">{activeResourceName ?? 'Resource details'}</h2>
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
            Notes
            <input
              value={form.notes}
              onChange={(event) => onFieldChange('notes', event.target.value)}
            />
          </label>
        </div>

        <div className="form-actions">
          <button className="primary-action" type="button" disabled={isSaving} onClick={onSave}>
            <Save size={18} />
            {isSaving ? 'Saving' : 'Save resource'}
          </button>
          <button className="text-button" type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </section>
      ) : null}

      <section className="section" aria-labelledby="resources-list-heading">
        <div className="section-heading">
          <h2 id="resources-list-heading">All Resources</h2>
        </div>

        <div className="plant-list">
          {!isLoading && resources.length === 0 ? (
            <p className="empty-state">No resources yet.</p>
          ) : null}

          {resources.map((resource) => (
            <article className="plant-row" key={resource.id}>
              <div>
                <h3>{resource.name}</h3>
                <p>
                  {resource.producedByRecipe
                    ? `Produced by ${resource.producedByRecipe.name}`
                    : resource.notes ?? 'No notes'}
                </p>
              </div>
              <div className="row-actions">
                <button className="icon-button compact" type="button" aria-label={`View ${resource.name}`} onClick={() => onOpenDetail(resource)}>
                  <Eye size={17} />
                </button>
                <button className="icon-button compact" type="button" aria-label={`Edit ${resource.name}`} onClick={() => onEdit(resource)}>
                  <Edit3 size={17} />
                </button>
                <button className="icon-button compact danger" type="button" aria-label={`Delete ${resource.name}`} onClick={() => onDelete(resource)}>
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
