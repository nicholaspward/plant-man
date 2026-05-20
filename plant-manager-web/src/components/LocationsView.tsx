import { Edit3, Eye, Plus, Save, Trash2, X } from 'lucide-react';
import type { PlantLocation } from '../domain';
import type { LocationFormState } from '../form-state';

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
  onFieldChange: (field: keyof LocationFormState, value: string | boolean) => void;
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
  const enabledCount = locations.filter((location) => location.isEnabled).length;

  return (
    <>
      <section className="summary-panel" aria-labelledby="locations-summary-heading">
        <div>
          <p className="eyebrow">Location library</p>
          <h2 id="locations-summary-heading">
            {isLoading ? 'Loading locations' : `${enabledCount} locations enabled`}
          </h2>
          <p>{error ?? 'Create and maintain the places where plants live.'}</p>
        </div>
        <button className="primary-action" type="button" onClick={onNew}>
          <Plus size={18} />
          New location
        </button>
      </section>

      {selectedLocation && !isEditorOpen ? (
        <section className="editor-panel" aria-labelledby="location-detail-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Location detail</p>
              <h2 id="location-detail-heading">{selectedLocation.name}</h2>
            </div>
            <div className="row-actions">
              <button className="icon-button compact" type="button" aria-label={`Edit ${selectedLocation.name}`} onClick={() => onEdit(selectedLocation)}>
                <Edit3 size={17} />
              </button>
              <button className="icon-button compact" type="button" aria-label="Close location detail" onClick={onCloseDetail}>
                <X size={18} />
              </button>
            </div>
          </div>
          <div className="plant-detail-meta">
            <div>
              <span>Notes</span>
              <strong>{selectedLocation.notes ?? 'No notes'}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{selectedLocation.isEnabled ? 'Enabled' : 'Disabled'}</strong>
            </div>
          </div>
        </section>
      ) : null}

      {isEditorOpen ? (
      <section className="editor-panel" aria-labelledby="location-editor-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{activeLocationName ? 'Editing' : 'New location'}</p>
            <h2 id="location-editor-heading">{activeLocationName ?? 'Location details'}</h2>
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
            {isSaving ? 'Saving' : 'Save location'}
          </button>
          <button className="text-button" type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </section>
      ) : null}

      <section className="section" aria-labelledby="locations-list-heading">
        <div className="section-heading">
          <h2 id="locations-list-heading">All Locations</h2>
        </div>

        <div className="plant-list">
          {!isLoading && locations.length === 0 ? (
            <p className="empty-state">No locations yet.</p>
          ) : null}

          {locations.map((location) => (
            <article className="plant-row" key={location.id}>
              <div>
                <h3>{location.name}</h3>
                <p>
                  {location.notes ?? 'No notes'}
                  {' - '}
                  {location.isEnabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <div className="row-actions">
                <button className="icon-button compact" type="button" aria-label={`View ${location.name}`} onClick={() => onOpenDetail(location)}>
                  <Eye size={17} />
                </button>
                <button className="icon-button compact" type="button" aria-label={`Edit ${location.name}`} onClick={() => onEdit(location)}>
                  <Edit3 size={17} />
                </button>
                <button className="icon-button compact danger" type="button" aria-label={`Delete ${location.name}`} onClick={() => onDelete(location)}>
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
