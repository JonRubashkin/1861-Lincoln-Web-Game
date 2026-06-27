// state.js — initial state factory and documentation of the state shape.
//
// The entire game state is a plain serializable object so it can be round-tripped
// through localStorage with JSON.stringify / JSON.parse. Nothing here imports the
// engine logic; this module only describes and constructs state.
//
// State shape:
// {
//   current:   { year: Number, month: Number },   // month is 1..12
//   stats:     { unionMorale, congressionalRelations, borderStates, treasury,
//                internationalStanding, warEffort, maryPersonal, security },
//   regions:   { [id]: { id, displayName, control, active, isTerritory } },
//   flags:     { [name]: true },                   // only truthy flags are present
//   changeLog: [ { month, target, delta, cause, reason } ],
//   usedDecisions: { [id]: Number },               // absolute month index last used
//   requiredDecisions: [ id ],                      // forced follow-ups due this month
//   resolvedThisMonth: [ id ],                       // decisions resolved this month
//   phase:     'cabinet' | 'event' | 'epilogue',
//   activeDecisionId: id | null,                     // decision modal currently open
//   activeEventId:    id | null,                     // event modal currently open
//   ending:    null | { kind, title, body, grade },
//   secondTermStart: null | Number,                  // month index the 2nd term began
//   log:       [ String ],                           // human-readable turn narration
// }

import { createRegions } from '../content/regions.js';
import { randomSeed } from './rng.js';

export const STAT_KEYS = [
  'unionMorale',
  'congressionalRelations',
  'borderStates',
  'treasury',
  'internationalStanding',
  'warEffort',
  'maryPersonal',
  'security',
];

// Dial metadata used by the UI (and documented in the README).
export const STAT_META = {
  unionMorale: { label: 'Union Morale', hint: 'Home-front will; the election currency.' },
  congressionalRelations: { label: 'Congress', hint: 'Standing with Congress, esp. Radical Republicans.' },
  borderStates: { label: 'Border States', hint: 'Political pressure gauge for the slave states that stayed.' },
  treasury: { label: 'Treasury', hint: 'Ability to finance the war.' },
  internationalStanding: { label: 'Intl. Standing', hint: 'Britain/France recognition risk.' },
  warEffort: { label: 'War Effort', hint: 'Army readiness and momentum.' },
  maryPersonal: { label: 'Home Front', hint: 'Personal life with Mary.' },
  security: { label: 'Security', hint: 'Personal safety. Hidden until the threat is revealed.' },
};

export function createInitialState(seed = randomSeed()) {
  return {
    current: { year: 1861, month: 3 },
    stats: {
      unionMorale: 55,
      congressionalRelations: 50,
      borderStates: 40,
      treasury: 50,
      internationalStanding: 55,
      warEffort: 45,
      maryPersonal: 60,
      security: 50, // present numerically but hidden until security_unlocked flag is set
    },
    regions: createRegions(),
    flags: {},
    changeLog: [],
    usedDecisions: {},
    requiredDecisions: [],
    resolvedThisMonth: [],
    // Random advisor situations surfaced for the current month, chosen once at month
    // entry from the seeded PRNG (frozen so re-renders don't re-roll). Ids into content.
    monthRandomAdvisorIds: [],
    // Seeded PRNG state (one 32-bit int) — saved/loaded so a playthrough's random
    // selection is reproducible. See engine/rng.js.
    rngSeed: seed >>> 0 || 1,
    phase: 'cabinet',
    activeDecisionId: null,
    activeEventId: null,
    ending: null,
    secondTermStart: null,
    log: [],
  };
}

// Absolute month index, used for cooldown and hazard math. 1861-03 -> 1861*12 + 2.
export function monthIndex(year, month) {
  return year * 12 + (month - 1);
}

// "YYYY-MM" string used for changeLog stamping and calendar-window comparisons.
export function monthString(year, month) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function currentMonthString(state) {
  return monthString(state.current.year, state.current.month);
}

export function currentMonthIndex(state) {
  return monthIndex(state.current.year, state.current.month);
}
