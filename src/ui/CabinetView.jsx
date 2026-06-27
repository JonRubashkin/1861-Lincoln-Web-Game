import { ADVISORS, MARY } from '../content/index.js';

// Placeholder portrait: a silhouette + initials plate. To swap in real art, set the
// advisor's `portrait` field in content/index.js to an image URL — that's the only
// change needed (handled below).
function Portrait({ person, active, required, onClick }) {
  const initials = person.name
    .split(' ')
    .map((w) => w[0])
    .filter((c) => /[A-Z]/.test(c))
    .slice(0, 2)
    .join('');

  return (
    <button
      type="button"
      data-testid={'portrait-' + person.id}
      data-active={active ? 'true' : 'false'}
      className={'portrait' + (active ? ' active' : ' inactive') + (required ? ' required' : '')}
      disabled={!active}
      onClick={active ? onClick : undefined}
      title={active ? `${person.name} — has business for you` : `${person.name} — nothing this month`}
    >
      <div className="portrait-frame">
        {person.portrait ? (
          <img src={person.portrait} alt={person.name} />
        ) : (
          <svg viewBox="0 0 64 64" className="portrait-placeholder" aria-hidden="true">
            <rect width="64" height="64" rx="4" />
            <circle cx="32" cy="26" r="13" className="silhouette" />
            <path d="M12 60 Q32 38 52 60 Z" className="silhouette" />
            <text x="32" y="34" className="portrait-initials">{initials}</text>
          </svg>
        )}
        {active && <span className="portrait-badge">!</span>}
        {required && <span className="portrait-required">must answer</span>}
      </div>
      <div className="portrait-name">{person.name.split(' ').slice(-1)}</div>
      <div className="portrait-title">{person.title}</div>
    </button>
  );
}

export default function CabinetView({ availableByAdvisor, requiredIds, onOpen }) {
  const roster = [...ADVISORS, MARY];
  return (
    <div className="cabinet">
      <h2>The Cabinet & Home</h2>
      <p className="cabinet-hint">
        Advisors with a marked portrait have a decision for you this month. You may end the
        turn without consulting everyone.
      </p>
      <div className="portraits">
        {roster.map((person) => {
          const decision = availableByAdvisor[person.id];
          const active = !!decision;
          const required = active && requiredIds.includes(decision.id);
          return (
            <Portrait
              key={person.id}
              person={person}
              active={active}
              required={required}
              onClick={() => onOpen(decision.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
