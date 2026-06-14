import { useMemo, useState } from 'react';
import type { CareActivity, Plant, PlantCareScheduleRule, PlantGroup } from '../domain';
import type { BulkScheduleFormState } from '../form-state';
import { SummaryStrip } from './Ui';

type SchedulesViewProps = {
  activities: CareActivity[];
  editingScheduleId: number | null;
  error: string | null;
  form: BulkScheduleFormState;
  groups: PlantGroup[];
  isLoading: boolean;
  isSaving: boolean;
  plants: Plant[];
  schedules: PlantCareScheduleRule[];
  onCancel: () => void;
  onDelete: (schedule: PlantCareScheduleRule) => void;
  onEdit: (schedule: PlantCareScheduleRule) => void;
  onFieldChange: (field: keyof BulkScheduleFormState, value: string | string[]) => void;
  onNew: () => void;
  onSave: () => void;
};

const recurrenceOptions = [
  { value: 'none', label: 'Does not repeat' },
  { value: 'daily', label: 'Every day' },
  { value: 'weekly', label: 'Every week' },
  { value: 'monthly', label: 'Every month' },
  { value: 'yearly', label: 'Every year' },
  { value: 'custom', label: 'Custom' },
];

const weekdayOptions = [
  { value: 'SU', label: 'S' },
  { value: 'MO', label: 'M' },
  { value: 'TU', label: 'T' },
  { value: 'WE', label: 'W' },
  { value: 'TH', label: 'T' },
  { value: 'FR', label: 'F' },
  { value: 'SA', label: 'S' },
];

export function SchedulesView({
  activities,
  editingScheduleId,
  error,
  form,
  groups,
  isLoading,
  isSaving,
  plants,
  schedules,
  onCancel,
  onDelete,
  onEdit,
  onFieldChange,
  onNew,
  onSave,
}: SchedulesViewProps) {
  const [plantQuery, setPlantQuery] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const visiblePlants = useMemo(
    () => filterPlants(plants, plantQuery),
    [plants, plantQuery],
  );
  const selectedPlantIds = new Set(form.plantIds);
  const selectedPlants = plants.filter((plant) => selectedPlantIds.has(String(plant.id)));
  const selectedGroup = groups.find((group) => String(group.id) === selectedGroupId);
  const selectedActivity = activities.find((activity) => String(activity.id) === form.careActivityId);
  const preview = selectedActivity ? formatSchedulePreview(selectedActivity.name, form) : '';
  const allVisibleSelected = visiblePlants.length > 0 && visiblePlants.every((plant) => selectedPlantIds.has(String(plant.id)));
  const selectedPlantsWithActivity = selectedActivity
    ? selectedPlants.filter((plant) => plant.careSchedules.some((schedule) => schedule.careActivityId === selectedActivity.id))
    : [];

  return (
    <>
      <SummaryStrip ariaLabel="Schedules summary">
        <p>{error ?? 'Review current schedules, choose target plants, and apply care intervals.'}</p>
        <button className="primary-action" type="button" disabled={isSaving} onClick={onNew}>
          New
        </button>
      </SummaryStrip>

      <section className="work-panel" aria-labelledby="bulk-schedule-heading">
        <div className="section-heading">
          <div>
            <h2 id="bulk-schedule-heading">{editingScheduleId === null ? 'New Schedule' : 'Edit Schedule'}</h2>
          </div>
          <div className="schedule-count">
            <span>{selectedGroup ? `${selectedGroup.name}: ${selectedPlants.length} plants` : `${selectedPlants.length} selected`}</span>
          </div>
        </div>

        <div className="plant-form">
          <label>
            Activity
            <select
              disabled={isSaving}
              value={form.careActivityId}
              onChange={(event) => onFieldChange('careActivityId', event.target.value)}
            >
              <option value="">Select an activity</option>
              {activities.map((activity) => (
                <option key={activity.id} value={activity.id}>
                  {activity.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Start date
            <input
              disabled={isSaving}
              type="date"
              value={form.scheduledFor}
              onChange={(event) => onFieldChange('scheduledFor', event.target.value)}
            />
          </label>
        </div>

        <fieldset className="schedule-options">
          <legend>Repeat</legend>
          {recurrenceOptions.map((option) => (
            <label className="check-option" key={option.value}>
              <input
                checked={form.recurrenceMode === option.value}
                disabled={isSaving}
                type="radio"
                name="recurrenceMode"
                value={option.value}
                onChange={(event) => onFieldChange('recurrenceMode', event.target.value)}
              />
              {option.label}
            </label>
          ))}
        </fieldset>

        {form.recurrenceMode === 'custom' ? (
          <div className="custom-schedule-options">
            <div className="repeat-every-row">
              <span>Repeats every</span>
              <input
                disabled={isSaving}
                min="1"
                max="365"
                type="number"
                value={form.repeatEvery}
                onChange={(event) => onFieldChange('repeatEvery', event.target.value)}
              />
              <select
                disabled={isSaving}
                value={form.repeatUnit}
                onChange={(event) => onFieldChange('repeatUnit', event.target.value)}
              >
                <option value="day">day</option>
                <option value="week">week</option>
                <option value="month">month</option>
                <option value="year">year</option>
              </select>
            </div>

            {form.repeatUnit === 'week' ? (
              <fieldset className="weekday-options">
                <legend>Repeats on</legend>
                {weekdayOptions.map((day) => (
                  <label key={day.value}>
                    <input
                      checked={form.repeatOnDays.includes(day.value)}
                      disabled={isSaving}
                      type="checkbox"
                      onChange={(event) => {
                        const nextDays = event.target.checked
                          ? [...form.repeatOnDays, day.value]
                          : form.repeatOnDays.filter((value) => value !== day.value);
                        onFieldChange('repeatOnDays', nextDays);
                      }}
                    />
                    <span>{day.label}</span>
                  </label>
                ))}
              </fieldset>
            ) : null}
          </div>
        ) : null}

        {form.recurrenceMode !== 'none' ? (
          <fieldset className="schedule-end-options">
            <legend>Ends</legend>
            <label className="check-option">
              <input
                checked={form.endsMode === 'never'}
                disabled={isSaving}
                type="radio"
                name="endsMode"
                value="never"
                onChange={(event) => onFieldChange('endsMode', event.target.value)}
              />
              Never
            </label>
            <label className="check-option">
              <input
                checked={form.endsMode === 'on'}
                disabled={isSaving}
                type="radio"
                name="endsMode"
                value="on"
                onChange={(event) => onFieldChange('endsMode', event.target.value)}
              />
              On date
            </label>
            {form.endsMode === 'on' ? (
              <input
                aria-label="End date"
                disabled={isSaving}
                type="date"
                value={form.endsOn}
                onChange={(event) => onFieldChange('endsOn', event.target.value)}
              />
            ) : null}
            <label className="check-option">
              <input
                checked={form.endsMode === 'after'}
                disabled={isSaving}
                type="radio"
                name="endsMode"
                value="after"
                onChange={(event) => onFieldChange('endsMode', event.target.value)}
              />
              After
            </label>
            {form.endsMode === 'after' ? (
              <input
                aria-label="Occurrences"
                disabled={isSaving}
                min="1"
                max="999"
                type="number"
                value={form.endsAfterOccurrences}
                onChange={(event) => onFieldChange('endsAfterOccurrences', event.target.value)}
              />
            ) : null}
          </fieldset>
        ) : null}

        {selectedActivity ? (
          <p className="schedule-hint">
            {selectedPlantsWithActivity.length} of {selectedPlants.length} selected plants already have {selectedActivity.name}.
          </p>
        ) : null}

        {preview ? (
          <div className="schedule-preview" aria-label="Schedule preview">
            <span>Preview</span>
            <strong>{preview}</strong>
          </div>
        ) : null}

        <div className="work-panel schedule-targets" aria-labelledby="bulk-schedule-plants-heading">
          <div className="section-heading">
            <div>
              <h2 id="bulk-schedule-plants-heading">Plants</h2>
            </div>
            <div className="row-actions">
              <button
                className="text-button"
                type="button"
                disabled={isSaving}
                onClick={() => {
                  setSelectedGroupId('');
                  onFieldChange(
                    'plantIds',
                    allVisibleSelected
                      ? form.plantIds.filter((id) => !visiblePlants.some((plant) => String(plant.id) === id))
                      : [...new Set([...form.plantIds, ...visiblePlants.map((plant) => String(plant.id))])],
                  );
                }}
              >
                {allVisibleSelected ? 'Clear visible' : 'Select visible'}
              </button>
            </div>
          </div>

          <div className="plant-form">
            <label>
              Target group
              <select
                disabled={isSaving}
                value={selectedGroupId}
                onChange={(event) => {
                  const groupId = event.target.value;
                  const group = groups.find((item) => String(item.id) === groupId);
                  setSelectedGroupId(groupId);
                  setPlantQuery('');
                  onFieldChange('plantIds', group ? group.plants.map((plant) => String(plant.id)) : []);
                }}
              >
                <option value="">Individual plants</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name} ({group.plants.length})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Search plants
              <input
                disabled={isSaving}
                type="search"
                value={plantQuery}
                placeholder="Search plants"
                onChange={(event) => setPlantQuery(event.target.value)}
              />
            </label>
          </div>

          <div className="plant-list compact-plant-list">
            {!isLoading && plants.length === 0 ? (
              <p className="empty-state">No plants available.</p>
            ) : null}

            {!isLoading && plants.length > 0 && visiblePlants.length === 0 ? (
              <p className="empty-state">No plants match that search.</p>
            ) : null}

            {visiblePlants.map((plant) => (
              <label className="plant-row check-row" key={plant.id}>
                <span>
                  <input
                    checked={selectedPlantIds.has(String(plant.id))}
                    disabled={isSaving}
                    type="checkbox"
                    onChange={(event) => {
                      const plantId = String(plant.id);
                      const nextPlantIds = event.target.checked
                        ? [...form.plantIds, plantId]
                        : form.plantIds.filter((id) => id !== plantId);
                      setSelectedGroupId('');
                      onFieldChange('plantIds', nextPlantIds);
                    }}
                  />
                  <strong>{plant.nickname}</strong>
                  <small>{formatPlantScheduleSummary(plant, selectedActivity)}</small>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button
            className="primary-action"
            type="button"
            disabled={isSaving || form.plantIds.length === 0 || !form.careActivityId}
            onClick={() => {
              onSave();
              setSelectedGroupId('');
            }}
          >
            {isSaving ? 'Saving' : 'Save'}
          </button>
          <button
            className="text-button"
            type="button"
            disabled={isSaving}
            onClick={() => {
              onCancel();
              setSelectedGroupId('');
            }}
          >
            Cancel
          </button>
        </div>
      </section>

      <section className="work-panel" aria-labelledby="schedules-list-heading">
        <div className="section-heading">
          <div>
            <h2 id="schedules-list-heading">Schedules</h2>
          </div>
        </div>

        <div className="detail-list">
          {!isLoading && schedules.length === 0 ? (
            <p className="empty-state">No schedules yet.</p>
          ) : null}

          {schedules.map((schedule) => (
            <article className="detail-row schedule-detail-row" key={schedule.id}>
              <div>
                <h4>{schedule.action}</h4>
                <p>{formatRecurrence(schedule)}</p>
                <p>{formatSchedulePlants(schedule)}</p>
              </div>
              <div className="row-actions">
                <button
                  className="text-button"
                  type="button"
                  disabled={isSaving}
                  onClick={() => onEdit(schedule)}
                >
                  Edit
                </button>
                <button
                  className="text-button danger"
                  type="button"
                  disabled={isSaving}
                  onClick={() => onDelete(schedule)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="work-panel" aria-labelledby="current-schedules-heading">
        <div className="section-heading">
          <div>
            <h2 id="current-schedules-heading">Selected Plant Schedules</h2>
          </div>
        </div>

        <div className="detail-list">
          {!isLoading && selectedPlants.length === 0 ? (
            <p className="empty-state">Select one or more plants to review their current schedules.</p>
          ) : null}

          {selectedPlants.map((plant) => (
            <article className="detail-row schedule-detail-row" key={plant.id}>
              <div>
                <h4>{plant.nickname}</h4>
                <p>{plant.taxon} - {plant.location}</p>
                {plant.careSchedules.length === 0 ? (
                  <p>No schedules.</p>
                ) : (
                  <div className="schedule-chip-list">
                    {plant.careSchedules.map((schedule) => (
                      <span className={`status-pill ${schedule.status}`} key={schedule.id}>
                        {schedule.action} / {formatRecurrence(schedule)} / {schedule.nextCare}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function formatPlantScheduleSummary(plant: Plant, selectedActivity?: CareActivity) {
  if (!selectedActivity) {
    return `${plant.careSchedules.length} schedules - next care ${plant.nextCare}`;
  }

  const schedule = plant.careSchedules.find((item) => item.careActivityId === selectedActivity.id);
  if (!schedule) {
    return `No ${selectedActivity.name} schedule`;
  }

  return `${selectedActivity.name}: ${formatRecurrence(schedule)} - ${schedule.nextCare}`;
}

function formatSchedulePlants(schedule: PlantCareScheduleRule) {
  if (schedule.plants.length === 0) {
    return 'No plants assigned';
  }

  const names = schedule.plants.map((plant) => plant.nickname);
  if (names.length <= 4) {
    return names.join(', ');
  }

  return `${names.slice(0, 4).join(', ')} + ${names.length - 4} more`;
}

function filterPlants(plants: Plant[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return plants;
  }

  return plants.filter((plant) => [
    plant.nickname,
    plant.taxon,
    plant.location,
    plant.nextCare,
    plant.status,
    ...plant.careSchedules.map((schedule) => schedule.action),
  ].some((value) => value.toLowerCase().includes(normalizedQuery)));
}

function formatSchedulePreview(activityName: string, form: BulkScheduleFormState) {
  return `${activityName}: ${formatRecurrence({
    recurrenceMode: form.recurrenceMode,
    repeatEvery: Number(form.repeatEvery),
    repeatUnit: form.repeatUnit,
    repeatOnDays: form.repeatOnDays.length > 0 ? form.repeatOnDays.join(',') : null,
    scheduledFor: form.scheduledFor || null,
    endsMode: form.endsMode,
    endsOn: form.endsMode === 'on' ? form.endsOn || null : null,
    endsAfterOccurrences: form.endsMode === 'after' ? Number(form.endsAfterOccurrences) : null,
  })}`;
}

function formatRecurrence(schedule: {
  recurrenceMode: string;
  repeatEvery: number;
  repeatUnit: string;
  repeatOnDays: string | null;
  scheduledFor: string | null;
  endsMode: string;
  endsOn: string | null;
  endsAfterOccurrences: number | null;
}) {
  const start = schedule.scheduledFor ? ` from ${formatCalendarDate(schedule.scheduledFor)}` : '';
  const ending = schedule.endsMode === 'on' && schedule.endsOn
    ? ` until ${formatCalendarDate(schedule.endsOn)}`
    : schedule.endsMode === 'after' && schedule.endsAfterOccurrences
      ? ` for ${schedule.endsAfterOccurrences}x`
      : '';

  if (schedule.recurrenceMode === 'none') {
    return schedule.scheduledFor ? `does not repeat, ${formatCalendarDate(schedule.scheduledFor)}` : 'does not repeat';
  }

  if (schedule.recurrenceMode !== 'custom') {
    return `${recurrenceOptions.find((option) => option.value === schedule.recurrenceMode)?.label.toLowerCase() ?? 'repeats'}${start}${ending}`;
  }

  const days = schedule.repeatOnDays
    ? ` on ${schedule.repeatOnDays.split(',').join(' ')}`
    : '';
  return `every ${schedule.repeatEvery} ${schedule.repeatUnit}${schedule.repeatEvery === 1 ? '' : 's'}${days}${start}${ending}`;
}

function formatCalendarDate(date: string) {
  const [year, month, day] = date.split('-');
  if (!year || !month || !day) {
    return date;
  }

  return `${month}/${day}/${year}`;
}
