import { describe, it, expect } from 'vitest';
import { gameReducer } from './reducer.js';
import { getActiveAdvisors } from './triggers.js';
import { content } from '../content/index.js';

const r = (state, action) => gameReducer(state, action, content);

describe('save / load round-trip', () => {
  it('serializes the entire state through JSON and restores it identically', () => {
    // Build a non-trivial state: resolve the opening event, take a cabinet choice.
    let s = r(null, { type: 'NEW_GAME' });
    s = r(s, { type: 'RESOLVE_EVENT', choiceIndex: 0 });
    s = r(s, { type: 'CHOOSE_DECISION', id: 'chase_war_finance', choiceIndex: 0 });

    const saved = JSON.parse(JSON.stringify(s)); // what localStorage would hold
    const loaded = r(null, { type: 'LOAD_GAME', state: saved });

    expect(loaded.current).toEqual(s.current);
    expect(loaded.stats).toEqual(s.stats);
    expect(loaded.regions).toEqual(s.regions);
    expect(loaded.flags).toEqual(s.flags);
    expect(loaded.changeLog).toEqual(s.changeLog);
    expect(loaded.usedDecisions).toEqual(s.usedDecisions);
    expect(loaded.phase).toBe(s.phase);
  });

  it('a loaded game is decoupled from the saved object (no shared references)', () => {
    let s = r(null, { type: 'NEW_GAME' });
    s = r(s, { type: 'RESOLVE_EVENT', choiceIndex: 1 });
    const saved = JSON.parse(JSON.stringify(s));
    const loaded = r(null, { type: 'LOAD_GAME', state: saved });
    loaded.stats.unionMorale = 0;
    expect(saved.stats.unionMorale).not.toBe(0);
  });
});

describe('advisor-active derivation', () => {
  it('marks an advisor active only in a month one of their decisions qualifies', () => {
    // March 1861: Seward (1861-03..06, intl<60) and Chase (1861-03..08) qualify;
    // Stanton's only decision is gated to 1862, so he is inactive.
    let s = r(null, { type: 'NEW_GAME' });
    s = r(s, { type: 'RESOLVE_EVENT', choiceIndex: 0 }); // back to cabinet, March 1861
    const active = getActiveAdvisors(content, s);
    expect(active.has('chase')).toBe(true);
    expect(active.has('seward')).toBe(true);
    expect(active.has('stanton')).toBe(false);
  });
});
