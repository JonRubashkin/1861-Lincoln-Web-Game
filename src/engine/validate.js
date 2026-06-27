// validate.js — validate content entries against the schema on load.
//
// Never throws: it returns a list of human-readable warnings and logs them with
// console.warn so a malformed content entry degrades gracefully instead of crashing
// the game. Adding content should be safe to iterate on.

import { STAT_KEYS } from './state.js';

const VALID_OPS = ['above', 'below', 'equals', 'isSet', 'notSet'];

export function validateContent(content, { advisorIds, regionIds }) {
  const warnings = [];
  const seenIds = new Set();
  const warn = (msg) => warnings.push(msg);

  if (!Array.isArray(content)) {
    warn('Content is not an array.');
    return warnings;
  }

  for (const entry of content) {
    const where = `entry "${entry && entry.id ? entry.id : '(no id)'}"`;

    if (!entry || typeof entry !== 'object') {
      warn(`${where}: not an object.`);
      continue;
    }
    if (!entry.id) warn(`${where}: missing id.`);
    if (entry.id && seenIds.has(entry.id)) warn(`${where}: duplicate id.`);
    if (entry.id) seenIds.add(entry.id);

    if (!entry.advisor) {
      warn(`${where}: missing advisor.`);
    } else if (entry.advisor !== 'event' && !advisorIds.has(entry.advisor)) {
      warn(`${where}: unknown advisor "${entry.advisor}".`);
    }

    if (typeof entry.text !== 'string' || !entry.text) warn(`${where}: missing text.`);

    // Triggers
    const t = entry.triggers || {};
    const monthRe = /^\d{4}-\d{2}$/;
    if (t.earliestMonth && !monthRe.test(t.earliestMonth))
      warn(`${where}: earliestMonth "${t.earliestMonth}" should be YYYY-MM.`);
    if (t.latestMonth && !monthRe.test(t.latestMonth))
      warn(`${where}: latestMonth "${t.latestMonth}" should be YYYY-MM.`);
    for (const cond of t.conditions || []) {
      if (!cond.target || cond.target.indexOf(':') === -1) {
        warn(`${where}: condition has malformed target "${cond.target}".`);
        continue;
      }
      if (!VALID_OPS.includes(cond.op)) warn(`${where}: invalid condition op "${cond.op}".`);
      const [kind, name] = cond.target.split(':');
      if (kind === 'stat' && !STAT_KEYS.includes(name))
        warn(`${where}: condition references unknown stat "${name}".`);
      if (kind === 'region' && !regionIds.has(name))
        warn(`${where}: condition references unknown region "${name}".`);
      if (!['stat', 'region', 'flag'].includes(kind))
        warn(`${where}: condition target kind "${kind}" is not stat/region/flag.`);
    }

    // Choices
    if (!Array.isArray(entry.choices) || entry.choices.length === 0) {
      warn(`${where}: must have at least one choice.`);
      continue;
    }
    entry.choices.forEach((c, i) => {
      const cw = `${where} choice[${i}]`;
      if (!c.label) warn(`${cw}: missing label.`);
      const fx = c.effects || {};
      for (const stat of Object.keys(fx.stats || {})) {
        if (!STAT_KEYS.includes(stat)) warn(`${cw}: effect on unknown stat "${stat}".`);
      }
      for (const region of Object.keys(fx.regions || {})) {
        if (!regionIds.has(region)) warn(`${cw}: effect on unknown region "${region}".`);
      }
      if (c.followUp && !seenIds.has(c.followUp)) {
        // Not necessarily an error (forward reference), but worth flagging if it
        // never resolves. We can only check ids seen so far; do a soft note.
      }
    });
  }

  // Second pass: validate followUp references against the full id set.
  for (const entry of content) {
    for (const c of entry.choices || []) {
      if (c.followUp && !seenIds.has(c.followUp))
        warnings.push(`entry "${entry.id}": followUp "${c.followUp}" does not match any entry id.`);
    }
  }

  if (warnings.length) {
    console.warn(`[content validation] ${warnings.length} issue(s):`);
    for (const w of warnings) console.warn('  - ' + w);
  }
  return warnings;
}
