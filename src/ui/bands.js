// bands.js — derive display tiers and colors from numeric control values.
// Tiers are NEVER stored; they are computed here at render time from the global bands.

export function bandOf(control) {
  if (control > 33) return 'union';
  if (control < -33) return 'confederate';
  return 'contested';
}

export const BAND_LABEL = {
  union: 'Union-controlled',
  contested: 'Contested',
  confederate: 'Confederate-controlled',
};

// Period-restrained palette.
export const BAND_COLOR = {
  union: '#41658a', // muted federal blue
  contested: '#c2a35a', // tan / gold
  confederate: '#9d5c4f', // muted brick red
};

export const DORMANT_COLOR = '#6f6f68';
