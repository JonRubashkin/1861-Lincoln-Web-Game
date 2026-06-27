// ============================================================================
// CONTENT BATCH 2 — September 1861 → mid-1863
// ============================================================================
// Conforms to the content schema in CLAUDE.md §7. All entries are
// schema-validated content only — no engine changes required EXCEPT the two
// integration notes at the bottom of this file (read them).
//
// MERGE GUIDANCE for Claude Code:
//   - Append the 1861 entries to the existing src/content/events/1861.js
//   - Create src/content/events/1862.js with the 1862 entries
//   - Create src/content/events/1863.js with the 1863 entries
//   - content/index.js should already aggregate events/<year>.js — wire the
//     two new year files into it.
//   - Run validate.js + `npm run test` after merging.
//
// The Emancipation arc is a flag-gated chain — note how the July 1862 cabinet
// meeting sets `emancipation_drafted`, Antietam sets `antietam_victory`, and
// the Preliminary Proclamation requires BOTH. This is the showcase for
// condition-gated, multi-month content.
// ============================================================================


// ---------------------------------------------------------------------------
// APPEND TO events/1861.js
// ---------------------------------------------------------------------------

export const events1861_batch2 = [
  {
    id: "fremont_emancipation_1861",
    advisor: "event",
    triggers: { earliestMonth: "1861-09", latestMonth: "1861-10" },
    oncePerGame: true,
    priority: 20,
    text: "General Frémont, commanding in Missouri, has issued his own proclamation freeing the slaves of Confederate sympathizers — without your authorization. The Radicals are jubilant. Kentucky's legislature is alarmed, and you've heard a Union officer there warn that the order could lose you the whole border at a stroke.",
    choices: [
      {
        label: "Revoke the order — you cannot risk Kentucky.",
        reason: "Overruled Frémont to keep the border states in the Union",
        effects: {
          stats: { borderStates: +12, congressionalRelations: -10, unionMorale: -4 },
          regions: { kentucky: +8, missouri: +5 }
        }
      },
      {
        label: "Let it stand — strike at slavery where you can.",
        reason: "Upheld Frémont's emancipation order",
        effects: {
          stats: { congressionalRelations: +12, internationalStanding: +5, borderStates: -15, unionMorale: +3 },
          regions: { kentucky: -15, missouri: +8 },
          flags: { set: ["early_emancipation_signal"] }
        }
      },
      {
        label: "Narrow it to match the Confiscation Act already on the books.",
        reason: "Narrowed Frémont's order to existing confiscation law",
        effects: {
          stats: { borderStates: +5, congressionalRelations: -2, unionMorale: +1 },
          regions: { kentucky: +2, missouri: +3 }
        }
      }
    ]
  },

  {
    id: "seward_trent_affair",
    advisor: "seward",
    triggers: { earliestMonth: "1861-11", latestMonth: "1862-01" },
    oncePerGame: true,
    priority: 25,
    text: "Captain Wilkes has seized two Confederate envoys, Mason and Slidell, from the British mail steamer Trent. The public is cheering him as a hero. London is incandescent — there is open talk of war, and troops are sailing for Canada. Seward, who once spoke loosely of war with Europe, now urges caution and awaits your decision.",
    choices: [
      {
        label: "Release the envoys; send a face-saving note to London.",
        reason: "Released the envoys to avoid war with Britain",
        effects: { stats: { internationalStanding: +22, unionMorale: -12, congressionalRelations: -3 } }
      },
      {
        label: "Hold them — they are traitors, not diplomats.",
        reason: "Held the envoys despite British fury",
        effects: {
          stats: { internationalStanding: -28, unionMorale: +10 },
          flags: { set: ["britain_tension_high"] }
        }
      },
      {
        label: "Release them quietly in exchange for British assurances of neutrality.",
        reason: "Traded the envoys' release for British neutrality assurances",
        effects: { stats: { internationalStanding: +14, unionMorale: -4, congressionalRelations: +2 } }
      }
    ]
  }
];


// ---------------------------------------------------------------------------
// NEW FILE: events/1862.js
// ---------------------------------------------------------------------------

export const events1862 = [
  {
    id: "cameron_stanton_1862",
    advisor: "event",
    triggers: { earliestMonth: "1862-01", latestMonth: "1862-03" },
    oncePerGame: true,
    priority: 18,
    text: "Secretary of War Cameron is mired in contracting scandals and his department is in disarray. Edwin Stanton — brusque, tireless, incorruptible — is within reach. Replacing a cabinet officer in the middle of a war carries real political risk.",
    choices: [
      {
        label: "Replace Cameron with Stanton.",
        reason: "Brought in Stanton to reform the War Department",
        effects: {
          stats: { warEffort: +12, treasury: +6, congressionalRelations: +4, unionMorale: +3 },
          flags: { set: ["stanton_replaces_cameron"] }
        }
      },
      {
        label: "Ease Cameron out as minister to Russia; install Stanton without a fight.",
        reason: "Eased Cameron abroad and installed Stanton quietly",
        effects: {
          stats: { warEffort: +10, congressionalRelations: +2, internationalStanding: +3 },
          flags: { set: ["stanton_replaces_cameron"] }
        }
      },
      {
        label: "Keep Cameron to avoid a political brawl.",
        reason: "Kept Cameron despite the scandals",
        effects: { stats: { warEffort: -6, treasury: -8, congressionalRelations: -6 } }
      }
    ]
  },

  {
    id: "chase_greenbacks_1862",
    advisor: "chase",
    triggers: { earliestMonth: "1862-02", latestMonth: "1862-04" },
    oncePerGame: true,
    priority: 14,
    text: "The Treasury is nearly empty and the banks have suspended payment in gold. Chase proposes a radical step: issue paper money — 'greenbacks' — as legal tender, backed only by the government's promise. It would fund the war, but invites inflation and a constitutional challenge.",
    choices: [
      {
        label: "Authorize the greenbacks.",
        reason: "Issued greenback paper currency to fund the war",
        effects: {
          stats: { treasury: +16, warEffort: +6, congressionalRelations: +2, unionMorale: -3 },
          flags: { set: ["greenbacks_issued"] }
        }
      },
      {
        label: "Authorize a limited issue as a stopgap only.",
        reason: "Authorized a limited greenback issue",
        effects: {
          stats: { treasury: +9, unionMorale: -1 },
          flags: { set: ["greenbacks_issued"] }
        }
      },
      {
        label: "Fund the war through bonds and taxation instead.",
        reason: "Funded the war by bonds and taxes rather than paper money",
        effects: { stats: { treasury: +6, unionMorale: -6, congressionalRelations: -2 } }
      }
    ]
  },

  {
    id: "mary_willie_1862",
    advisor: "mary",
    triggers: { earliestMonth: "1862-02", latestMonth: "1862-03" },
    oncePerGame: true,
    priority: 22,
    text: "Your son Willie, eleven years old, has died of typhoid fever in the White House. Mary is inconsolable — she cannot bear to enter the rooms where he played, and the gaslit receptions go dark. The war grants no pause for a father's grief.",
    choices: [
      {
        label: "Step back from the work and grieve alongside Mary.",
        reason: "Stepped back from duties to grieve with Mary",
        effects: { stats: { maryPersonal: +10, warEffort: -4, unionMorale: -2 } }
      },
      {
        label: "Arrange care and company for Mary while you carry the war.",
        reason: "Arranged support for Mary while shouldering the war",
        effects: { stats: { maryPersonal: +4, treasury: -2 } }
      },
      {
        label: "Bury the grief; bury yourself in the work.",
        reason: "Submerged grief in the work of the presidency",
        effects: { stats: { maryPersonal: -10, warEffort: +4 } }
      }
    ]
  },

  {
    id: "forts_henry_donelson_1862",
    advisor: "event",
    triggers: { earliestMonth: "1862-02", latestMonth: "1862-03" },
    oncePerGame: true,
    priority: 12,
    text: "An obscure general named Grant has taken Forts Henry and Donelson, cracking open the western rivers and demanding 'unconditional surrender.' Tennessee lies suddenly exposed. The cabinet debates how hard to press the advantage.",
    choices: [
      {
        label: "Reinforce Grant and drive into Tennessee.",
        reason: "Reinforced Grant's western advance into Tennessee",
        effects: {
          stats: { warEffort: +8, unionMorale: +8 },
          regions: { tennessee: +18, kentucky: +10 }
        }
      },
      {
        label: "Consolidate the river gains before advancing.",
        reason: "Consolidated the western river gains",
        effects: {
          stats: { warEffort: +4, unionMorale: +5 },
          regions: { tennessee: +8, kentucky: +6 }
        }
      }
    ]
  },

  {
    id: "welles_ironclads_1862",
    advisor: "welles",
    triggers: { earliestMonth: "1862-03", latestMonth: "1862-04" },
    oncePerGame: true,
    priority: 13,
    text: "The Confederate ironclad Virginia — the raised and armored Merrimack — wrecked the wooden blockade fleet at Hampton Roads in a single afternoon. Welles's untested little Monitor fought her to a draw the next day. He wants to commit hard to an ironclad navy: costly, unproven, and the future of war at sea.",
    choices: [
      {
        label: "Fund a major ironclad program.",
        reason: "Committed to building an ironclad navy",
        effects: {
          stats: { treasury: -8, warEffort: +10, internationalStanding: +4 },
          regions: { virginia: +4 },
          flags: { set: ["ironclad_program"] }
        }
      },
      {
        label: "Hold the blockade with the fleet you have.",
        reason: "Kept the blockade on a conventional footing",
        effects: { stats: { treasury: -2, warEffort: +2 } }
      }
    ]
  },

  {
    id: "dc_emancipation_1862",
    advisor: "event",
    triggers: { earliestMonth: "1862-04", latestMonth: "1862-06" },
    oncePerGame: true,
    priority: 11,
    text: "Congress has passed a bill abolishing slavery in the District of Columbia, compensating loyal owners. Signing it would be the first federal abolition of slavery on American soil — and a clear signal to the border states of where the wind now blows.",
    choices: [
      {
        label: "Sign it.",
        reason: "Signed abolition of slavery in the District of Columbia",
        effects: {
          stats: { congressionalRelations: +8, internationalStanding: +5, borderStates: -6, unionMorale: +2 },
          flags: { set: ["dc_emancipation"] }
        }
      },
      {
        label: "Sign it, and pair it with an offer of compensated emancipation to the border states.",
        reason: "Signed D.C. abolition and courted the border states with compensation",
        effects: {
          stats: { congressionalRelations: +6, borderStates: +2, treasury: -6 },
          flags: { set: ["dc_emancipation", "border_compensation_offered"] }
        }
      },
      {
        label: "Delay signing to gauge the border-state reaction.",
        reason: "Delayed D.C. abolition to reassure the border states",
        effects: { stats: { congressionalRelations: -5, borderStates: +5 } }
      }
    ]
  },

  {
    id: "shiloh_1862",
    advisor: "event",
    triggers: { earliestMonth: "1862-04", latestMonth: "1862-05" },
    oncePerGame: true,
    priority: 10,
    text: "Grant has held the field at Shiloh — but the casualty lists are staggering, more American dead in two days than in all the nation's earlier wars combined. The public recoils even in victory, and the cry to remove Grant is loud.",
    choices: [
      {
        label: "Stand by Grant: 'I cannot spare this man — he fights.'",
        reason: "Kept Grant despite the Shiloh outcry",
        effects: {
          stats: { warEffort: +8, unionMorale: -6 },
          regions: { tennessee: +8 }
        }
      },
      {
        label: "Reassign Grant to quiet the critics.",
        reason: "Sidelined Grant after Shiloh",
        effects: { stats: { warEffort: -8, unionMorale: +4, congressionalRelations: +3 } }
      }
    ]
  },

  {
    id: "emancipation_draft_cabinet_1862",
    advisor: "event",
    triggers: { earliestMonth: "1862-07", latestMonth: "1862-08" },
    oncePerGame: true,
    priority: 30,
    text: "You have drafted a proclamation freeing the slaves in the rebelling states, and read it aloud to the cabinet. Chase and Stanton press you to issue it at once. Seward agrees with the measure itself — but warns that, with the army in retreat, the world will read it as 'the last shriek on the retreat,' a cry of desperation. He counsels you to wait for a victory.",
    choices: [
      {
        label: "Issue it now — the moral case will not wait.",
        reason: "Issued emancipation immediately, from a position of weakness",
        effects: {
          stats: { congressionalRelations: +15, internationalStanding: +6, borderStates: -18, unionMorale: -5 },
          regions: { kentucky: -12, missouri: -8, maryland: -6 },
          flags: { set: ["emancipation_issued"] }
        }
      },
      {
        label: "Take Seward's counsel — hold it, and wait for a battlefield victory.",
        reason: "Held the proclamation, waiting for a victory (Seward's counsel)",
        effects: {
          stats: { congressionalRelations: -4 },
          flags: { set: ["emancipation_drafted"] }
        }
      },
      {
        label: "Shelve emancipation; keep the war about Union alone.",
        reason: "Set emancipation aside to keep the war focused on Union",
        effects: {
          stats: { congressionalRelations: -12, borderStates: +10, internationalStanding: -5 },
          flags: { set: ["emancipation_shelved"] }
        }
      }
    ]
  },

  {
    id: "second_bull_run_1862",
    advisor: "event",
    triggers: { earliestMonth: "1862-08", latestMonth: "1862-09" },
    oncePerGame: true,
    priority: 9,
    text: "Pope has been routed at the Second Battle of Bull Run, and the army is reeling back into the Washington defenses. Lee is turning north toward Maryland. Had you issued the proclamation last month, it would indeed look like desperation now.",
    choices: [
      {
        label: "Restore McClellan — only he can reorganize this army quickly.",
        reason: "Recalled McClellan to defend Washington",
        effects: {
          stats: { warEffort: +6, unionMorale: -6, congressionalRelations: -8 },
          regions: { virginia: -8, maryland: -6 }
        }
      },
      {
        label: "Find a new commander rather than recall McClellan.",
        reason: "Refused to restore McClellan after Bull Run",
        effects: {
          stats: { warEffort: -8, unionMorale: -8, congressionalRelations: +4 },
          regions: { maryland: -10 }
        }
      }
    ]
  },

  {
    id: "antietam_1862",
    advisor: "event",
    triggers: { earliestMonth: "1862-09", latestMonth: "1862-10" },
    oncePerGame: true,
    priority: 28,
    text: "Along Antietam Creek, the bloodiest single day of the war ends with Lee's invasion of the North turned back. It is no clean triumph — McClellan let Lee's battered army slip back across the Potomac — but the field is yours. The victory you were told to wait for has come.",
    choices: [
      {
        label: "Claim it as the victory you needed.",
        reason: "Treated Antietam as the awaited victory",
        effects: {
          stats: { unionMorale: +10, warEffort: +6, internationalStanding: +8 },
          regions: { maryland: +15, virginia: +5 },
          flags: { set: ["antietam_victory"] }
        }
      },
      {
        label: "Order McClellan to pursue and finish Lee's army.",
        reason: "Ordered McClellan to pursue Lee after Antietam",
        effects: {
          stats: { warEffort: +4, unionMorale: +8, congressionalRelations: -2 },
          regions: { maryland: +15, virginia: +10 },
          flags: { set: ["antietam_victory"] }
        }
      }
    ]
  },

  {
    id: "preliminary_emancipation_1862",
    advisor: "event",
    triggers: {
      earliestMonth: "1862-09",
      latestMonth: "1862-12",
      conditions: [
        { target: "flag:emancipation_drafted", op: "isSet" },
        { target: "flag:antietam_victory", op: "isSet" }
      ]
    },
    oncePerGame: true,
    priority: 35,
    text: "The victory has come and the proclamation is ready. You can now issue the preliminary Emancipation Proclamation: as of the first of January, all persons held as slaves in states still in rebellion shall be free. It will remake the meaning of the war at home and abroad — and the border states are holding their breath.",
    choices: [
      {
        label: "Issue the preliminary proclamation.",
        reason: "Issued the preliminary Emancipation Proclamation",
        effects: {
          stats: { congressionalRelations: +16, internationalStanding: +14, unionMorale: +4, borderStates: -12 },
          regions: { kentucky: -8, missouri: -5, maryland: -4 },
          flags: { set: ["emancipation_issued"] }
        }
      },
      {
        label: "Hold a while longer to steady the border states first.",
        reason: "Delayed the proclamation to steady the border states",
        effects: { stats: { congressionalRelations: -6, borderStates: +8 } }
      }
    ]
  },

  {
    id: "bates_habeas_corpus_1862",
    advisor: "bates",
    triggers: { earliestMonth: "1862-09", latestMonth: "1862-11" },
    oncePerGame: true,
    priority: 8,
    text: "Anti-war agitation and resistance to the coming draft are spreading across the North. Stanton wants broad authority to detain agitators without trial. Suspending habeas corpus would grant it. Bates, your Attorney General, is uneasy about how far the Constitution can be stretched even in a rebellion.",
    choices: [
      {
        label: "Suspend habeas corpus broadly across the North.",
        reason: "Suspended habeas corpus to suppress anti-war agitation",
        effects: {
          stats: { warEffort: +6, unionMorale: +2, congressionalRelations: -6, internationalStanding: -3 },
          flags: { set: ["habeas_suspended"] }
        }
      },
      {
        label: "Limit any suspension to active war zones.",
        reason: "Limited habeas suspension to war zones",
        effects: { stats: { warEffort: +3, congressionalRelations: -1 } }
      },
      {
        label: "Refuse — uphold the writ even now.",
        reason: "Upheld habeas corpus despite the unrest",
        effects: { stats: { warEffort: -5, unionMorale: -2, congressionalRelations: +5 } }
      }
    ]
  }
];


// ---------------------------------------------------------------------------
// NEW FILE: events/1863.js
// ---------------------------------------------------------------------------

export const events1863 = [
  {
    id: "final_emancipation_1863",
    advisor: "event",
    triggers: {
      earliestMonth: "1863-01",
      latestMonth: "1863-02",
      conditions: [{ target: "flag:emancipation_issued", op: "isSet" }]
    },
    oncePerGame: true,
    priority: 35,
    text: "January 1, 1863. The hundred days are up. With the stroke of a pen the final Emancipation Proclamation takes effect — and with it, the door opens to enlisting Black soldiers into the Union army. Your hand is steady. 'If my name ever goes into history,' you tell those gathered, 'it will be for this act.'",
    choices: [
      {
        label: "Sign, and authorize the enlistment of Black troops.",
        reason: "Signed the final Proclamation and authorized Black troops",
        effects: {
          stats: { congressionalRelations: +12, internationalStanding: +10, warEffort: +10, unionMorale: +6, borderStates: -8 },
          flags: { set: ["emancipation_final", "black_troops_authorized"] }
        }
      },
      {
        label: "Sign the proclamation, but defer Black enlistment for now.",
        reason: "Signed the Proclamation but deferred Black enlistment",
        effects: {
          stats: { congressionalRelations: +6, internationalStanding: +10, unionMorale: +3, borderStates: -3 },
          flags: { set: ["emancipation_final"] }
        }
      }
    ]
  },

  {
    id: "west_virginia_statehood_1863",
    advisor: "event",
    triggers: { earliestMonth: "1863-06", latestMonth: "1863-07" },
    oncePerGame: true,
    priority: 14,
    text: "The loyal counties of western Virginia have petitioned to enter the Union as a new state of their own. It is of doubtful constitutional tidiness — carving a state out of a state in the middle of a rebellion — but it would plant a loyal foothold in the Confederacy's flank.",
    choices: [
      {
        label: "Admit West Virginia to the Union.",
        reason: "Admitted West Virginia to the Union",
        effects: {
          stats: { congressionalRelations: +6, unionMorale: +5 },
          regions: { virginia: +6 },
          flags: { set: ["west_virginia_active"] } // engine activates the dormant region (see note 1)
        }
      },
      {
        label: "Decline on constitutional grounds.",
        reason: "Declined to admit West Virginia",
        effects: { stats: { congressionalRelations: -4, unionMorale: -3 } }
      }
    ]
  }
];


// ============================================================================
// INTEGRATION NOTES (these require engine awareness, not new engine logic)
// ============================================================================
//
// NOTE 1 — West Virginia activation.
//   `west_virginia_statehood_1863` sets the `west_virginia_active` flag. The
//   engine's existing "flag activates region" hook (CLAUDE.md §10) must map
//   `west_virginia_active` -> set region `west_virginia` { active:true,
//   control:+40 }. No special-case code in the event itself; keep the mapping
//   data-driven so future statehood beats reuse it.
//
// NOTE 2 — The Emancipation chain (flag-gated, multi-month):
//   emancipation_draft_cabinet_1862 ("wait for victory") -> sets
//     `emancipation_drafted`
//   antietam_1862 -> sets `antietam_victory`
//   preliminary_emancipation_1862 -> REQUIRES both flags -> sets
//     `emancipation_issued`
//   final_emancipation_1863 -> REQUIRES `emancipation_issued` -> sets
//     `emancipation_final`
//   Note the alternate path: choosing "Issue it now" in the July cabinet
//   meeting sets `emancipation_issued` directly (skipping the preliminary
//   gate), so final_emancipation_1863 still fires in Jan 1863. The "shelve"
//   path sets `emancipation_shelved` and neither proclamation fires —
//   a genuine sandbox divergence. `antietam_victory` is intentionally a
//   sticky window flag (CLAUDE.md §10).
//
// NOTE 3 — Playwright fixtures.
//   Add a seed fixture that sets flags `emancipation_drafted` +
//   `antietam_victory` and calendar 1862-09 so the e2e suite can assert the
//   preliminary proclamation appears, without playing 18 turns.
// ============================================================================
