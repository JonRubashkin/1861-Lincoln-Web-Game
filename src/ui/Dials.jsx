import { STAT_META } from '../engine/state.js';

const VISIBLE_ORDER = [
  'unionMorale',
  'congressionalRelations',
  'borderStates',
  'treasury',
  'internationalStanding',
  'warEffort',
  'maryPersonal',
];

function Dial({ statKey, value }) {
  const meta = STAT_META[statKey];
  const hue = value >= 60 ? 'good' : value >= 35 ? 'mid' : 'bad';
  return (
    <div className="dial" title={meta.hint} data-testid={'dial-' + statKey}>
      <div className="dial-label">{meta.label}</div>
      <div className="dial-bar">
        <div className={'dial-fill ' + hue} style={{ width: value + '%' }} />
      </div>
      <div className="dial-value" data-testid={'dial-value-' + statKey}>{Math.round(value)}</div>
    </div>
  );
}

export default function Dials({ state }) {
  // Security stays hidden until the Baltimore Plot event sets the unlock flag.
  const showSecurity = !!state.flags.security_unlocked;
  return (
    <div className="dials">
      {VISIBLE_ORDER.map((k) => (
        <Dial key={k} statKey={k} value={state.stats[k]} />
      ))}
      {showSecurity && <Dial statKey="security" value={state.stats.security} />}
    </div>
  );
}
