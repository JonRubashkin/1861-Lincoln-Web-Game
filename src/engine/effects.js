// effects.js — the single chokepoint that applies any effect object.
//
// It mutates stats / regions / flags on a state object, clamps ranges, and writes
// exactly one changeLog entry per *numeric* target touched (stat or region). Nothing
// else in the codebase appends to the change log.
//
// An effect object (from a choice) looks like:
//   {
//     stats:   { unionMorale: +5, treasury: -10 },
//     regions: { kentucky: +15 },
//     flags:   { set: ['security_unlocked'], clear: ['some_flag'] },
//   }

import { STAT_KEYS, monthString } from './state.js';

export function clampStat(v) {
  return Math.max(0, Math.min(100, v));
}

export function clampControl(v) {
  return Math.max(-100, Math.min(100, v));
}

// Apply `effects` to `state` (mutates in place). `cause` is the decision/choice id,
// `reason` is the human-readable string shown in the info panel. Returns the state.
export function applyEffects(state, effects, cause, reason) {
  if (!effects) return state;
  const month = monthString(state.current.year, state.current.month);

  if (effects.stats) {
    for (const [key, delta] of Object.entries(effects.stats)) {
      if (!STAT_KEYS.includes(key) || !delta) continue;
      const before = state.stats[key];
      const after = clampStat(before + delta);
      state.stats[key] = after;
      const applied = after - before; // log the clamped delta actually applied
      if (applied !== 0) {
        state.changeLog.push({ month, target: `stat:${key}`, delta: applied, cause, reason });
      }
    }
  }

  if (effects.regions) {
    for (const [id, delta] of Object.entries(effects.regions)) {
      const region = state.regions[id];
      if (!region || !delta) continue;
      const before = region.control;
      const after = clampControl(before + delta);
      region.control = after;
      const applied = after - before;
      if (applied !== 0) {
        state.changeLog.push({ month, target: `region:${id}`, delta: applied, cause, reason });
      }
    }
  }

  if (effects.flags) {
    for (const f of effects.flags.set || []) {
      state.flags[f] = true;
    }
    for (const f of effects.flags.clear || []) {
      delete state.flags[f];
    }
  }

  return state;
}
