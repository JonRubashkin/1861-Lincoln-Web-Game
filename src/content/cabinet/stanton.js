// Edwin M. Stanton — Secretary of War (from 1862; Cameron held the post in 1861).
//
// Kept out of the March–August 1861 vertical slice on purpose: his decision is gated
// to 1862, so his portrait shows in the Cabinet roster but stays inactive during the
// slice. This demonstrates that authoring future content is purely additive.

export default [
  {
    id: 'stanton_reinforce_border',
    advisor: 'stanton',
    triggers: {
      earliestMonth: '1862-01',
    },
    priority: 12,
    text:
      'Now War Secretary, Stanton wants to pour reinforcements into the contested border garrisons before the next campaign season opens.',
    choices: [
      {
        label: 'Reinforce the Kentucky and Missouri garrisons',
        reason: 'Reinforced the border garrisons',
        effects: {
          stats: { warEffort: 6, treasury: -8 },
          regions: { kentucky: 15, missouri: 10 },
        },
      },
      {
        label: 'Concentrate force for an offensive instead',
        reason: 'Massed troops for an offensive rather than garrison duty',
        effects: {
          stats: { warEffort: 10, treasury: -6 },
          regions: { virginia: 8 },
        },
      },
    ],
  },

  // ---- Recurring situations (random pool) ---------------------------------
  {
    id: 'stanton_general_feud',
    advisor: 'stanton',
    kind: 'random',
    oncePerGame: false,
    cooldown: 5,
    weight: 2,
    triggers: { earliestMonth: '1862-02' },
    text:
      'Two of your generals are at each other’s throats — a feud of wounded vanity and conflicting orders that is paralyzing a whole department. Stanton, never one for tact, wants to break the both of them. The armies need harmony more than they need either man’s pride.',
    choices: [
      {
        label: 'Back Stanton: relieve the worse offender and end it.',
        reason: 'Relieved a feuding general to restore command harmony',
        effects: { stats: { warEffort: +5, congressionalRelations: -3 } },
      },
      {
        label: 'Mediate yourself and keep both men in harness.',
        reason: 'Personally mediated a generals’ feud',
        effects: { stats: { warEffort: +2, maryPersonal: -2, congressionalRelations: +2 } },
      },
    ],
  },

  {
    id: 'stanton_supply_scandal',
    advisor: 'stanton',
    kind: 'random',
    oncePerGame: false,
    cooldown: 6,
    weight: 2,
    triggers: { earliestMonth: '1862-02' },
    text:
      'Stanton has uncovered another contractor swindle — "shoddy" uniforms that dissolve in the rain, boots with paper soles, lame horses sold as cavalry mounts. He wants to make a public example, though some of the guilty have friends in Congress.',
    choices: [
      {
        label: 'Prosecute hard and publish the names, friends in Congress or no.',
        reason: 'Prosecuted the war-supply swindlers publicly',
        effects: { stats: { treasury: +6, warEffort: +4, congressionalRelations: -5 } },
      },
      {
        label: 'Settle it quietly to avoid a political brawl mid-war.',
        reason: 'Settled the supply scandal quietly',
        effects: { stats: { treasury: +2, congressionalRelations: +2, unionMorale: -2 } },
      },
    ],
  },

  {
    id: 'stanton_telegraph_intel',
    advisor: 'stanton',
    kind: 'random',
    oncePerGame: false,
    cooldown: 6,
    weight: 2,
    triggers: { earliestMonth: '1862-03' },
    text:
      'From the telegraph office beside Stanton’s desk — where you spend so many sleepless nights — comes a stream of intercepts and informant reports. Stanton proposes tightening military control over the wires and the spies, centralizing the war’s intelligence in his own hands.',
    choices: [
      {
        label: 'Give Stanton control of the telegraph and the secret service.',
        reason: 'Centralized military intelligence under Stanton',
        effects: { stats: { warEffort: +6, congressionalRelations: -2, internationalStanding: +1 } },
      },
      {
        label: 'Keep the wires open and intelligence dispersed.',
        reason: 'Kept the telegraph and intelligence dispersed',
        effects: { stats: { warEffort: -2, congressionalRelations: +3 } },
      },
    ],
  },
];
