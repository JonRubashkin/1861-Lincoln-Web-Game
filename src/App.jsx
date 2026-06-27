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
import { seedActionFromUrl } from './debug/seed.js';

const SAVE_KEY = 'lincoln-presidency-save-v1';

function reducer(state, action) {
  return gameReducer(state, action, content);
}

function startState() {
  // Dev/test only: a `?seed=` URL param jumps to a reproducible scenario. The branch
  // (and the debug module) is stripped from production builds.
  if (import.meta.env.DEV) {
    const seedAction = seedActionFromUrl();
    if (seedAction) return gameReducer(null, seedAction, content);
  }
  // Resume a saved game on reload if one exists; otherwise start fresh.
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return gameReducer(null, { type: 'LOAD_GAME', state: JSON.parse(raw) }, content);
  } catch {
    /* corrupt or unavailable storage — fall through to a new game */
  }
  return gameReducer(null, { type: 'NEW_GAME' }, content);
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, startState);
  const [selectedId, setSelectedId] = useState(null);

  // Auto-save every state change so a reload resumes where the player left off
  // (startState() loads this on next mount). Writing to an external system from an
  // effect is exactly what effects are for; no React state is touched here.
  useEffect(() => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch {
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
    } catch {
      /* ignore */
    }
  }, [state]);

  const load = useCallback(() => {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    try {
      dispatch({ type: 'LOAD_GAME', state: JSON.parse(raw) });
      setSelectedId(null);
    } catch {
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
          <button type="button" onClick={load}>Load</button>
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
