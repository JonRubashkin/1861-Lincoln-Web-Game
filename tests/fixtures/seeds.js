// Reproducible scenario seeds (CLAUDE.md §11).
//
// Each seed is a plain-data patch applied over a fresh game by the generic
// SEED_GAME reducer action: { current?, stats?, regions?, flags?, secondTermStart?,
// rng? }. `rng` is an optional deterministic roll function used only for the
// assassination scenario so the hazard is testable without flakiness.
//
// These are shared by the dev-only `?seed=` loader (src/debug/) and the Playwright
// e2e suite, so a scenario is defined in exactly one place.

import { monthIndex } from '../../src/engine/state.js';

export const SEEDS = {
  // Jump straight to the Baltimore Plot month so the Security dial unlock is one step.
  pre_baltimore: {
    current: { year: 1861, month: 5 },
  },

  // August 1861: no scripted event fires, so the cabinet is immediately actionable.
  // Maryland is parked just inside "contested" so Blair's "secure the rail lines"
  // choice (+18) tips it over the +33 line into the Union tier — a visible map shift
  // with attribution.
  cabinet_map: {
    current: { year: 1861, month: 8 },
    flags: ['war_begun'],
    regions: { maryland: 30 },
  },

  // batch-2 note 3: pre-set the two gating flags at Sept 1862 so the Preliminary
  // Emancipation Proclamation surfaces immediately, without playing 18 turns.
  emancipation_prelim: {
    current: { year: 1862, month: 9 },
    flags: ['emancipation_drafted', 'antietam_victory', 'war_begun', 'security_unlocked'],
  },

  // 1864 election checkpoint, tuned below threshold -> curtailed first-term epilogue
  // on load. Stats are kept clear of the threshold-event triggers so the endgame,
  // not a state-triggered event, is what fires.
  election_1864: {
    current: { year: 1864, month: 11 },
    stats: { unionMorale: 30, warEffort: 10, congressionalRelations: 10, treasury: 40 },
  },

  // Deep in the second term with the President badly exposed; the deterministic
  // rng (always rolls 0) makes the hazard fire on load -> martyr epilogue.
  assassination: {
    current: { year: 1866, month: 6 },
    stats: { security: 5 },
    flags: ['security_unlocked', 'union_victory'],
    secondTermStart: monthIndex(1865, 3),
    rng: () => 0,
  },

  // Catastrophic ending, any month: the capital falls.
  catastrophic: {
    current: { year: 1864, month: 1 },
    flags: ['washington_captured'],
  },
};
