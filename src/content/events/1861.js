// Calendar-anchored events for 1861. Each is a content entry with advisor: 'event'.
// Exactly one event fires per month (highest priority qualifying entry).

export default [
  {
    id: 'event_inauguration',
    advisor: 'event',
    triggers: { earliestMonth: '1861-03', latestMonth: '1861-03' },
    priority: 100,
    text:
      'March 4, 1861. You take the oath on the Capitol steps before a divided, anxious nation. Seven states have already declared their departure. Your inaugural address will set the tone for everything that follows.',
    choices: [
      {
        label: 'Strike a conciliatory tone — "We are not enemies, but friends"',
        reason: 'Extended an olive branch to the South in the inaugural',
        effects: {
          stats: { unionMorale: 4, borderStates: 8, congressionalRelations: -5 },
        },
      },
      {
        label: 'Vow to hold all federal forts and property',
        reason: 'Took a firm line to preserve the Union',
        effects: {
          stats: { unionMorale: 8, warEffort: 4, congressionalRelations: 5, borderStates: -6 },
        },
      },
    ],
  },

  {
    id: 'event_fort_sumter',
    advisor: 'event',
    triggers: { earliestMonth: '1861-04', latestMonth: '1861-04' },
    priority: 100,
    text:
      'April 12, 1861. Confederate guns open fire on Fort Sumter in Charleston harbor. The garrison surrenders. The war everyone feared has begun, and the upper South is choosing sides. The nation waits to hear what you will do.',
    choices: [
      {
        label: 'Call for 75,000 volunteers to suppress the rebellion',
        reason: 'Called up the militia after Sumter; the upper South recoiled',
        effects: {
          stats: { warEffort: 12, unionMorale: 10, borderStates: -8 },
          regions: { virginia: -10, north_carolina: -10, tennessee: -10, arkansas: -10 },
          flags: { set: ['war_begun'] },
        },
      },
      {
        label: 'Seek a negotiated settlement to avoid all-out war',
        reason: 'Sought to avoid full-scale war after Sumter',
        effects: {
          stats: { unionMorale: -10, warEffort: -5, congressionalRelations: -10, borderStates: 6 },
        },
      },
    ],
  },

  {
    id: 'event_baltimore_plot',
    advisor: 'event',
    triggers: { earliestMonth: '1861-05', latestMonth: '1861-06' },
    priority: 90,
    text:
      'Detectives bring word of a plot against your life — assassins lying in wait. It is the first time the threat has felt real and personal. How you carry yourself now will shape the years to come.',
    choices: [
      {
        label: 'Accept a quiet guard detail and vary your routine',
        reason: 'Accepted protection after the threat came to light',
        effects: {
          stats: { security: 12, maryPersonal: -2 },
          // Reveals the hidden Security dial in the UI for the rest of the game.
          flags: { set: ['security_unlocked'] },
        },
      },
      {
        label: 'Refuse to hide from the people you serve',
        reason: 'Refused to cower behind guards, trusting the public',
        effects: {
          stats: { security: -8, unionMorale: 5 },
          flags: { set: ['security_unlocked'] },
        },
      },
    ],
  },

  {
    id: 'event_bull_run',
    advisor: 'event',
    triggers: { earliestMonth: '1861-07', latestMonth: '1861-07' },
    priority: 100,
    text:
      'July 21, 1861. The grand advance "On to Richmond" ends in chaos at Bull Run. Green Union troops break and flee back toward Washington alongside the picnicking spectators who came to watch. The North is stunned.',
    choices: [
      {
        label: 'Steady the public — promise a longer, harder war',
        reason: 'Rallied the public after the rout at Bull Run',
        effects: {
          stats: { unionMorale: -8, warEffort: 4, congressionalRelations: 2 },
          regions: { virginia: -8 },
        },
      },
      {
        label: 'Purge the generals and reorganize the army',
        reason: 'Reorganized the army after Bull Run',
        effects: {
          stats: { warEffort: 10, unionMorale: -12, treasury: -6 },
          regions: { virginia: -5 },
        },
      },
    ],
  },

  // ---- Content batch 2 (Sept–Dec 1861) ------------------------------------
  {
    id: 'fremont_emancipation_1861',
    advisor: 'event',
    triggers: { earliestMonth: '1861-09', latestMonth: '1861-10' },
    oncePerGame: true,
    priority: 20,
    text:
      "General Frémont, commanding in Missouri, has issued his own proclamation freeing the slaves of Confederate sympathizers — without your authorization. The Radicals are jubilant. Kentucky's legislature is alarmed, and you've heard a Union officer there warn that the order could lose you the whole border at a stroke.",
    choices: [
      {
        label: 'Revoke the order — you cannot risk Kentucky.',
        reason: 'Overruled Frémont to keep the border states in the Union',
        effects: {
          stats: { borderStates: +12, congressionalRelations: -10, unionMorale: -4 },
          regions: { kentucky: +8, missouri: +5 },
        },
      },
      {
        label: 'Let it stand — strike at slavery where you can.',
        reason: "Upheld Frémont's emancipation order",
        effects: {
          stats: { congressionalRelations: +12, internationalStanding: +5, borderStates: -15, unionMorale: +3 },
          regions: { kentucky: -15, missouri: +8 },
          flags: { set: ['early_emancipation_signal'] },
        },
      },
      {
        label: 'Narrow it to match the Confiscation Act already on the books.',
        reason: "Narrowed Frémont's order to existing confiscation law",
        effects: {
          stats: { borderStates: +5, congressionalRelations: -2, unionMorale: +1 },
          regions: { kentucky: +2, missouri: +3 },
        },
      },
    ],
  },

  {
    id: 'seward_trent_affair',
    advisor: 'seward',
    triggers: { earliestMonth: '1861-11', latestMonth: '1862-01' },
    oncePerGame: true,
    priority: 25,
    text:
      'Captain Wilkes has seized two Confederate envoys, Mason and Slidell, from the British mail steamer Trent. The public is cheering him as a hero. London is incandescent — there is open talk of war, and troops are sailing for Canada. Seward, who once spoke loosely of war with Europe, now urges caution and awaits your decision.',
    choices: [
      {
        label: 'Release the envoys; send a face-saving note to London.',
        reason: 'Released the envoys to avoid war with Britain',
        effects: { stats: { internationalStanding: +22, unionMorale: -12, congressionalRelations: -3 } },
      },
      {
        label: 'Hold them — they are traitors, not diplomats.',
        reason: 'Held the envoys despite British fury',
        effects: {
          stats: { internationalStanding: -28, unionMorale: +10 },
          flags: { set: ['britain_tension_high'] },
        },
      },
      {
        label: 'Release them quietly in exchange for British assurances of neutrality.',
        reason: "Traded the envoys' release for British neutrality assurances",
        effects: { stats: { internationalStanding: +14, unionMorale: -4, congressionalRelations: +2 } },
      },
    ],
  },
];
