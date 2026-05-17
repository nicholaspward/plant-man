import { BookOpen, Edit3, Plus, Save, Trash2, X } from 'lucide-react';
import type { PlantTaxon } from '../domain';
import type { TaxonFormState } from '../form-state';
import { formatTaxon } from '../form-state';

type TaxaViewProps = {
  activeTaxonName?: string;
  error: string | null;
  form: TaxonFormState;
  isLoading: boolean;
  isSaving: boolean;
  taxa: PlantTaxon[];
  onCancel: () => void;
  onDelete: (taxon: PlantTaxon) => void;
  onEdit: (taxon: PlantTaxon) => void;
  onFieldChange: (field: keyof TaxonFormState, value: string) => void;
  onNew: () => void;
  onSave: () => void;
};

export function TaxaView({
  activeTaxonName,
  error,
  form,
  isLoading,
  isSaving,
  taxa,
  onCancel,
  onDelete,
  onEdit,
  onFieldChange,
  onNew,
  onSave,
}: TaxaViewProps) {
  return (
    <>
      <section className="summary-panel" aria-labelledby="taxa-summary-heading">
        <div>
          <p className="eyebrow">Taxon library</p>
          <h2 id="taxa-summary-heading">
            {isLoading ? 'Loading taxa' : `${taxa.length} taxa available`}
          </h2>
          <p>{error ?? 'Create and maintain the plant identities used by your collection.'}</p>
        </div>
        <button className="primary-action" type="button" onClick={onNew}>
          <Plus size={18} />
          New taxon
        </button>
      </section>

      <section className="editor-panel" aria-labelledby="taxon-editor-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{activeTaxonName ? 'Editing' : 'New taxon'}</p>
            <h2 id="taxon-editor-heading">{activeTaxonName ?? 'Taxon details'}</h2>
          </div>
          <button className="icon-button compact" type="button" aria-label="Clear form" onClick={onCancel}>
            <X size={18} />
          </button>
        </div>

        <div className="plant-form">
          <label>
            Common name
            <input
              value={form.name}
              onChange={(event) => onFieldChange('name', event.target.value)}
            />
          </label>
          <label>
            Genus
            <input
              value={form.genus}
              onChange={(event) => onFieldChange('genus', event.target.value)}
            />
          </label>
          <label>
            Species
            <input
              value={form.species}
              onChange={(event) => onFieldChange('species', event.target.value)}
            />
          </label>
          <label>
            Cultivar
            <input
              value={form.cultivar}
              onChange={(event) => onFieldChange('cultivar', event.target.value)}
            />
          </label>
          <label>
            Variety
            <input
              value={form.variety}
              onChange={(event) => onFieldChange('variety', event.target.value)}
            />
          </label>
          <label>
            Authority
            <input
              value={form.authority}
              onChange={(event) => onFieldChange('authority', event.target.value)}
            />
          </label>
        </div>

        <div className="form-actions">
          <button className="primary-action" type="button" disabled={isSaving} onClick={onSave}>
            <Save size={18} />
            {isSaving ? 'Saving' : 'Save taxon'}
          </button>
          <button className="text-button" type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </section>

      <section className="section" aria-labelledby="taxa-list-heading">
        <div className="section-heading">
          <h2 id="taxa-list-heading">All Taxa</h2>
        </div>

        <div className="plant-list">
          {!isLoading && taxa.length === 0 ? (
            <p className="empty-state">No taxa yet.</p>
          ) : null}

          {taxa.map((taxon) => (
            <article className="plant-row" key={taxon.id}>
              <div className="plant-mark">
                <BookOpen size={20} />
              </div>
              <div>
                <h3>{taxon.name}</h3>
                <p>{formatTaxon(taxon)}</p>
              </div>
              <div className="row-actions">
                <button className="icon-button compact" type="button" aria-label={`Edit ${taxon.name}`} onClick={() => onEdit(taxon)}>
                  <Edit3 size={17} />
                </button>
                <button className="icon-button compact danger" type="button" aria-label={`Delete ${taxon.name}`} onClick={() => onDelete(taxon)}>
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
