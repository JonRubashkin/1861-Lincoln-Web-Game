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

  // ---- Recurring situations (random pool) ---------------------------------
  {
    id: 'bates_treason_trial',
    advisor: 'bates',
    kind: 'random',
    oncePerGame: false,
    cooldown: 6,
    weight: 2,
    text:
      'A prominent secessionist sits in custody, and the question of what to do with him lands on Bates’s desk. A treason trial in open court would affirm the rule of law — and risk a sympathetic jury, an acquittal, and a martyr. A military tribunal would be surer and swifter, and uglier.',
    choices: [
      {
        label: 'Try him in the civil courts and let the law be seen to work.',
        reason: 'Tried a secessionist in open civil court',
        effects: { stats: { congressionalRelations: +4, internationalStanding: +3, warEffort: -2 } },
      },
      {
        label: 'Refer him to a military tribunal for a swift, certain result.',
        reason: 'Sent a secessionist before a military tribunal',
        effects: {
          stats: { warEffort: +3, congressionalRelations: -4, internationalStanding: -2 },
          flags: { set: ['habeas_suspended'] },
        },
      },
    ],
  },

  {
    id: 'bates_war_measure_legality',
    advisor: 'bates',
    kind: 'random',
    oncePerGame: false,
    cooldown: 6,
    weight: 2,
    text:
      'Bates, the cautious lawyer of the cabinet, lays out his doubts about the reach of your war powers — the blockade, the arrests, the seizures all rest on authority no peacetime court would grant. He asks how far you mean to stretch the Constitution to save it.',
    choices: [
      {
        label: 'Claim the broad war powers a rebellion demands.',
        reason: 'Claimed broad executive war powers to meet the rebellion',
        effects: { stats: { warEffort: +5, congressionalRelations: -4, unionMorale: +2 } },
      },
      {
        label: 'Keep your measures on the firmest legal ground Bates can find.',
        reason: 'Kept the war measures on firm legal ground',
        effects: { stats: { congressionalRelations: +5, warEffort: -3, internationalStanding: +2 } },
      },
    ],
  },
];
