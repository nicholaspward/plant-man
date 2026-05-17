import { Leaf } from 'lucide-react';
import type { CareStatus, Plant } from '../domain';

const statusLabel: Record<CareStatus, string> = {
  due: 'Due',
  soon: 'Soon',
  ok: 'Ok',
};

export function PlantCard({ plant }: { plant: Plant }) {
  return (
    <article className="plant-card">
      <div className="plant-card-top">
        <div className="plant-mark">
          <Leaf size={20} />
        </div>
        <span className={`status-pill ${plant.status}`}>
          {statusLabel[plant.status]}
        </span>
      </div>
      <h3>{plant.nickname}</h3>
      <p className="taxon">{plant.taxon}</p>
      <dl>
        <div>
          <dt>Location</dt>
          <dd>{plant.location}</dd>
        </div>
        <div>
          <dt>Last watered</dt>
          <dd>{plant.lastWatered}</dd>
        </div>
      </dl>
    </article>
  );
}
