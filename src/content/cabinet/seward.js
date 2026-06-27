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
];
