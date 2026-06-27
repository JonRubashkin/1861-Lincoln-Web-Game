// reducer.js — pure state transitions for the turn loop.
//
// The reducer takes (state, action, content) and returns a new state. It never
// mutates the input: it deep-clones first, then mutates the clone. `content` is the
// aggregated array of decisions/events (passed in so the reducer stays decoupled and
// unit-testable). Optional `action.rng` lets tests make the assassination roll
// deterministic.
//
// Actions:
//   { type: 'NEW_GAME' }
//   { type: 'LOAD_GAME', state }
//   { type: 'OPEN_DECISION', id }
//   { type: 'CLOSE_DECISION' }
//   { type: 'CHOOSE_DECISION', id, choiceIndex }
//   { type: 'END_TURN', rng? }
//   { type: 'RESOLVE_EVENT', choiceIndex, rng? }

import { createInitialState, currentMonthIndex, monthString } from './state.js';
import { applyEffects } from './effects.js';
import { selectMonthlyEvent } from './triggers.js';
import { evaluateEndgame } from './endgame.js';
import { FLAG_ACTIVATIONS } from '../content/regions.js';

function clone(state) {
  return structuredClone(state);
}

function findEntry(content, id) {
  return content.find((e) => e.id === id) || null;
}

// Resolve structural region changes that flags imply but the effect schema can't
// express directly (e.g. West Virginia splitting from Virginia in 1863). Keeps the
// rendered SVG geometry fixed; only flips `active` and seeds control once. Driven
// entirely by the FLAG_ACTIVATIONS data table — no per-region special cases — so a
// new statehood/territory beat is a data row in regions.js, not engine code.
function reconcileStructural(state) {
  for (const [flag, rule] of Object.entries(FLAG_ACTIVATIONS)) {
    if (!state.flags[flag]) continue;
    const region = state.regions[rule.region];
    if (!region || region.active) continue;
    region.active = true;
    const before = region.control;
    region.control = rule.control;
    state.changeLog.push({
      month: monthString(state.current.year, state.current.month),
      target: `region:${rule.region}`,
      delta: region.control - before,
      cause: `structural_${flag}`,
      reason: rule.reason,
    });
  }
}

// Apply a chosen choice's effects + bookkeeping (mutates state).
function resolveChoice(state, entry, choiceIndex) {
  const choice = entry.choices[choiceIndex];
  if (!choice) return;
  applyEffects(state, choice.effects, `${entry.id}:${choiceIndex}`, choice.reason || entry.id);
  reconcileStructural(state);
  state.usedDecisions[entry.id] = currentMonthIndex(state);
  if (!state.resolvedThisMonth.includes(entry.id)) state.resolvedThisMonth.push(entry.id);
  state.requiredDecisions = state.requiredDecisions.filter((id) => id !== entry.id);
  if (choice.followUp) {
    if (!state.pendingFollowUps) state.pendingFollowUps = [];
    state.pendingFollowUps.push(choice.followUp);
  }
}

function advanceMonth(state) {
  let { year, month } = state.current;
  month += 1;
  if (month > 12) {
    month = 1;
    year += 1;
  }
  state.current = { year, month };
}

// Pick and stage this month's event, or run endgame + go to cabinet if none.
function enterMonth(state, content, rng) {
  const ev = selectMonthlyEvent(content, state);
  if (ev) {
    state.phase = 'event';
    state.activeEventId = ev.id;
    return state;
  }
  // No event this month — endgame still evaluates, then cabinet phase.
  applyEndgame(state, rng);
  if (state.phase !== 'epilogue') {
    state.phase = 'cabinet';
    state.activeEventId = null;
  }
  return state;
}

function applyEndgame(state, rng) {
  const result = evaluateEndgame(state, rng);
  if (!result) return;
  if (result.ending) {
    state.ending = result.ending;
    state.phase = 'epilogue';
    state.activeDecisionId = null;
    state.activeEventId = null;
  } else if (result.secondTermBegins) {
    state.secondTermStart = currentMonthIndex(state);
  }
}

export function gameReducer(state, action, content = []) {
  switch (action.type) {
    case 'NEW_GAME': {
      const s = createInitialState();
      s.pendingFollowUps = [];
      // Fire the opening (March 1861) event before the first cabinet phase.
      return enterMonth(s, content, action.rng);
    }

    case 'LOAD_GAME': {
      const s = clone(action.state);
      if (!s.pendingFollowUps) s.pendingFollowUps = [];
      return s;
    }

    // Dev/test only (see src/debug/): jump to an arbitrary state by applying a
    // generic patch to a fresh game, then entering that month so the right event
    // (or endgame) surfaces. The patch is plain data — no content-specific logic.
    case 'SEED_GAME': {
      const s = createInitialState();
      s.pendingFollowUps = [];
      const p = action.patch || {};
      if (p.current) s.current = { ...s.current, ...p.current };
      if (p.stats) Object.assign(s.stats, p.stats);
      if (p.flags) for (const f of p.flags) s.flags[f] = true;
      if (p.regions) {
        for (const [id, control] of Object.entries(p.regions)) {
          if (s.regions[id]) s.regions[id].control = control;
        }
      }
      if (p.secondTermStart != null) s.secondTermStart = p.secondTermStart;
      reconcileStructural(s);
      return enterMonth(s, content, action.rng);
    }

    case 'OPEN_DECISION': {
      if (state.phase !== 'cabinet') return state;
      const s = clone(state);
      s.activeDecisionId = action.id;
      return s;
    }

    case 'CLOSE_DECISION': {
      const s = clone(state);
      s.activeDecisionId = null;
      return s;
    }

    case 'CHOOSE_DECISION': {
      if (state.phase !== 'cabinet') return state;
      const entry = findEntry(content, action.id);
      if (!entry) return state;
      const s = clone(state);
      resolveChoice(s, entry, action.choiceIndex);
      s.activeDecisionId = null;
      return s;
    }

    case 'END_TURN': {
      if (state.phase !== 'cabinet') return state;
      // Gate: all forced follow-ups must be resolved first.
      if (state.requiredDecisions.length > 0) return state;
      const s = clone(state);
      advanceMonth(s);
      s.resolvedThisMonth = [];
      s.requiredDecisions = s.pendingFollowUps || [];
      s.pendingFollowUps = [];
      return enterMonth(s, content, action.rng);
    }

    case 'RESOLVE_EVENT': {
      if (state.phase !== 'event') return state;
      const entry = findEntry(content, state.activeEventId);
      if (!entry) return state;
      const s = clone(state);
      resolveChoice(s, entry, action.choiceIndex);
      s.activeEventId = null;
      applyEndgame(s, action.rng);
      if (s.phase !== 'epilogue') s.phase = 'cabinet';
      return s;
    }

    default:
      return state;
  }
}
