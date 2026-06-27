// triggers.js — decide which decisions/events qualify in the current month.
//
// A content entry qualifies when:
//   - its calendar window (earliestMonth / latestMonth) contains the current month,
//   - every condition in triggers.conditions holds,
//   - it is not on cooldown,
//   - it has not already been used, if oncePerGame.
//
// Forced follow-ups (state.requiredDecisions) bypass trigger checks entirely.

import { currentMonthString, currentMonthIndex } from './state.js';
import { weightedPick, shuffleInPlace } from './rng.js';

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

// An entry is "random" only if it opts in; everything else is scripted (default).
export function isRandom(entry) {
  return entry.kind === 'random';
}

// Scripted (non-random) cabinet/mary decisions eligible this month. These are
// deterministic and always offered (historical beats never get crowded out).
function eligibleScriptedDecisions(content, state) {
  const out = [];
  for (const entry of content) {
    if (entry.advisor === 'event' || isRandom(entry)) continue;
    if (state.resolvedThisMonth.includes(entry.id)) continue;
    if (qualifies(entry, state)) out.push(entry);
  }
  return out;
}

// Pick the occasional random advisor situations for the month, drawing from the
// seeded PRNG. Runs ONCE at month entry (the result is frozen into state) so the
// cabinet doesn't re-roll on every render. Respects an active-advisor cap (target
// 1–3): scripted-active advisors fill the cap first; remaining capacity is offered,
// occasionally, to advisors who have an eligible random situation but no scripted one.
export function selectRandomAdvisorSituations(content, state, rand, cap = 3, surfaceChance = 0.5) {
  const scriptedAdvisors = new Set(eligibleScriptedDecisions(content, state).map((d) => d.advisor));
  let capacity = cap - scriptedAdvisors.size;
  if (capacity <= 0) return [];

  // Group eligible random advisor situations by advisor, skipping advisors who already
  // have a scripted decision this month.
  const byAdvisor = new Map();
  for (const entry of content) {
    if (entry.advisor === 'event' || !isRandom(entry)) continue;
    if (scriptedAdvisors.has(entry.advisor)) continue;
    if (state.resolvedThisMonth.includes(entry.id)) continue;
    if (!qualifies(entry, state)) continue;
    if (!byAdvisor.has(entry.advisor)) byAdvisor.set(entry.advisor, []);
    byAdvisor.get(entry.advisor).push(entry);
  }

  const advisors = shuffleInPlace([...byAdvisor.keys()], rand);
  const chosen = [];
  for (const advisor of advisors) {
    if (capacity <= 0) break;
    if (rand() >= surfaceChance) continue; // occasional, not guaranteed
    const pick = weightedPick(byAdvisor.get(advisor), rand);
    if (pick) {
      chosen.push(pick.id);
      capacity -= 1;
    }
  }
  return chosen;
}

// All cabinet/mary decisions to offer this month: scripted-eligible (live) + forced
// follow-ups + the random situations frozen at month entry (state.monthRandomAdvisorIds).
export function getAvailableDecisions(content, state) {
  const out = [];
  const randomIds = new Set(state.monthRandomAdvisorIds || []);
  for (const entry of content) {
    if (entry.advisor === 'event') continue;
    if (state.resolvedThisMonth.includes(entry.id)) continue;
    const forced = state.requiredDecisions.includes(entry.id);
    const scripted = !isRandom(entry) && qualifies(entry, state);
    const random = randomIds.has(entry.id);
    if (forced || scripted || random) out.push(entry);
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

// The single monthly event. Scripted precedence: if any scripted advisor:'event'
// entry is eligible, fire the highest-priority one (historical beats always win their
// month). Otherwise weighted-random-draw from eligible random events. `rand` is a
// () => [0,1) draw from the seeded PRNG.
export function selectMonthlyEvent(content, state, rand = Math.random) {
  let bestScripted = null;
  const eligibleRandom = [];
  for (const entry of content) {
    if (entry.advisor !== 'event') continue;
    if (state.resolvedThisMonth.includes(entry.id)) continue;
    if (!qualifies(entry, state)) continue;
    if (isRandom(entry)) {
      eligibleRandom.push(entry);
    } else if (bestScripted === null || (entry.priority || 0) > (bestScripted.priority || 0)) {
      bestScripted = entry;
    }
  }
  if (bestScripted) return bestScripted;
  return weightedPick(eligibleRandom, rand);
}
