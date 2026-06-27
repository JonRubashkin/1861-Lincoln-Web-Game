// General random events (advisor:'event', kind:'random'). These keep otherwise-quiet
// months alive: scripted historical beats always win their month, so these only fire
// when no scripted event is eligible, drawn by weight from the seeded PRNG. All are
// oncePerGame:false with a cooldown so they recur but never back-to-back. Mostly
// date-flexible; a few are gated to wartime. Every choice allows sandbox divergence.
//
// These are wartime vignettes, so the whole pool is capped at the war's end (April
// 1865) below — months in the post-war second term draw on the assassination hazard,
// not this flavor pool. Capping in one place keeps each entry's triggers focused.

const WAR_END = '1865-04';

const POOL = [
  {
    id: 'rnd_home_front_rumor',
    advisor: 'event',
    kind: 'random',
    oncePerGame: false,
    cooldown: 3,
    weight: 3,
    text:
      'A wild rumor races through the Northern papers — a great victory, or a great disaster, no one yet knows which. The telegraph offices are mobbed. For a day or two the public mood hangs on nothing but hearsay.',
    choices: [
      {
        label: 'Wait for confirmed dispatches before saying a word.',
        reason: 'Waited for confirmed news rather than feed the rumor mill',
        effects: { stats: { unionMorale: -2, congressionalRelations: +2 } },
      },
      {
        label: 'Reassure the public with a calm, hopeful statement.',
        reason: 'Calmed the home front amid the rumors',
        effects: { stats: { unionMorale: +4, warEffort: -1 } },
      },
    ],
  },

  {
    id: 'rnd_battlefield_lull',
    advisor: 'event',
    kind: 'random',
    oncePerGame: false,
    cooldown: 4,
    weight: 3,
    text:
      'The armies sit in their lines and nothing moves. The papers grumble that the war drifts while the generals dither. A quiet month can steady tired troops — or rot the public’s patience.',
    choices: [
      {
        label: 'Prod the generals for an advance.',
        reason: 'Pressed the generals to move during the lull',
        effects: { stats: { warEffort: +4, unionMorale: +2, treasury: -3 } },
      },
      {
        label: 'Let the men rest and refit.',
        reason: 'Let the armies rest and refit through the lull',
        effects: { stats: { warEffort: +3, unionMorale: -2 } },
      },
    ],
  },

  {
    id: 'rnd_inflation_news',
    advisor: 'event',
    kind: 'random',
    oncePerGame: false,
    cooldown: 4,
    weight: 2,
    text:
      'Prices climb again — flour, coal, boots — and laborers in the cities mutter that their wages buy less each month. The greenback dollar slips against gold. The cost of the war is reaching every kitchen table.',
    choices: [
      {
        label: 'Lean on the Treasury to defend the currency.',
        reason: 'Acted to defend the currency against inflation',
        effects: { stats: { treasury: +4, unionMorale: -2, internationalStanding: +2 } },
      },
      {
        label: 'Do nothing and let the war economy run hot.',
        reason: 'Let the war economy run hot',
        effects: { stats: { treasury: -2, warEffort: +3, unionMorale: -3 } },
      },
    ],
  },

  {
    id: 'rnd_camp_disease',
    advisor: 'event',
    kind: 'random',
    oncePerGame: false,
    cooldown: 5,
    weight: 2,
    triggers: { earliestMonth: '1861-06', conditions: [{ target: 'flag:war_begun', op: 'isSet' }] },
    text:
      'Disease, not battle, is the great killer in the camps — measles, dysentery, typhoid sweeping through regiments before they ever see a fight. The Sanitary Commission begs for funds and authority.',
    choices: [
      {
        label: 'Back the Sanitary Commission with money and access.',
        reason: 'Funded the Sanitary Commission against camp disease',
        effects: { stats: { warEffort: +5, treasury: -4, unionMorale: +2 } },
      },
      {
        label: 'Leave sanitation to the army’s own surgeons.',
        reason: 'Left camp sanitation to the army surgeons',
        effects: { stats: { warEffort: -3 } },
      },
    ],
  },

  {
    id: 'rnd_press_flap',
    advisor: 'event',
    kind: 'random',
    oncePerGame: false,
    cooldown: 5,
    weight: 2,
    text:
      'A newspaper prints what looks like troop movements — careless, or treasonous, depending on who you ask. Generals demand the editor be shut down; others warn that silencing the press hands the enemy a gift of a different kind.',
    choices: [
      {
        label: 'Suppress the paper and arrest the editor.',
        reason: 'Suppressed a newspaper over leaked movements',
        effects: { stats: { warEffort: +3, congressionalRelations: -5, unionMorale: -2 } },
      },
      {
        label: 'Issue a stern warning but let the presses run.',
        reason: 'Warned the press but let it run free',
        effects: { stats: { congressionalRelations: +4, warEffort: -2 } },
      },
    ],
  },

  {
    id: 'rnd_harvest_weather',
    advisor: 'event',
    kind: 'random',
    oncePerGame: false,
    cooldown: 6,
    weight: 2,
    text:
      'Word comes up from the farm states about the season’s harvest and the roads. A bountiful crop feeds the armies and the Treasury alike; a hard season mires the wagons and gnaws at morale.',
    choices: [
      {
        label: 'Prioritize moving the harvest to the armies and the cities.',
        reason: 'Moved the harvest to feed the armies and cities',
        effects: { stats: { treasury: +5, warEffort: +2, borderStates: +2 } },
      },
      {
        label: 'Let the markets sort the grain out themselves.',
        reason: 'Left the harvest to the markets',
        effects: { stats: { treasury: +2, unionMorale: -1 } },
      },
    ],
  },

  {
    id: 'rnd_prisoner_news',
    advisor: 'event',
    kind: 'random',
    oncePerGame: false,
    cooldown: 5,
    weight: 2,
    triggers: { earliestMonth: '1862-01', conditions: [{ target: 'flag:war_begun', op: 'isSet' }] },
    text:
      'Accounts of the prison camps reach the papers — Northern men wasting in Southern stockades, Southern men in Northern ones. The question of prisoner exchange is tangled now with the status of Black soldiers, whom the Confederacy refuses to treat as soldiers at all.',
    choices: [
      {
        label: 'Hold firm: no exchanges until Black prisoners are treated as soldiers.',
        reason: 'Tied prisoner exchange to equal treatment of Black soldiers',
        effects: { stats: { congressionalRelations: +5, unionMorale: -4, warEffort: +2 } },
      },
      {
        label: 'Resume exchanges to bring the wasting men home.',
        reason: 'Resumed prisoner exchanges to bring men home',
        effects: { stats: { unionMorale: +5, warEffort: -3, congressionalRelations: -4 } },
      },
    ],
  },

  {
    id: 'rnd_diplomatic_incident',
    advisor: 'event',
    kind: 'random',
    oncePerGame: false,
    cooldown: 5,
    weight: 2,
    text:
      'A minor incident at sea — a stopped merchantman, a contraband cargo, an indignant foreign consul — threatens to swell into a diplomatic squall if mishandled. Seward awaits a posture.',
    choices: [
      {
        label: 'Smooth it over with a prompt, courteous note.',
        reason: 'Defused a minor diplomatic incident with courtesy',
        effects: { stats: { internationalStanding: +5, unionMorale: -1 } },
      },
      {
        label: 'Stand on American rights and concede nothing.',
        reason: 'Stood firm on American rights in the dispute',
        effects: { stats: { internationalStanding: -4, unionMorale: +3 } },
      },
    ],
  },

  {
    id: 'rnd_recruiting_drive',
    advisor: 'event',
    kind: 'random',
    oncePerGame: false,
    cooldown: 5,
    weight: 2,
    triggers: { earliestMonth: '1861-05', conditions: [{ target: 'flag:war_begun', op: 'isSet' }] },
    text:
      'The ranks need filling. Governors propose bounties to lure volunteers before any unpopular draft is needed; reformers warn that bounties breed "bounty-jumpers" who enlist, desert, and enlist again under a new name.',
    choices: [
      {
        label: 'Authorize generous enlistment bounties.',
        reason: 'Filled the ranks with enlistment bounties',
        effects: { stats: { warEffort: +6, treasury: -6 } },
      },
      {
        label: 'Rely on patriotism and the threat of the draft.',
        reason: 'Relied on the draft’s shadow rather than bounties',
        effects: { stats: { warEffort: +2, unionMorale: -3, treasury: +1 } },
      },
    ],
  },

  {
    id: 'rnd_copperhead_press',
    advisor: 'event',
    kind: 'random',
    oncePerGame: false,
    cooldown: 5,
    weight: 2,
    text:
      'The Copperhead press is loud this month — calling the war a butcher’s failure, the draft a tyranny, and you a despot. It is poison to morale, but it is also, inconveniently, the free speech you are fighting to preserve.',
    choices: [
      {
        label: 'Answer them in the open with facts and patience.',
        reason: 'Answered the Copperhead press in the open',
        effects: { stats: { unionMorale: +4, congressionalRelations: +2 } },
      },
      {
        label: 'Let military commanders deal with the worst agitators.',
        reason: 'Let commanders silence the worst agitators',
        effects: { stats: { unionMorale: +2, congressionalRelations: -5 } },
      },
    ],
  },

  {
    id: 'rnd_gold_market',
    advisor: 'event',
    kind: 'random',
    oncePerGame: false,
    cooldown: 6,
    weight: 2,
    text:
      'Speculators in New York are bidding up gold, and the higher gold climbs the worse the war news is presumed to be. Some in Congress want the gold room shut by law; others say it is the fever, not the thermometer, that needs treating.',
    choices: [
      {
        label: 'Move against the speculators to steady confidence.',
        reason: 'Moved against the gold speculators',
        effects: { stats: { treasury: +5, internationalStanding: +2, congressionalRelations: -2 } },
      },
      {
        label: 'Let the market be and fix the war news instead.',
        reason: 'Ignored the gold room and focused on the war',
        effects: { stats: { treasury: -2, warEffort: +3 } },
      },
    ],
  },

  {
    id: 'rnd_contraband_camps',
    advisor: 'event',
    kind: 'random',
    oncePerGame: false,
    cooldown: 6,
    weight: 2,
    triggers: { earliestMonth: '1862-01', conditions: [{ target: 'flag:war_begun', op: 'isSet' }] },
    text:
      'Wherever the armies go, enslaved people come into the lines seeking freedom — "contrabands," the camps call them. Their numbers swell faster than anyone has planned for. They need food, shelter, and a policy.',
    choices: [
      {
        label: 'Organize the camps and put the freedmen to paid labor.',
        reason: 'Organized the contraband camps and paid freedmen for labor',
        effects: {
          stats: { warEffort: +4, congressionalRelations: +5, borderStates: -4, treasury: -3 },
        },
      },
      {
        label: 'Leave the matter to local commanders for now.',
        reason: 'Left the contraband question to local commanders',
        effects: { stats: { borderStates: +2, congressionalRelations: -3 } },
      },
    ],
  },
];

// Cap every entry at the war's end without repeating latestMonth on each one. (This is
// a content decision expressed as data, not engine logic — the engine still just reads
// triggers.latestMonth.)
export default POOL.map((e) => ({
  ...e,
  triggers: { ...(e.triggers || {}), latestMonth: (e.triggers && e.triggers.latestMonth) || WAR_END },
}));
