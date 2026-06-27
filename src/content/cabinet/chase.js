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

  // ---- Recurring situations (random pool) ---------------------------------
  {
    id: 'chase_resignation_threat',
    advisor: 'chase',
    kind: 'random',
    oncePerGame: false,
    cooldown: 5,
    weight: 3,
    triggers: { earliestMonth: '1862-01' },
    text:
      'Chase is in your office again, resignation in hand — the fourth time, by some counts. Brilliant, able, and convinced he should be sitting where you sit, he uses the threat to quit as a lever in every quarrel. One day you may simply take him at his word; today he waits to see if you will beg him to stay.',
    choices: [
      {
        label: 'Soothe him and refuse the resignation — you need his Treasury.',
        reason: 'Talked Chase out of resigning to keep the Treasury steady',
        effects: { stats: { treasury: +4, congressionalRelations: +2, maryPersonal: -2 } },
      },
      {
        label: 'Call his bluff coolly and let him reconsider on his own.',
        reason: 'Called Chase’s bluff over resigning',
        effects: { stats: { congressionalRelations: -3, treasury: -2 } },
      },
      {
        label: 'Accept it — you are done being managed by the threat.',
        reason: 'Accepted Chase’s resignation rather than be managed by it',
        effects: { stats: { treasury: -6, congressionalRelations: -4, unionMorale: +2 } },
      },
    ],
  },

  {
    id: 'chase_bond_drive',
    advisor: 'chase',
    kind: 'random',
    oncePerGame: false,
    cooldown: 6,
    weight: 2,
    text:
      'Chase and the financier Jay Cooke propose a great popular bond drive — selling the war debt in small denominations to ordinary citizens, so that the farmer and the clerk hold a stake in the Union’s survival. It is novel, patriotic, and a gamble on public faith.',
    choices: [
      {
        label: 'Launch the popular bond drive nationwide.',
        reason: 'Launched a popular war-bond drive',
        effects: { stats: { treasury: +10, unionMorale: +3, congressionalRelations: +2 } },
      },
      {
        label: 'Stick to conventional borrowing from the banks.',
        reason: 'Kept to conventional bank borrowing',
        effects: { stats: { treasury: +5, internationalStanding: -1 } },
      },
    ],
  },

  {
    id: 'chase_gold_speculation',
    advisor: 'chase',
    kind: 'random',
    oncePerGame: false,
    cooldown: 7,
    weight: 2,
    text:
      'The premium on gold gyrates wildly, and Chase suspects a ring of speculators is profiting from every rumor of defeat. He floats a heavy-handed scheme to dump government gold and break them — which could backfire spectacularly on the Treasury’s own credit.',
    choices: [
      {
        label: 'Let Chase try to break the speculators.',
        reason: 'Let Chase move to break the gold speculators',
        effects: { stats: { treasury: -4, internationalStanding: -2, congressionalRelations: +1 } },
      },
      {
        label: 'Forbid the gamble and ride out the swings.',
        reason: 'Rode out the gold swings rather than gamble the Treasury',
        effects: { stats: { treasury: +2 } },
      },
    ],
  },
];
