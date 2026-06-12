import { useMemo, useState } from 'react';
import type { PlantFlagDefinition } from '../domain';
import type { FlagDefinitionFormState } from '../form-state';
import { CatalogFilterSection, ClosePanelButton, DetailActions, EntityList, RecordActions, SummaryActionButton, SummaryStrip } from './Ui';

const flagThemeColors = [
  { label: 'Alert', value: '#FFEDEB' },
  { label: 'Attention', value: '#FFF7D6' },
  { label: 'Monitor', value: '#E9F2FF' },
  { label: 'Healthy', value: '#DCFFF1' },
  { label: 'Info', value: '#F1F2F4' },
  { label: 'Special', value: '#F3F0FF' },
  { label: 'Paused', value: '#DCDFE4' },
  { label: 'Review', value: '#EAE6FF' },
];

type FlagsViewProps = {
  activeFlagName?: string;
  error: string | null;
  flags: PlantFlagDefinition[];
  form: FlagDefinitionFormState;
  isEditorOpen: boolean;
  isLoading: boolean;
  isSaving: boolean;
  selectedFlag?: PlantFlagDefinition;
  onCancel: () => void;
  onCloseDetail: () => void;
  onDelete: (flag: PlantFlagDefinition) => void;
  onEdit: (flag: PlantFlagDefinition) => void;
  onFieldChange: (field: keyof FlagDefinitionFormState, value: string) => void;
  onNew: () => void;
  onOpenDetail: (flag: PlantFlagDefinition) => void;
  onSave: () => void;
};

export function FlagsView({
  activeFlagName,
  error,
  flags,
  form,
  isEditorOpen,
  isLoading,
  isSaving,
  selectedFlag,
  onCancel,
  onCloseDetail,
  onDelete,
  onEdit,
  onFieldChange,
  onNew,
  onOpenDetail,
  onSave,
}: FlagsViewProps) {
  const [filterQuery, setFilterQuery] = useState('');
  const filteredFlags = useMemo(() => {
    const query = filterQuery.trim().toLowerCase();
    if (!query) {
      return flags;
    }

    return flags.filter((flag) => flag.name.toLowerCase().includes(query));
  }, [filterQuery, flags]);

  return (
    <>
      <SummaryStrip
        ariaLabel="Flags summary"
        action={<SummaryActionButton onClick={onNew}>New</SummaryActionButton>}
      >
        <p>{error ?? 'Configure reusable flags for plants.'}</p>
      </SummaryStrip>

      <CatalogFilterSection
        value={filterQuery}
        placeholder="Search flags"
        onChange={setFilterQuery}
      />

      <EntityList
        ariaLabel="Flags"
        emptyMessage={flags.length === 0 ? 'No flags yet.' : 'No flags match this search.'}
        getKey={(flag) => flag.id}
        isLoading={isLoading}
        items={filteredFlags}
        renderActions={(flag) => (
          <>
            <span className="flag-chip" style={{ backgroundColor: flag.color }}>
              {flag.name}
            </span>
            <RecordActions
              deleteLabel={`Delete ${flag.name}`}
              editLabel={`Edit ${flag.name}`}
              viewLabel={`View ${flag.name}`}
              onDelete={() => onDelete(flag)}
              onEdit={() => onEdit(flag)}
              onView={() => onOpenDetail(flag)}
            />
          </>
        )}
        renderContent={(flag) => <h3>{flag.name}</h3>}
      />

      {selectedFlag && !isEditorOpen ? (
        <section className="work-panel" aria-labelledby="flag-detail-heading">
          <div className="section-heading">
            <div>
              <h2 id="flag-detail-heading">{selectedFlag.name}</h2>
            </div>
            <DetailActions
              closeLabel="Close flag detail"
              editLabel={`Edit ${selectedFlag.name}`}
              onClose={onCloseDetail}
              onEdit={() => onEdit(selectedFlag)}
            />
          </div>
          <span className="flag-chip" style={{ backgroundColor: selectedFlag.color }}>
            {selectedFlag.name}
          </span>
        </section>
      ) : null}

      {isEditorOpen ? (
        <section className="work-panel" aria-labelledby="flag-editor-heading">
          <div className="section-heading">
            <div>
              <h2 id="flag-editor-heading">{activeFlagName ?? 'New flag'}</h2>
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
            <fieldset className="flag-theme-picker form-wide">
              <legend>Color theme</legend>
              <div className="flag-theme-options">
                {flagThemeColors.map((theme) => (
                  <label className="flag-theme-option" key={theme.value}>
                    <input
                      checked={form.color.toLowerCase() === theme.value.toLowerCase()}
                      type="radio"
                      name="flag-color-theme"
                      value={theme.value}
                      onChange={() => onFieldChange('color', theme.value)}
                    />
                    <span className="flag-theme-swatch" style={{ backgroundColor: theme.value }} />
                    <span>{theme.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
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
