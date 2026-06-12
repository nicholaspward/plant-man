import { useMemo, useState } from 'react';
import type { Plant, PlantGroup } from '../domain';
import type { PlantGroupFormState } from '../form-state';
import { CatalogFilterSection, ClosePanelButton, EntityList, RecordActions, SummaryActionButton, SummaryStrip } from './Ui';

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
  const [filterQuery, setFilterQuery] = useState('');
  const filteredGroups = useMemo(() => {
    const query = filterQuery.trim().toLowerCase();
    if (!query) {
      return groups;
    }

    return groups.filter((group) =>
      `${group.name} ${group.notes ?? ''} ${group.plants.map((plant) => plant.nickname).join(' ')}`.toLowerCase().includes(query)
    );
  }, [filterQuery, groups]);

  return (
    <>
      <SummaryStrip
        ariaLabel="Groups summary"
        action={<SummaryActionButton onClick={onNew}>New</SummaryActionButton>}
      >
        <p>{error ?? 'Organize plants for scheduling and care logging.'}</p>
      </SummaryStrip>

      <CatalogFilterSection
        value={filterQuery}
        placeholder="Search groups"
        onChange={setFilterQuery}
      />

      <EntityList
        ariaLabel="Groups"
        emptyMessage={groups.length === 0 ? 'No groups yet.' : 'No groups match this search.'}
        getKey={(group) => group.id}
        isLoading={isLoading}
        items={filteredGroups}
        renderActions={(group) => (
          <RecordActions
            deleteLabel={`Delete ${group.name}`}
            editLabel={`Edit ${group.name}`}
            onDelete={() => onDelete(group)}
            onEdit={() => onEdit(group)}
          />
        )}
        renderContent={(group) => (
          <>
            <h3>{group.name}</h3>
            <p>{group.plants.length} plants{group.notes ? ` - ${group.notes}` : ''}</p>
          </>
        )}
      />

      {isEditorOpen ? (
        <section className="work-panel" aria-labelledby="group-editor-heading">
          <div className="section-heading">
            <div>
              <h2 id="group-editor-heading">{activeGroupName ?? 'New group'}</h2>
            </div>
            <ClosePanelButton onClick={onCancel} />
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
