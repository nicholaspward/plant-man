import { useMemo, useState } from 'react';
import type { PlantInfoSearchResult, PlantTaxon } from '../domain';
import type { TaxonFormState } from '../form-state';
import { formatTaxon } from '../form-state';
import { CatalogFilterSection, EntityList, RecordActions, SummaryActionButton, SummaryStrip } from './Ui';

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
  const [filterQuery, setFilterQuery] = useState('');
  const filteredTaxa = useMemo(() => {
    const query = filterQuery.trim().toLowerCase();
    if (!query) {
      return taxa;
    }

    return taxa.filter((taxon) =>
      `${formatTaxon(taxon)} ${taxon.commonName ?? ''} ${taxon.genus ?? ''} ${taxon.species ?? ''} ${taxon.cultivar ?? ''} ${taxon.variety ?? ''}`
        .toLowerCase()
        .includes(query)
    );
  }, [filterQuery, taxa]);

  return (
    <>
      <SummaryStrip
        ariaLabel="Taxa summary"
        action={<SummaryActionButton onClick={onNew}>New</SummaryActionButton>}
      >
        <p>{error ?? 'Create and maintain the plant identities used by your collection.'}</p>
      </SummaryStrip>

      <CatalogFilterSection
        value={filterQuery}
        placeholder="Search taxa"
        onChange={setFilterQuery}
      />

      <EntityList
        ariaLabel="Taxa"
        emptyMessage={taxa.length === 0 ? 'No taxa yet.' : 'No taxa match this search.'}
        getKey={(taxon) => taxon.id}
        isLoading={isLoading}
        items={filteredTaxa}
        renderActions={(taxon) => (
          <RecordActions
            deleteLabel={`Delete ${taxon.name}`}
            editLabel={`Edit ${taxon.name}`}
            viewLabel={`View ${taxon.name}`}
            onDelete={() => onDelete(taxon)}
            onEdit={() => onEdit(taxon)}
            onView={() => onOpenDetail(taxon)}
          />
        )}
        renderContent={(taxon) => <h3>{formatTaxon(taxon)}</h3>}
      />

      <section className="work-panel" aria-labelledby="taxa-search-heading">
        <div className="section-heading">
          <div>
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
            {isSearching ? 'Searching' : 'Search'}
          </button>
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
                      <dt>Common Names</dt>
                      <dd>{result.commonNames.length > 0 ? result.commonNames.join(', ') : 'None'}</dd>
                    </div>
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
                      <dd>
                        {result.source === 'gbif' ? (
                          <a
                            href={`https://www.gbif.org/species/${result.externalId}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {`${result.source}:${result.externalId}`}
                          </a>
                        ) : (
                          `${result.source}:${result.externalId}`
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>
                <div className="row-actions">
                  <button className="small-action" type="button" onClick={() => onPrefillResult(result)}>
                    Prefill
                  </button>
                  <button className="small-action" type="button" disabled={isSaving} onClick={() => onImportResult(result)}>
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
        <section className="work-panel" aria-labelledby="taxon-detail-heading">
          <div className="section-heading">
            <div>
              <h2 id="taxon-detail-heading">{formatTaxon(selectedTaxon)}</h2>
            </div>
            <div className="row-actions">
              <button className="icon-button compact" type="button" aria-label={`Edit ${selectedTaxon.name}`} onClick={() => onEdit(selectedTaxon)}>
                Edit
              </button>
              <button className="icon-button compact" type="button" aria-label="Close taxon detail" onClick={onCloseDetail}>
                Close
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
      <section className="work-panel" aria-labelledby="taxon-editor-heading">
        <div className="section-heading">
          <div>
            <h2 id="taxon-editor-heading">{activeTaxonName ?? 'New taxon'}</h2>
          </div>
          <button className="icon-button compact" type="button" aria-label="Close panel" onClick={onCancel}>
            Close
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
