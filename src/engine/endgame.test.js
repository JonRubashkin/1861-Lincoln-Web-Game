import { describe, it, expect } from 'vitest';
import { createInitialState } from './state.js';
import {
  electionScore,
  evaluateEndgame,
  assassinationChance,
  ELECTION_THRESHOLD,
} from './endgame.js';

function at(year, month) {
  const s = createInitialState();
  s.current = { year, month };
  return s;
}

describe('1864 election checkpoint', () => {
  it('ends the game below threshold and continues at/above', () => {
    const lose = at(1864, 11);
    lose.stats.unionMorale = 10;
    lose.stats.warEffort = 10;
    lose.stats.congressionalRelations = 10;
    expect(electionScore(lose)).toBeLessThan(ELECTION_THRESHOLD);
    expect(evaluateEndgame(lose, () => 0.99).ending.kind).toBe('curtailed');

    const win = at(1864, 11);
    win.stats.unionMorale = 80;
    win.stats.warEffort = 70;
    win.stats.congressionalRelations = 70;
    expect(electionScore(win)).toBeGreaterThanOrEqual(ELECTION_THRESHOLD);
    expect(evaluateEndgame(win, () => 0.99)).toEqual({ secondTermBegins: true });
  });
});

describe('catastrophic endings (any month)', () => {
  it('fires on washington_captured', () => {
    const s = at(1862, 6);
    s.flags.washington_captured = true;
    expect(evaluateEndgame(s, () => 0.99).ending.kind).toBe('catastrophic');
  });
  it('fires when morale hits 0', () => {
    const s = at(1862, 6);
    s.stats.unionMorale = 0;
    expect(evaluateEndgame(s, () => 0.99).ending.kind).toBe('catastrophic');
  });
});

describe('assassination hazard ramp', () => {
  it('is zero before the second term and during the grace period', () => {
    expect(assassinationChance(at(1864, 6))).toBe(0); // before 2nd term
    expect(assassinationChance(at(1865, 3))).toBe(0); // grace month 1
    expect(assassinationChance(at(1865, 4))).toBe(0); // grace month 2
  });

  it('ramps upward over the second term', () => {
    const early = assassinationChance(at(1865, 6));
    const later = assassinationChance(at(1867, 6));
    expect(early).toBeGreaterThan(0);
    expect(later).toBeGreaterThan(early);
  });

  it('scales with exposure (lower security = higher chance)', () => {
    const safe = at(1866, 6);
    safe.stats.security = 90;
    const exposed = at(1866, 6);
    exposed.stats.security = 10;
    expect(assassinationChance(exposed)).toBeGreaterThan(assassinationChance(safe));
  });

  it('can end the game in the second term given an unlucky roll', () => {
    const s = at(1866, 6);
    s.stats.security = 20;
    const result = evaluateEndgame(s, () => 0); // always rolls under the chance
    expect(result.ending.kind).toBe('full');
    expect(result.ending.title).toContain('Martyr');
  });
});

describe('1868 backstop', () => {
  it('ends with a full-presidency epilogue if no assassination fired', () => {
    const s = at(1868, 11);
    s.stats.security = 100; // no hazard
    const result = evaluateEndgame(s, () => 0.99);
    expect(result.ending.kind).toBe('full');
  });
});
