# CLAUDE.md

Persistent context for working on **"Lincoln: A Presidency"** — a turn-based, data-driven decision game about Lincoln's presidency. Read this before making changes. Keep it updated when architecture or conventions change.

---

## 1. What this project is

A static React + Vite single-page game. The player advises with Lincoln's cabinet, makes personal-life choices, watches a stylized US map shift with the Civil War, and ends each turn (one month) to face a historical or counterfactual event. It is a **sandbox** — choices can diverge from real history. The game runs March 1861 → at most the 1868 election, with the 1864 election as a mandatory checkpoint and a chance-based assassination hazard in the second term.

## 2. Non-negotiable design pillars

1. **Engine and content are fully separated.** Engine = turn loop, state math, rendering, endgame evaluation. Content = every advisor decision and event, in data modules under `src/content/`. **Adding content must never require editing engine code.** If you find yourself adding a `switch` on a specific event id inside the engine, stop — generalize it into the schema instead.
2. **Everything is a number; display tiers are derived.** Global dials and per-region control are numbers. Categories like "mostly Union" or "contested" are computed from numeric bands at render time, never stored.
3. **Every effect is attributed and logged.** Applying any effect writes a `changeLog` entry (month, target, delta, cause, human-readable reason). The map info panel and any recap read from this log. Built in from the start — do not retrofit.
4. **One content format for decisions and events.** An event is just a content entry whose `advisor` is `"event"`.

## 3. Tech stack & constraints

- React + Vite, SPA, **no backend.** All state client-side.
- Saves via **`localStorage`** (this is a real deployed app — `localStorage` is correct here).
- Deploys static to **GitHub Pages** (GitHub Actions → Pages preferred). Set Vite `base` to the repo path.
- Minimal dependencies. One state approach (context+reducer or a tiny store) — be consistent.
- Map is inline **SVG**, simplified-geographic (recognizable US silhouette, low-poly state shapes), **not** a hex/node grid.

## 4. Repository layout

```
src/
  engine/   state.js reducer.js triggers.js effects.js endgame.js validate.js
  content/  regions.js  cabinet/<advisor>.js  events/<year>.js  events/thresholds.js  index.js
  ui/       CabinetView DecisionModal MapView InfoPanel Dials EndTurnBar Epilogue
  App.jsx main.jsx
tests/      unit (vitest)   e2e (playwright)
README.md   (player/author-facing)   CLAUDE.md (this file)
```

## 5. Commands

```bash
npm run dev         # local dev server
npm run build       # production build (static, to dist/)
npm run preview     # serve the build locally
npm run test        # unit tests (vitest) — engine logic
npm run test:e2e    # Playwright end-to-end tests
npm run lint
```

Keep `npm run test` and `npm run test:e2e` green before committing. CI should run both.

## 6. State model (canonical reference)

### Global dials (`stats`), range 0–100, clamped after every effect

| id | start | higher is |
|---|---|---|
| `unionMorale` | 55 | better (this is the 1864 election currency) |
| `congressionalRelations` | 50 | better |
| `borderStates` | 40 | better |
| `treasury` | 50 | better |
| `internationalStanding` | 55 | better |
| `warEffort` | 45 | better |
| `maryPersonal` | 60 | better |
| `security` | hidden | safer — **locked and not rendered until `security_unlocked` flag is set** (Baltimore Plot). Starts ~50 on unlock. |

### Regions

`{ id, displayName, control: -100..+100, active: bool, isTerritory: bool }`. Control bands (global): `>33` Union, `-33..33` contested, `<-33` Confederate. Dormant regions have `active:false` and render neutral. SVG geometry never changes — activation flips `active`, never re-splits paths.

### Flags

String set for unlocks and non-repeating story state. New flags **must** be documented here. Current flags:

**Engine-significant (read by `endgame.js` / structural hooks):**
- `security_unlocked` — reveals the Security dial (Baltimore Plot).
- `west_virginia_active` — drives the data-driven `FLAG_ACTIVATIONS` hook (activates the `west_virginia` region at +40). See §10.
- `washington_captured`, `foreign_intervention` — catastrophic endings (any month).
- `union_victory`, `confederacy_recognized` — colour the epilogue war summary.
- `victory_celebration` — thematic spike multiplier on the assassination hazard.
- `reconstruction_begun` — epilogue flavour.

**1864 election (read by `endgame.js` ELECTION_FLAG_MODIFIERS — the one documented place the engine reads election flags):**
- `atlanta_fallen` (+12), `soldier_vote_enabled` (+6), `sheridan_shenandoah` (+5), `fremont_withdrew` (+5), `johnson_vp` (+4), `peace_terms_firm` (+3), `blind_memo` (+2), `blair_dropped` (−2), `peace_talks_entertained` (−8). Also `mcclellan_opponent` (sets the opponent; neutral score).

**Story / content-gating (set and read by content only — engine never switches on them):**
- Emancipation chain: `emancipation_drafted`, `antietam_victory` (sticky window flag, §10), `emancipation_issued`, `emancipation_shelved`, `emancipation_final`, `black_troops_authorized`, `early_emancipation_signal`, `dc_emancipation`, `border_compensation_offered`.
- War / cabinet: `war_begun`, `blockade_declared`, `stanton_replaces_cameron`, `greenbacks_issued`, `ironclad_program`, `habeas_suspended`, `dissent_suppressed`.
- Diplomacy: `britain_tension_high`.

### Change log

`{ month, target: "stat:<id>"|"region:<id>", delta, cause: <choice/event id>, reason: <string> }`. Info panel filters by `region:<id>` and most-recent month.

### Calendar

`current: { year, month }`, start `1861-03`. Compare as `"YYYY-MM"`.

### Seeded PRNG (`rngSeed`)

`rngSeed` (one 32-bit integer) lives in state and is saved/loaded, so a playthrough's random selection is reproducible. **All random selection draws from it** (engine/rng.js, mulberry32) — never bare `Math.random()` in selection logic. A new game gets a varied seed (`randomSeed()`); `NEW_GAME` may pin it via `action.seed`, and the dev seeds pin `rngSeed` directly. Selection happens once per month at month-entry in the reducer (so re-renders never re-roll): the chosen random advisor situations are frozen into `monthRandomAdvisorIds`. The assassination hazard keeps its own injectable `action.rng` (defaults `Math.random`) — that is a hazard roll, not content selection.

## 7. Content schema (decisions & events)

```js
{
  id: "unique_id",
  advisor: "seward",              // cabinet id OR "event"
  triggers: {
    earliestMonth: "1861-11",     // optional
    latestMonth:   "1862-02",     // optional
    conditions: [                 // optional; ALL must hold
      { target: "stat:internationalStanding", op: "below", value: 40 },
      { target: "flag:emancipation_drafted",  op: "isSet" }
    ]
  },
  oncePerGame: true,              // default true
  cooldown: 0,                    // months before recurrence (ignored if oncePerGame)
  priority: 10,                   // higher wins when several SCRIPTED entries qualify the same month
  kind: "scripted",               // "scripted" (default) | "random"
  weight: 1,                      // relative odds within a RANDOM draw (default 1)
  text: "...",
  choices: [
    { label: "...", reason: "...",          // reason feeds the change log
      effects: { stats:{}, regions:{}, flags:{ set:[], clear:[] } },
      followUp: null }            // optional id forced NEXT month (use only for true next-month chains)
  ]
}
```

Condition ops: `above`, `below`, `equals`, `isSet`, `notSet`. Targets: `stat:<id>`, `region:<id>`, `flag:<name>`.

**Eligibility (per entry, per month):** passes calendar window + all conditions + not on cooldown + not already used (if `oncePerGame`). Same for both kinds.

**`scripted` vs `random` (optional, backward compatible):**
- `kind:"scripted"` (default) — historical/authored beats. `random` — recurring flavor; typically `oncePerGame:false` with a `cooldown` (months) so it recurs but never back-to-back, and a `weight` for the draw.

**Monthly event slot (one per month, in `selectMonthlyEvent`):** among eligible `advisor:"event"` entries — if any *scripted* one exists, fire the highest-`priority` one (historical beats always win their month); else weighted-random-draw one from the eligible *random* events (by `weight`, from the seeded PRNG); else no event.

**Advisor situations:** an advisor's portrait is active if they have an eligible *scripted* decision (always offered). On months where an advisor has none, they *may* surface one eligible *random* situation. To preserve pacing this is chosen once at month-entry (`selectRandomAdvisorSituations`, frozen into `monthRandomAdvisorIds`): scripted-active advisors fill an active-advisor cap (target 1–3) first; the remainder is offered occasionally (not every advisor, not every month) to advisors who have a random situation but no scripted one.

## 8. Turn loop

Status readout → cabinet phase (active portraits only) → Mary phase → map viewable/clickable throughout → **End Turn** (cabinet decisions skippable; unconsulted advisors pass) → advance month → event fires → `endgame.js` evaluation → repeat.

## 9. Endgame evaluation order (each month, after event)

1. **Catastrophic (any month):** `washington_captured` or `foreign_intervention` flag, or `unionMorale` == 0 → graded catastrophic epilogue.
2. **1864-11 checkpoint:** election score = weighted blend (unionMorale dominant, + warEffort, congressionalRelations, Union/Confederate map ratio) **+ the 1864 flag modifiers** (`ELECTION_FLAG_MODIFIERS`, the one place flags feed the score — e.g. `atlanta_fallen` +12). Below threshold → election-loss epilogue (first term graded). Else second term begins. The Nov 1864 `election_day_1864` event is the lead-in; the checkpoint resolves on its resolution.
3. **Assassination hazard (1865-03+):** per-month probability ending in a graded epilogue. ~2-month grace period, then a **ramping** base rate scaled by `(100 - security)`. ≥1 security decision must surface before it gets dangerous. Post-war celebration moments may spike it.
4. **1868-11 backstop:** if no assassination, end at 1868 results with a full-presidency graded epilogue. No third term.

Epilogue templates: curtailed-first-term (election loss), fuller-presidency (assassination/1868), catastrophic. All read from final state; **death is not a "you lose" screen** — it honors the presidency built.

## 10. Engine conventions & gotchas

- **`effects.js` is the only writer to `changeLog`.** It mutates stats/regions/flags, clamps 0–100 (dials) / −100..+100 (regions), and writes one log entry per target touched, with `cause` = choice/event id and `reason` = the choice's `reason`.
- **Special flag → region activation.** When `west_virginia_active` becomes set, the engine sets the `west_virginia` region `active:true, control:+40`. Handle this as a general "flag activates region" hook keyed by data, not a hardcoded special case — future statehood/territory promotions reuse it.
- **Transient flags.** Some flags represent a *window* (e.g. `antietam_victory` gating the proclamation). Flags are sticky by default. If a flag should expire, give it an explicit clear (via a later choice's `flags.clear`, or a small TTL mechanism). Document any window flag where it's set. Currently `antietam_victory` is intentionally sticky (the window stays open once the victory is won).
- **`validate.js` runs on content load:** required fields, referenced advisor/region/stat/flag ids resolve, valid ops, and the random fields (`kind` ∈ scripted/random, positive `weight`, a random entry that is `oncePerGame` with no cooldown). Warn (don't crash) on malformed entries; surface warnings in dev console.
- **Seeded PRNG drives all random selection** (engine/rng.js; `state.rngSeed`, saved/loaded). The reducer makes a generator from `rngSeed` at month-entry, does every selection draw, and writes the advanced seed back — selection is therefore a state transition (never run from a render). Bare `Math.random()` must not appear in selection logic. The new-game seed (`randomSeed()`) is the only nondeterministic source, and it is immediately persisted.
- **1864 election flag modifiers live only in `endgame.js` (`ELECTION_FLAG_MODIFIERS`).** That is the single, documented place the engine reads election flags into the score. Do not branch on specific election flags anywhere else; new election levers are a row in that table.
- Reducer transitions are **pure** and unit-tested.
- Save/load round-trips the *entire* state (calendar, stats, regions, flags, full changeLog, used-decision ids, `rngSeed`, `monthRandomAdvisorIds`). Include new-game reset. (LOAD back-fills `rngSeed`/`monthRandomAdvisorIds` for pre-existing saves.)

## 11. Testing

### Unit (vitest) — engine
Cover at minimum: effect application clamps correctly and logs with attribution; trigger evaluation respects calendar + conditions + cooldown + oncePerGame; advisor-active derivation; 1864 election scoring threshold; assassination hazard ramp + grace period + security scaling; flag→region activation (West Virginia); save/load round-trip.

### E2E (Playwright) — the loop
Maintain these scenarios:
1. **Cold load** → game renders at March 1861, dials visible, `security` dial NOT visible.
2. **Cabinet decision** → click an active portrait, pick a choice, modal closes, relevant dial moves.
3. **End turn → event** → End Turn advances the month and a monthly event modal appears.
4. **Map updates + attribution** → after a choice with region effects, the region's fill tier changes AND opening its info panel shows the change with its reason string.
5. **Security unlock** → after the Baltimore Plot event, the `security` dial becomes visible.
6. **Save/reload** → reload the page, state (month, dials, map, log) persists.
7. **Endgame paths** → 1864 election checkpoint triggers; second-term assassination hazard can fire; catastrophic loss can fire.

### Debug seeding (IMPORTANT for testable e2e)
Playing 40 turns to reach 1864 in every test is untenable. A **dev-only scenario-seed mechanism** is implemented: a `?seed=<name>` URL param (handled in `src/App.jsx` via `src/debug/seed.js`, both gated behind `import.meta.env.DEV` so they are tree-shaken from production builds) dispatches the generic `SEED_GAME` reducer action with a plain-data patch (`current`, `stats`, `regions`, `flags`, `secondTermStart`, optional deterministic `rng`). The seeds themselves live in **`tests/fixtures/seeds.js`**, shared by the dev loader and the Playwright suite so a scenario is defined once.

The e2e suite (`tests/e2e/`, run with `npm run test:e2e`) runs against the Vite **dev** server because seeds are dev-only. It covers all seven scenarios above plus the seeded preliminary-Emancipation fixture (`?seed=emancipation_prelim`). The `SEED_GAME` action is generic state-patching — it carries no content-specific logic.

## 12. Content authoring rules

- New content goes in `src/content/`, never in engine files.
- Every new entry must pass `validate.js`. Run `npm run test` after adding content.
- Reference only ids that exist (advisors, regions, stats, flags). If introducing a new flag, document it in §6 of this file.
- Keep `text` concise (a short paragraph). Each choice needs a `reason` — it is player-facing in the info panel/recap, so write it as plain past-tense ("Released the envoys to avoid war with Britain").
- Historical flavor is welcome; real documented quotes are fine. Choices must allow divergence from history (sandbox), not just the "correct" answer.
- Balance is tuned by editing numbers in content, not logic. Expect a playtest-and-retune pass.

## 13. Current status / roadmap

- **MVP slice:** engine + map + full endgame logic + content for Mar–Aug 1861. ✅ Done.
- **Content batch 2:** Sept 1861 → mid-1863 (Trent Affair, Cameron→Stanton, the Emancipation chain, West Virginia statehood, supporting cabinet/Mary beats). ✅ **Integrated** — appended to `events/1861.js`, plus new `events/1862.js` and `events/1863.js`, all wired through `content/index.js`. The WV statehood beat drives the data-driven `FLAG_ACTIVATIONS` hook.
- **Random-event mechanic + pools:** ✅ **Done.** Seeded PRNG (`rngSeed`, engine/rng.js); `kind`/`weight` schema; scripted-precedence event slot with weighted-random fallback; occasional random advisor situations under an active-advisor cap. Content: `events/random_pool.js` (general wartime events, capped at the war's end) and ~2–3 recurring random situations per advisor in each `cabinet/<advisor>.js`.
- **1864 election:** ✅ **Done.** `events/1864.js` — Greeley/Niagara, the VP question (Johnson), Frémont/Blair, the Blind Memorandum, the Democratic nomination, the Fall of Atlanta, Sheridan in the Shenandoah, the soldier vote, and the Election-Day lead-in. Each sets a flag read by `endgame.js` `ELECTION_FLAG_MODIFIERS`.
- **Tooling:** ESLint flat config (`npm run lint`), Vitest unit suite, Playwright e2e (`npm run test:e2e`), `?seed=` debug seeding, GitHub Pages deploy (`deploy.yml`) and CI (`ci.yml`, runs lint + unit + build + e2e).
- **Remaining scripted gap:** authored *scripted* history still jumps from **mid-1863 to the June–Nov 1864 election beats**; the random pool keeps those months alive in the meantime. A future batch fills 1863–mid-1864 (Gettysburg, Vicksburg, the draft riots, Chattanooga, the Wilderness/Overland campaign, etc.).
- **Out of scope for now:** the `activeFighting` region overlay; content past the 1864 election; final portrait art (stylized map is real, portraits are placeholders).
