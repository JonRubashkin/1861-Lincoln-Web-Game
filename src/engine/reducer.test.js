import { describe, it, expect } from 'vitest';
import { gameReducer } from './reducer.js';
import { content } from '../content/index.js';

const r = (state, action) => gameReducer(state, action, content);

describe('turn loop reducer', () => {
  it('NEW_GAME stages the March 1861 opening event', () => {
    const s = r(null, { type: 'NEW_GAME' });
    expect(s.current).toEqual({ year: 1861, month: 3 });
    expect(s.phase).toBe('event');
    expect(s.activeEventId).toBe('event_inauguration');
  });

  it('resolving the opening event applies effects and returns to cabinet', () => {
    let s = r(null, { type: 'NEW_GAME' });
    const before = s.stats.unionMorale;
    s = r(s, { type: 'RESOLVE_EVENT', choiceIndex: 1 }); // firm line: +8 morale
    expect(s.phase).toBe('cabinet');
    expect(s.stats.unionMorale).toBe(before + 8);
    expect(s.resolvedThisMonth).toContain('event_inauguration');
  });

  it('a cabinet choice with a followUp forces a required decision next month and gates End Turn', () => {
    let s = r(null, { type: 'NEW_GAME' });
    s = r(s, { type: 'RESOLVE_EVENT', choiceIndex: 0 }); // inauguration resolved
    // Seward's hard-line choice schedules seward_recognition_scare next month.
    s = r(s, { type: 'CHOOSE_DECISION', id: 'seward_british_posture', choiceIndex: 0 });
    expect(s.pendingFollowUps).toContain('seward_recognition_scare');

    s = r(s, { type: 'END_TURN' }); // advance to April -> Fort Sumter event
    expect(s.requiredDecisions).toContain('seward_recognition_scare');
    s = r(s, { type: 'RESOLVE_EVENT', choiceIndex: 0 }); // resolve Fort Sumter

    // End Turn is blocked while the forced follow-up is unanswered.
    const blocked = r(s, { type: 'END_TURN' });
    expect(blocked.current).toEqual(s.current);

    s = r(s, { type: 'CHOOSE_DECISION', id: 'seward_recognition_scare', choiceIndex: 0 });
    expect(s.requiredDecisions).toHaveLength(0);
    const advanced = r(s, { type: 'END_TURN' });
    expect(advanced.current).toEqual({ year: 1861, month: 5 });
  });

  it('activates West Virginia structurally when the flag is set', () => {
    let s = r(null, { type: 'NEW_GAME' });
    s = r(s, { type: 'RESOLVE_EVENT', choiceIndex: 0 });
    expect(s.regions.west_virginia.active).toBe(false);
    // Simulate an event/choice setting the flag via the effects chokepoint by
    // directly applying through a cabinet choice path is overkill; flip + reconcile
    // happens on any resolveChoice. Use a hand-built content entry instead:
    const extra = [
      { id: 'mk_wv', advisor: 'event', triggers: {}, choices: [
        { label: 'go', effects: { flags: { set: ['west_virginia_active'] } } },
      ] },
    ];
    s.phase = 'event';
    s.activeEventId = 'mk_wv';
    s = gameReducer(s, { type: 'RESOLVE_EVENT', choiceIndex: 0, rng: () => 0.99 }, extra);
    expect(s.regions.west_virginia.active).toBe(true);
    expect(s.regions.west_virginia.control).toBe(40);
  });
});
