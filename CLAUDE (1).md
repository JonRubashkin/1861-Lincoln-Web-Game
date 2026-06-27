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

String set for unlocks and non-repeating story state (`security_unlocked`, `west_virginia_active`, `stanton_replaces_cameron`, `emancipation_drafted`, `emancipation_issued`, `antietam_victory`, `washington_captured`, `foreign_intervention`, …).

### Change log

`{ month, target: "stat:<id>"|"region:<id>", delta, cause: <choice/event id>, reason: <string> }`. Info panel filters by `region:<id>` and most-recent month.

### Calendar

`current: { year, month }`, start `1861-03`. Compare as `"YYYY-MM"`.

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
  priority: 10,                   // higher wins when several qualify the same month
  text: "...",
  choices: [
    { label: "...", reason: "...",          // reason feeds the change log
      effects: { stats:{}, regions:{}, flags:{ set:[], clear:[] } },
      followUp: null }            // optional id forced NEXT month (use only for true next-month chains)
  ]
}
```

Condition ops: `above`, `below`, `equals`, `isSet`, `notSet`. Targets: `stat:<id>`, `region:<id>`, `flag:<name>`.

**Trigger resolution per month:** gather all entries passing calendar window + all conditions + not on cooldown + not already used (if `oncePerGame`). An advisor's portrait is active only if ≥1 of their decisions qualifies (drives "subset of advisors has business this month"). The monthly event = highest-`priority` qualifying `advisor:"event"` entry.

## 8. Turn loop

Status readout → cabinet phase (active portraits only) → Mary phase → map viewable/clickable throughout → **End Turn** (cabinet decisions skippable; unconsulted advisors pass) → advance month → event fires → `endgame.js` evaluation → repeat.

## 9. Endgame evaluation order (each month, after event)

1. **Catastrophic (any month):** `washington_captured` or `foreign_intervention` flag, or `unionMorale` == 0 → graded catastrophic epilogue.
2. **1864-11 checkpoint:** election score = weighted blend (unionMorale dominant, + warEffort, congressionalRelations, Union/Confederate map ratio). Below threshold → election-loss epilogue (first term graded). Else second term begins.
3. **Assassination hazard (1865-03+):** per-month probability ending in a graded epilogue. ~2-month grace period, then a **ramping** base rate scaled by `(100 - security)`. ≥1 security decision must surface before it gets dangerous. Post-war celebration moments may spike it.
4. **1868-11 backstop:** if no assassination, end at 1868 results with a full-presidency graded epilogue. No third term.

Epilogue templates: curtailed-first-term (election loss), fuller-presidency (assassination/1868), catastrophic. All read from final state; **death is not a "you lose" screen** — it honors the presidency built.

## 10. Engine conventions & gotchas

- **`effects.js` is the only writer to `changeLog`.** It mutates stats/regions/flags, clamps 0–100 (dials) / −100..+100 (regions), and writes one log entry per target touched, with `cause` = choice/event id and `reason` = the choice's `reason`.
- **Special flag → region activation.** When `west_virginia_active` becomes set, the engine sets the `west_virginia` region `active:true, control:+40`. Handle this as a general "flag activates region" hook keyed by data, not a hardcoded special case — future statehood/territory promotions reuse it.
- **Transient flags.** Some flags represent a *window* (e.g. `antietam_victory` gating the proclamation). Flags are sticky by default. If a flag should expire, give it an explicit clear (via a later choice's `flags.clear`, or a small TTL mechanism). Document any window flag where it's set. Currently `antietam_victory` is intentionally sticky (the window stays open once the victory is won).
- **`validate.js` runs on content load:** required fields, referenced advisor/region/stat/flag ids resolve, valid ops. Warn (don't crash) on malformed entries; surface warnings in dev console.
- Reducer transitions are **pure** and unit-tested.
- Save/load round-trips the *entire* state (calendar, stats, regions, flags, full changeLog, used-decision ids). Include new-game reset.

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
Playing 40 turns to reach 1864 in every test is untenable. Add a **dev-only scenario-seed mechanism** — e.g. a `?seed=` URL param or a debug panel (excluded from production builds) that sets calendar, stats, regions, and flags directly. Endgame e2e tests use this to jump to the relevant month/state. Keep seeds in a `tests/fixtures/` file so scenarios are reproducible.

## 12. Content authoring rules

- New content goes in `src/content/`, never in engine files.
- Every new entry must pass `validate.js`. Run `npm run test` after adding content.
- Reference only ids that exist (advisors, regions, stats, flags). If introducing a new flag, document it in §6 of this file.
- Keep `text` concise (a short paragraph). Each choice needs a `reason` — it is player-facing in the info panel/recap, so write it as plain past-tense ("Released the envoys to avoid war with Britain").
- Historical flavor is welcome; real documented quotes are fine. Choices must allow divergence from history (sandbox), not just the "correct" answer.
- Balance is tuned by editing numbers in content, not logic. Expect a playtest-and-retune pass.

## 13. Current status / roadmap

- **MVP slice:** engine + map + full endgame logic + content for Mar–Aug 1861.
- **Content batch 2:** Sept 1861 → mid-1863 (Trent Affair, Cameron→Stanton, the Emancipation chain, West Virginia statehood, supporting cabinet/Mary beats). See the batch-2 content doc; merge into `events/1861.js`, new `events/1862.js`, new `events/1863.js`.
- **Out of scope for now:** the `activeFighting` region overlay; content past mid-1863; final portrait art (stylized map is real, portraits are placeholders).
