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
    rngSeed: 7,
  },

  // batch-2 note 3: pre-set the two gating flags at Sept 1862 so the Preliminary
  // Emancipation Proclamation surfaces immediately, without playing 18 turns.
  emancipation_prelim: {
    current: { year: 1862, month: 9 },
    flags: ['emancipation_drafted', 'antietam_victory', 'war_begun', 'security_unlocked'],
  },

  // Sept 1864: the Fall of Atlanta scripted beat fires on load. rngSeed is pinned so
  // any incidental random advisor situations are reproducible.
  atlanta_1864: {
    current: { year: 1864, month: 9 },
    flags: ['war_begun'],
    rngSeed: 1864,
  },

  // 1864 election: the Election-Day lead-in event fires first; resolving it hands off
  // to the endgame checkpoint. LOSE seed is tuned below threshold (curtailed epilogue);
  // WIN seed is above it (second term begins, no epilogue). Stats are kept clear of the
  // threshold-event triggers so only the named beats fire.
  election_1864_lose: {
    current: { year: 1864, month: 11 },
    stats: { unionMorale: 30, warEffort: 10, congressionalRelations: 10, treasury: 40 },
    rngSeed: 1864,
  },

  election_1864_win: {
    current: { year: 1864, month: 11 },
    stats: { unionMorale: 75, warEffort: 65, congressionalRelations: 60, treasury: 55 },
    flags: ['atlanta_fallen', 'soldier_vote_enabled', 'war_begun'],
    rngSeed: 1864,
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

  // Catastrophic ending: the capital falls. Set in the post-war window (no scripted or
  // pooled event competes for the month) so the endgame check fires immediately on load.
  catastrophic: {
    current: { year: 1866, month: 2 },
    flags: ['washington_captured'],
  },
};
