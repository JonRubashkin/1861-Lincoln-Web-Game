// Gideon Welles — Secretary of the Navy. The blockade.

export default [
  {
    id: 'welles_blockade',
    advisor: 'welles',
    triggers: {
      earliestMonth: '1861-04',
      latestMonth: '1861-08',
      conditions: [{ target: 'flag:war_begun', op: 'isSet' }],
    },
    priority: 10,
    text:
      'With the war begun, Welles presses for a naval blockade of Southern ports. But a "blockade" in international law implies the Confederacy is a belligerent power — not merely a band of rebels — and Europe will take note.',
    choices: [
      {
        label: 'Proclaim a full blockade of the Southern coast',
        reason: 'Declared a naval blockade of the Confederacy',
        effects: {
          stats: { warEffort: 8, internationalStanding: -6 },
          flags: { set: ['blockade_declared'] },
        },
      },
      {
        label: 'Merely "close" the ports by domestic law',
        reason: 'Closed Southern ports by statute to avoid implying belligerency',
        effects: {
          stats: { internationalStanding: 4, warEffort: 2 },
        },
      },
    ],
  },
];
