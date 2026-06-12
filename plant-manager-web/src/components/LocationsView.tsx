import { useMemo, useState } from 'react';
import type { PlantLocation } from '../domain';
import type { LocationFormState } from '../form-state';
import { CatalogFilterSection, ClosePanelButton, DetailActions, EntityList, RecordActions, SummaryActionButton, SummaryStrip } from './Ui';

type LocationsViewProps = {
  activeLocationName?: string;
  error: string | null;
  form: LocationFormState;
  isEditorOpen: boolean;
  isLoading: boolean;
  isSaving: boolean;
  locations: PlantLocation[];
  selectedLocation?: PlantLocation;
  onCancel: () => void;
  onCloseDetail: () => void;
  onDelete: (location: PlantLocation) => void;
  onEdit: (location: PlantLocation) => void;
  onFieldChange: (field: keyof LocationFormState, value: string) => void;
  onNew: () => void;
  onOpenDetail: (location: PlantLocation) => void;
  onSave: () => void;
};

export function LocationsView({
  activeLocationName,
  error,
  form,
  isEditorOpen,
  isLoading,
  isSaving,
  locations,
  selectedLocation,
  onCancel,
  onCloseDetail,
  onDelete,
  onEdit,
  onFieldChange,
  onNew,
  onOpenDetail,
  onSave,
}: LocationsViewProps) {
  const [filterQuery, setFilterQuery] = useState('');
  const filteredLocations = useMemo(() => {
    const query = filterQuery.trim().toLowerCase();
    if (!query) {
      return locations;
    }

    return locations.filter((location) =>
      `${location.name} ${location.notes ?? ''}`.toLowerCase().includes(query)
    );
  }, [filterQuery, locations]);

  return (
    <>
      <SummaryStrip
        ariaLabel="Locations summary"
        action={<SummaryActionButton onClick={onNew}>New</SummaryActionButton>}
      >
        <p>{error ?? 'Create and maintain the places where plants live.'}</p>
      </SummaryStrip>

      <CatalogFilterSection
        value={filterQuery}
        placeholder="Search locations"
        onChange={setFilterQuery}
      />

      <EntityList
        ariaLabel="Locations"
        emptyMessage={locations.length === 0 ? 'No locations yet.' : 'No locations match this search.'}
        getKey={(location) => location.id}
        isLoading={isLoading}
        items={filteredLocations}
        renderActions={(location) => (
          <RecordActions
            deleteLabel={`Delete ${location.name}`}
            editLabel={`Edit ${location.name}`}
            viewLabel={`View ${location.name}`}
            onDelete={() => onDelete(location)}
            onEdit={() => onEdit(location)}
            onView={() => onOpenDetail(location)}
          />
        )}
        renderContent={(location) => (
          <>
            <h3>{location.name}</h3>
            <p>{location.notes ?? 'No notes'}</p>
          </>
        )}
      />

      {selectedLocation && !isEditorOpen ? (
        <section className="work-panel" aria-labelledby="location-detail-heading">
          <div className="section-heading">
            <div>
              <h2 id="location-detail-heading">{selectedLocation.name}</h2>
            </div>
            <DetailActions
              closeLabel="Close location detail"
              editLabel={`Edit ${selectedLocation.name}`}
              onClose={onCloseDetail}
              onEdit={() => onEdit(selectedLocation)}
            />
          </div>
          <div className="plant-detail-meta">
            <div>
              <span>Notes</span>
              <strong>{selectedLocation.notes ?? 'No notes'}</strong>
            </div>
          </div>
        </section>
      ) : null}

      {isEditorOpen ? (
      <section className="work-panel" aria-labelledby="location-editor-heading">
        <div className="section-heading">
          <div>
            <h2 id="location-editor-heading">{activeLocationName ?? 'New location'}</h2>
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
