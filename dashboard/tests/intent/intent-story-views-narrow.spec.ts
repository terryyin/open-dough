// A selected story's views and Hide files / Show files ending their row
// (../../src/IntentStoryView.tsx) at a narrow width: every control stays
// within the page without widening it, Tab reaches the toggle after the
// views, Enter and Space work it, and Home and End choose along the views.
// The toggle's wide layout: ./intent-sidebar-toggle.spec.ts.

import { expectFilesShown, filesToggle } from "../intentModePage.ts";
import { box } from "../partArrangement.ts";
import { expect, test } from "../support/preparationPage.ts";
import {
  expectStoryTab,
  outsideCount,
  selectTakenStoryInIntent,
  storyTab,
} from "../support/intentStoryPage.ts";

test("narrow, a selected story's views and Hide files stay reachable by keyboard without widening the page", async ({
  page,
  origin,
}) => {
  const { intent } = await selectTakenStoryInIntent(page, origin);
  await page.setViewportSize({ width: 390, height: 760 });
  const width = await page.evaluate(() => document.documentElement.clientWidth);
  for (const control of [
    storyTab(intent, "CI comparison"),
    storyTab(intent, "Changed tests"),
    storyTab(intent, "Intent coverage"),
    filesToggle(intent),
    outsideCount(intent),
  ]) {
    await expect(control).toBeVisible();
    const at = await box(control);
    expect(at.x).toBeGreaterThanOrEqual(0);
    expect(at.x + at.width).toBeLessThanOrEqual(width);
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);

  await storyTab(intent, "Changed tests").focus();
  await page.keyboard.press("Tab");
  await expect(filesToggle(intent)).toBeFocused();
  await page.keyboard.press("Enter");
  await expectFilesShown(intent, false);
  await page.keyboard.press("Space");
  await expectFilesShown(intent, true);
  await storyTab(intent, "Changed tests").focus();
  await page.keyboard.press("Home");
  await expectStoryTab(intent, "CI comparison");
  await expect(storyTab(intent, "CI comparison")).toBeFocused();
  await page.keyboard.press("End");
  await expectStoryTab(intent, "Intent coverage");
  await expect(filesToggle(intent)).toHaveCount(0);
});
