// Threshold (state-triggered, non-calendar) events. These have no calendar window;
// they fire when the game state crosses a line, proving non-calendar triggering.
// Their priority is below the anchor events so a named monthly event still wins.

export default [
  {
    id: 'threshold_kentucky_crisis',
    advisor: 'event',
    oncePerGame: true,
    priority: 60,
    triggers: {
      conditions: [{ target: 'region:kentucky', op: 'below', value: 0 }],
    },
    text:
      'Kentucky is slipping. Confederate sympathizers grow bold, and the legislature wavers. Losing the Bluegrass State would expose the whole Ohio River line. The moment demands a decision.',
    choices: [
      {
        label: 'Rush Unionist arms and money into the state',
        reason: 'Poured arms and money into Kentucky to hold it',
        effects: {
          stats: { treasury: -8, borderStates: 4 },
          regions: { kentucky: 18 },
        },
      },
      {
        label: 'Let Kentucky settle its own loyalties',
        reason: 'Declined to intervene as Kentucky wavered',
        effects: {
          stats: { borderStates: -6 },
          regions: { kentucky: -8 },
        },
      },
    ],
  },

  {
    id: 'threshold_treasury_strain',
    advisor: 'event',
    oncePerGame: true,
    priority: 55,
    triggers: {
      conditions: [{ target: 'stat:treasury', op: 'below', value: 25 }],
    },
    text:
      'The Treasury is nearly dry. Suppliers go unpaid, soldiers grumble for their wages, and the bond markets are jittery. Chase needs an answer before confidence collapses.',
    choices: [
      {
        label: 'Push an emergency war-tax through Congress',
        reason: 'Passed an emergency war tax to refill the Treasury',
        effects: {
          stats: { treasury: 20, congressionalRelations: -6, unionMorale: -4 },
        },
      },
      {
        label: 'Borrow heavily from Northern banks',
        reason: 'Borrowed heavily to keep the war funded',
        effects: {
          stats: { treasury: 14, internationalStanding: -3 },
        },
      },
    ],
  },

  {
    id: 'threshold_morale_warning',
    advisor: 'event',
    oncePerGame: true,
    priority: 65,
    triggers: {
      conditions: [{ target: 'stat:unionMorale', op: 'below', value: 25 }],
    },
    text:
      'War-weariness spreads across the North. Draft resistance flares, copperhead newspapers cry for peace, and the casualty lists grow longer. The home front is fraying.',
    choices: [
      {
        label: 'Deliver a stirring public address to rally the cause',
        reason: 'Rallied a flagging home front with a stirring address',
        effects: {
          stats: { unionMorale: 14, congressionalRelations: -2 },
        },
      },
      {
        label: 'Crack down on antiwar agitators',
        reason: 'Suppressed antiwar agitation to steady the home front',
        effects: {
          stats: { unionMorale: 6, congressionalRelations: -8 },
          flags: { set: ['dissent_suppressed'] },
        },
      },
    ],
  },
];
