// rng.js — a small, fully deterministic seeded PRNG for content selection.
//
// All random selection (the monthly random-event draw and occasional random advisor
// situations) draws from a seed that lives in game state and is saved/loaded, so a
// playthrough is reproducible and tests can pin outcomes. Bare Math.random() is never
// used in selection logic.
//
// Usage:
//   const gen = makeRng(state.rngSeed);
//   gen.next();            // a float in [0, 1)
//   state.rngSeed = gen.state;   // persist the advanced seed
//
// Algorithm: mulberry32 — tiny, fast, good enough for game variety, and trivially
// serializable (the entire generator state is one 32-bit integer).

export function makeRng(seed) {
  let a = (seed >>> 0) || 1; // 0 is a degenerate seed; nudge to 1
  return {
    next() {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    get state() {
      return a >>> 0;
    },
  };
}

// A fresh, varied seed for a new game (this is *seeding*, not selection, so a
// nondeterministic source is fine; the seed is then persisted for reproducibility).
export function randomSeed() {
  return (Math.floor(Math.random() * 0xffffffff) >>> 0) || 1;
}

// Pick one item from `items` by relative `weight` (default 1) using a draw function
// `rand` (a () => [0,1) ). Returns null for an empty list.
export function weightedPick(items, rand) {
  if (!items || items.length === 0) return null;
  const total = items.reduce((sum, e) => sum + (e.weight > 0 ? e.weight : 1), 0);
  let r = rand() * total;
  for (const e of items) {
    r -= e.weight > 0 ? e.weight : 1;
    if (r < 0) return e;
  }
  return items[items.length - 1];
}

// Fisher–Yates in place, using a draw function.
export function shuffleInPlace(arr, rand) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
