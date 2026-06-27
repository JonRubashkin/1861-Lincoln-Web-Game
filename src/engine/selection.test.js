// Part 1 — random-event selection, the seeded PRNG, and the active-advisor cap.

import { describe, it, expect } from 'vitest';
import { createInitialState, monthIndex } from './state.js';
import { makeRng, weightedPick } from './rng.js';
import {
  selectMonthlyEvent,
  selectRandomAdvisorSituations,
  qualifies,
} from './triggers.js';
import { gameReducer } from './reducer.js';
import { content } from '../content/index.js';

function at(year, month) {
  const s = createInitialState(1);
  s.current = { year, month };
  return s;
}

describe('monthly event selection — scripted precedence', () => {
  it('fires a scripted event over an eligible random one', () => {
    const c = [
      { id: 'rand1', advisor: 'event', kind: 'random', oncePerGame: false, cooldown: 0, triggers: {} },
      { id: 'scr1', advisor: 'event', priority: 10, triggers: {} },
    ];
    const draw = makeRng(123).next;
    expect(selectMonthlyEvent(c, at(1863, 11), draw).id).toBe('scr1');
  });

  it('draws a random event only when no scripted event is eligible', () => {
    const c = [
      { id: 'rand1', advisor: 'event', kind: 'random', oncePerGame: false, cooldown: 0, weight: 1, triggers: {} },
      // scripted, but out of its calendar window -> not eligible
      { id: 'scr1', advisor: 'event', priority: 10, triggers: { earliestMonth: '1999-01' } },
    ];
    const picked = selectMonthlyEvent(c, at(1863, 11), makeRng(5).next);
    expect(picked.id).toBe('rand1');
  });

  it('returns null when neither a scripted nor a random event is eligible', () => {
    const c = [{ id: 's', advisor: 'event', triggers: { earliestMonth: '1999-01' } }];
    expect(selectMonthlyEvent(c, at(1863, 11), makeRng(1).next)).toBe(null);
  });
});

describe('weighted random draw — deterministic for a fixed seed', () => {
  const c = [
    { id: 'a', advisor: 'event', kind: 'random', oncePerGame: false, cooldown: 0, weight: 1, triggers: {} },
    { id: 'b', advisor: 'event', kind: 'random', oncePerGame: false, cooldown: 0, weight: 3, triggers: {} },
  ];

  it('the same seed yields the same pick', () => {
    const pick = (seed) => selectMonthlyEvent(c, at(1863, 11), makeRng(seed).next).id;
    expect(pick(42)).toBe(pick(42));
    expect(pick(7)).toBe(pick(7));
  });

  it('honors weights over many seeds (3:1 favors b)', () => {
    const counts = { a: 0, b: 0 };
    for (let seed = 1; seed <= 600; seed++) {
      counts[selectMonthlyEvent(c, at(1863, 11), makeRng(seed).next).id] += 1;
    }
    expect(counts.b).toBeGreaterThan(counts.a);
  });

  it('weightedPick is a pure function of its draw value', () => {
    const items = [{ id: 'x', weight: 1 }, { id: 'y', weight: 1 }];
    expect(weightedPick(items, () => 0.1).id).toBe('x');
    expect(weightedPick(items, () => 0.9).id).toBe('y');
    expect(weightedPick([], () => 0.5)).toBe(null);
  });
});

describe('cooldown prevents back-to-back recurrence', () => {
  it('a recurring random entry is unavailable until its cooldown elapses', () => {
    const e = { id: 'r', advisor: 'event', kind: 'random', oncePerGame: false, cooldown: 3, triggers: {} };
    const s = at(1862, 1);
    expect(qualifies(e, s)).toBe(true);
    s.usedDecisions.r = monthIndex(1862, 1);
    s.current = { year: 1862, month: 2 }; // 1 month later
    expect(qualifies(e, s)).toBe(false);
    s.current = { year: 1862, month: 3 }; // 2 months later
    expect(qualifies(e, s)).toBe(false);
    s.current = { year: 1862, month: 4 }; // 3 months later -> off cooldown
    expect(qualifies(e, s)).toBe(true);
  });
});

describe('active-advisor cap', () => {
  const pool = ['seward', 'chase', 'welles', 'bates', 'blair'].map((advisor) => ({
    id: `${advisor}_sit`,
    advisor,
    kind: 'random',
    oncePerGame: false,
    cooldown: 0,
    triggers: {},
  }));

  it('never surfaces more than the cap of random advisor situations', () => {
    // surfaceChance = 1 forces every considered advisor; cap 3 must still bind.
    const chosen = selectRandomAdvisorSituations(pool, at(1862, 5), makeRng(9).next, 3, 1);
    expect(chosen.length).toBe(3);
    const advisors = chosen.map((id) => pool.find((e) => e.id === id).advisor);
    expect(new Set(advisors).size).toBe(3); // one per advisor
  });

  it('scripted-active advisors consume the cap and are skipped for random', () => {
    const withScripted = [...pool, { id: 'seward_scr', advisor: 'seward', triggers: {} }];
    const chosen = selectRandomAdvisorSituations(withScripted, at(1862, 5), makeRng(9).next, 3, 1);
    expect(chosen.length).toBe(2); // cap 3 minus the scripted seward
    const advisors = chosen.map((id) => withScripted.find((e) => e.id === id).advisor);
    expect(advisors).not.toContain('seward');
  });

  it('is occasional, not guaranteed, at a low surface chance', () => {
    // surfaceChance 0 => no advisor situations surface.
    expect(selectRandomAdvisorSituations(pool, at(1862, 5), makeRng(9).next, 3, 0)).toEqual([]);
  });
});

describe('seeded PRNG lives in state and makes selection reproducible', () => {
  it('the same pinned seed reproduces the monthly selection through the reducer', () => {
    const patch = { current: { year: 1863, month: 11 }, flags: ['war_begun'], rngSeed: 99 };
    const a = gameReducer(null, { type: 'SEED_GAME', patch }, content);
    const b = gameReducer(null, { type: 'SEED_GAME', patch }, content);
    expect(a.activeEventId).toBe(b.activeEventId);
    expect(a.monthRandomAdvisorIds).toEqual(b.monthRandomAdvisorIds);
    expect(a.rngSeed).toBe(b.rngSeed);
  });

  it('NEW_GAME accepts a seed and round-trips rngSeed through save/load', () => {
    const s = gameReducer(null, { type: 'NEW_GAME', seed: 1861 }, content);
    expect(typeof s.rngSeed).toBe('number');
    const saved = JSON.parse(JSON.stringify(s));
    const loaded = gameReducer(null, { type: 'LOAD_GAME', state: saved }, content);
    expect(loaded.rngSeed).toBe(s.rngSeed);
  });
});
