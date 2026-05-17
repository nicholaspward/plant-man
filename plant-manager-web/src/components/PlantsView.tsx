import { Check, Edit3, Leaf, Plus, Save, Trash2, X, ClipboardCheck } from 'lucide-react';
import type { ActionLog, CareAction, Plant, PlantTaxon } from '../domain';
import type { CareLogFormState, PlantFormState, TaxonFormState } from '../form-state';
import { formatTaxon } from '../form-state';

type PlantsViewProps = {
  activePlantName?: string;
  actionLogs: ActionLog[];
  careActions: CareAction[];
  careLogForm: CareLogFormState;
  error: string | null;
  form: PlantFormState;
  isLoading: boolean;
  isSaving: boolean;
  plantTaxa: PlantTaxon[];
  plants: Plant[];
  onCancel: () => void;
  onDelete: (plant: Plant) => void;
  onEdit: (plant: Plant) => void;
  onFieldChange: (field: keyof PlantFormState, value: string) => void;
  onLogCare: () => void;
  onLogCareFieldChange: (field: keyof CareLogFormState, value: string) => void;
  onNew: () => void;
  onQuickTaxonFieldChange: (field: keyof TaxonFormState, value: string) => void;
  onSave: () => void;
  onSaveQuickTaxon: () => void;
  onSelectTaxon: (taxon: PlantTaxon) => void;
  onStartLogCare: (plant?: Plant) => void;
  onTaxonSearchChange: (value: string) => void;
  quickTaxonForm: TaxonFormState;
  taxonSearch: string;
  isCreatingTaxon: boolean;
};

export function PlantsView({
  activePlantName,
  actionLogs,
  careActions,
  careLogForm,
  error,
  form,
  isLoading,
  isSaving,
  plantTaxa,
  plants,
  onCancel,
  onDelete,
  onEdit,
  onFieldChange,
  onLogCare,
  onLogCareFieldChange,
  onNew,
  onQuickTaxonFieldChange,
  onSave,
  onSaveQuickTaxon,
  onSelectTaxon,
  onStartLogCare,
  onTaxonSearchChange,
  quickTaxonForm,
  taxonSearch,
  isCreatingTaxon,
}: PlantsViewProps) {
  const enabledCareActions = careActions.filter((action) => action.isEnabled);
  const selectedTaxon = plantTaxa.find((taxon) => String(taxon.id) === form.taxonId);
  const normalizedSearch = taxonSearch.trim().toLowerCase();
  const filteredTaxa = plantTaxa.filter((taxon) => {
    if (!normalizedSearch) {
      return true;
    }

    return [
      taxon.name,
      taxon.genus,
      taxon.species,
      formatTaxon(taxon),
    ].some((value) => value.toLowerCase().includes(normalizedSearch));
  });

  return (
    <>
      <section className="summary-panel" aria-labelledby="plants-summary-heading">
        <div>
          <p className="eyebrow">Plant inventory</p>
          <h2 id="plants-summary-heading">
            {isLoading ? 'Loading plants' : `${plants.length} plants tracked`}
          </h2>
          <p>{error ?? 'Add, update, or remove plants from your collection.'}</p>
        </div>
        <button className="primary-action" type="button" onClick={onNew}>
          <Plus size={18} />
          New plant
        </button>
      </section>

      <section className="editor-panel" aria-labelledby="care-log-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Manual entry</p>
            <h2 id="care-log-heading">Log care</h2>
          </div>
          <button className="icon-button compact" type="button" aria-label="Start care log" onClick={() => onStartLogCare()}>
            <ClipboardCheck size={18} />
          </button>
        </div>

        <div className="plant-form">
          <label>
            Plant
            <select
              value={careLogForm.plantId}
              onChange={(event) => onLogCareFieldChange('plantId', event.target.value)}
            >
              <option value="">Select a plant</option>
              {plants.map((plant) => (
                <option key={plant.id} value={plant.id}>
                  {plant.nickname}
                </option>
              ))}
            </select>
          </label>
          <label>
            Action
            <select
              value={careLogForm.action}
              onChange={(event) => onLogCareFieldChange('action', event.target.value)}
            >
              {enabledCareActions.length === 0 ? (
                <option value="">No enabled actions</option>
              ) : null}
              {enabledCareActions.map((action) => (
                <option key={action.id} value={action.name}>
                  {action.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Date
            <input
              type="date"
              value={careLogForm.performedOn}
              onChange={(event) => onLogCareFieldChange('performedOn', event.target.value)}
            />
          </label>
          <label>
            Notes
            <input
              value={careLogForm.notes}
              onChange={(event) => onLogCareFieldChange('notes', event.target.value)}
            />
          </label>
        </div>

        <div className="form-actions">
          <button className="primary-action" type="button" disabled={isSaving || enabledCareActions.length === 0} onClick={onLogCare}>
            <ClipboardCheck size={18} />
            {isSaving ? 'Logging' : 'Log care'}
          </button>
        </div>
      </section>

      <section className="section" aria-labelledby="care-history-heading">
        <div className="section-heading">
          <h2 id="care-history-heading">Care History</h2>
        </div>

        <div className="plant-list">
          {!isLoading && actionLogs.length === 0 ? (
            <p className="empty-state">No care logged yet.</p>
          ) : null}

          {actionLogs.slice(0, 12).map((log) => (
            <article className="plant-row" key={log.id}>
              <div className="plant-mark">
                <ClipboardCheck size={20} />
              </div>
              <div>
                <h3>{log.action}</h3>
                <p>
                  {log.plantName} - {formatLogDate(log.performedOn)}
                  {log.notes ? ` - ${log.notes}` : ''}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

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
            Nickname
            <input
              value={form.nickname}
              onChange={(event) => onFieldChange('nickname', event.target.value)}
            />
          </label>
          <div className="taxon-picker">
            <label>
              Taxon
              <input
                value={taxonSearch}
                onChange={(event) => onTaxonSearchChange(event.target.value)}
              />
            </label>
            {selectedTaxon ? (
              <p className="selected-taxon">
                <Check size={15} />
                {formatTaxon(selectedTaxon)}
              </p>
            ) : null}
            <div className="taxon-results" aria-label="Taxon search results">
              {filteredTaxa.length === 0 ? (
                <p className="empty-state">No matching taxa.</p>
              ) : null}
              {filteredTaxa.slice(0, 8).map((taxon) => (
                <button
                  className="taxon-option"
                  key={taxon.id}
                  type="button"
                  aria-pressed={String(taxon.id) === form.taxonId}
                  onClick={() => onSelectTaxon(taxon)}
                >
                  <span>{taxon.name}</span>
                  <small>{taxon.genus} {taxon.species}</small>
                </button>
              ))}
            </div>
          </div>
          <label>
            Location
            <input
              value={form.location}
              onChange={(event) => onFieldChange('location', event.target.value)}
            />
          </label>
          <label>
            Last watered
            <input
              type="date"
              value={form.lastWateredOn}
              onChange={(event) => onFieldChange('lastWateredOn', event.target.value)}
            />
          </label>
          <label>
            Water every days
            <input
              min="1"
              max="365"
              type="number"
              value={form.waterEveryDays}
              onChange={(event) => onFieldChange('waterEveryDays', event.target.value)}
            />
          </label>
        </div>

        <div className="quick-taxon" aria-labelledby="quick-taxon-heading">
          <div>
            <p className="eyebrow">Missing from the list?</p>
            <h3 id="quick-taxon-heading">Create taxon</h3>
          </div>
          <div className="quick-taxon-fields">
            <label>
              Common name
              <input
                value={quickTaxonForm.name}
                onChange={(event) => onQuickTaxonFieldChange('name', event.target.value)}
              />
            </label>
            <label>
              Genus
              <input
                value={quickTaxonForm.genus}
                onChange={(event) => onQuickTaxonFieldChange('genus', event.target.value)}
              />
            </label>
            <label>
              Species
              <input
                value={quickTaxonForm.species}
                onChange={(event) => onQuickTaxonFieldChange('species', event.target.value)}
              />
            </label>
          </div>
          <button className="small-action" type="button" disabled={isCreatingTaxon} onClick={onSaveQuickTaxon}>
            <Plus size={16} />
            {isCreatingTaxon ? 'Adding' : 'Add and select'}
          </button>
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
              <div className="plant-mark">
                <Leaf size={20} />
              </div>
              <div>
                <h3>{plant.nickname}</h3>
                <p>{plant.taxon} - {plant.location}</p>
              </div>
              <div className="row-actions">
                <button className="icon-button compact" type="button" aria-label={`Edit ${plant.nickname}`} onClick={() => onEdit(plant)}>
                  <Edit3 size={17} />
                </button>
                <button className="icon-button compact" type="button" aria-label={`Log care for ${plant.nickname}`} onClick={() => onStartLogCare(plant)}>
                  <ClipboardCheck size={17} />
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

function formatLogDate(date: string) {
  const [year, month, day] = date.split('-');
  if (!year || !month || !day) {
    return date;
  }

  return `${month}/${day}/${year}`;
}
