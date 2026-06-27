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

  // ---- Recurring situations (random pool) ---------------------------------
  {
    id: 'mary_southern_relatives',
    advisor: 'mary',
    kind: 'random',
    oncePerGame: false,
    cooldown: 6,
    weight: 2,
    triggers: { earliestMonth: '1861-07', conditions: [{ target: 'flag:war_begun', op: 'isSet' }] },
    text:
      'The papers are at Mary again — her brothers and brothers-in-law wear Confederate gray, and the whisper is that the First Lady is a traitor in the White House itself. One of her sisters, widowed by a rebel general’s death, even seeks refuge under your roof. Mary is wounded and defiant by turns.',
    choices: [
      {
        label: 'Defend her loyalty publicly and welcome her grieving sister.',
        reason: 'Defended Mary’s loyalty and took in her widowed sister',
        effects: { stats: { maryPersonal: +8, unionMorale: -4, congressionalRelations: -3 } },
      },
      {
        label: 'Ask her to keep the Confederate kin at arm’s length for now.',
        reason: 'Asked Mary to distance her Confederate relatives',
        effects: { stats: { maryPersonal: -6, unionMorale: +3 } },
      },
    ],
  },

  {
    id: 'mary_seances',
    advisor: 'mary',
    kind: 'random',
    oncePerGame: false,
    cooldown: 6,
    weight: 2,
    triggers: { earliestMonth: '1862-04' },
    text:
      'Still drowning in grief for Willie, Mary has brought spiritualists into the White House, holding séances in the Red Room to reach across to her lost boy. The papers would savage it if they knew. You have felt the pull of that grief yourself.',
    choices: [
      {
        label: 'Sit with her at a séance — let her have this comfort.',
        reason: 'Indulged Mary’s séances to ease her grief',
        effects: { stats: { maryPersonal: +7, congressionalRelations: -2 } },
      },
      {
        label: 'Gently steer her toward quieter mourning, away from the mediums.',
        reason: 'Steered Mary away from the spiritualists',
        effects: { stats: { maryPersonal: -3 } },
      },
    ],
  },

  {
    id: 'mary_safety_fears',
    advisor: 'mary',
    kind: 'random',
    oncePerGame: false,
    cooldown: 5,
    weight: 2,
    triggers: { conditions: [{ target: 'flag:security_unlocked', op: 'isSet' }] },
    text:
      'Mary has seen the threatening letters too, and the dreams trouble her sleep — she is certain someone means to kill you. She begs you to take the guards seriously, to stop riding out alone to the Soldiers’ Home at dusk. You have always hated being fenced from the people.',
    choices: [
      {
        label: 'Indulge her fears and accept a closer guard.',
        reason: 'Accepted a closer guard to ease Mary’s fears',
        effects: { stats: { security: +8, maryPersonal: +5, unionMorale: -2 } },
      },
      {
        label: 'Soothe her, but keep going about openly as you always have.',
        reason: 'Kept moving openly despite Mary’s fears',
        effects: { stats: { security: -6, maryPersonal: -3, unionMorale: +3 } },
      },
    ],
  },
];
