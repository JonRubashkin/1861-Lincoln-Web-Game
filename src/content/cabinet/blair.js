// Montgomery Blair — Postmaster General. Border-state politics and the map.

export default [
  {
    id: 'blair_border_states',
    advisor: 'blair',
    triggers: {
      earliestMonth: '1861-04',
      latestMonth: '1861-08',
    },
    priority: 12,
    text:
      'Blair, the Cabinet’s sharpest reader of border-state sentiment, lays a map on your desk. Kentucky clings to neutrality, Maryland’s railroads run perilously close to secessionist mobs, and Missouri teeters toward open guerrilla war. Where do you press?',
    choices: [
      {
        label: 'Respect Kentucky’s neutrality and move with great care',
        reason: 'Honored Kentucky neutrality to keep it in the Union',
        effects: {
          stats: { borderStates: 6, warEffort: -3 },
          regions: { kentucky: 8 },
        },
      },
      {
        label: 'Secure Maryland’s rail lines to Washington by force',
        reason: 'Secured Maryland’s railroads with troops',
        effects: {
          stats: { borderStates: -4, congressionalRelations: 3 },
          regions: { maryland: 18 },
        },
      },
      {
        label: 'Arm the Unionist Home Guard in Missouri',
        reason: 'Armed Missouri Unionists against the secessionist governor',
        effects: {
          stats: { borderStates: -6, warEffort: 4 },
          regions: { missouri: 12 },
        },
      },
    ],
  },

  // ---- Recurring situations (random pool) ---------------------------------
  {
    id: 'blair_patronage',
    advisor: 'blair',
    kind: 'random',
    oncePerGame: false,
    cooldown: 6,
    weight: 2,
    text:
      'Blair, master of the Post Office and its thousands of appointments, wants a free hand to place loyal border-state men in the local offices — postmasters who can hold a wavering county for the Union. The Radicals grumble that he is building a conservative machine.',
    choices: [
      {
        label: 'Let Blair use the patronage to shore up the border.',
        reason: 'Used postal patronage to hold the border counties',
        effects: { stats: { borderStates: +6, congressionalRelations: -4 } },
      },
      {
        label: 'Spread the appointments to placate the Radicals too.',
        reason: 'Spread patronage to balance the factions',
        effects: { stats: { congressionalRelations: +4, borderStates: -2 } },
      },
    ],
  },

  {
    id: 'blair_conservative_pushback',
    advisor: 'blair',
    kind: 'random',
    oncePerGame: false,
    cooldown: 5,
    weight: 2,
    text:
      'Blair speaks for the conservatives at the cabinet table, and he is blunt: the Radicals push you too fast on emancipation and the Black soldier, and every step alienates the very border men keeping the Union whole. He wants you to lean back toward the center.',
    choices: [
      {
        label: 'Heed Blair and reassure the conservatives.',
        reason: 'Tacked toward Blair’s conservatives to steady the border',
        effects: { stats: { borderStates: +5, congressionalRelations: -6 } },
      },
      {
        label: 'Side with the Radicals and tell Blair the war has moved on.',
        reason: 'Sided with the Radicals over Blair’s conservatives',
        effects: { stats: { congressionalRelations: +6, borderStates: -5, internationalStanding: +2 } },
      },
      {
        label: 'Hold the middle and refuse to be pulled either way.',
        reason: 'Held the middle between the factions',
        effects: { stats: { maryPersonal: -1 } },
      },
    ],
  },
];
