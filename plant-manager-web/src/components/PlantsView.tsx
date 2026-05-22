import { Edit3, Plus, Save, Trash2, X } from 'lucide-react';
import type { Plant } from '../domain';
import type { PlantFormState } from '../form-state';

type PlantsViewProps = {
  activePlantName?: string;
  error: string | null;
  form: PlantFormState;
  isLoading: boolean;
  isPlantEditorOpen: boolean;
  isSaving: boolean;
  plants: Plant[];
  onCancel: () => void;
  onDelete: (plant: Plant) => void;
  onEdit: (plant: Plant) => void;
  onFieldChange: (field: keyof PlantFormState, value: string) => void;
  onNew: () => void;
  onSave: () => void;
};

export function PlantsView({
  activePlantName,
  error,
  form,
  isLoading,
  isPlantEditorOpen,
  isSaving,
  plants,
  onCancel,
  onDelete,
  onEdit,
  onFieldChange,
  onNew,
  onSave,
}: PlantsViewProps) {
  return (
    <>
      <section className="summary-panel" aria-labelledby="plants-summary-heading">
        <div>
          <p className="eyebrow">Plant inventory</p>
          <h2 id="plants-summary-heading">
            {isLoading ? 'Loading plants' : `${plants.length} plants tracked`}
          </h2>
          <p>{error ?? 'Create and maintain plant objects.'}</p>
        </div>
        <button className="primary-action" type="button" onClick={onNew}>
          <Plus size={18} />
          New plant
        </button>
      </section>

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
              Name
              <input
                value={form.nickname}
                onChange={(event) => onFieldChange('nickname', event.target.value)}
              />
            </label>
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

          {plants.map((plant) => (
            <article className="plant-row" key={plant.id}>
              <div>
                <h3>{plant.nickname}</h3>
              </div>
              <div className="row-actions">
                <button className="icon-button compact" type="button" aria-label={`Edit ${plant.nickname}`} onClick={() => onEdit(plant)}>
                  <Edit3 size={17} />
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
