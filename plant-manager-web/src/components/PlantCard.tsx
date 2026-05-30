import { Eye } from 'lucide-react';
import type { CareStatus, Plant } from '../domain';

const statusLabel: Record<CareStatus, string> = {
  due: 'Due',
  soon: 'Soon',
  ok: 'Ok',
  unscheduled: 'Unscheduled',
};

type PlantCardProps = {
  plant: Plant;
  onOpen?: (plant: Plant) => void;
};

export function PlantCard({ plant, onOpen }: PlantCardProps) {
  return (
    <article className="plant-card">
      <h3>{plant.nickname}</h3>
      <div className="taxon">
        <p>{plant.taxon}</p>
        {plant.flags.filter((flag) => flag.resolvedOn === null).length > 0 ? (
          <div className="flag-list">
            {plant.flags
              .filter((flag) => flag.resolvedOn === null)
              .map((flag) => (
                <span className="flag-chip" key={flag.id} style={{ backgroundColor: flag.color }}>
                  {flag.name}
                </span>
              ))}
          </div>
        ) : null}
        {plant.groups.length > 0 ? (
          <div className="flag-list">
            {plant.groups.map((group) => (
              <span className="flag-chip group-chip" key={group.id}>
                {group.name}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <dl>
        <div>
          <dt>Location</dt>
          <dd>{plant.location}</dd>
        </div>
        <div>
          <dt>Next care</dt>
          <dd>{plant.nextCare}</dd>
        </div>
      </dl>
      <div className="plant-card-actions">
        <span className={`status-pill ${plant.status}`}>
          {statusLabel[plant.status]}
        </span>
        {onOpen ? (
          <button
            className="icon-button compact"
            type="button"
            aria-label={`View ${plant.nickname}`}
            onClick={() => onOpen(plant)}
          >
            <Eye size={17} />
          </button>
        ) : null}
      </div>
    </article>
  );
}
