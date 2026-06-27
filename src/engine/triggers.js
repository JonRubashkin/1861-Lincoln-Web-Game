// triggers.js — decide which decisions/events qualify in the current month.
//
// A content entry qualifies when:
//   - its calendar window (earliestMonth / latestMonth) contains the current month,
//   - every condition in triggers.conditions holds,
//   - it is not on cooldown,
//   - it has not already been used, if oncePerGame.
//
// Forced follow-ups (state.requiredDecisions) bypass trigger checks entirely.

import { monthIndex, currentMonthString, currentMonthIndex } from './state.js';

function readTarget(state, target) {
  const [kind, name] = target.split(':');
  if (kind === 'stat') return state.stats[name];
  if (kind === 'region') return state.regions[name] ? state.regions[name].control : undefined;
  if (kind === 'flag') return !!state.flags[name];
  return undefined;
}

export function evaluateCondition(state, cond) {
  const value = readTarget(state, cond.target);
  switch (cond.op) {
    case 'above':
      return typeof value === 'number' && value > cond.value;
    case 'below':
      return typeof value === 'number' && value < cond.value;
    case 'equals':
      return value === cond.value;
    case 'isSet':
      return value === true;
    case 'notSet':
      return value === false || value === undefined;
    default:
      return false;
  }
}

function withinCalendar(entry, monthStr) {
  const t = entry.triggers || {};
  if (t.earliestMonth && monthStr < t.earliestMonth) return false;
  if (t.latestMonth && monthStr > t.latestMonth) return false;
  return true;
}

function offCooldown(entry, state) {
  const lastUsed = state.usedDecisions[entry.id];
  if (lastUsed === undefined) return true;
  // oncePerGame defaults to true; if used at all it never recurs.
  const once = entry.oncePerGame !== false;
  if (once) return false;
  const cooldown = entry.cooldown || 0;
  return currentMonthIndex(state) - lastUsed >= cooldown;
}

// Does an entry qualify this month? Ignores requiredDecisions (handled separately).
export function qualifies(entry, state) {
  const monthStr = currentMonthString(state);
  if (!withinCalendar(entry, monthStr)) return false;
  if (!offCooldown(entry, state)) return false;
  const conds = (entry.triggers && entry.triggers.conditions) || [];
  return conds.every((c) => evaluateCondition(state, c));
}

// All cabinet/mary decisions available this month (advisor !== 'event'),
// including any forced follow-ups that are due now.
export function getAvailableDecisions(content, state) {
  const out = [];
  const seen = new Set();
  for (const entry of content) {
    if (entry.advisor === 'event') continue;
    if (state.resolvedThisMonth.includes(entry.id)) continue;
    const forced = state.requiredDecisions.includes(entry.id);
    if (forced || qualifies(entry, state)) {
      out.push(entry);
      seen.add(entry.id);
    }
  }
  // A forced follow-up might not exist in content (defensive) — ignore silently.
  return out;
}

// Distinct advisor ids that have at least one available decision this month.
export function getActiveAdvisors(content, state) {
  const ids = new Set();
  for (const d of getAvailableDecisions(content, state)) ids.add(d.advisor);
  return ids;
}

// The single monthly event: highest-priority qualifying advisor:'event' entry
// that hasn't already fired this month.
export function selectMonthlyEvent(content, state) {
  let best = null;
  for (const entry of content) {
    if (entry.advisor !== 'event') continue;
    if (state.resolvedThisMonth.includes(entry.id)) continue;
    if (!qualifies(entry, state)) continue;
    if (best === null || (entry.priority || 0) > (best.priority || 0)) best = entry;
  }
  return best;
}
