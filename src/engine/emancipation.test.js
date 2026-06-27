// The Emancipation chain is the showcase for flag-gated, multi-month content
// (CLAUDE.md §10, batch-2 note 2). These tests drive the real reducer + content so
// they fail if the gating flags or trigger conditions drift. All engine logic stays
// generic — the chain lives entirely in data.

import { describe, it, expect } from 'vitest';
import { gameReducer } from './reducer.js';
import { selectMonthlyEvent } from './triggers.js';
import { content } from '../content/index.js';

const r = (state, action) => gameReducer(state, action, content);

// Jump to a month where `eventId` auto-fires, returning the staged state.
function seedTo(current, flags = []) {
  return r(null, { type: 'SEED_GAME', patch: { current, flags } });
}

// Force-resolve whatever event is currently staged with the given choice.
function resolveEvent(s, choiceIndex) {
  expect(s.phase).toBe('event');
  return r(s, { type: 'RESOLVE_EVENT', choiceIndex });
}

// Query which event would fire in a given month for a given flag set.
function eventAt(current, flags) {
  const s = { ...seedBlank(), current };
  for (const f of flags) s.flags[f] = true;
  const ev = selectMonthlyEvent(content, s);
  return ev ? ev.id : null;
}
function seedBlank() {
  // A minimal state shell the trigger query needs.
  return { current: { year: 1862, month: 9 }, stats: {}, regions: {}, flags: {}, usedDecisions: {}, resolvedThisMonth: [] };
}

describe('emancipation chain — wait-for-victory path', () => {
  it('drafted -> (Antietam) -> preliminary -> final', () => {
    // July 1862 cabinet meeting fires as the month event.
    let s = seedTo({ year: 1862, month: 7 });
    expect(s.activeEventId).toBe('emancipation_draft_cabinet_1862');
    s = resolveEvent(s, 1); // "wait for a victory"
    expect(s.flags.emancipation_drafted).toBe(true);
    expect(s.flags.emancipation_issued).toBeUndefined();

    // In Sept, with the draft made but no victory yet, the preliminary must NOT
    // qualify — Antietam wins the month instead.
    expect(eventAt({ year: 1862, month: 9 }, ['emancipation_drafted'])).toBe('antietam_1862');

    // Once Antietam sets the victory flag, the preliminary outranks everything.
    expect(eventAt({ year: 1862, month: 9 }, ['emancipation_drafted', 'antietam_victory'])).toBe(
      'preliminary_emancipation_1862'
    );

    // Resolve the preliminary -> emancipation_issued.
    let p = seedTo({ year: 1862, month: 9 }, ['emancipation_drafted', 'antietam_victory']);
    expect(p.activeEventId).toBe('preliminary_emancipation_1862');
    p = resolveEvent(p, 0);
    expect(p.flags.emancipation_issued).toBe(true);

    // Jan 1863 final proclamation requires emancipation_issued.
    expect(eventAt({ year: 1863, month: 1 }, ['emancipation_issued'])).toBe('final_emancipation_1863');
    let f = seedTo({ year: 1863, month: 1 }, ['emancipation_issued']);
    f = resolveEvent(f, 0);
    expect(f.flags.emancipation_final).toBe(true);
    expect(f.flags.black_troops_authorized).toBe(true);
  });
});

describe('emancipation chain — issue-now path', () => {
  it('issuing immediately skips the preliminary gate but still reaches the final', () => {
    let s = seedTo({ year: 1862, month: 7 });
    s = resolveEvent(s, 0); // "Issue it now"
    expect(s.flags.emancipation_issued).toBe(true);
    expect(s.flags.emancipation_drafted).toBeUndefined();

    // Preliminary needs emancipation_drafted, which was never set -> Antietam fires.
    expect(eventAt({ year: 1862, month: 9 }, ['emancipation_issued'])).toBe('antietam_1862');
    // The final still fires in Jan 1863 because emancipation_issued is set.
    expect(eventAt({ year: 1863, month: 1 }, ['emancipation_issued'])).toBe('final_emancipation_1863');
  });
});

describe('emancipation chain — shelve path', () => {
  it('shelving means neither proclamation ever fires (a genuine divergence)', () => {
    let s = seedTo({ year: 1862, month: 7 });
    s = resolveEvent(s, 2); // "Shelve emancipation"
    expect(s.flags.emancipation_shelved).toBe(true);
    expect(s.flags.emancipation_issued).toBeUndefined();
    expect(s.flags.emancipation_drafted).toBeUndefined();

    expect(eventAt({ year: 1862, month: 9 }, ['emancipation_shelved'])).toBe('antietam_1862');
    // No proclamation fires in Jan 1863 (a random general event may fill the slot,
    // but never the Emancipation chain).
    const jan63 = eventAt({ year: 1863, month: 1 }, ['emancipation_shelved']);
    expect(jan63).not.toBe('final_emancipation_1863');
    expect(jan63).not.toBe('preliminary_emancipation_1862');
  });
});
