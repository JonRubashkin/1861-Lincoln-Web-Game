// Salmon P. Chase — Secretary of the Treasury. Financing the war.

export default [
  {
    id: 'chase_war_finance',
    advisor: 'chase',
    triggers: {
      earliestMonth: '1861-03',
      latestMonth: '1861-08',
    },
    priority: 10,
    text:
      'Secretary Chase lays out the arithmetic of mobilization: armies cost money the Treasury does not have. He needs a financing strategy, and each path has a price.',
    choices: [
      {
        label: 'Issue paper money ("greenbacks") to pay the bills',
        reason: 'Printed paper money to fund mobilization',
        effects: {
          stats: { treasury: 18, unionMorale: -6, internationalStanding: -4 },
        },
      },
      {
        label: 'Float war bonds and raise the tariff',
        reason: 'Funded the war through bonds and tariffs',
        effects: {
          stats: { treasury: 10, congressionalRelations: 5, unionMorale: -2 },
        },
      },
      {
        label: 'Hold the line — keep the budget lean for now',
        reason: 'Kept the budget lean rather than borrow',
        effects: {
          stats: { treasury: -5, warEffort: -6 },
        },
      },
    ],
  },
];
