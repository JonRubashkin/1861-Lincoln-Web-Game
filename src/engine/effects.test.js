import { describe, it, expect } from 'vitest';
import { applyEffects, clampStat, clampControl } from './effects.js';
import { createInitialState } from './state.js';

describe('effects', () => {
  it('clamps stats to 0..100 and logs the applied (clamped) delta', () => {
    const s = createInitialState();
    s.stats.treasury = 95;
    applyEffects(s, { stats: { treasury: 20 } }, 'cause', 'Funded the war');
    expect(s.stats.treasury).toBe(100);
    const entry = s.changeLog.at(-1);
    expect(entry.target).toBe('stat:treasury');
    expect(entry.delta).toBe(5); // only the 5 that fit before the cap
    expect(entry.reason).toBe('Funded the war');
  });

  it('clamps region control to -100..100', () => {
    const s = createInitialState();
    s.regions.kentucky.control = 5;
    applyEffects(s, { regions: { kentucky: 500 } }, 'cause', 'Reinforced');
    expect(s.regions.kentucky.control).toBe(100);
    expect(s.changeLog.at(-1)).toMatchObject({ target: 'region:kentucky', delta: 95 });
  });

  it('does not log a no-op delta', () => {
    const s = createInitialState();
    s.stats.unionMorale = 100;
    applyEffects(s, { stats: { unionMorale: 10 } }, 'cause', 'reason');
    expect(s.changeLog.length).toBe(0);
  });

  it('sets and clears flags without logging them', () => {
    const s = createInitialState();
    s.flags.old = true;
    applyEffects(s, { flags: { set: ['security_unlocked'], clear: ['old'] } }, 'c', 'r');
    expect(s.flags.security_unlocked).toBe(true);
    expect(s.flags.old).toBeUndefined();
    expect(s.changeLog.length).toBe(0);
  });

  it('clamp helpers behave', () => {
    expect(clampStat(150)).toBe(100);
    expect(clampStat(-5)).toBe(0);
    expect(clampControl(-200)).toBe(-100);
    expect(clampControl(200)).toBe(100);
  });
});
