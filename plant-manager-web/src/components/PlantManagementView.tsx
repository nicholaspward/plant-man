import { Check, MapPin, Save, Tags, Trash2 } from 'lucide-react';
import type {
  Plant,
  PlantFlag,
  PlantFlagDefinition,
  PlantLocation,
  PlantTaxon,
} from '../domain';
import type { PlantFlagFormState } from '../form-state';
import { formatTaxon } from '../form-state';

type PlantManagementViewProps = {
  error: string | null;
  isLoading: boolean;
  isSaving: boolean;
  plantFlagDefinitions: PlantFlagDefinition[];
  plantFlagForm: PlantFlagFormState;
  plantLocations: PlantLocation[];
  plantTaxa: PlantTaxon[];
  plants: Plant[];
  selectedPlant?: Plant;
  selectedPlantId: number | null;
  onAssignFlag: () => void;
  onFieldChange: (field: keyof PlantFlagFormState, value: string) => void;
  onRemoveFlag: (flag: PlantFlag) => void;
  onResolveFlag: (flag: PlantFlag) => void;
  onSelectPlant: (plantId: string) => void;
  onSetLocation: (locationId: string) => void;
  onSetTaxon: (taxonId: string) => void;
};

export function PlantManagementView({
  error,
  isLoading,
  isSaving,
  plantFlagDefinitions,
  plantFlagForm,
  plantLocations,
  plantTaxa,
  plants,
  selectedPlant,
  selectedPlantId,
  onAssignFlag,
  onFieldChange,
  onRemoveFlag,
  onResolveFlag,
  onSelectPlant,
  onSetLocation,
  onSetTaxon,
}: PlantManagementViewProps) {
  const enabledFlags = plantFlagDefinitions.filter((flag) => flag.isEnabled);
  const enabledLocations = plantLocations.filter((location) =>
    location.isEnabled || location.id === selectedPlant?.locationId);
  const activeFlags = selectedPlant?.flags.filter((flag) => flag.resolvedOn === null) ?? [];
  const resolvedFlags = selectedPlant?.flags.filter((flag) => flag.resolvedOn !== null) ?? [];

  return (
    <>
      <section className="summary-panel" aria-labelledby="plant-management-summary-heading">
        <div>
          <p className="eyebrow">Relationship surface</p>
          <h2 id="plant-management-summary-heading">
            {isLoading ? 'Loading plants' : 'Plant Management'}
          </h2>
          <p>{error ?? 'Attach building blocks to plant objects without changing the building block libraries.'}</p>
        </div>
      </section>

      <section className="editor-panel" aria-labelledby="plant-management-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Selected plant</p>
            <h2 id="plant-management-heading">{selectedPlant?.nickname ?? 'Choose a plant'}</h2>
          </div>
        </div>

        <div className="plant-form">
          <label>
            Plant
            <select
              value={selectedPlantId ?? ''}
              onChange={(event) => onSelectPlant(event.target.value)}
            >
              <option value="">Select a plant</option>
              {plants.map((plant) => (
                <option key={plant.id} value={plant.id}>
                  {plant.nickname}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {selectedPlant ? (
        <div className="plant-detail-grid">
          <section className="detail-section" aria-labelledby="plant-management-identity">
            <div className="detail-section-heading">
              <Tags size={17} />
              <h3 id="plant-management-identity">Identity</h3>
            </div>
            <div className="plant-form">
              <label>
                Taxon
                <select
                  disabled={isSaving}
                  value={selectedPlant.taxonId ?? ''}
                  onChange={(event) => onSetTaxon(event.target.value)}
                >
                  <option value="">No taxon</option>
                  {plantTaxa.map((taxon) => (
                    <option key={taxon.id} value={taxon.id}>
                      {formatTaxon(taxon)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="detail-section" aria-labelledby="plant-management-placement">
            <div className="detail-section-heading">
              <MapPin size={17} />
              <h3 id="plant-management-placement">Placement</h3>
            </div>
            <div className="plant-form">
              <label>
                Location
                <select
                  disabled={isSaving}
                  value={selectedPlant.locationId ?? ''}
                  onChange={(event) => onSetLocation(event.target.value)}
                >
                  <option value="">No location</option>
                  {enabledLocations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.isEnabled ? location.name : `${location.name} (disabled)`}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="detail-section detail-section-wide" aria-labelledby="plant-management-flags">
            <div className="detail-section-heading">
              <Check size={17} />
              <h3 id="plant-management-flags">Flags</h3>
            </div>

            <div className="flag-assignment-form">
              <label>
                Flag
                <select
                  value={plantFlagForm.plantFlagDefinitionId}
                  onChange={(event) => onFieldChange('plantFlagDefinitionId', event.target.value)}
                >
                  <option value="">Select a flag</option>
                  {enabledFlags.map((flag) => (
                    <option key={flag.id} value={flag.id}>
                      {flag.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Started
                <input
                  type="date"
                  value={plantFlagForm.startedOn}
                  onChange={(event) => onFieldChange('startedOn', event.target.value)}
                />
              </label>
              <label>
                Notes
                <input
                  value={plantFlagForm.notes}
                  onChange={(event) => onFieldChange('notes', event.target.value)}
                />
              </label>
              <button
                className="small-action"
                type="button"
                disabled={isSaving || !plantFlagForm.plantFlagDefinitionId}
                onClick={onAssignFlag}
              >
                <Save size={16} />
                Attach flag
              </button>
            </div>

            {activeFlags.length === 0 ? (
              <p className="empty-state">No active flags.</p>
            ) : (
              <div className="detail-list">
                {activeFlags.map((flag) => (
                  <div className="detail-row" key={flag.id}>
                    <div>
                      <h4>
                        <span className="flag-chip" style={{ backgroundColor: flag.color }}>
                          {flag.name}
                        </span>
                      </h4>
                      <p>
                        Started {formatDate(flag.startedOn)}
                        {flag.notes ? ` - ${flag.notes}` : ''}
                      </p>
                    </div>
                    <div className="row-actions">
                      <button className="small-action" type="button" disabled={isSaving} onClick={() => onResolveFlag(flag)}>
                        Resolve
                      </button>
                      <button className="icon-button compact danger" type="button" aria-label={`Remove ${flag.name}`} disabled={isSaving} onClick={() => onRemoveFlag(flag)}>
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {resolvedFlags.length > 0 ? (
              <div className="detail-list resolved-flags">
                {resolvedFlags.slice(0, 4).map((flag) => (
                  <div className="detail-row" key={flag.id}>
                    <div>
                      <h4>{flag.name}</h4>
                      <p>
                        Resolved {flag.resolvedOn ? formatDate(flag.resolvedOn) : ''}
                        {flag.notes ? ` - ${flag.notes}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        </div>
      ) : null}
    </>
  );
}

function formatDate(date: string) {
  const [year, month, day] = date.split('-');
  if (!year || !month || !day) {
    return date;
  }

  return `${month}/${day}/${year}`;
}
