import { describe, it, expect } from 'vitest';
import { createInitialState, monthIndex } from './state.js';
import { qualifies, getAvailableDecisions, selectMonthlyEvent, evaluateCondition } from './triggers.js';

function at(year, month) {
  const s = createInitialState();
  s.current = { year, month };
  return s;
}

describe('trigger evaluation', () => {
  it('respects the calendar window', () => {
    const entry = { id: 'e', advisor: 'seward', triggers: { earliestMonth: '1861-04', latestMonth: '1861-06' } };
    expect(qualifies(entry, at(1861, 3))).toBe(false);
    expect(qualifies(entry, at(1861, 4))).toBe(true);
    expect(qualifies(entry, at(1861, 6))).toBe(true);
    expect(qualifies(entry, at(1861, 7))).toBe(false);
  });

  it('requires all conditions to hold', () => {
    const entry = {
      id: 'e', advisor: 'chase',
      triggers: { conditions: [
        { target: 'stat:treasury', op: 'below', value: 30 },
        { target: 'flag:war_begun', op: 'isSet' },
      ] },
    };
    const s = at(1861, 5);
    expect(qualifies(entry, s)).toBe(false); // treasury 50, no flag
    s.stats.treasury = 20;
    expect(qualifies(entry, s)).toBe(false); // still missing flag
    s.flags.war_begun = true;
    expect(qualifies(entry, s)).toBe(true);
  });

  it('evaluates each op', () => {
    const s = at(1861, 5);
    s.stats.unionMorale = 40;
    expect(evaluateCondition(s, { target: 'stat:unionMorale', op: 'above', value: 30 })).toBe(true);
    expect(evaluateCondition(s, { target: 'stat:unionMorale', op: 'below', value: 30 })).toBe(false);
    expect(evaluateCondition(s, { target: 'stat:unionMorale', op: 'equals', value: 40 })).toBe(true);
    expect(evaluateCondition(s, { target: 'flag:none', op: 'notSet' })).toBe(true);
    s.flags.x = true;
    expect(evaluateCondition(s, { target: 'flag:x', op: 'isSet' })).toBe(true);
  });

  it('honors oncePerGame and cooldown', () => {
    const once = { id: 'once', advisor: 'seward', oncePerGame: true, triggers: {} };
    const s = at(1861, 5);
    expect(qualifies(once, s)).toBe(true);
    s.usedDecisions.once = monthIndex(1861, 5);
    expect(qualifies(once, s)).toBe(false); // never recurs

    const recur = { id: 'recur', advisor: 'seward', oncePerGame: false, cooldown: 2, triggers: {} };
    s.usedDecisions.recur = monthIndex(1861, 3);
    s.current = { year: 1861, month: 4 };
    expect(qualifies(recur, s)).toBe(false); // 1 month < cooldown 2
    s.current = { year: 1861, month: 5 };
    expect(qualifies(recur, s)).toBe(true); // 2 months >= cooldown
  });

  it('treats forced follow-ups as available even without triggers', () => {
    const content = [{ id: 'fu', advisor: 'seward', triggers: { earliestMonth: '1999-01' }, choices: [] }];
    const s = at(1861, 5);
    expect(getAvailableDecisions(content, s).length).toBe(0);
    s.requiredDecisions = ['fu'];
    expect(getAvailableDecisions(content, s).map((d) => d.id)).toEqual(['fu']);
  });

  it('selects the highest-priority qualifying event', () => {
    const content = [
      { id: 'lo', advisor: 'event', priority: 10, triggers: {} },
      { id: 'hi', advisor: 'event', priority: 90, triggers: {} },
      { id: 'notyet', advisor: 'event', priority: 100, triggers: { earliestMonth: '1999-01' } },
    ];
    expect(selectMonthlyEvent(content, at(1861, 5)).id).toBe('hi');
  });
});
