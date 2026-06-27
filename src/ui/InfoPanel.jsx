import { bandOf, BAND_LABEL } from './bands.js';
import { currentMonthString } from '../engine/state.js';

// Info + display only. No decisions are made from the map.
export default function InfoPanel({ region, state }) {
  if (!region) {
    return (
      <div className="info-panel empty">
        <p>Click a region on the map to inspect its control and what changed last month.</p>
      </div>
    );
  }

  const month = currentMonthString(state);
  // Last month's changes for this region, pulled from the change log.
  const changes = state.changeLog.filter(
    (e) => e.target === `region:${region.id}` && e.month === month
  );

  const tier = region.active ? BAND_LABEL[bandOf(region.control)] : 'Dormant';

  return (
    <div className="info-panel">
      <h3>{region.displayName}</h3>
      <div className="info-tier">
        <span className={'tier-chip ' + (region.active ? bandOf(region.control) : 'dormant')}>{tier}</span>
        {region.isTerritory && <span className="tier-chip territory">Territory</span>}
        <span className="control-value">
          control {region.control > 0 ? '+' : ''}{region.control}
        </span>
      </div>

      <h4>This month ({month})</h4>
      {changes.length === 0 ? (
        <p className="muted">No changes recorded this month.</p>
      ) : (
        <ul className="change-list">
          {changes.map((c, i) => (
            <li key={i}>
              <span className={'delta ' + (c.delta >= 0 ? 'up' : 'down')}>
                {c.delta > 0 ? '+' : ''}{c.delta}
              </span>{' '}
              {c.reason}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
