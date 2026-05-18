import { Edit3, Plus, Save, Trash2, X } from 'lucide-react';
import type { PlantFlagDefinition } from '../domain';
import type { FlagDefinitionFormState } from '../form-state';

type FlagsViewProps = {
  activeFlagName?: string;
  error: string | null;
  flags: PlantFlagDefinition[];
  form: FlagDefinitionFormState;
  isEditorOpen: boolean;
  isLoading: boolean;
  isSaving: boolean;
  onCancel: () => void;
  onDelete: (flag: PlantFlagDefinition) => void;
  onEdit: (flag: PlantFlagDefinition) => void;
  onFieldChange: (field: keyof FlagDefinitionFormState, value: string | boolean) => void;
  onNew: () => void;
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
  onCancel,
  onDelete,
  onEdit,
  onFieldChange,
  onNew,
  onSave,
}: FlagsViewProps) {
  const enabledCount = flags.filter((flag) => flag.isEnabled).length;

  return (
    <>
      <section className="summary-panel" aria-labelledby="flags-summary-heading">
        <div>
          <p className="eyebrow">Plant flags</p>
          <h2 id="flags-summary-heading">
            {isLoading ? 'Loading flags' : `${enabledCount} flags enabled`}
          </h2>
          <p>{error ?? 'Configure reusable pest, condition, and workflow flags for plants.'}</p>
        </div>
        <button className="primary-action" type="button" onClick={onNew}>
          <Plus size={18} />
          New flag
        </button>
      </section>

      {isEditorOpen ? (
        <section className="editor-panel" aria-labelledby="flag-editor-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{activeFlagName ? 'Editing' : 'New flag'}</p>
              <h2 id="flag-editor-heading">{activeFlagName ?? 'Flag details'}</h2>
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
              Category
              <select
                value={form.category}
                onChange={(event) => onFieldChange('category', event.target.value)}
              >
                <option value="Pest">Pest</option>
                <option value="Disease">Disease</option>
                <option value="Condition">Condition</option>
                <option value="Workflow">Workflow</option>
                <option value="General">General</option>
              </select>
            </label>
            <label>
              Color
              <input
                type="color"
                value={form.color}
                onChange={(event) => onFieldChange('color', event.target.value)}
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
              {isSaving ? 'Saving' : 'Save flag'}
            </button>
            <button className="text-button" type="button" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </section>
      ) : null}

      <section className="section" aria-labelledby="flags-list-heading">
        <div className="section-heading">
          <h2 id="flags-list-heading">All Flags</h2>
        </div>

        <div className="plant-list">
          {!isLoading && flags.length === 0 ? (
            <p className="empty-state">No flags yet.</p>
          ) : null}

          {flags.map((flag) => (
            <article className="plant-row" key={flag.id}>
              <div>
                <h3>{flag.name}</h3>
                <p>
                  {flag.category}
                  {' - '}
                  {flag.isEnabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <div className="row-actions">
                <span className="flag-chip" style={{ backgroundColor: flag.color }}>
                  {flag.name}
                </span>
                <button className="icon-button compact" type="button" aria-label={`Edit ${flag.name}`} onClick={() => onEdit(flag)}>
                  <Edit3 size={17} />
                </button>
                <button className="icon-button compact danger" type="button" aria-label={`Delete ${flag.name}`} onClick={() => onDelete(flag)}>
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
