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
];
