import { useMemo, useState } from 'react';
import type { CareTask, Plant, PlantGroup } from '../domain';
import { PlantCard } from './PlantCard';
import { SummaryStrip } from './Ui';

type HomeViewProps = {
  careTasks: CareTask[];
  error: string | null;
  groups: PlantGroup[];
  isLoading: boolean;
  plants: Plant[];
  onCompleteBulkTasks: (tasks: CareTask[]) => void;
  onCompleteTask: (task: CareTask) => void;
  onOpenPlant: (plant: Plant) => void;
};

export function HomeView({
  careTasks,
  error,
  groups,
  isLoading,
  plants,
  onCompleteBulkTasks,
  onCompleteTask,
  onOpenPlant,
}: HomeViewProps) {
  const dueTaskGroups = groupDueTasks(careTasks);
  const weekDays = useMemo(() => getWeekDays(), []);
  const [selectedDate, setSelectedDate] = useState(() => weekDays[0]?.dateKey ?? getDateKey(new Date()));
  const selectedDay = weekDays.find((day) => day.dateKey === selectedDate) ?? weekDays[0];
  const selectedTasks = getTasksForDate(careTasks, selectedDate);
  const groupDueTaskGroups = getGroupDueTaskGroups(careTasks, groups);

  return (
    <>
      <SummaryStrip ariaLabel="Dashboard summary">
        <p>{error ?? 'Start with the plants that need attention now.'}</p>
      </SummaryStrip>

      <section className="work-panel" aria-labelledby="calendar-heading">
        <div className="section-heading">
          <h2 id="calendar-heading">Care Calendar</h2>
          <span className="schedule-count">{selectedTasks.length} selected</span>
        </div>

        <div className="week-strip" role="tablist" aria-label="Care tasks by day">
          {weekDays.map((day) => {
            const dayTasks = getTasksForDate(careTasks, day.dateKey);
            const hasDueTasks = dayTasks.some((task) => task.status === 'due');

            return (
              <button
                className="week-day"
                type="button"
                role="tab"
                aria-selected={day.dateKey === selectedDate}
                key={day.dateKey}
                onClick={() => setSelectedDate(day.dateKey)}
              >
                <span>{day.label}</span>
                <strong>{day.dayNumber}</strong>
                <small>{dayTasks.length}</small>
                {hasDueTasks ? <span className="week-day-alert" aria-hidden="true" /> : null}
              </button>
            );
          })}
        </div>

        <div className="task-list">
          <p className="task-list-label">{selectedDay?.heading ?? 'Selected day'}</p>
          {!isLoading && selectedTasks.length === 0 ? (
            <p className="empty-state">No care scheduled for this day.</p>
          ) : null}

          {selectedTasks.map((task) => (
            <article className="task-row" key={`calendar-${task.id}`}>
              <span className={`status-dot ${task.status}`} />
              <div>
                <h3>{task.action}</h3>
                <p>{task.plantName} - {task.due}</p>
              </div>
              <button
                className="small-action"
                type="button"
                disabled={task.status !== 'due'}
                onClick={() => onCompleteTask(task)}
              >
                Log
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="work-panel" aria-labelledby="care-heading">
        <div className="section-heading">
          <h2 id="care-heading">Due Care</h2>
          <button className="text-button" type="button">View all</button>
        </div>

        <div className="task-list">
          {!isLoading && careTasks.length === 0 ? (
            <p className="empty-state">No care tasks yet.</p>
          ) : null}

          {dueTaskGroups.length > 0 ? (
            <>
              <p className="task-list-label">Bulk actions</p>
              {dueTaskGroups.map((group) => (
                <article className="task-row task-row-group" key={group.careActivityId}>
                  <span className="status-dot due" />
                  <div>
                    <h3>{group.action}</h3>
                    <p>
                      {group.tasks.length} due - {formatPlantNames(group.tasks)}
                    </p>
                  </div>
                  <button
                    className="small-action"
                    type="button"
                    onClick={() => onCompleteBulkTasks(group.tasks)}
                  >
                    Log all due
                  </button>
                </article>
              ))}
            </>
          ) : null}

          {groupDueTaskGroups.length > 0 ? (
            <>
              <p className="task-list-label">Group actions</p>
              {groupDueTaskGroups.map((group) => (
                <article className="task-row task-row-group" key={`${group.groupId}-${group.careActivityId}`}>
                  <span className="status-dot due" />
                  <div>
                    <h3>{group.groupName} / {group.action}</h3>
                    <p>
                      {group.tasks.length} due - {formatPlantNames(group.tasks)}
                    </p>
                  </div>
                  <button
                    className="small-action"
                    type="button"
                    onClick={() => onCompleteBulkTasks(group.tasks)}
                  >
                    Log group
                  </button>
                </article>
              ))}
            </>
          ) : null}

          {careTasks.length > 0 ? (
            <>
              <p className="task-list-label">Individual tasks</p>
              {careTasks.map((task) => (
                <article className="task-row" key={task.id}>
                  <span className={`status-dot ${task.status}`} />
                  <div>
                    <h3>{task.action}</h3>
                    <p>{task.plantName} - {task.due}</p>
                  </div>
                  <button
                    className="small-action"
                    type="button"
                    onClick={() => onCompleteTask(task)}
                  >
                    Log
                  </button>
                </article>
              ))}
            </>
          ) : null}
        </div>
      </section>

      <section className="work-panel" aria-labelledby="plants-heading">
        <div className="section-heading">
          <h2 id="plants-heading">My Plants</h2>
        </div>

        <div className="plant-grid">
          {!isLoading && plants.length === 0 ? (
            <p className="empty-state">No plants yet.</p>
          ) : null}

          {plants.map((plant) => (
            <PlantCard plant={plant} key={plant.id} onOpen={onOpenPlant} />
          ))}
        </div>
      </section>
    </>
  );
}

function groupDueTasks(tasks: CareTask[]) {
  const groups = new Map<number, { careActivityId: number; action: string; tasks: CareTask[] }>();
  for (const task of tasks) {
    if (task.status !== 'due') {
      continue;
    }

    const group = groups.get(task.careActivityId);
    if (group) {
      group.tasks.push(task);
      continue;
    }

    groups.set(task.careActivityId, {
      careActivityId: task.careActivityId,
      action: task.action,
      tasks: [task],
    });
  }

  return [...groups.values()].sort((left, right) => left.action.localeCompare(right.action));
}

function getGroupDueTaskGroups(tasks: CareTask[], groups: PlantGroup[]) {
  const dueTasks = tasks.filter((task) => task.status === 'due');

  return groups.flatMap((group) => {
    const groupPlantIds = new Set(group.plants.map((plant) => plant.id));
    return groupDueTasks(dueTasks.filter((task) => groupPlantIds.has(task.plantId)))
      .map((taskGroup) => ({
        ...taskGroup,
        groupId: group.id,
        groupName: group.name,
      }));
  });
}

function formatPlantNames(tasks: CareTask[]) {
  const names = tasks.map((task) => task.plantName);
  if (names.length <= 3) {
    return names.join(', ');
  }

  return `${names.slice(0, 3).join(', ')} + ${names.length - 3} more`;
}

function getWeekDays() {
  const today = new Date();

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    const dateKey = getDateKey(date);

    return {
      dateKey,
      dayNumber: date.getDate().toString(),
      heading: index === 0
        ? 'Today'
        : date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }),
      label: index === 0
        ? 'Today'
        : date.toLocaleDateString(undefined, { weekday: 'short' }),
    };
  });
}

function getTasksForDate(tasks: CareTask[], dateKey: string) {
  const todayKey = getDateKey(new Date());

  return tasks
    .filter((task) => {
      const taskDateKey = getTaskDateKey(task);
      if (!taskDateKey) {
        return false;
      }

      if (dateKey === todayKey) {
        return taskDateKey <= todayKey;
      }

      return taskDateKey === dateKey;
    })
    .sort(compareCareTasks);
}

function compareCareTasks(left: CareTask, right: CareTask) {
  const dueComparison = (getTaskDateKey(left) ?? '').localeCompare(getTaskDateKey(right) ?? '');
  if (dueComparison !== 0) {
    return dueComparison;
  }

  const plantComparison = left.plantName.localeCompare(right.plantName);
  if (plantComparison !== 0) {
    return plantComparison;
  }

  return left.action.localeCompare(right.action);
}

function getTaskDateKey(task: CareTask) {
  if (task.dueDate) {
    return task.dueDate;
  }

  const today = new Date();
  if (task.due === 'Today' || task.due === 'Yesterday' || task.due.endsWith(' days ago')) {
    return getDateKey(today);
  }

  if (task.due === 'Tomorrow') {
    return getOffsetDateKey(today, 1);
  }

  const relativeMatch = /^In (\d+) days$/.exec(task.due);
  if (relativeMatch) {
    return getOffsetDateKey(today, Number(relativeMatch[1]));
  }

  return null;
}

function getOffsetDateKey(date: Date, offsetDays: number) {
  const nextDate = new Date(date);
  nextDate.setDate(date.getDate() + offsetDays);

  return getDateKey(nextDate);
}

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
