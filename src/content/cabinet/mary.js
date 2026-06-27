// Mary Todd Lincoln — the home front and personal life. Treated as an "advisor"
// in the schema (advisor id "mary"), surfaced through her own portrait.

export default [
  {
    id: 'mary_white_house_spending',
    advisor: 'mary',
    triggers: {
      earliestMonth: '1861-05',
      latestMonth: '1861-08',
    },
    priority: 10,
    text:
      'Mary has run far over budget refurbishing the shabby White House — new china, drapery, carpets — even as the country counts its war dead. The newspapers have the story. She is wounded by the criticism and looks to you.',
    choices: [
      {
        label: 'Defend her publicly against the critics',
        reason: 'Stood by Mary against the press',
        effects: {
          stats: { maryPersonal: 10, treasury: -6, unionMorale: -4 },
        },
      },
      {
        label: 'Gently ask her to economize',
        reason: 'Asked Mary to rein in the household spending',
        effects: {
          stats: { maryPersonal: -8, treasury: 4, congressionalRelations: 3 },
        },
      },
      {
        label: 'Stay out of it and let it blow over',
        reason: 'Stayed out of the household quarrel',
        effects: {
          stats: { maryPersonal: -2 },
        },
      },
    ],
  },
];
