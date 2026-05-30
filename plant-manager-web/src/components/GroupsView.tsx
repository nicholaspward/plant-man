import { Edit3, Plus, Save, Trash2, X } from 'lucide-react';
import type { Plant, PlantGroup } from '../domain';
import type { PlantGroupFormState } from '../form-state';

type GroupsViewProps = {
  activeGroupName?: string;
  error: string | null;
  form: PlantGroupFormState;
  groups: PlantGroup[];
  isEditorOpen: boolean;
  isLoading: boolean;
  isSaving: boolean;
  plants: Plant[];
  onCancel: () => void;
  onDelete: (group: PlantGroup) => void;
  onEdit: (group: PlantGroup) => void;
  onFieldChange: (field: keyof PlantGroupFormState, value: string | string[]) => void;
  onNew: () => void;
  onSave: () => void;
};

export function GroupsView({
  activeGroupName,
  error,
  form,
  groups,
  isEditorOpen,
  isLoading,
  isSaving,
  plants,
  onCancel,
  onDelete,
  onEdit,
  onFieldChange,
  onNew,
  onSave,
}: GroupsViewProps) {
  const selectedPlantIds = new Set(form.plantIds);

  return (
    <>
      <section className="summary-panel" aria-labelledby="groups-summary-heading">
        <div>
          <p className="eyebrow">Plant groups</p>
          <h2 id="groups-summary-heading">
            {isLoading ? 'Loading groups' : `${groups.length} groups`}
          </h2>
          <p>{error ?? 'Organize plants for scheduling and care logging.'}</p>
        </div>
        <button className="primary-action" type="button" onClick={onNew}>
          <Plus size={18} />
          New group
        </button>
      </section>

      {isEditorOpen ? (
        <section className="editor-panel" aria-labelledby="group-editor-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{activeGroupName ? 'Editing' : 'New group'}</p>
              <h2 id="group-editor-heading">{activeGroupName ?? 'Group details'}</h2>
            </div>
            <button className="icon-button compact" type="button" aria-label="Clear form" onClick={onCancel}>
              <X size={18} />
            </button>
          </div>

          <div className="plant-form">
            <label>
              Name
              <input
                disabled={isSaving}
                value={form.name}
                onChange={(event) => onFieldChange('name', event.target.value)}
              />
            </label>
            <label className="form-wide">
              Notes
              <textarea
                disabled={isSaving}
                value={form.notes}
                onChange={(event) => onFieldChange('notes', event.target.value)}
              />
            </label>
          </div>

          <fieldset className="resource-picker schedule-picker">
            <legend>Plants</legend>
            <div className="plant-list compact-plant-list">
              {!isLoading && plants.length === 0 ? (
                <p className="empty-state">No plants available.</p>
              ) : null}

              {plants.map((plant) => (
                <label className="plant-row check-row" key={plant.id}>
                  <span>
                    <input
                      checked={selectedPlantIds.has(String(plant.id))}
                      disabled={isSaving}
                      type="checkbox"
                      onChange={(event) => {
                        const plantId = String(plant.id);
                        const nextPlantIds = event.target.checked
                          ? [...form.plantIds, plantId]
                          : form.plantIds.filter((id) => id !== plantId);
                        onFieldChange('plantIds', nextPlantIds);
                      }}
                    />
                    <strong>{plant.nickname}</strong>
                    <small>{plant.taxon} - {plant.location}</small>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="form-actions">
            <button className="primary-action" type="button" disabled={isSaving || !form.name.trim()} onClick={onSave}>
              <Save size={18} />
              {isSaving ? 'Saving' : 'Save group'}
            </button>
            <button className="text-button" type="button" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </section>
      ) : null}

      <section className="section" aria-labelledby="groups-list-heading">
        <div className="section-heading">
          <h2 id="groups-list-heading">All Groups</h2>
        </div>

        <div className="plant-list">
          {!isLoading && groups.length === 0 ? (
            <p className="empty-state">No groups yet.</p>
          ) : null}

          {groups.map((group) => (
            <article className="plant-row" key={group.id}>
              <div>
                <h3>{group.name}</h3>
                <p>{group.plants.length} plants{group.notes ? ` - ${group.notes}` : ''}</p>
              </div>
              <div className="row-actions">
                <button className="icon-button compact" type="button" aria-label={`Edit ${group.name}`} onClick={() => onEdit(group)}>
                  <Edit3 size={17} />
                </button>
                <button className="icon-button compact danger" type="button" aria-label={`Delete ${group.name}`} onClick={() => onDelete(group)}>
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
