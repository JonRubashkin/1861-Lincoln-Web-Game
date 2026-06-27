// Calendar-anchored events for 1863 (content batch 2).
// Closes the Emancipation chain (final proclamation, gated on emancipation_issued)
// and admits West Virginia — which sets west_virginia_active. The engine's
// data-driven FLAG_ACTIVATIONS hook (regions.js) flips the dormant region active;
// the event carries no special-case logic (batch-2 note 1).

export default [
  {
    id: 'final_emancipation_1863',
    advisor: 'event',
    triggers: {
      earliestMonth: '1863-01',
      latestMonth: '1863-02',
      conditions: [{ target: 'flag:emancipation_issued', op: 'isSet' }],
    },
    oncePerGame: true,
    priority: 35,
    text:
      "January 1, 1863. The hundred days are up. With the stroke of a pen the final Emancipation Proclamation takes effect — and with it, the door opens to enlisting Black soldiers into the Union army. Your hand is steady. 'If my name ever goes into history,' you tell those gathered, 'it will be for this act.'",
    choices: [
      {
        label: 'Sign, and authorize the enlistment of Black troops.',
        reason: 'Signed the final Proclamation and authorized Black troops',
        effects: {
          stats: { congressionalRelations: +12, internationalStanding: +10, warEffort: +10, unionMorale: +6, borderStates: -8 },
          flags: { set: ['emancipation_final', 'black_troops_authorized'] },
        },
      },
      {
        label: 'Sign the proclamation, but defer Black enlistment for now.',
        reason: 'Signed the Proclamation but deferred Black enlistment',
        effects: {
          stats: { congressionalRelations: +6, internationalStanding: +10, unionMorale: +3, borderStates: -3 },
          flags: { set: ['emancipation_final'] },
        },
      },
    ],
  },

  {
    id: 'west_virginia_statehood_1863',
    advisor: 'event',
    triggers: { earliestMonth: '1863-06', latestMonth: '1863-07' },
    oncePerGame: true,
    priority: 14,
    text:
      "The loyal counties of western Virginia have petitioned to enter the Union as a new state of their own. It is of doubtful constitutional tidiness — carving a state out of a state in the middle of a rebellion — but it would plant a loyal foothold in the Confederacy's flank.",
    choices: [
      {
        label: 'Admit West Virginia to the Union.',
        reason: 'Admitted West Virginia to the Union',
        effects: {
          stats: { congressionalRelations: +6, unionMorale: +5 },
          regions: { virginia: +6 },
          // Engine's FLAG_ACTIVATIONS hook activates the dormant region (note 1).
          flags: { set: ['west_virginia_active'] },
        },
      },
      {
        label: 'Decline on constitutional grounds.',
        reason: 'Declined to admit West Virginia',
        effects: { stats: { congressionalRelations: -4, unionMorale: -3 } },
      },
    ],
  },
];
