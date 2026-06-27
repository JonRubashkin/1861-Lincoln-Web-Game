// The 1864 presidential election — the game's hinge.
//
// Calendar-anchored scripted beats (advisor:'event') run one per month June→November;
// the cabinet-attributed beats (Blind Memorandum, Frémont/Blair, the soldier vote)
// layer on top in their month's cabinet phase. Each beat sets a flag that the
// election score in endgame.js reads (see ELECTION_FLAG_MODIFIERS) so the player's
// 1864 choices measurably move the result. The 1864-11 checkpoint then resolves
// win/lose after the Election-Day lead-in. Every choice allows sandbox divergence.

export default [
  // 2. The Vice-Presidential question (June 1864) — keep Hamlin, or swap in Andrew
  //    Johnson on a "National Union" ticket to broaden the appeal.
  {
    id: 'vp_question_1864',
    advisor: 'event',
    triggers: { earliestMonth: '1864-06', latestMonth: '1864-06' },
    priority: 92,
    text:
      'The National Union convention at Baltimore must name a running mate. The party managers press you to drop Hannibal Hamlin — a sound Maine Republican but a New Englander like yourself — for Andrew Johnson, the War Democrat who held loyal as military governor of Tennessee. A border man on the ticket would say the war is a national cause, not a party one.',
    choices: [
      {
        label: 'Take Johnson — broaden the ticket into a National Union front.',
        reason: 'Replaced Hamlin with Andrew Johnson to broaden the ticket',
        effects: {
          stats: { borderStates: +8, unionMorale: +4, congressionalRelations: -3 },
          flags: { set: ['johnson_vp'] },
        },
      },
      {
        label: 'Keep Hamlin — reward a loyal Republican and the Radicals who like him.',
        reason: 'Kept Hannibal Hamlin on the ticket',
        effects: { stats: { congressionalRelations: +5, borderStates: -3 } },
      },
      {
        label: 'Stay publicly silent and let the convention decide.',
        reason: 'Let the convention settle the Vice-Presidency unaided',
        effects: { stats: { congressionalRelations: -2 } },
      },
    ],
  },

  // 1. Greeley's peace mission (July 1864) — Niagara Falls feelers.
  {
    id: 'greeley_peace_1864',
    advisor: 'event',
    triggers: { earliestMonth: '1864-07', latestMonth: '1864-07' },
    priority: 92,
    text:
      'Horace Greeley of the Tribune, half-frantic for peace, reports Confederate agents at Niagara Falls said to hold powers to treat. The country is war-weary and the pressure to be seen reaching for peace is immense. Whatever you send will be read aloud in every newspaper, North and South.',
    choices: [
      {
        label: 'Address it "To Whom It May Concern": peace requires Union and abolition.',
        reason: 'Set Union and abolition as the price of peace ("To Whom It May Concern")',
        effects: {
          stats: { unionMorale: +5, congressionalRelations: +8, internationalStanding: +3 },
          flags: { set: ['peace_terms_firm'] },
        },
      },
      {
        label: 'Authorize Greeley to open broader, looser talks and see what they hold.',
        reason: 'Let Greeley open broader peace talks',
        effects: {
          stats: { unionMorale: -8, congressionalRelations: -6, borderStates: +4 },
          flags: { set: ['peace_talks_entertained'] },
        },
      },
      {
        label: 'Refuse the gambit publicly as a Confederate trick.',
        reason: 'Dismissed the Niagara feelers as a rebel trick',
        effects: { stats: { unionMorale: -2, congressionalRelations: +2 } },
      },
    ],
  },

  // 4. The Blind Memorandum (Aug 23, 1864) — cabinet pledge, sight unseen.
  {
    id: 'blind_memo_1864',
    advisor: 'stanton',
    triggers: { earliestMonth: '1864-08', latestMonth: '1864-08' },
    priority: 50,
    text:
      'In the bleakest week of the canvass you believe you will not be re-elected. Stanton stands ready as you fold a memorandum so only the blank back shows, and ask the whole cabinet to sign it sight unseen. Within, a pledge: to cooperate with the President-elect to save the Union between the election and the inauguration, for "he will have secured his election on such ground that he cannot possibly save it afterward."',
    choices: [
      {
        label: 'Have the cabinet sign the sealed pledge.',
        reason: 'Bound the cabinet by the blind memorandum to save the Union to the end',
        effects: {
          stats: { unionMorale: +3, congressionalRelations: +2 },
          flags: { set: ['blind_memo'] },
        },
      },
      {
        label: 'Keep the resolve private; sign nothing.',
        reason: 'Kept his resolve private rather than binding the cabinet',
        effects: { stats: {} },
      },
    ],
  },

  // 5. The Democratic nomination (Aug 1864) — McClellan on a peace platform.
  {
    id: 'democratic_nomination_1864',
    advisor: 'event',
    triggers: { earliestMonth: '1864-08', latestMonth: '1864-08' },
    priority: 90,
    text:
      'The Democrats have nominated General George B. McClellan — the man you twice removed — on a platform written by the Copperhead Vallandigham declaring the war a failure and demanding a cessation of hostilities. McClellan half-repudiates the plank even as he accepts the nomination. The lines of the contest are drawn: the war, or a negotiated peace.',
    choices: [
      {
        label: 'Frame the race as Union versus surrender, and run on the war.',
        reason: 'Cast the race as Union against surrender',
        effects: {
          stats: { unionMorale: +6, warEffort: +3, congressionalRelations: +3 },
          flags: { set: ['mcclellan_opponent'] },
        },
      },
      {
        label: 'Court war-weary voters by stressing your own openness to honorable peace.',
        reason: 'Softened toward war-weary voters against McClellan',
        effects: {
          stats: { unionMorale: -3, borderStates: +5, congressionalRelations: -4 },
          flags: { set: ['mcclellan_opponent'] },
        },
      },
    ],
  },

  // 3. Frémont's third-party challenge (Sept 1864) — the Radical splinter, paired
  //    historically with easing Blair out of the cabinet.
  {
    id: 'fremont_challenge_1864',
    advisor: 'blair',
    triggers: { earliestMonth: '1864-08', latestMonth: '1864-09' },
    priority: 40,
    text:
      "General Frémont's Radical splinter ticket threatens to draw off antislavery votes and hand the election to McClellan. Word comes that Frémont would withdraw — if you would part with a conservative the Radicals despise. Blair, your own Postmaster General and the man they mean, lays the choice before you himself, unflinching.",
    choices: [
      {
        label: 'Cut the deal: accept Blair’s resignation to unify the ticket.',
        reason: 'Eased Blair out of the cabinet to secure Frémont’s withdrawal',
        effects: {
          stats: { congressionalRelations: +10, borderStates: -6 },
          flags: { set: ['fremont_withdrew', 'blair_dropped'] },
        },
      },
      {
        label: 'Negotiate Frémont’s withdrawal without sacrificing Blair.',
        reason: 'Won Frémont’s withdrawal while keeping Blair',
        effects: {
          stats: { congressionalRelations: +3, borderStates: +2 },
          flags: { set: ['fremont_withdrew'] },
        },
      },
      {
        label: 'Refuse to bargain and risk the divided vote.',
        reason: 'Refused to bargain with the Radical splinter',
        effects: { stats: { congressionalRelations: -5, unionMorale: -3 } },
      },
    ],
  },

  // 6. Fall of Atlanta (Sept 2, 1864) — the turning point that saved the election.
  {
    id: 'atlanta_1864',
    advisor: 'event',
    triggers: { earliestMonth: '1864-09', latestMonth: '1864-09' },
    priority: 99,
    text:
      '"Atlanta is ours, and fairly won." Sherman\'s telegram lands like a thunderclap in a North that had all but despaired. The Copperhead claim that the war is a failure collapses overnight; salutes are fired in a hundred cities. The whole temper of the canvass has changed in a single day.',
    choices: [
      {
        label: 'Order national salutes and a day of thanksgiving — let the North feel it win.',
        reason: 'Proclaimed thanksgiving for the fall of Atlanta',
        effects: {
          stats: { unionMorale: +18, warEffort: +12, congressionalRelations: +5 },
          regions: { georgia: +22, tennessee: +6 },
          flags: { set: ['atlanta_fallen'] },
        },
      },
      {
        label: 'Press Sherman onward at once toward the sea, celebration be damned.',
        reason: 'Pushed Sherman onward from Atlanta without pause',
        effects: {
          stats: { unionMorale: +12, warEffort: +16 },
          regions: { georgia: +26 },
          flags: { set: ['atlanta_fallen'] },
        },
      },
    ],
  },

  // 7. Sheridan in the Shenandoah (Oct 1864) — Cedar Creek; more autumn good news.
  {
    id: 'sheridan_shenandoah_1864',
    advisor: 'event',
    triggers: { earliestMonth: '1864-10', latestMonth: '1864-10' },
    priority: 90,
    text:
      'Surprised and routed in the dawn fog at Cedar Creek, Sheridan’s army was saved by the general’s own furious twenty-mile ride from Winchester to rally it — and turned the day into a crushing victory. The Shenandoah, the granary and invasion road of the Confederacy, is burned and broken. The autumn brings victory upon victory.',
    choices: [
      {
        label: 'Trumpet Sheridan’s ride and the valley won, days before the vote.',
        reason: 'Made Sheridan’s Shenandoah victory the news of the hour',
        effects: {
          stats: { unionMorale: +10, warEffort: +8 },
          regions: { virginia: +14 },
          flags: { set: ['sheridan_shenandoah'] },
        },
      },
      {
        label: 'Note it soberly — victories enough, no need to gloat.',
        reason: 'Marked the Shenandoah victory without fanfare',
        effects: {
          stats: { unionMorale: +5, warEffort: +6 },
          regions: { virginia: +10 },
          flags: { set: ['sheridan_shenandoah'] },
        },
      },
    ],
  },

  // 8. The soldier vote (Oct 1864) — furloughs / absentee voting (soldiers favored
  //    Lincoln heavily). A Stanton-flavored War Department decision.
  {
    id: 'soldier_vote_1864',
    advisor: 'stanton',
    triggers: { earliestMonth: '1864-10', latestMonth: '1864-10' },
    priority: 45,
    text:
      'Stanton has the machinery ready: states that allow it can poll their soldiers in the field, and where they cannot, men can be furloughed home to vote. The army is yours by wide margins — but stripping the lines to send men home, and the partisan look of a War Department turning out its own voters, both carry a cost.',
    choices: [
      {
        label: 'Enable absentee field voting and furlough regiments home en masse.',
        reason: 'Mobilized the soldier vote through furloughs and field ballots',
        effects: {
          stats: { unionMorale: +6, warEffort: -4, congressionalRelations: -2 },
          flags: { set: ['soldier_vote_enabled'] },
        },
      },
      {
        label: 'Permit only orderly absentee balloting where the law already allows.',
        reason: 'Allowed soldier balloting only where the law already provided',
        effects: {
          stats: { unionMorale: +3 },
          flags: { set: ['soldier_vote_enabled'] },
        },
      },
      {
        label: 'Keep the army at the front and out of the politics entirely.',
        reason: 'Kept the army out of the election',
        effects: { stats: { warEffort: +3, congressionalRelations: +2 } },
      },
    ],
  },

  // 9. Election Day framing (Nov 1864) — short lead-in; the endgame 1864 checkpoint
  //    then resolves win/lose and hands off to the epilogue.
  {
    id: 'election_day_1864',
    advisor: 'event',
    triggers: { earliestMonth: '1864-11', latestMonth: '1864-11' },
    priority: 99,
    text:
      'November 8, 1864. A cold rain falls on Washington as the returns begin to clatter in over the War Department wires. For the first time in the history of any republic, a nation rends itself in civil war and still stops to hold a free election. You wait, as you said you would abide the verdict, whatever the people decide.',
    choices: [
      {
        label: 'Wait out the returns at the War Department telegraph.',
        reason: 'Awaited the people’s verdict at the telegraph office',
        effects: { stats: {} },
      },
      {
        label: 'Go home to Mary and let the count come as it will.',
        reason: 'Left the count to history and went home to Mary',
        effects: { stats: { maryPersonal: +4 } },
      },
    ],
  },
];
