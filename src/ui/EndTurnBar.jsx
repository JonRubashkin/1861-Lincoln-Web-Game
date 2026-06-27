import { currentMonthString } from '../engine/state.js';

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function EndTurnBar({ state, requiredRemaining, onEndTurn }) {
  const month = currentMonthString(state);
  // Notable map shifts recorded this month, for the state-of-the-nation readout.
  const shifts = state.changeLog
    .filter((e) => e.month === month && e.target.startsWith('region:'))
    .slice(-3);

  const canEnd = requiredRemaining === 0;

  return (
    <div className="endturn-bar">
      <div className="endturn-status">
        <div className="endturn-month" data-testid="month">
          {MONTH_NAMES[state.current.month]} {state.current.year}
        </div>
        {shifts.length > 0 ? (
          <div className="endturn-shifts">
            {shifts.map((s, i) => (
              <span key={i} className="shift">
                {s.target.replace('region:', '').replace(/_/g, ' ')} {s.delta > 0 ? '+' : ''}{s.delta}
              </span>
            ))}
          </div>
        ) : (
          <div className="endturn-shifts muted">A quiet month on the map so far.</div>
        )}
      </div>
      <div className="endturn-action">
        {!canEnd && (
          <span className="endturn-warn">{requiredRemaining} decision(s) must be answered first.</span>
        )}
        <button type="button" className="end-turn" data-testid="end-turn" disabled={!canEnd} onClick={onEndTurn}>
          End Turn ▸
        </button>
      </div>
    </div>
  );
}
