// endgame.js — terminal-condition evaluation, run after each monthly event resolves.
//
// Order of evaluation each month:
//   1. Catastrophic endings (any month).
//   2. 1864 election checkpoint (1864-11).
//   3. Assassination hazard (second term only, 1865-03 onward).
//   4. 1868 backstop (1868-11).
//
// All pure given an injected rng (defaults to Math.random) so tests are deterministic.

import { monthIndex, currentMonthIndex, currentMonthString } from './state.js';

// ---- Map control helpers -----------------------------------------------------

export function mapControlPercent(state) {
  // Fraction (0..100) of decided, active, non-territory regions that are Union.
  let union = 0;
  let confederate = 0;
  for (const r of Object.values(state.regions)) {
    if (!r.active || r.isTerritory) continue;
    if (r.control > 33) union += 1;
    else if (r.control < -33) confederate += 1;
  }
  const decided = union + confederate;
  if (decided === 0) return 50;
  return (union / decided) * 100;
}

// ---- 1864 election -----------------------------------------------------------

export const ELECTION_THRESHOLD = 50;

// 1864 flag modifiers — the single, documented place where the player's election-year
// choices move the result on top of the dial/map blend. Positive = helps re-election.
// These read flags the 1864 content sets (events/1864.js); the engine never switches on
// a specific flag elsewhere. Tune balance here, not in logic.
export const ELECTION_FLAG_MODIFIERS = {
  atlanta_fallen: +12, // Sherman takes Atlanta — the historical turning point
  soldier_vote_enabled: +6, // furloughed/absentee soldiers favored Lincoln heavily
  sheridan_shenandoah: +5, // Cedar Creek and the autumn good news
  fremont_withdrew: +5, // the Radical splinter healed, the vote not divided
  johnson_vp: +4, // the broadened "National Union" ticket
  peace_terms_firm: +3, // "To Whom It May Concern" steadied the war party
  blind_memo: +2, // resolve to govern to the end, modestly steadying
  blair_dropped: -2, // appeasing the Radicals cost some conservative goodwill
  peace_talks_entertained: -8, // entertaining peace feelers read as wavering
};

export function electionFlagBonus(state) {
  let bonus = 0;
  for (const [flag, mod] of Object.entries(ELECTION_FLAG_MODIFIERS)) {
    if (state.flags[flag]) bonus += mod;
  }
  return bonus;
}

export function electionScore(state) {
  const s = state.stats;
  const map = mapControlPercent(state);
  // unionMorale dominant, then warEffort, congress, the map ratio, plus the
  // documented 1864 flag modifiers.
  return (
    0.45 * s.unionMorale +
    0.2 * s.warEffort +
    0.15 * s.congressionalRelations +
    0.2 * map +
    electionFlagBonus(state)
  );
}

// Plain-language note on what swung (or failed to swing) the 1864 race, for epilogues.
function describeElection(state) {
  if (state.flags.atlanta_fallen)
    return 'The fall of Atlanta in September had reignited the North and turned the canvass.';
  if (state.flags.peace_talks_entertained)
    return 'Entertaining the peace feelers had let the war party paint you as wavering.';
  if (state.flags.fremont_withdrew)
    return 'The Radical splinter had been healed, the Union vote kept whole.';
  return 'The contest turned on the weary arithmetic of the war itself.';
}

// ---- Assassination hazard ----------------------------------------------------

const SECOND_TERM_START = monthIndex(1865, 3); // 1865-03
const GRACE_MONTHS = 2;

// Per-month probability (0..1) of a lethal event. Pure function of state.
export function assassinationChance(state) {
  const idx = currentMonthIndex(state);
  if (idx < SECOND_TERM_START) return 0;
  const monthsIn = idx - SECOND_TERM_START;
  if (monthsIn < GRACE_MONTHS) return 0; // grace period

  const ramp = monthsIn - GRACE_MONTHS;
  // Base rate climbs over time so tension rises rather than a flat dice roll.
  let base = Math.min(0.015 + 0.004 * ramp, 0.18);

  // Player-modulated: scales with how exposed the President is.
  const securityFactor = (100 - state.stats.security) / 50; // 0 at sec=100, 2 at sec=0
  let chance = base * securityFactor;

  // Thematic spikes (e.g. post-war public celebrations) without hard-coding a date.
  if (state.flags.victory_celebration) chance *= 1.8;

  return Math.max(0, Math.min(0.6, chance));
}

// ---- Epilogue grading --------------------------------------------------------

function describeWar(state) {
  if (state.flags.union_victory) return 'The rebellion was crushed and the Union restored.';
  if (state.flags.confederacy_recognized || state.flags.foreign_intervention)
    return 'Foreign powers tipped the scales and Southern independence took hold.';
  const map = mapControlPercent(state);
  if (map > 65) return 'The Union armies held the upper hand as the guns fell quiet.';
  if (map < 40) return 'The Confederacy still held vast ground; the war’s end was no triumph.';
  return 'The war ground on, its outcome unsettled.';
}

function describeSlavery(state) {
  return state.flags.emancipation_issued
    ? 'Emancipation had been proclaimed; the institution of slavery was broken.'
    : 'Slavery endured — the great question left unanswered.';
}

function gradeFromStats(state) {
  const s = state.stats;
  const composite = (s.unionMorale + s.warEffort + s.congressionalRelations + mapControlPercent(state)) / 4;
  if (composite >= 70) return 'A';
  if (composite >= 58) return 'B';
  if (composite >= 45) return 'C';
  if (composite >= 32) return 'D';
  return 'F';
}

function fullPresidencyEpilogue(state, { died }) {
  const grade = gradeFromStats(state);
  const title = died ? 'A Martyr’s Rest' : 'The Full Measure';
  const lines = [
    died
      ? 'An assassin’s bullet found the President. The nation wept — but the work was already wrought.'
      : 'The President served out his terms and stepped down with the Republic intact.',
    `Re-elected in 1864: ${describeElection(state)}`,
    describeWar(state),
    describeSlavery(state),
    state.flags.reconstruction_begun
      ? 'The hard labor of Reconstruction had begun in earnest.'
      : 'Reconstruction remained a road barely entered.',
    `Border states held at a pressure reading of ${Math.round(state.stats.borderStates)}; the Union morale you leave behind stands at ${Math.round(state.stats.unionMorale)}.`,
  ];
  return { kind: 'full', title, body: lines.join(' '), grade };
}

function curtailedTermEpilogue(state) {
  const grade = gradeFromStats(state);
  return {
    kind: 'curtailed',
    title: 'Turned Out of Office',
    body: [
      'The voters of 1864 rendered their verdict, and it was not for you. A single term, and then the door.',
      describeElection(state),
      describeWar(state),
      describeSlavery(state),
      `You leave with the war effort at ${Math.round(state.stats.warEffort)} and the home front at ${Math.round(state.stats.unionMorale)}.`,
    ].join(' '),
    grade,
  };
}

function catastrophicEpilogue(state, cause) {
  return {
    kind: 'catastrophic',
    title: 'The Union Sundered',
    body: [
      cause,
      'The experiment in self-government faltered on your watch.',
      describeSlavery(state),
      'History would not be kind.',
    ].join(' '),
    grade: 'F',
  };
}

// ---- Main evaluation ---------------------------------------------------------

// Returns an ending object, or null if the game continues. Does NOT mutate state
// except for stamping secondTermStart when the 1864 checkpoint is survived (the
// reducer is responsible for persisting that — see note below). To stay pure here,
// we return a small directive the reducer applies.
export function evaluateEndgame(state, rng = Math.random) {
  const monthStr = currentMonthString(state);

  // 1. Catastrophic, any month.
  if (state.flags.washington_captured)
    return { ending: catastrophicEpilogue(state, 'Washington itself fell to Confederate arms.') };
  if (state.flags.foreign_intervention)
    return { ending: catastrophicEpilogue(state, 'European powers entered the war against the Union.') };
  if (state.stats.unionMorale <= 0)
    return { ending: catastrophicEpilogue(state, 'The will of the people collapsed; the North would fight no more.') };

  // 2. 1864 election checkpoint.
  if (monthStr === '1864-11') {
    if (electionScore(state) < ELECTION_THRESHOLD) {
      return { ending: curtailedTermEpilogue(state) };
    }
    // Survived; mark the start of the second term so the hazard clock can begin.
    return { secondTermBegins: true };
  }

  // 3. Assassination hazard, second term only.
  const chance = assassinationChance(state);
  if (chance > 0 && rng() < chance) {
    return { ending: fullPresidencyEpilogue(state, { died: true }) };
  }

  // 4. 1868 backstop.
  if (monthStr === '1868-11') {
    return { ending: fullPresidencyEpilogue(state, { died: false }) };
  }

  return null;
}
