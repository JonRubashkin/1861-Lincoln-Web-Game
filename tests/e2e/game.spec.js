import { test, expect } from '@playwright/test';

// The seven maintained scenarios from CLAUDE.md §11, plus the batch-2 note-3
// Emancipation fixture. Endgame and mid-game states are reached via the dev-only
// `?seed=` mechanism rather than by playing dozens of turns.

async function dialValue(page, stat) {
  const text = await page.getByTestId(`dial-value-${stat}`).textContent();
  return Number(text);
}

// In months with no scripted beat, a pooled random event now opens the turn. For
// cabinet-phase tests we resolve whatever event leads, then proceed to the cabinet.
async function clearLeadingEvent(page) {
  const modal = page.getByTestId('event-modal');
  if (await modal.count()) {
    await page.getByTestId('choice-0').click();
    await expect(modal).toHaveCount(0);
  }
}

test('1. cold load renders March 1861 with dials visible and security hidden', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByTestId('month')).toHaveText('March 1861');
  await expect(page.getByTestId('dial-unionMorale')).toBeVisible();
  await expect(page.getByTestId('dial-treasury')).toBeVisible();
  // Security dial is locked until the Baltimore Plot.
  await expect(page.getByTestId('dial-security')).toHaveCount(0);
  // The March 1861 opening event (inauguration) is staged on a fresh game.
  await expect(page.getByTestId('event-modal')).toHaveAttribute('data-entry', 'event_inauguration');
});

test('2. a cabinet decision moves the relevant dial', async ({ page }) => {
  await page.goto('./?seed=cabinet_map'); // Aug 1861
  await clearLeadingEvent(page);
  const before = await dialValue(page, 'treasury');
  await page.getByTestId('portrait-chase').click();
  await expect(page.getByTestId('decision-modal')).toBeVisible();
  await page.getByTestId('choice-0').click(); // greenbacks: treasury +18
  await expect(page.getByTestId('decision-modal')).toHaveCount(0);
  expect(await dialValue(page, 'treasury')).toBeGreaterThan(before);
});

test('3. End Turn advances the month and fires the monthly event', async ({ page }) => {
  await page.goto('./');
  await page.getByTestId('choice-1').click(); // resolve inauguration
  await expect(page.getByTestId('event-modal')).toHaveCount(0);
  await page.getByTestId('end-turn').click();
  await expect(page.getByTestId('month')).toHaveText('April 1861');
  await expect(page.getByTestId('event-modal')).toHaveAttribute('data-entry', 'event_fort_sumter');
});

test('4. a region choice changes the map tier and is attributed in the info panel', async ({ page }) => {
  await page.goto('./?seed=cabinet_map'); // Maryland parked at +30 (contested)
  await clearLeadingEvent(page);
  await expect(page.getByTestId('region-maryland')).toHaveAttribute('data-band', 'contested');
  await page.getByTestId('portrait-blair').click();
  await page.getByTestId('choice-1').click(); // "secure the rail lines" -> Maryland +18
  await expect(page.getByTestId('region-maryland')).toHaveAttribute('data-band', 'union');
  // Open the info panel for the change + its reason string.
  await page.getByTestId('region-maryland').click();
  const panel = page.locator('.info-panel');
  await expect(panel).toContainText('+18');
  await expect(panel).toContainText('Secured Maryland');
});

test('5. the Security dial unlocks after the Baltimore Plot', async ({ page }) => {
  await page.goto('./?seed=pre_baltimore'); // May 1861 -> Baltimore Plot event
  await expect(page.getByTestId('dial-security')).toHaveCount(0);
  await expect(page.getByTestId('event-modal')).toHaveAttribute('data-entry', 'event_baltimore_plot');
  await page.getByTestId('choice-0').click(); // accept a guard detail -> security_unlocked
  await expect(page.getByTestId('dial-security')).toBeVisible();
});

test('6. state persists across a reload', async ({ page }) => {
  await page.goto('./');
  await page.getByTestId('choice-1').click(); // firm line: unionMorale +8 (55 -> 63)
  const morale = await dialValue(page, 'unionMorale');
  expect(morale).toBe(63);
  await page.reload();
  await expect(page.getByTestId('month')).toHaveText('March 1861');
  expect(await dialValue(page, 'unionMorale')).toBe(morale);
  // We resumed in the cabinet phase, not back at the opening event.
  await expect(page.getByTestId('event-modal')).toHaveCount(0);
});

test('7a. the 1864 election checkpoint can end the presidency (loss)', async ({ page }) => {
  await page.goto('./?seed=election_1864_lose');
  // Election Day lead-in fires first, then the checkpoint resolves on resolution.
  await expect(page.getByTestId('event-modal')).toHaveAttribute('data-entry', 'election_day_1864');
  await page.getByTestId('choice-0').click();
  await expect(page.getByTestId('epilogue')).toHaveAttribute('data-kind', 'curtailed');
});

test('7a-win. a strong 1864 record wins a second term (no epilogue)', async ({ page }) => {
  await page.goto('./?seed=election_1864_win');
  await expect(page.getByTestId('event-modal')).toHaveAttribute('data-entry', 'election_day_1864');
  await page.getByTestId('choice-0').click();
  // Survived the checkpoint: the game continues into the second term.
  await expect(page.getByTestId('epilogue')).toHaveCount(0);
  await expect(page.getByTestId('month')).toHaveText('November 1864');
  await expect(page.getByTestId('dial-unionMorale')).toBeVisible();
});

test('7b. a catastrophic loss can fire', async ({ page }) => {
  await page.goto('./?seed=catastrophic');
  await expect(page.getByTestId('epilogue')).toHaveAttribute('data-kind', 'catastrophic');
});

test('7c. the second-term assassination hazard can fire', async ({ page }) => {
  await page.goto('./?seed=assassination');
  await expect(page.getByTestId('epilogue')).toHaveAttribute('data-kind', 'full');
  await expect(page.getByTestId('epilogue-title')).toContainText('Martyr');
});

test('8. the preliminary Emancipation Proclamation fires from the seeded fixture', async ({ page }) => {
  await page.goto('./?seed=emancipation_prelim'); // Sept 1862, drafted + Antietam pre-set
  await expect(page.getByTestId('event-modal')).toHaveAttribute(
    'data-entry',
    'preliminary_emancipation_1862'
  );
});

test('9. the Fall of Atlanta fires at Sept 1864 and its morale swing lands', async ({ page }) => {
  await page.goto('./?seed=atlanta_1864');
  await expect(page.getByTestId('event-modal')).toHaveAttribute('data-entry', 'atlanta_1864');
  const before = await dialValue(page, 'unionMorale');
  await page.getByTestId('choice-0').click(); // proclaim thanksgiving: morale +18
  expect(await dialValue(page, 'unionMorale')).toBeGreaterThan(before);
});
