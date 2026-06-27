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

  // ---- Recurring situations (random pool) ---------------------------------
  {
    id: 'welles_blockade_runners',
    advisor: 'welles',
    kind: 'random',
    oncePerGame: false,
    cooldown: 5,
    weight: 2,
    triggers: { earliestMonth: '1861-07', conditions: [{ target: 'flag:war_begun', op: 'isSet' }] },
    text:
      'Fast, low blockade-runners are slipping in and out of Wilmington and Charleston by the dark of the moon, trading Southern cotton for European arms. Welles wants more steam cruisers on the inshore stations — a costly tightening of the noose.',
    choices: [
      {
        label: 'Reinforce the inshore squadrons to choke the runners.',
        reason: 'Tightened the blockade against the runners',
        effects: { stats: { warEffort: +5, treasury: -5, internationalStanding: +2 } },
      },
      {
        label: 'Keep the cruisers hunting on the high seas instead.',
        reason: 'Kept the cruisers hunting raiders on the high seas',
        effects: { stats: { warEffort: +2, internationalStanding: -1 } },
      },
    ],
  },

  {
    id: 'welles_foreign_warship',
    advisor: 'welles',
    kind: 'random',
    oncePerGame: false,
    cooldown: 7,
    weight: 2,
    triggers: { earliestMonth: '1862-06' },
    text:
      'A powerful warship is fitting out in a neutral European yard, its true buyer disguised behind a shell of brokers. Welles fears it is meant for the Confederacy and wants agents to buy it out from under them — or failing that, to shadow it from the day it sails.',
    choices: [
      {
        label: 'Outbid the rebels and buy the ship for the Union navy.',
        reason: 'Bought a foreign-built warship away from the Confederacy',
        effects: { stats: { warEffort: +6, treasury: -8, internationalStanding: +2 } },
      },
      {
        label: 'Let it sail and assign cruisers to run it down at sea.',
        reason: 'Shadowed a suspect foreign warship rather than buy it',
        effects: { stats: { warEffort: +2, internationalStanding: -2 } },
      },
    ],
  },
];
