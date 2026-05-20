import { Save } from 'lucide-react';
import type { CareActivity, Plant } from '../domain';
import type { BulkScheduleFormState } from '../form-state';

type SchedulesViewProps = {
  activities: CareActivity[];
  error: string | null;
  form: BulkScheduleFormState;
  isLoading: boolean;
  isSaving: boolean;
  plants: Plant[];
  onFieldChange: (field: keyof BulkScheduleFormState, value: string | boolean | string[]) => void;
  onSave: () => void;
};

export function SchedulesView({
  activities,
  error,
  form,
  isLoading,
  isSaving,
  plants,
  onFieldChange,
  onSave,
}: SchedulesViewProps) {
  const enabledActivities = activities.filter((activity) => activity.isEnabled);
  const selectedPlantIds = new Set(form.plantIds);
  const allVisibleSelected = plants.length > 0 && plants.every((plant) => selectedPlantIds.has(String(plant.id)));

  return (
    <>
      <section className="summary-panel" aria-labelledby="schedules-summary-heading">
        <div>
          <p className="eyebrow">Care schedules</p>
          <h2 id="schedules-summary-heading">
            {isLoading ? 'Loading schedules' : 'Bulk schedule assignment'}
          </h2>
          <p>{error ?? 'Apply one care interval to several plants at once.'}</p>
        </div>
      </section>

      <section className="editor-panel" aria-labelledby="bulk-schedule-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Bulk edit</p>
            <h2 id="bulk-schedule-heading">Apply schedule</h2>
          </div>
        </div>

        <div className="plant-form">
          <label>
            Activity
            <select
              value={form.careActivityId}
              onChange={(event) => onFieldChange('careActivityId', event.target.value)}
            >
              <option value="">Select an activity</option>
              {enabledActivities.map((activity) => (
                <option key={activity.id} value={activity.id}>
                  {activity.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Every days
            <input
              min="1"
              max="365"
              type="number"
              value={form.everyDays}
              onChange={(event) => onFieldChange('everyDays', event.target.value)}
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

        <div className="section" aria-labelledby="bulk-schedule-plants-heading">
          <div className="section-heading">
            <h2 id="bulk-schedule-plants-heading">Plants</h2>
            <button
              className="text-button"
              type="button"
              onClick={() => onFieldChange(
                'plantIds',
                allVisibleSelected ? [] : plants.map((plant) => String(plant.id)),
              )}
            >
              {allVisibleSelected ? 'Clear all' : 'Select all'}
            </button>
          </div>

          <div className="plant-list">
            {!isLoading && plants.length === 0 ? (
              <p className="empty-state">No plants available.</p>
            ) : null}

            {plants.map((plant) => (
              <label className="plant-row check-row" key={plant.id}>
                <span>
                  <input
                    checked={selectedPlantIds.has(String(plant.id))}
                    type="checkbox"
                    onChange={(event) => {
                      const plantId = String(plant.id);
                      const nextPlantIds = event.target.checked
                        ? [...form.plantIds, plantId]
                        : form.plantIds.filter((id) => id !== plantId);
                      onFieldChange('plantIds', nextPlantIds);
                    }}
                  />
                  <span>
                    <strong>{plant.nickname}</strong>
                    <small>{plant.taxon} - {plant.location}</small>
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button className="primary-action" type="button" disabled={isSaving || form.plantIds.length === 0 || !form.careActivityId} onClick={onSave}>
            <Save size={18} />
            {isSaving ? 'Saving' : `Apply to ${form.plantIds.length} plants`}
          </button>
        </div>
      </section>
    </>
  );
}
