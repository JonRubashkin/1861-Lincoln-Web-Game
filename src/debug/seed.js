// Dev-only scenario seeding (CLAUDE.md §11).
//
// Reads a `?seed=<name>` URL parameter and turns it into a SEED_GAME action. This
// module is only ever referenced from inside `if (import.meta.env.DEV)` blocks, so a
// production build (where import.meta.env.DEV is statically false) dead-code-eliminates
// the branch and tree-shakes this module and the fixtures out of the bundle.

import { SEEDS } from '../../tests/fixtures/seeds.js';

// Returns a SEED_GAME action for the current URL's `?seed=`, or null if absent/unknown.
export function seedActionFromUrl() {
  if (typeof window === 'undefined') return null;
  const name = new URLSearchParams(window.location.search).get('seed');
  if (!name) return null;
  const seed = SEEDS[name];
  if (!seed) {
    console.warn(`[debug] unknown seed "${name}". Known: ${Object.keys(SEEDS).join(', ')}`);
    return null;
  }
  const { rng, ...patch } = seed;
  return { type: 'SEED_GAME', patch, rng };
}
