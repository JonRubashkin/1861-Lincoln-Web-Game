# Lincoln: A Presidency

A browser-based, turn-based decision game about Abraham Lincoln's presidency. You
advise with your Cabinet, make personal-life choices, watch a stylized map of the
Civil War shift in response, and end each turn (one month) to face a historical or
counterfactual event. It is a **sandbox** — your choices can diverge from real
history — running from March 1861 to at most the 1868 election results, with the 1864
election as a mandatory checkpoint and a chance-based assassination hazard in the
second term.

Built with **React + Vite**, no backend. State lives in the browser; saves use
`localStorage`. Deploys as static files to **GitHub Pages**.

---

## Running, building, deploying

```bash
npm install
npm run dev       # local dev server
npm run build     # production build to dist/
npm run preview   # preview the production build
npm run lint      # ESLint
npm test          # engine + content unit tests (Vitest)
npm run test:e2e  # end-to-end tests (Playwright, runs against the dev server)
```

> **Playwright browsers:** the first e2e run downloads a Chromium build
> (`npx playwright install chromium`). CI does this automatically. In sandboxes
> that ship a pre-installed Chromium at `/opt/pw-browsers/chromium`, the config
> uses it directly — no download needed.

### GitHub Pages

`vite.config.js` sets `base: '/1861-Lincoln-Web-Game/'` so the project site resolves
under `https://<user>.github.io/1861-Lincoln-Web-Game/`. **If the repository is
renamed, update `base` to match.**

Deployment is automated by `.github/workflows/deploy.yml`: every push to `main`
builds the site and publishes it via GitHub Actions. Enable it once under
**Settings → Pages → Build and deployment → Source: GitHub Actions**.

---

## Architecture (the one rule that matters)

The **engine** (`src/engine/`) is fully separated from the **content**
(`src/content/`). The engine knows nothing about specific advisors or events; it only
knows the schema. **Adding content never requires touching engine logic.**

```
src/engine/
  state.js      initial state factory, dial metadata, calendar helpers
  effects.js    THE ONLY place that mutates stats/regions/flags + writes the change log
  triggers.js   which decisions/events qualify this month
  reducer.js    pure turn-loop transitions (apply effects, advance the month)
  endgame.js    catastrophes, 1864 election, assassination hazard, 1868 backstop, grading
  validate.js   validates content against the schema on load (warns, never crashes)
src/content/
  regions.js          regions + starting control values
  cabinet/*.js        one module per advisor
  events/1861.js      calendar-anchored events (1861)
  events/1862.js      calendar-anchored events (1862) — incl. the Emancipation chain
  events/1863.js      calendar-anchored events (1863) — final Proclamation, WV statehood
  events/thresholds.js state-triggered (non-calendar) events
  index.js            aggregates all content + the Cabinet roster, runs validation
src/ui/               React components (Cabinet, Map, InfoPanel, Dials, modal, epilogue)
```

Three principles are baked in:

1. **Everything is a number; tiers are derived.** Dials (0–100) and region control
   (−100..+100) are stored as numbers. Display categories ("Union-controlled",
   "contested") are computed from bands at render time (`src/ui/bands.js`), never
   stored.
2. **Attributed effects.** Every numeric change is logged in `state.changeLog` with
   `{ month, target, delta, cause, reason }`. The map info panel reads from this log.
   `effects.js` is the single writer.
3. **One schema for decisions and events.** An event is just an entry whose `advisor`
   field is `"event"`.

---

## The dials (global stats)

Range 0–100; clamped after every effect. Higher is better for all of them.

| Dial (`id`)              | Start | Meaning |
|--------------------------|-------|---------|
| `unionMorale`            | 55    | Home-front will; the election currency |
| `congressionalRelations` | 50    | Standing with Congress, esp. Radical Republicans |
| `borderStates`           | 40    | Political pressure gauge for the slave states that stayed |
| `treasury`               | 50    | Ability to finance the war |
| `internationalStanding`  | 55    | Britain/France recognition risk |
| `warEffort`              | 45    | Army readiness/momentum |
| `maryPersonal`           | 60    | Personal life / home front with Mary |
| `security`               | hidden | Personal safety. **Hidden until the `security_unlocked` flag is set** (the Baltimore Plot event). Then it appears, starting ~50. Drives the second-term assassination hazard. |

---

## The map (regions)

Region control is a number from **−100 (fully Confederate) to +100 (fully Union)**.
Display tiers come from global bands:

| Band            | Condition          |
|-----------------|--------------------|
| Union-controlled | `control > 33`    |
| Contested        | `-33 ≤ control ≤ 33` |
| Confederate      | `control < -33`   |

- `active: false` regions are **dormant** (e.g. West Virginia before 1863) and render
  neutral. Setting the `west_virginia_active` flag activates it structurally (the
  engine flips `active` and seeds control; the SVG geometry never changes).
- `isTerritory: true` regions render with a lighter, dashed style.

### How region ids map to SVG paths

The map geometry is data-driven in `src/ui/mapLayout.js`. Each region id maps to a set
of grid cells `[col, row]`; `cellsToPath()` traces the outline of the merged cells.
A region's `id` in `content/regions.js` **must** have a matching key in `LAYOUT`
(and an entry in `ABBREV` for its label). To reshape a state, edit its cell list — no
hand-drawn path coordinates required.

---

## Content schema

Decisions and events share one format. Drop entries into a `cabinet/*.js` or
`events/*.js` module; `content/index.js` aggregates and validates them.

```js
{
  id: 'unique_id',              // required, unique
  advisor: 'seward',            // a Cabinet/advisor id, OR 'event' for the monthly event
  oncePerGame: true,            // default true; if false, may recur after `cooldown`
  cooldown: 0,                  // months before recurrence (ignored if oncePerGame)
  priority: 10,                 // higher wins when several events qualify the same month
  triggers: {
    earliestMonth: '1861-04',   // optional, "YYYY-MM"
    latestMonth: '1861-08',     // optional
    conditions: [               // optional; ALL must hold
      { target: 'stat:treasury',        op: 'below', value: 30 },
      { target: 'region:kentucky',      op: 'above', value: 0 },
      { target: 'flag:security_unlocked', op: 'isSet' },
    ],
  },
  text: 'The situation you face…',
  choices: [
    {
      label: 'What the player clicks',
      reason: 'Past-tense phrase shown in the change log / info panel',
      effects: {
        stats:   { unionMorale: -8, treasury: +12 }, // deltas, applied + clamped
        regions: { kentucky: +15 },                  // control deltas
        flags:   { set: ['some_flag'], clear: ['other_flag'] },
      },
      followUp: null,            // optional id of a decision FORCED next month
    },
  ],
}
```

**Condition ops:** `above`, `below`, `equals`, `isSet`, `notSet`.
**Condition / effect targets:** `stat:<id>`, `region:<id>`, `flag:<name>`.

### Adding a Cabinet decision

1. Open the advisor's module (e.g. `src/content/cabinet/chase.js`) and add an entry
   with `advisor: '<that advisor id>'`.
2. Give it a `triggers` window/conditions so it surfaces when you want. The advisor's
   portrait becomes active in any month one of their decisions qualifies.
3. Cabinet decisions are **skippable** — the player can end the turn without consulting
   everyone. A decision named in another choice's `followUp` is **forced** the next
   month and blocks End Turn until answered.

### Adding an event

Same schema, but `advisor: 'event'`. Put calendar-anchored events in
`events/1861.js` (use `earliestMonth`/`latestMonth`) and state-triggered ones in
`events/thresholds.js` (use `conditions`, no calendar window). Exactly **one** event
fires per month: the highest-`priority` qualifying entry. Keep anchor events at high
priority (90–100) so they outrank threshold events.

### Adding a new advisor

Add a module under `cabinet/`, import it in `content/index.js`, and add a roster entry
to `ADVISORS` there (`{ id, name, title, portrait }`). Real portraits are a one-line
change: set `portrait` to an image URL; otherwise a labeled placeholder is generated.

---

## Turn loop

1. State-of-the-nation readout (dials + recent map shifts).
2. **Cabinet phase** — only advisors with a qualifying decision are clickable.
3. **Mary phase** — same mechanism, via her portrait.
4. The **map** is viewable any time; click a region for its info panel (display only —
   no decisions are made from the map).
5. **End Turn** (enabled once any forced follow-ups are answered).
6. The calendar advances one month and the month's **event** fires.
7. **Endgame evaluation** runs (see `endgame.js`): catastrophic checks any month, the
   1864 election checkpoint, the second-term assassination hazard (ramping, modulated
   by `security`), and the 1868 backstop. Endings are graded and read entirely from
   final state.

---

## Debug seeding (dev only)

Reaching 1864 by hand for every test is untenable, so a dev-only seed mechanism jumps
straight to a scenario: append `?seed=<name>` to the URL while running `npm run dev`.
Seeds are plain-data state patches defined in **`tests/fixtures/seeds.js`** (shared with
the Playwright suite) and applied via the generic `SEED_GAME` action. The loader is
gated behind `import.meta.env.DEV`, so it is stripped from production builds.

Available seeds: `pre_baltimore`, `cabinet_map`, `emancipation_prelim`, `election_1864`,
`assassination`, `catastrophic`. Example: `…/?seed=emancipation_prelim` opens directly
on the Preliminary Emancipation Proclamation.

## Content scope

Authored content currently runs **March 1861 → mid-1863**: the March–August 1861 slice
plus content batch 2 (the Trent Affair, Cameron→Stanton, the full Emancipation chain,
West Virginia statehood, and supporting cabinet/Mary beats). The **complete endgame
logic** — catastrophes, the 1864 election checkpoint, the ramping second-term
assassination hazard, and the 1868 backstop — is implemented and unit-tested even
though the authored timeline doesn't yet reach it. The rest of the presidency is added
later against this locked schema, purely as content.
