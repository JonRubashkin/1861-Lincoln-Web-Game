// William H. Seward — Secretary of State. Diplomacy and foreign posture.

export default [
  {
    id: 'seward_british_posture',
    advisor: 'seward',
    triggers: {
      earliestMonth: '1861-03',
      latestMonth: '1861-06',
      // Demonstrates a stat condition in a trigger.
      conditions: [{ target: 'stat:internationalStanding', op: 'below', value: 60 }],
    },
    priority: 10,
    text:
      'Secretary Seward warns that London is watching the secession crisis closely. Some in the Cabinet — Seward among them at his most reckless — muse that a foreign quarrel might reunite the country. He wants a posture toward Britain and France.',
    choices: [
      {
        label: 'Take a hard line — warn any power that recognizes the rebels',
        reason: 'Blustered at Europe to deter recognition of the Confederacy',
        effects: {
          stats: { internationalStanding: -10, unionMorale: 6 },
          flags: { set: ['britain_tension_high'] },
        },
        // Forces a follow-up decision next month (demonstrates followUp + gating).
        followUp: 'seward_recognition_scare',
      },
      {
        label: 'Pursue quiet diplomacy and reassure London',
        reason: 'Reassured Britain through back-channel diplomacy',
        effects: {
          stats: { internationalStanding: 12, unionMorale: -3 },
        },
      },
    ],
  },

  // Forced follow-up: only ever appears because a prior choice scheduled it.
  // It has no calendar window of its own; requiredDecisions makes it surface.
  {
    id: 'seward_recognition_scare',
    advisor: 'seward',
    oncePerGame: true,
    priority: 10,
    text:
      'Your bluster has rattled the European courts. A British minister hints, coolly, that recognition of the Confederacy is "under consideration." Seward awaits your instruction before the moment hardens.',
    choices: [
      {
        label: 'Walk it back — issue a measured, conciliatory note',
        reason: 'Defused the recognition scare with a conciliatory note',
        effects: {
          stats: { internationalStanding: 14, unionMorale: -4 },
          flags: { clear: ['britain_tension_high'] },
        },
      },
      {
        label: 'Double down — dare them to intervene',
        reason: 'Dared Europe to intervene rather than back down',
        effects: {
          stats: { internationalStanding: -12, unionMorale: 8, warEffort: 3 },
        },
      },
    ],
  },

  // ---- Recurring situations (random pool) ---------------------------------
  {
    id: 'seward_maximilian',
    advisor: 'seward',
    kind: 'random',
    oncePerGame: false,
    cooldown: 8,
    weight: 2,
    triggers: { earliestMonth: '1862-06' },
    text:
      'Seward brings troubling news from Mexico: France has installed the Archduke Maximilian as a puppet emperor, in open defiance of the Monroe Doctrine, while you are too consumed by the rebellion to answer it. He counsels patience — one war at a time — but the Radicals want Napoleon III warned off the continent now.',
    choices: [
      {
        label: 'Swallow it for now — protest on paper, fight one war at a time.',
        reason: 'Deferred the Mexican question to focus on the rebellion',
        effects: { stats: { internationalStanding: +4, congressionalRelations: -4 } },
      },
      {
        label: 'Warn France sharply that the Republic will not abide a throne on its border.',
        reason: 'Warned France off its Mexican adventure',
        effects: { stats: { internationalStanding: -6, unionMorale: +5, congressionalRelations: +4 } },
      },
    ],
  },

  {
    id: 'seward_laird_rams',
    advisor: 'seward',
    kind: 'random',
    oncePerGame: false,
    cooldown: 8,
    weight: 2,
    triggers: { earliestMonth: '1863-01' },
    text:
      'British yards are building ironclad "rams" plainly bound for the Confederacy — vessels that could shatter the wooden blockade. Seward has a dispatch drafted to Minister Adams in London. Its sharpest line reads, "It would be superfluous in me to point out to your Lordship that this is war."',
    choices: [
      {
        label: 'Send the warning as written — make the threat unmistakable.',
        reason: 'Threatened Britain to stop the Laird rams ("this is war")',
        effects: {
          stats: { internationalStanding: -4, warEffort: +4, unionMorale: +3 },
          flags: { set: ['britain_tension_high'] },
        },
      },
      {
        label: 'Soften it to lawyerly protest and trust London to detain the ships.',
        reason: 'Trusted quiet diplomacy to detain the Laird rams',
        effects: { stats: { internationalStanding: +6, warEffort: -2 } },
      },
    ],
  },

  {
    id: 'seward_commerce_raiders',
    advisor: 'seward',
    kind: 'random',
    oncePerGame: false,
    cooldown: 6,
    weight: 2,
    triggers: { earliestMonth: '1862-08', conditions: [{ target: 'flag:war_begun', op: 'isSet' }] },
    text:
      'British-built Confederate cruisers — the Alabama foremost among them — are burning Northern merchantmen across the oceans and driving up insurance rates at every port. Shipowners howl. Seward wants to lodge the damage claims against Britain for the day of reckoning.',
    choices: [
      {
        label: 'Press the claims hard now and rattle London.',
        reason: 'Pressed Britain on the commerce-raider claims',
        effects: { stats: { internationalStanding: -3, unionMorale: +3, treasury: -2 } },
      },
      {
        label: 'Catalog the damages quietly and save the reckoning for after the war.',
        reason: 'Banked the raider claims for a postwar reckoning',
        effects: { stats: { internationalStanding: +4, treasury: -1 } },
      },
    ],
  },
];
