import { useReducer, useState, useEffect, useMemo, useCallback } from 'react';
import { content } from './content/index.js';
import { gameReducer } from './engine/reducer.js';
import { getAvailableDecisions } from './engine/triggers.js';
import CabinetView from './ui/CabinetView.jsx';
import MapView from './ui/MapView.jsx';
import InfoPanel from './ui/InfoPanel.jsx';
import Dials from './ui/Dials.jsx';
import DecisionModal from './ui/DecisionModal.jsx';
import EndTurnBar from './ui/EndTurnBar.jsx';
import Epilogue from './ui/Epilogue.jsx';

const SAVE_KEY = 'lincoln-presidency-save-v1';

function reducer(state, action) {
  return gameReducer(state, action, content);
}

function startState() {
  return gameReducer(null, { type: 'NEW_GAME' }, content);
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, startState);
  const [selectedId, setSelectedId] = useState(null);
  const [hasSave, setHasSave] = useState(() => !!localStorage.getItem(SAVE_KEY));

  // Auto-save every state change (except the transient epilogue is fine to save too).
  useEffect(() => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
      setHasSave(true);
    } catch (e) {
      // Storage may be unavailable (private mode); ignore.
    }
  }, [state]);

  const entryById = useMemo(() => {
    const m = {};
    for (const e of content) m[e.id] = e;
    return m;
  }, []);

  // Decisions available this month, one (highest-priority) per advisor for the portrait.
  const availableByAdvisor = useMemo(() => {
    const out = {};
    if (state.phase === 'epilogue') return out;
    for (const d of getAvailableDecisions(content, state)) {
      const cur = out[d.advisor];
      if (!cur || (d.priority || 0) > (cur.priority || 0)) out[d.advisor] = d;
    }
    return out;
  }, [state]);

  const newGame = useCallback(() => {
    dispatch({ type: 'NEW_GAME' });
    setSelectedId(null);
  }, []);

  const save = useCallback(() => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
      setHasSave(true);
    } catch (e) {
      /* ignore */
    }
  }, [state]);

  const load = useCallback(() => {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    try {
      dispatch({ type: 'LOAD_GAME', state: JSON.parse(raw) });
      setSelectedId(null);
    } catch (e) {
      /* ignore corrupt save */
    }
  }, []);

  const activeDecision = state.activeDecisionId ? entryById[state.activeDecisionId] : null;
  const activeEvent = state.phase === 'event' && state.activeEventId ? entryById[state.activeEventId] : null;
  const selectedRegion = selectedId ? state.regions[selectedId] : null;

  if (state.phase === 'epilogue') {
    return <Epilogue ending={state.ending} onNewGame={newGame} />;
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <h1>Lincoln: A Presidency</h1>
          <span className="tagline">An advisory sandbox · March 1861 →</span>
        </div>
        <div className="topbar-actions">
          <button type="button" onClick={save}>Save</button>
          <button type="button" onClick={load} disabled={!hasSave}>Load</button>
          <button type="button" onClick={newGame}>New Game</button>
        </div>
      </header>

      <Dials state={state} />

      <main className="layout">
        <section className="col-left">
          <CabinetView
            availableByAdvisor={availableByAdvisor}
            requiredIds={state.requiredDecisions}
            onOpen={(id) => dispatch({ type: 'OPEN_DECISION', id })}
          />
        </section>

        <section className="col-right">
          <MapView regions={state.regions} selectedId={selectedId} onSelect={setSelectedId} />
          <InfoPanel region={selectedRegion} state={state} />
        </section>
      </main>

      <EndTurnBar
        state={state}
        requiredRemaining={state.requiredDecisions.length}
        onEndTurn={() => dispatch({ type: 'END_TURN' })}
      />

      {/* Cabinet/Mary decision modal (dismissible). */}
      {activeDecision && !activeEvent && (
        <DecisionModal
          entry={activeDecision}
          isEvent={false}
          onChoose={(i) => dispatch({ type: 'CHOOSE_DECISION', id: activeDecision.id, choiceIndex: i })}
          onClose={() => dispatch({ type: 'CLOSE_DECISION' })}
        />
      )}

      {/* Monthly event modal (must be answered). */}
      {activeEvent && (
        <DecisionModal
          entry={activeEvent}
          isEvent={true}
          onChoose={(i) => dispatch({ type: 'RESOLVE_EVENT', choiceIndex: i })}
        />
      )}
    </div>
  );
}
