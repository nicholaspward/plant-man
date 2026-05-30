import { Edit3, Eye, Plus, Save, Trash2, X } from 'lucide-react';
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
  selectedPlant?: Plant;
  onCancel: () => void;
  onCloseDetail: () => void;
  onDelete: (plant: Plant) => void;
  onEdit: (plant: Plant) => void;
  onFieldChange: (field: keyof PlantFormState, value: string) => void;
  onNew: () => void;
  onOpenDetail: (plant: Plant) => void;
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
  selectedPlant,
  onCancel,
  onCloseDetail,
  onDelete,
  onEdit,
  onFieldChange,
  onNew,
  onOpenDetail,
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
            <label>
              Birthday
              <input
                type="date"
                value={form.birthday}
                onChange={(event) => onFieldChange('birthday', event.target.value)}
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

      {selectedPlant && !isPlantEditorOpen ? (
        <section className="editor-panel" aria-labelledby="plant-detail-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Plant detail</p>
              <h2 id="plant-detail-heading">{selectedPlant.nickname}</h2>
            </div>
            <div className="row-actions">
              <button className="icon-button compact" type="button" aria-label={`Edit ${selectedPlant.nickname}`} onClick={() => onEdit(selectedPlant)}>
                <Edit3 size={17} />
              </button>
              <button className="icon-button compact" type="button" aria-label="Close plant detail" onClick={onCloseDetail}>
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="plant-detail-meta compact-meta">
            <div>
              <span>Birthday</span>
              <strong>{selectedPlant.birthday ?? 'Not set'}</strong>
            </div>
            <div>
              <span>Location</span>
              <strong>{selectedPlant.location}</strong>
            </div>
            <div>
              <span>Taxon</span>
              <strong>{selectedPlant.taxon}</strong>
            </div>
            <div>
              <span>Next care</span>
              <strong>{selectedPlant.nextCare}</strong>
            </div>
            <div className="meta-wide">
              <span>Groups</span>
              <strong>{selectedPlant.groups.length > 0 ? selectedPlant.groups.map((group) => group.name).join(', ') : 'None'}</strong>
            </div>
          </div>

          <div className="detail-section-heading">
            <h3>Timeline</h3>
          </div>
          <PlantTimeline plant={selectedPlant} />
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
                <p>
                  {plant.birthday ? `Birthday ${plant.birthday}` : 'No birthday'}
                  {plant.groups.length > 0 ? ` - ${plant.groups.map((group) => group.name).join(', ')}` : ''}
                </p>
              </div>
              <div className="row-actions">
                <button className="icon-button compact" type="button" aria-label={`View ${plant.nickname}`} onClick={() => onOpenDetail(plant)}>
                  <Eye size={17} />
                </button>
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

function PlantTimeline({ plant }: { plant: Plant }) {
  const timelineItems = [
    ...(plant.birthday ? [{
      date: plant.birthday,
      title: 'Birthday',
      detail: `${plant.nickname} joined the collection.`,
    }] : []),
    ...plant.actionLogs.map((log) => ({
      date: log.performedOn,
      title: log.action,
      detail: formatLogDetail(log),
    })),
  ].sort((left, right) => right.date.localeCompare(left.date));

  if (timelineItems.length === 0) {
    return <p className="empty-state">No timeline entries yet.</p>;
  }

  return (
    <div className="timeline-list">
      {timelineItems.map((item, index) => (
        <article className="timeline-item" key={`${item.date}-${item.title}-${index}`}>
          <time>{item.date}</time>
          <div>
            <h4>{item.title}</h4>
            <p>{item.detail}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function formatLogDetail(log: Plant['actionLogs'][number]) {
  const resources = log.resources.map((resource) => {
    const amount = resource.quantity === null
      ? ''
      : ` (${resource.quantity}${resource.unit ? ` ${resource.unit}` : ''})`;
    return `${resource.name}${amount}`;
  });
  const parts = [
    log.notes,
    resources.length > 0 ? resources.join(', ') : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(' - ') : 'Care logged.';
}
