import { useState } from 'react';
import type { CatalogImportResult } from '../domain';
import { SummaryStrip } from './Ui';

type ImportExportViewProps = {
  catalogImportResult: CatalogImportResult | null;
  error: string | null;
  isExporting: boolean;
  isImportingCatalog: boolean;
  onApplyCatalogImport: (file: File) => void;
  onExport: () => void;
  onPreviewCatalogImport: (file: File) => void;
};

export function ImportExportView({
  catalogImportResult,
  error,
  isExporting,
  isImportingCatalog,
  onApplyCatalogImport,
  onExport,
  onPreviewCatalogImport,
}: ImportExportViewProps) {
  const [catalogImportFile, setCatalogImportFile] = useState<File | null>(null);
  const [previewedCatalogImportFile, setPreviewedCatalogImportFile] = useState<File | null>(null);
  const canApplyPreviewedFile = catalogImportFile !== null
    && previewedCatalogImportFile === catalogImportFile
    && catalogImportResult?.canApply === true;

  return (
    <>
      <SummaryStrip
        ariaLabel="Import and export summary"
        action={(
          <div className="summary-actions">
          <button className="primary-action" type="button" disabled={isExporting} onClick={onExport}>
            {isExporting ? 'Exporting' : 'Export'}
          </button>
          </div>
        )}
      >
        <p>{error ?? 'Move catalog data in and out of Plant-Man spreadsheets.'}</p>
      </SummaryStrip>

      <section className="work-panel catalog-import-panel" aria-labelledby="catalog-import-heading">
        <div className="section-heading">
          <h2 id="catalog-import-heading">Spreadsheet import</h2>
          <div className="row-actions">
            <button
              className="small-action"
              type="button"
              disabled={isImportingCatalog || catalogImportFile === null}
              onClick={() => {
                if (catalogImportFile) {
                  setPreviewedCatalogImportFile(catalogImportFile);
                  onPreviewCatalogImport(catalogImportFile);
                }
              }}
            >
              Preview
            </button>
            <button
              className="small-action"
              type="button"
              disabled={isImportingCatalog || !canApplyPreviewedFile}
              onClick={() => catalogImportFile ? onApplyCatalogImport(catalogImportFile) : undefined}
            >
              Apply
            </button>
          </div>
        </div>

        <div className="plant-form import-file-row">
          <label className="form-wide">
            Workbook
            <input
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              type="file"
              onChange={(event) => {
                setCatalogImportFile(event.target.files?.[0] ?? null);
                setPreviewedCatalogImportFile(null);
              }}
            />
          </label>
        </div>

        {catalogImportResult ? (
          <div className="import-preview">
            <div className="plant-detail-meta compact-meta">
              <div>
                <span>Create</span>
                <strong>{catalogImportResult.created}</strong>
              </div>
              <div>
                <span>Update</span>
                <strong>{catalogImportResult.updated}</strong>
              </div>
              <div>
                <span>Skipped</span>
                <strong>{catalogImportResult.skipped}</strong>
              </div>
              <div>
                <span>Status</span>
                <strong>{catalogImportResult.applied ? 'Applied' : catalogImportResult.canApply ? 'Ready' : 'Blocked'}</strong>
              </div>
            </div>

            {catalogImportResult.sheets.length > 0 ? (
              <div className="detail-list import-sheet-list">
                {catalogImportResult.sheets.map((sheet) => (
                  <div className="detail-row import-row" key={sheet.sheet}>
                    <div>
                      <h4>{sheet.sheet}</h4>
                      <p>
                        {sheet.rows} rows - {sheet.creates} create - {sheet.updates} update - {sheet.skips} skipped
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {catalogImportResult.issues.length > 0 ? (
              <>
                <p className="list-label">Issues</p>
                <div className="detail-list import-issue-list">
                  {catalogImportResult.issues.slice(0, 12).map((issue, index) => (
                    <div className="detail-row import-row" key={`${issue.sheet}-${issue.row}-${issue.field}-${index}`}>
                      <div>
                        <h4>{issue.sheet}{issue.row > 0 ? ` row ${issue.row}` : ''}</h4>
                        <p>{issue.field}: {issue.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        ) : null}
      </section>
    </>
  );
}
