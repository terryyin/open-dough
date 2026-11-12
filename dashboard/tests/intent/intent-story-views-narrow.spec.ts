// A selected story's views and Hide files / Show files ending their row
// (../../src/IntentPage.tsx) at a narrow width: every control stays
// within the page without widening it, Tab reaches the toggle after the
// views, Enter and Space work it, and Home and End choose along the views.
// The toggle's wide layout: ./intent-sidebar-toggle.spec.ts.

import {
  expectFilesShown,
  filesToggle,
  intentModeTab,
  intentPageFrame,
} from "../intentModePage.ts";
import { parts } from "../dashboardPage.ts";
import { ciPanel } from "../intentCiStatusPage.ts";
import { publishIntentTrunk } from "../support/intentStoryWorktree.ts";
import { openBacklog } from "../support/sessionDialog.ts";
import { box } from "../partArrangement.ts";
import {
  browserRevision,
  intentReadingPane,
} from "../intentPerspectivePage.ts";
import { twiceZoomedWindow, zoomedWindow } from "../accessibleReading.ts";
import { expect, test } from "../support/preparationPage.ts";
import {
  expectStoryTab,
  outsideCount,
  selectTakenStoryInIntent,
  storyTab,
  storyViews,
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

test("without a story the shared header, project views and reader fit narrow and short reading with keyboard controls", async ({
  page,
  origin,
}) => {
  publishIntentTrunk(origin.project);
  await openBacklog(page, origin);
  const { intentChoice, intent } = parts(page);
  await intentChoice.click();
  for (const viewport of [
    { width: 390, height: 560 },
    { width: 720, height: 460 },
    twiceZoomedWindow,
    zoomedWindow,
  ]) {
    await page.setViewportSize(viewport);
    await expect(
      intent.getByRole("heading", { name: "No story selected", exact: true }),
    ).toBeVisible();
    await expect(intentPageFrame(intent)).toHaveAttribute(
      "data-intent-context",
      "project",
    );
    await expect(storyViews(intent)).toHaveCount(0);
    const width = await page.evaluate(
      () => document.documentElement.clientWidth,
    );
    for (const control of [
      browserRevision(intent),
      intentModeTab(intent, "CI status"),
      intentModeTab(intent, "Optimization Candidates"),
      filesToggle(intent),
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
    await intentModeTab(intent, "CI status").focus();
    await page.keyboard.press("Tab");
    await expect(filesToggle(intent)).toBeFocused();
    await page.keyboard.press("Enter");
    await expectFilesShown(intent, false);
    await expect(ciPanel(intent)).toBeVisible();
    const reading = await box(intentReadingPane(intent));
    expect(reading.height).toBeGreaterThan(viewport.height <= 256 ? 30 : 100);
    await page.keyboard.press("Space");
    await expectFilesShown(intent, true);
    await intentModeTab(intent, "CI status").press("End");
    await expect(
      intentModeTab(intent, "Optimization Candidates"),
    ).toBeFocused();
    await expect(filesToggle(intent)).toHaveCount(0);
    await page.keyboard.press("Home");
    await expect(intentModeTab(intent, "CI status")).toBeFocused();
    await expect(ciPanel(intent)).toBeVisible();
  }
});
