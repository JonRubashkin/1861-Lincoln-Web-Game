import { ADVISORS, MARY } from '../content/index.js';

const PEOPLE = Object.fromEntries([...ADVISORS, MARY].map((p) => [p.id, p]));

// Renders a decision OR an event (same schema). `entry` is the content entry.
// `isEvent` controls whether the modal can be dismissed (events must be answered).
export default function DecisionModal({ entry, isEvent, onChoose, onClose }) {
  if (!entry) return null;
  const person = PEOPLE[entry.advisor];
  const speaker = isEvent ? 'Event' : person ? person.name : entry.advisor;

  return (
    <div className="modal-backdrop" onClick={isEvent ? undefined : onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} data-testid={isEvent ? 'event-modal' : 'decision-modal'} data-entry={entry.id}>
        <div className="modal-speaker">{speaker}{person && !isEvent ? ` · ${person.title}` : ''}</div>
        <p className="modal-text">{entry.text}</p>
        <div className="modal-choices">
          {entry.choices.map((c, i) => (
            <button key={i} type="button" className="choice" data-testid={'choice-' + i} onClick={() => onChoose(i)}>
              {c.label}
            </button>
          ))}
        </div>
        {!isEvent && (
          <button type="button" className="modal-dismiss" onClick={onClose}>
            Step away for now
          </button>
        )}
      </div>
    </div>
  );
}
