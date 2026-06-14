import { useMemo, useState } from 'react';
import type { CareActivity, CareHistoryEvent, Plant, UpdateActionLogPayload, UpdateCareDismissalPayload, UpdateCareSnoozePayload } from '../domain';
import { SummaryStrip } from './Ui';

type CareHistoryViewProps = {
  activities: CareActivity[];
  events: CareHistoryEvent[];
  error: string | null;
  isLoading: boolean;
  isSaving: boolean;
  plants: Plant[];
  onDelete: (event: CareHistoryEvent) => void;
  onUpdate: (event: CareHistoryEvent, payload: UpdateActionLogPayload | UpdateCareDismissalPayload | UpdateCareSnoozePayload) => void;
};

type EventTypeFilter = 'all' | CareHistoryEvent['type'];

export function CareHistoryView({
  activities,
  events,
  error,
  isLoading,
  isSaving,
  plants,
  onDelete,
  onUpdate,
}: CareHistoryViewProps) {
  const [typeFilter, setTypeFilter] = useState<EventTypeFilter>('all');
  const [plantId, setPlantId] = useState('');
  const [activityId, setActivityId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [query, setQuery] = useState('');
  const [editingKey, setEditingKey] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editResources, setEditResources] = useState<Record<number, { quantity: string; unit: string }>>({});

  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return events.filter((event) => {
      if (typeFilter !== 'all' && event.type !== typeFilter) {
        return false;
      }
      if (plantId && event.plantId !== Number(plantId)) {
        return false;
      }
      if (activityId && event.careActivityId !== Number(activityId)) {
        return false;
      }
      if (fromDate && event.date < fromDate) {
        return false;
      }
      if (toDate && event.date > toDate) {
        return false;
      }
      if (!normalizedQuery) {
        return true;
      }

      return [
        event.plantName,
        event.action,
        event.notes ?? '',
        ...event.resources.map((resource) => resource.name),
      ].join(' ').toLowerCase().includes(normalizedQuery);
    });
  }, [activityId, events, fromDate, plantId, query, toDate, typeFilter]);

  return (
    <>
      <SummaryStrip ariaLabel="Care history summary">
        <p>{error ?? 'Review logged, dismissed, and snoozed care events.'}</p>
      </SummaryStrip>

      <section className="work-panel" aria-labelledby="care-history-filters-heading">
        <div className="section-heading">
          <h2 id="care-history-filters-heading">Care History</h2>
          <span className="schedule-count">{filteredEvents.length} shown</span>
        </div>

        <div className="plant-form">
          <label>
            Type
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as EventTypeFilter)}>
              <option value="all">All events</option>
              <option value="log">Logged</option>
              <option value="dismissal">Dismissed</option>
              <option value="snooze">Snoozed</option>
            </select>
          </label>
          <label>
            Plant
            <select value={plantId} onChange={(event) => setPlantId(event.target.value)}>
              <option value="">All plants</option>
              {plants.map((plant) => (
                <option key={plant.id} value={plant.id}>
                  {plant.nickname}
                </option>
              ))}
            </select>
          </label>
          <label>
            Activity
            <select value={activityId} onChange={(event) => setActivityId(event.target.value)}>
              <option value="">All activities</option>
              {activities.map((activity) => (
                <option key={activity.id} value={activity.id}>
                  {activity.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Search
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <label>
            From
            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
            />
          </label>
          <label>
            To
            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="work-panel" aria-labelledby="care-history-list-heading">
        <div className="section-heading">
          <h2 id="care-history-list-heading">Events</h2>
        </div>

        <div className="detail-list">
          {!isLoading && filteredEvents.length === 0 ? (
            <p className="empty-state">{events.length === 0 ? 'No care history yet.' : 'No events match these filters.'}</p>
          ) : null}

          {filteredEvents.map((event) => {
            const eventKey = `${event.type}-${event.id}`;
            const isEditing = editingKey === eventKey;

            return (
              <article className="detail-row care-history-row" key={eventKey}>
                <div>
                  <h4>{event.action}</h4>
                  <p>{event.plantName} - {formatDate(event.date)}</p>
                  {event.notes ? <p>{event.notes}</p> : null}
                  {event.resources.length > 0 ? (
                    <p>{event.resources.map(formatResource).join(', ')}</p>
                  ) : null}
                  {isEditing ? (
                    <div className="care-history-editor">
                      <label>
                        {event.type === 'snooze' ? 'Snoozed until' : 'Date'}
                        <input
                          disabled={isSaving}
                          type="date"
                          value={editDate}
                          onChange={(changeEvent) => setEditDate(changeEvent.target.value)}
                        />
                      </label>
                      <label>
                        Notes
                        <textarea
                          disabled={isSaving}
                          value={editNotes}
                          onChange={(changeEvent) => setEditNotes(changeEvent.target.value)}
                        />
                      </label>
                      {event.type === 'log' && event.resources.length > 0 ? (
                        <div className="history-resource-grid">
                          {event.resources.map((resource) => (
                            <div className="care-resource-edit" key={resource.actionResourceId}>
                              <span>{resource.name}</span>
                              <input
                                aria-label={`${resource.name} quantity`}
                                disabled={isSaving}
                                type="number"
                                min="0"
                                value={editResources[resource.actionResourceId]?.quantity ?? formatNumber(resource.quantity)}
                                onChange={(changeEvent) => setEditResources((current) => ({
                                  ...current,
                                  [resource.actionResourceId]: {
                                    quantity: changeEvent.target.value,
                                    unit: current[resource.actionResourceId]?.unit ?? resource.unit ?? '',
                                  },
                                }))}
                              />
                              <input
                                aria-label={`${resource.name} unit`}
                                disabled={isSaving}
                                value={editResources[resource.actionResourceId]?.unit ?? resource.unit ?? ''}
                                onChange={(changeEvent) => setEditResources((current) => ({
                                  ...current,
                                  [resource.actionResourceId]: {
                                    quantity: current[resource.actionResourceId]?.quantity ?? formatNumber(resource.quantity),
                                    unit: changeEvent.target.value,
                                  },
                                }))}
                              />
                            </div>
                          ))}
                        </div>
                      ) : null}
                      <div className="form-actions">
                        <button
                          className="primary-action"
                          type="button"
                          disabled={isSaving || !editDate}
                          onClick={() => saveEdit(event)}
                        >
                          Save
                        </button>
                        <button
                          className="text-button"
                          type="button"
                          disabled={isSaving}
                          onClick={() => setEditingKey('')}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="history-event-actions">
                  <span className={`status-pill ${event.type === 'log' ? 'ok' : event.type === 'snooze' ? 'soon' : 'unscheduled'}`}>
                    {formatEventType(event.type)}
                  </span>
                  <div className="row-actions">
                    <button
                      className="text-button"
                      type="button"
                      disabled={isSaving}
                      onClick={() => startEdit(event)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-button"
                      type="button"
                      disabled={isSaving}
                      onClick={() => onDelete(event)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );

  function startEdit(event: CareHistoryEvent) {
    setEditingKey(`${event.type}-${event.id}`);
    setEditDate(event.date);
    setEditNotes(event.notes ?? '');
    setEditResources(Object.fromEntries(event.resources.map((resource) => [
      resource.actionResourceId,
      {
        quantity: formatNumber(resource.quantity),
        unit: resource.unit ?? '',
      },
    ])));
  }

  function saveEdit(event: CareHistoryEvent) {
    const notes = editNotes.trim() || null;
    if (event.type === 'log') {
      onUpdate(event, {
        plantId: event.plantId,
        careActivityId: event.careActivityId,
        performedOn: editDate,
        notes,
        resources: event.resources.map((resource) => ({
          actionResourceId: resource.actionResourceId,
          quantity: normalizeQuantity(editResources[resource.actionResourceId]?.quantity, resource.quantity),
          unit: editResources[resource.actionResourceId]?.unit.trim() || resource.unit,
        })),
      });
    } else if (event.type === 'dismissal') {
      onUpdate(event, {
        plantId: event.plantId,
        careActivityId: event.careActivityId,
        dismissedOn: editDate,
        notes,
      });
    } else {
      onUpdate(event, {
        plantId: event.plantId,
        careActivityId: event.careActivityId,
        snoozedUntil: editDate,
        notes,
      });
    }
    setEditingKey('');
  }
}

function formatResource(resource: CareHistoryEvent['resources'][number]) {
  const quantity = resource.quantity === null ? '' : `${resource.quantity} `;
  const unit = resource.unit ? `${resource.unit} ` : '';
  return `${quantity}${unit}${resource.name}`.trim();
}

function formatDate(value: string) {
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) {
    return value;
  }

  return `${month}/${day}/${year}`;
}

function formatEventType(type: CareHistoryEvent['type']) {
  return type === 'log' ? 'Logged' : type === 'dismissal' ? 'Dismissed' : 'Snoozed';
}

function formatNumber(value: number | null) {
  return value === null ? '' : String(value);
}

function normalizeQuantity(value: string | undefined, fallback: number | null) {
  if (value === undefined || value.trim() === '') {
    return fallback;
  }

  return Number(value);
}
