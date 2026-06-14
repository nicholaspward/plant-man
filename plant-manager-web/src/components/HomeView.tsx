import type { ActionLog, CareTask, Plant } from '../domain';
import { SummaryStrip } from './Ui';

type HomeViewProps = {
  careTasks: CareTask[];
  error: string | null;
  isLoading: boolean;
  plants: Plant[];
  onOpenCare: () => void;
  onOpenPlants: () => void;
};

export function HomeView({
  careTasks,
  error,
  isLoading,
  plants,
  onOpenCare,
  onOpenPlants,
}: HomeViewProps) {
  const dueCount = careTasks.filter((task) => task.status === 'due').length;
  const upcomingCount = careTasks.filter((task) => task.status === 'soon').length;
  const activeFlagCount = plants.reduce(
    (count, plant) => count + plant.flags.filter((flag) => flag.resolvedOn === null).length,
    0,
  );
  const recentLogs = getRecentLogs(plants);

  return (
    <>
      <SummaryStrip ariaLabel="Dashboard summary">
        <p>{error ?? 'Quick status for care and collection health.'}</p>
      </SummaryStrip>

      <div className="dashboard-panel-grid">
        <section className="work-panel dashboard-panel" aria-labelledby="dashboard-care-heading">
          <div className="section-heading">
            <h2 id="dashboard-care-heading">Care</h2>
          </div>
          <div className="dashboard-stat-grid">
            <DashboardStat label="Due" value={dueCount} />
            <DashboardStat label="Upcoming" value={upcomingCount} />
          </div>
          <div className="form-actions">
            <button className="primary-action" type="button" onClick={onOpenCare}>
              Open Care
            </button>
          </div>
        </section>

        <section className="work-panel dashboard-panel" aria-labelledby="dashboard-plants-heading">
          <div className="section-heading">
            <h2 id="dashboard-plants-heading">Plants</h2>
          </div>
          <div className="dashboard-stat-grid">
            <DashboardStat label="Total" value={plants.length} />
            <DashboardStat label="Flagged" value={activeFlagCount} />
          </div>
          <div className="form-actions">
            <button className="primary-action" type="button" onClick={onOpenPlants}>
              Open Plant Management
            </button>
          </div>
        </section>
      </div>

      <section className="work-panel" aria-labelledby="recent-care-heading">
        <div className="section-heading">
          <h2 id="recent-care-heading">Recent Care</h2>
        </div>

        <div className="detail-list">
          {!isLoading && recentLogs.length === 0 ? (
            <p className="empty-state">No care has been logged yet.</p>
          ) : null}

          {recentLogs.map((log) => (
            <article className="detail-row" key={log.id}>
              <div>
                <h4>{log.action}</h4>
                <p>{log.plantName} - {formatDate(log.performedOn)}</p>
                {log.notes ? <p>{log.notes}</p> : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function DashboardStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="dashboard-stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function getRecentLogs(plants: Plant[]) {
  return plants
    .flatMap((plant) => plant.actionLogs.map((log) => ({ ...log, plantName: log.plantName || plant.nickname })))
    .sort(compareLogs)
    .slice(0, 5);
}

function compareLogs(left: ActionLog, right: ActionLog) {
  const dateComparison = right.performedOn.localeCompare(left.performedOn);
  if (dateComparison !== 0) {
    return dateComparison;
  }

  return right.id - left.id;
}

function formatDate(value: string) {
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) {
    return value;
  }

  return `${month}/${day}/${year}`;
}
