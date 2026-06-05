import { Download, Edit3, Eye, Plus, Save, Search, Trash2, X } from 'lucide-react';
import type { PlantInfoSearchResult, PlantTaxon } from '../domain';
import type { TaxonFormState } from '../form-state';
import { formatTaxon } from '../form-state';

type TaxaViewProps = {
  activeTaxonName?: string;
  error: string | null;
  form: TaxonFormState;
  hasSearched: boolean;
  isEditorOpen: boolean;
  isLoading: boolean;
  isSaving: boolean;
  isSearching: boolean;
  plantInfoResults: PlantInfoSearchResult[];
  searchQuery: string;
  selectedTaxon?: PlantTaxon;
  taxa: PlantTaxon[];
  onCancel: () => void;
  onCloseDetail: () => void;
  onDelete: (taxon: PlantTaxon) => void;
  onEdit: (taxon: PlantTaxon) => void;
  onFieldChange: (field: keyof TaxonFormState, value: string) => void;
  onImportResult: (result: PlantInfoSearchResult) => void;
  onNew: () => void;
  onOpenDetail: (taxon: PlantTaxon) => void;
  onPrefillResult: (result: PlantInfoSearchResult) => void;
  onSave: () => void;
  onSearch: (query?: string) => void;
  onSearchQueryChange: (value: string) => void;
};

const plantInfoSearchExamples = [
  'ficus',
  'monstera',
  'alocasia',
  'croton',
];

function getPlantInfoSubtitle(result: PlantInfoSearchResult) {
  if (result.commonName) {
    return result.commonName;
  }

  return [result.genus, result.species].filter(Boolean).join(' ') || 'Reference taxon';
}

export function TaxaView({
  activeTaxonName,
  error,
  form,
  hasSearched,
  isEditorOpen,
  isLoading,
  isSaving,
  isSearching,
  plantInfoResults,
  searchQuery,
  selectedTaxon,
  taxa,
  onCancel,
  onCloseDetail,
  onDelete,
  onEdit,
  onFieldChange,
  onImportResult,
  onNew,
  onOpenDetail,
  onPrefillResult,
  onSave,
  onSearch,
  onSearchQueryChange,
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

      <section className="editor-panel" aria-labelledby="taxa-search-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Offline lookup</p>
            <h2 id="taxa-search-heading">Search plant info</h2>
          </div>
        </div>

        <div className="search-row">
          <label>
            Plant name
            <input
              type="search"
              value={searchQuery}
              placeholder="ficus"
              onChange={(event) => onSearchQueryChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  onSearch();
                }
              }}
            />
          </label>
          <button className="primary-action" type="button" disabled={isSearching} onClick={() => onSearch()}>
            <Search size={18} />
            {isSearching ? 'Searching' : 'Search'}
          </button>
        </div>

        <div className="query-chip-row" aria-label="Example plant info searches">
          {plantInfoSearchExamples.map((query) => (
            <button
              className="query-chip"
              type="button"
              key={query}
              onClick={() => onSearch(query)}
            >
              {query}
            </button>
          ))}
        </div>

        {plantInfoResults.length > 0 ? (
          <div className="plant-list">
            {plantInfoResults.map((result) => (
              <article className="plant-row" key={`${result.source}-${result.externalId}`}>
                <div className="plant-info-result">
                  <h3>{result.canonicalName ?? result.scientificName}</h3>
                  <p>{getPlantInfoSubtitle(result)}</p>
                  <dl className="plant-info-meta">
                    <div>
                      <dt>Family</dt>
                      <dd>{result.family ?? 'Unknown'}</dd>
                    </div>
                    <div>
                      <dt>Genus</dt>
                      <dd>{result.genus ?? 'Unknown'}</dd>
                    </div>
                    <div>
                      <dt>Species</dt>
                      <dd>{result.species ?? 'Unknown'}</dd>
                    </div>
                    <div>
                      <dt>Status</dt>
                      <dd>{[result.rank, result.status].filter(Boolean).join(' / ') || 'Unknown'}</dd>
                    </div>
                    <div>
                      <dt>Source</dt>
                      <dd>{`${result.source}:${result.externalId}`}</dd>
                    </div>
                  </dl>
                </div>
                <div className="row-actions">
                  <button className="small-action" type="button" onClick={() => onPrefillResult(result)}>
                    <Edit3 size={16} />
                    Prefill
                  </button>
                  <button className="small-action" type="button" disabled={isSaving} onClick={() => onImportResult(result)}>
                    <Download size={16} />
                    Import
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : hasSearched && !isSearching ? (
          <p className="empty-state">No plant info matches that search.</p>
        ) : null}
      </section>

      {selectedTaxon && !isEditorOpen ? (
        <section className="editor-panel" aria-labelledby="taxon-detail-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Taxon detail</p>
              <h2 id="taxon-detail-heading">{formatTaxon(selectedTaxon)}</h2>
            </div>
            <div className="row-actions">
              <button className="icon-button compact" type="button" aria-label={`Edit ${selectedTaxon.name}`} onClick={() => onEdit(selectedTaxon)}>
                <Edit3 size={17} />
              </button>
              <button className="icon-button compact" type="button" aria-label="Close taxon detail" onClick={onCloseDetail}>
                <X size={18} />
              </button>
            </div>
          </div>
          <div className="plant-detail-meta">
            <div>
              <span>Common name</span>
              <strong>{selectedTaxon.name}</strong>
            </div>
            <div>
              <span>Genus</span>
              <strong>{selectedTaxon.genus}</strong>
            </div>
            <div>
              <span>Species</span>
              <strong>{selectedTaxon.species}</strong>
            </div>
            <div>
              <span>Cultivar</span>
              <strong>{selectedTaxon.cultivar ?? 'None'}</strong>
            </div>
            <div>
              <span>Variety</span>
              <strong>{selectedTaxon.variety ?? 'None'}</strong>
            </div>
            <div>
              <span>Authority</span>
              <strong>{selectedTaxon.authority ?? 'None'}</strong>
            </div>
            <div>
              <span>Family</span>
              <strong>{selectedTaxon.family ?? 'None'}</strong>
            </div>
            <div>
              <span>GBIF</span>
              <strong>{selectedTaxon.externalSource === 'gbif' ? selectedTaxon.externalId : 'Not linked'}</strong>
            </div>
          </div>
        </section>
      ) : null}

      {isEditorOpen ? (
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
          <label>
            Family
            <input
              value={form.family}
              onChange={(event) => onFieldChange('family', event.target.value)}
            />
          </label>
          <label>
            GBIF ID
            <input
              value={form.externalId}
              onChange={(event) => onFieldChange('externalId', event.target.value)}
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
      ) : null}

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
              <div>
                <h3>{formatTaxon(taxon)}</h3>
              </div>
              <div className="row-actions">
                <button className="icon-button compact" type="button" aria-label={`View ${taxon.name}`} onClick={() => onOpenDetail(taxon)}>
                  <Eye size={17} />
                </button>
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
