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
  onCompleteTask,
  onNewPlant,
  onOpenPlant,
}: HomeViewProps) {
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
        <button className="primary-action" type="button" onClick={onNewPlant}>
          <Plus size={18} />
          Add plant
        </button>
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
