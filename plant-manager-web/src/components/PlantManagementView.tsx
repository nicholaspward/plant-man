import { useMemo, useState } from 'react';
import type {
  Plant,
  PlantFlag,
  PlantFlagDefinition,
  PlantLocation,
  PlantTaxon,
} from '../domain';
import type { PlantFlagFormState, PlantFormState } from '../form-state';
import { formatTaxon } from '../form-state';
import { CatalogFilterSection, SummaryActionButton, SummaryStrip } from './Ui';

type PlantManagementViewProps = {
  activePlantName?: string;
  error: string | null;
  form: PlantFormState;
  isPlantEditorOpen: boolean;
  isLoading: boolean;
  isSaving: boolean;
  plantFlagDefinitions: PlantFlagDefinition[];
  plantFlagForm: PlantFlagFormState;
  plantLocations: PlantLocation[];
  plantTaxa: PlantTaxon[];
  plants: Plant[];
  selectedPlant?: Plant;
  onAssignFlag: () => void;
  onCancelPlant: () => void;
  onDeletePlant: (plant: Plant) => void;
  onFieldChange: (field: keyof PlantFlagFormState, value: string) => void;
  onNewPlant: () => void;
  onPlantFieldChange: (field: keyof PlantFormState, value: PlantFormState[keyof PlantFormState]) => void;
  onRemoveFlag: (flag: PlantFlag) => void;
  onResolveFlag: (flag: PlantFlag) => void;
  onSavePlant: () => void;
  onSelectPlant: (plantId: string) => void;
};

export function PlantManagementView({
  activePlantName,
  error,
  form,
  isPlantEditorOpen,
  isLoading,
  isSaving,
  plantFlagDefinitions,
  plantFlagForm,
  plantLocations,
  plantTaxa,
  plants,
  selectedPlant,
  onAssignFlag,
  onCancelPlant,
  onDeletePlant,
  onFieldChange,
  onNewPlant,
  onPlantFieldChange,
  onRemoveFlag,
  onResolveFlag,
  onSavePlant,
  onSelectPlant,
}: PlantManagementViewProps) {
  const [plantSearchQuery, setPlantSearchQuery] = useState('');
  const isNewPlant = isPlantEditorOpen && !activePlantName;
  const activeFlags = selectedPlant?.flags.filter((flag) => flag.resolvedOn === null) ?? [];
  const resolvedFlags = selectedPlant?.flags.filter((flag) => flag.resolvedOn !== null) ?? [];
  const filteredPlants = useMemo(() => {
    const query = plantSearchQuery.trim().toLowerCase();
    if (query.length === 0) {
      return plants;
    }

    return plants.filter((plant) => getPlantSearchText(plant, plantTaxa).includes(query));
  }, [plantSearchQuery, plantTaxa, plants]);

  return (
    <>
      <SummaryStrip
        ariaLabel="Plant management summary"
        action={(
          <div className="summary-actions">
            <SummaryActionButton onClick={onNewPlant}>New</SummaryActionButton>
          </div>
        )}
      >
        <p>{error ?? 'Create plants and attach catalog records to each plant.'}</p>
      </SummaryStrip>

      {!isNewPlant ? (
        <>
          <CatalogFilterSection
            value={plantSearchQuery}
            placeholder="Search plants"
            onChange={setPlantSearchQuery}
          />

          <section className="work-panel" aria-label="Plants">
          <div className="plant-list">
            {!isLoading && plants.length === 0 ? (
              <p className="empty-state">No plants yet.</p>
            ) : null}

            {!isLoading && plants.length > 0 && filteredPlants.length === 0 ? (
              <p className="empty-state">No plants match this search.</p>
            ) : null}

            {filteredPlants.map((plant) => (
              <article className="plant-row" key={plant.id}>
                <div>
                  <h3>{plant.nickname}</h3>
                  <p>
                    {plant.birthday ? `Birthday ${plant.birthday}` : 'No birthday'}
                    {plant.taxon ? ` - ${plant.taxon}` : ''}
                    {plant.location ? ` - ${plant.location}` : ''}
                  </p>
                </div>
                <div className="row-actions">
                  <button className="small-action" type="button" onClick={() => onSelectPlant(String(plant.id))}>
                    Manage
                  </button>
                  <button className="icon-button compact danger" type="button" aria-label={`Delete ${plant.nickname}`} onClick={() => onDeletePlant(plant)}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
          </section>
        </>
      ) : null}

      {isPlantEditorOpen ? (
        <section className="work-panel" aria-labelledby="plant-editor-heading">
          <div className="section-heading">
            <div>
              <h2 id="plant-editor-heading">{activePlantName ?? 'New plant'}</h2>
            </div>
            <button className="icon-button compact" type="button" aria-label="Close panel" onClick={onCancelPlant}>
              Close
            </button>
          </div>

          <div className="plant-form">
            <label>
              Name
              <input
                value={form.nickname}
                onChange={(event) => onPlantFieldChange('nickname', event.target.value)}
              />
            </label>
            <label>
              Birthday
              <input
                type="date"
                value={form.birthday}
                onChange={(event) => onPlantFieldChange('birthday', event.target.value)}
              />
            </label>
            <label>
              Taxon
              <select
                value={form.taxonId}
                onChange={(event) => onPlantFieldChange('taxonId', event.target.value)}
              >
                <option value="">No taxon</option>
                {plantTaxa.map((taxon) => (
                  <option key={taxon.id} value={taxon.id}>
                    {formatTaxon(taxon)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Location
              <select
                value={form.locationId}
                onChange={(event) => onPlantFieldChange('locationId', event.target.value)}
              >
                <option value="">No location</option>
                {plantLocations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>
      ) : null}

      {selectedPlant ? (
        <>
          <section className="work-panel" aria-labelledby="plant-management-flags">
            <div className="detail-section-heading">
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
                  {plantFlagDefinitions.map((flag) => (
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
                Attach flag
              </button>
            </div>

            {activeFlags.length === 0 ? (
              <p className="empty-state">No active flags.</p>
            ) : (
              <>
                <p className="list-label">Active flags</p>
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
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {resolvedFlags.length > 0 ? (
              <>
                <p className="list-label">Recently resolved</p>
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
              </>
            ) : null}
          </section>

          <section className="work-panel" aria-labelledby="plant-management-timeline">
            <div className="detail-section-heading">
              <h3 id="plant-management-timeline">Timeline</h3>
            </div>
            <PlantTimeline plant={selectedPlant} />
          </section>
        </>
      ) : null}

      {isPlantEditorOpen ? (
        <section className="work-panel plant-editor-actions" aria-label="Plant edit actions">
          <div className="form-actions">
            <button className="primary-action" type="button" disabled={isSaving} onClick={onSavePlant}>
              {isSaving ? 'Saving' : 'Save'}
            </button>
            <button className="text-button" type="button" onClick={onCancelPlant}>
              Cancel
            </button>
            {selectedPlant ? (
              <button className="small-action danger" type="button" disabled={isSaving} onClick={() => onDeletePlant(selectedPlant)}>
                Delete
              </button>
            ) : null}
          </div>
        </section>
      ) : null}

    </>
  );
}

function getPlantSearchText(plant: Plant, plantTaxa: PlantTaxon[]) {
  const taxon = plantTaxa.find((item) => item.id === plant.taxonId);
  return [
    plant.nickname,
    plant.birthday,
    plant.location,
    plant.taxon,
    ...plant.groups.map((group) => group.name),
    taxon?.name,
    taxon?.genus,
    taxon?.species,
    taxon?.cultivar,
    taxon?.variety,
    taxon?.authority,
    taxon?.family,
    taxon?.commonName,
    taxon ? formatTaxon(taxon) : null,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
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

function formatDate(date: string) {
  const [year, month, day] = date.split('-');
  if (!year || !month || !day) {
    return date;
  }

  return `${month}/${day}/${year}`;
}
