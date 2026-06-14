import { useMemo, useState } from 'react';
import type { PlantInfoSearchResult, PlantTaxon } from '../domain';
import { formatTaxon } from '../form-state';
import { CatalogFilterSection, EntityList, SummaryStrip } from './Ui';

type TaxaViewProps = {
  error: string | null;
  hasSearched: boolean;
  isLoading: boolean;
  isSaving: boolean;
  isSearching: boolean;
  plantInfoResults: PlantInfoSearchResult[];
  searchQuery: string;
  selectedTaxon?: PlantTaxon;
  taxa: PlantTaxon[];
  onCloseDetail: () => void;
  onDelete: (taxon: PlantTaxon) => void;
  onImportResult: (result: PlantInfoSearchResult) => void;
  onOpenDetail: (taxon: PlantTaxon) => void;
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
  error,
  hasSearched,
  isLoading,
  isSaving,
  isSearching,
  plantInfoResults,
  searchQuery,
  selectedTaxon,
  taxa,
  onCloseDetail,
  onDelete,
  onImportResult,
  onOpenDetail,
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
      >
        <p>{error ?? 'Import GBIF-backed plant identities for use in your collection.'}</p>
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
          <>
            <button className="icon-button compact" type="button" aria-label={`View ${taxon.name}`} onClick={() => onOpenDetail(taxon)}>
              View
            </button>
            <button className="icon-button compact danger" type="button" aria-label={`Delete ${taxon.name}`} onClick={() => onDelete(taxon)}>
              Delete
            </button>
          </>
        )}
        renderContent={(taxon) => <h3>{formatTaxon(taxon)}</h3>}
      />

      <section className="work-panel" aria-labelledby="taxa-search-heading">
        <div className="section-heading">
          <div>
            <h2 id="taxa-search-heading">Search GBIF</h2>
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

      {selectedTaxon ? (
        <section className="work-panel" aria-labelledby="taxon-detail-heading">
          <div className="section-heading">
            <div>
              <h2 id="taxon-detail-heading">{formatTaxon(selectedTaxon)}</h2>
            </div>
            <div className="row-actions">
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

    </>
  );
}
