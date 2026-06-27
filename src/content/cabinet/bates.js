// Edward Bates — Attorney General. Civil liberties in wartime.

export default [
  {
    id: 'bates_habeas_corpus',
    advisor: 'bates',
    triggers: {
      earliestMonth: '1861-04',
      latestMonth: '1861-08',
      // Surfaces only when Maryland is genuinely shaky (stat/region condition).
      conditions: [{ target: 'region:maryland', op: 'below', value: 40 }],
    },
    priority: 11,
    text:
      'Secessionist agitators are tearing up rail lines and inciting mobs in Maryland, between the capital and the North. Bates, ever cautious, lays out the constitutional question: may you suspend the writ of habeas corpus to hold them without trial?',
    choices: [
      {
        label: 'Suspend the writ along the Washington–Philadelphia line',
        reason: 'Suspended habeas corpus to secure the capital’s lifeline',
        effects: {
          stats: { congressionalRelations: -8, unionMorale: 4 },
          regions: { maryland: 10 },
          flags: { set: ['habeas_suspended'] },
        },
      },
      {
        label: 'Uphold the writ — arrest no one without charge',
        reason: 'Upheld civil liberties despite the danger',
        effects: {
          stats: { congressionalRelations: 6 },
          regions: { maryland: -6 },
        },
      },
    ],
  },
];
