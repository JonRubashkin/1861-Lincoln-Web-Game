// index.js — aggregate all content into one array and validate it on load.
//
// Adding content means dropping an entry into a cabinet/* or events/* module (or a
// new module imported here). Nothing in the engine needs to change.

import { validateContent } from '../engine/validate.js';
import { REGION_IDS } from './regions.js';

import seward from './cabinet/seward.js';
import chase from './cabinet/chase.js';
import stanton from './cabinet/stanton.js';
import welles from './cabinet/welles.js';
import bates from './cabinet/bates.js';
import blair from './cabinet/blair.js';
import mary from './cabinet/mary.js';

import events1861 from './events/1861.js';
import thresholds from './events/thresholds.js';

// Cabinet roster — drives the portrait gallery. `id` must match the advisor id used
// in content entries. Swapping in real portraits is a one-line change per advisor
// (set `portrait` to an image URL; placeholders are generated from initials).
export const ADVISORS = [
  { id: 'seward', name: 'William H. Seward', title: 'Secretary of State', portrait: null },
  { id: 'chase', name: 'Salmon P. Chase', title: 'Secretary of the Treasury', portrait: null },
  { id: 'stanton', name: 'Edwin M. Stanton', title: 'Secretary of War', portrait: null },
  { id: 'welles', name: 'Gideon Welles', title: 'Secretary of the Navy', portrait: null },
  { id: 'bates', name: 'Edward Bates', title: 'Attorney General', portrait: null },
  { id: 'blair', name: 'Montgomery Blair', title: 'Postmaster General', portrait: null },
];

// Mary is surfaced through her own portrait, separate from the Cabinet gallery.
export const MARY = { id: 'mary', name: 'Mary Todd Lincoln', title: 'First Lady', portrait: null };

const ADVISOR_IDS = new Set([...ADVISORS.map((a) => a.id), MARY.id]);

export const content = [
  ...seward,
  ...chase,
  ...stanton,
  ...welles,
  ...bates,
  ...blair,
  ...mary,
  ...events1861,
  ...thresholds,
];

export const validationWarnings = validateContent(content, {
  advisorIds: ADVISOR_IDS,
  regionIds: REGION_IDS,
});
