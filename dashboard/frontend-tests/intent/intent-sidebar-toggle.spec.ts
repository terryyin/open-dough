import { selectTakenStoryInIntent } from "../../tests/support/frontendIntentVisits.ts";
// Hide files / Show files (../../src/FileBrowserToggle.tsx) in Project
// Intent's strip on CI status (../../src/IntentPage.tsx), or ending a
// selected story's view row on Changed tests
// (../../src/intentStoryTabs.tsx): hiding the locations column gives the
// reading pane the content width (narrow, the height under the strip), with
// the story's header still above it; showing it returns the tree as it was,
// also after visiting the story's other views. Each scope keeps its own
// choice with Intent's reading place (../../src/pageIntentReading.tsx) across
// views, a visit to the other scope and Development, and a project change
// shows the column again. A narrow
// selected story's view row: ../../frontend-tests/intent/intent-story-views-narrow.spec.ts.

import type { Locator, Page } from "@playwright/test";
import { box } from "../../tests/partArrangement.ts";
import { storyA } from "../../../Distribution/tests/support/queued-repository.mjs";
import { chooseProject, parts } from "../../tests/dashboardPage.ts";
import { ciPanel } from "../../tests/intentCiStatusPage.ts";
import {
  chooseOptimizationCandidates,
  expectFilesShown,
  filesToggle,
  intentModeBar,
  intentModeTab,
  openProjectIntent,
  returnToStory,
  storyViewBar,
  filesScroll,
  scrollFilesHalfway,
  intentBrowser,
} from "../../tests/intentModePage.ts";
import {
  fileReadingTab,
  proofRegion,
} from "../../tests/intentPerspectivePage.ts";
import { intentReadingPane } from "../../tests/intentReadingPlacePage.ts";
import { expect, test } from "../../tests/support/frontendApp.ts";
import {
  chooseStoryTab,
  expectStoryTab,
  folderToggle,
  intentFile,
  storyOnly,
  storySummary,
  storyTitle,
  storyViews,
  intentDiffReading,
} from "../../tests/support/intentStoryPage.ts";
import { deepSpec } from "../../tests/support/intentStoryWorktree.ts";
import type { FrontendServiceState } from "../../tests/support/frontendServiceState.ts";
import { putFrontendIntentStory } from "../../tests/support/frontendIntentStory.ts";
import { answerFrontendIntentCi } from "../../tests/support/frontendIntentCi.ts";
import { openUntilRead } from "../../tests/pageRequestNotes.ts";

// The reading pane spans the browser's whole width, and its whole height.
async function expectReadingFillsBrowser(intent: Locator) {
  const browser = await box(intentBrowser(intent));
  const pane = await box(intentReadingPane(intent));
  expect(Math.abs(pane.width - browser.width)).toBeLessThanOrEqual(1);
  expect(Math.abs(pane.x - browser.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(pane.y + pane.height - (browser.y + browser.height)))
    // The browser's top border sits above the pane.
    .toBeLessThanOrEqual(1);
  expect(pane.y - browser.y).toBeLessThanOrEqual(1);
  return pane;
}

// Intent with its locations published and no story selected.
async function openIntentWithoutStory(
  page: Page,
  services: FrontendServiceState,
) {
  putFrontendIntentStory(services);
  await answerFrontendIntentCi(page, services.revision);
  await openUntilRead(page, "/?project=open-dough&perspective=intent");
  const { intent } = parts(page);
  await expect(ciPanel(intent)).toBeVisible();
  await expectFilesShown(intent, true);
  return intent;
}

test("Hide files gives the reading pane the width under the story's header; after the other views, Show files returns the column, test and Proof as they were", async ({
  page,
  frontendServices,
}) => {
  await page.setViewportSize({ width: 1280, height: 560 });
  const { intent } = await selectTakenStoryInIntent(page, frontendServices);
  await storyOnly(intent).check();
  await intentFile(intent, deepSpec).click();
  await expect(intentDiffReading(intent).name).toHaveText(deepSpec);
  const proofTab = fileReadingTab(intent, "Proof");
  await proofTab.click();
  await expect(proofRegion(intent)).toBeVisible();
  const offset = await scrollFilesHalfway(intent);
  expect(offset).toBeGreaterThan(20);
  const before = await box(intentReadingPane(intent));

  // The toggle ends the story's view row, after the tabs.
  const bar = storyViewBar(intent);
  const toggleBox = await box(filesToggle(intent));
  const tabsBox = await box(storyViews(intent));
  const barBox = await box(bar);
  expect(toggleBox.x).toBeGreaterThan(tabsBox.x + tabsBox.width);
  expect(
    Math.abs(toggleBox.x + toggleBox.width - (barBox.x + barBox.width)),
  ).toBeLessThanOrEqual(32);
  await expect(intentModeBar(intent).getByRole("button")).toHaveCount(0);

  await filesToggle(intent).click();
  await expectFilesShown(intent, false);
  const hidden = await expectReadingFillsBrowser(intent);
  expect(hidden.width).toBeGreaterThan(before.width);
  await expect(proofRegion(intent)).toBeVisible();
  // The header stays above the full-width reader.
  const header = await box(storySummary(intent));
  expect(hidden.y).toBeGreaterThanOrEqual(header.y + header.height);

  for (const view of ["Intent coverage", "CI comparison"] as const) {
    await chooseStoryTab(intent, view);
    await expect(filesToggle(intent)).toHaveCount(0);
    await expect(intentReadingPane(intent)).toBeHidden();
    await chooseStoryTab(intent, "Changed tests");
    await expectFilesShown(intent, false);
    await expect(proofRegion(intent)).toBeVisible();
  }

  await filesToggle(intent).click();
  await expectFilesShown(intent, true);
  await expect(storyOnly(intent)).toBeChecked();
  await expect(intentFile(intent, deepSpec)).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  for (const name of ["boundary", "deep"])
    await expect(folderToggle(intent, name, true)).toBeVisible();
  await expect.poll(() => filesScroll(intent)).toBe(offset);
  await expect(proofTab).toHaveAttribute("aria-selected", "true");
});

test("the hidden column stays hidden through a Project Intent visit, which keeps its own choice, and Development, and a project change shows it", async ({
  page,
  frontendServices,
}) => {
  const { intent } = await selectTakenStoryInIntent(page, frontendServices);
  await filesToggle(intent).click();
  await expectFilesShown(intent, false);

  // Project Intent's column is its own, still shown.
  await openProjectIntent(intent);
  await expectFilesShown(intent, true);
  await chooseOptimizationCandidates(intent);
  await expect(filesToggle(intent)).toHaveCount(0);
  await returnToStory(intent);
  await expectStoryTab(intent, "Changed tests");
  await expectFilesShown(intent, false);

  const { development, intentChoice } = parts(page);
  await development.click();
  await expect(intent).toHaveCount(0);
  await intentChoice.click();
  await expectFilesShown(intent, false);

  // Without locations, the explanation in their place offers no toggle.
  await chooseProject(page, "Doughnut");
  await expect(intent).toContainText(
    "No intent locations are configured for Doughnut.",
  );
  await expect(filesToggle(intent)).toHaveCount(0);
  await chooseProject(page, "Open Dough");
  // The restored story replaces the temporary header while its work is read.
  await expect(storyTitle(intent)).toHaveText(storyA.title);
  await chooseStoryTab(intent, "Changed tests");
  await expectFilesShown(intent, true);
});

test("with no story, the toggle is reached by Tab after the tabs, works with Enter and Space, and CI status takes the width", async ({
  page,
  frontendServices,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const intent = await openIntentWithoutStory(page, frontendServices);

  await intentModeTab(intent, "CI status").focus();
  await page.keyboard.press("Tab");
  await expect(filesToggle(intent)).toBeFocused();
  await page.keyboard.press("Enter");
  await expectFilesShown(intent, false);
  await expect(intentModeBar(intent).getByRole("tab")).toHaveText([
    "CI status",
    "Optimization Candidates",
  ]);
  await expect(filesToggle(intent)).toHaveAccessibleName("Show files");
  await expect(ciPanel(intent)).toBeVisible();
  await expectReadingFillsBrowser(intent);

  await expect(filesToggle(intent)).toBeFocused();
  await page.keyboard.press("Space");
  await expectFilesShown(intent, true);
});

test("narrow, the hidden column gives the reading pane the height under the strip", async ({
  page,
  frontendServices,
}) => {
  await page.setViewportSize({ width: 640, height: 720 });
  const intent = await openIntentWithoutStory(page, frontendServices);
  const browser = await box(intentBrowser(intent));
  const before = await box(intentReadingPane(intent));
  expect(before.height).toBeLessThan(browser.height - 40);

  await filesToggle(intent).click();
  await expectFilesShown(intent, false);
  const pane = await expectReadingFillsBrowser(intent);
  expect(pane.height).toBeGreaterThan(before.height);
  const bar = await box(intentModeBar(intent));
  expect(pane.y).toBeGreaterThanOrEqual(bar.y + bar.height);
});
