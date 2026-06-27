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
];
