import { CalendarCheck, Plus } from 'lucide-react';
import type { CareTask, Plant } from '../domain';
import { PlantCard } from './PlantCard';

type HomeViewProps = {
  careTasks: CareTask[];
  dueCount: number;
  error: string | null;
  isLoading: boolean;
  isPlantSearchActive: boolean;
  plants: Plant[];
  totalPlantCount: number;
  onCompleteBulkTasks: (tasks: CareTask[]) => void;
  onCompleteTask: (task: CareTask) => void;
  onNewPlant: () => void;
  onOpenPlant: (plant: Plant) => void;
};

export function HomeView({
  careTasks,
  dueCount,
  error,
  isLoading,
  isPlantSearchActive,
  plants,
  totalPlantCount,
  onCompleteBulkTasks,
  onCompleteTask,
  onNewPlant,
  onOpenPlant,
}: HomeViewProps) {
  const dueTaskGroups = groupDueTasks(careTasks);

  return (
    <>
      <section className="summary-panel" aria-labelledby="summary-heading">
        <div>
          <p className="eyebrow">Care queue</p>
          <h2 id="summary-heading">
            {isLoading ? 'Loading care' : `${dueCount} tasks due`}
          </h2>
          <p>{error ?? 'Start with the plants that need attention now.'}</p>
        </div>
      </section>

      <section className="section" aria-labelledby="care-heading">
        <div className="section-heading">
          <h2 id="care-heading">Due Care</h2>
          <button className="text-button" type="button">View all</button>
        </div>

        <div className="task-list">
          {!isLoading && careTasks.length === 0 ? (
            <p className="empty-state">
              {isPlantSearchActive ? 'No care tasks match the search.' : 'No care tasks yet.'}
            </p>
          ) : null}

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
                <CalendarCheck size={16} />
                Log all due
              </button>
            </article>
          ))}

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
                <CalendarCheck size={16} />
                Log
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="plants-heading">
        <div className="section-heading">
          <h2 id="plants-heading">My Plants</h2>
          <button className="icon-button compact" type="button" aria-label="Add plant" onClick={onNewPlant}>
            <Plus size={18} />
          </button>
        </div>

        <div className="plant-grid">
          {!isLoading && totalPlantCount === 0 ? (
            <p className="empty-state">No plants yet.</p>
          ) : null}

          {!isLoading && totalPlantCount > 0 && plants.length === 0 ? (
            <p className="empty-state">No plants match the search.</p>
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

function formatPlantNames(tasks: CareTask[]) {
  const names = tasks.map((task) => task.plantName);
  if (names.length <= 3) {
    return names.join(', ');
  }

  return `${names.slice(0, 3).join(', ')} + ${names.length - 3} more`;
}
