// Hide files / Show files in Intent's reading-mode strip
// (../../src/IntentModeTabs.tsx, ../../src/FileBrowserToggle.tsx): hiding the
// locations column gives the reading pane the content width (narrow, the
// height under the strip), and the strip shows nothing of the summary;
// showing it returns the summary and tree as they were. The
// choice is kept with Intent's reading place (../../src/pageIntentReading.tsx)
// across modes and Development, and a project change shows the column again.

import type { Locator, Page } from "@playwright/test";
import { chooseProject, parts } from "../dashboardPage.ts";
import { ciPanel } from "../intentCiStatusPage.ts";
import {
  chooseOptimizationCandidates,
  expectFilesShown,
  filesToggle,
  intentModeBar,
  intentModeTab,
} from "../intentModePage.ts";
import { purposeRegion } from "../intentPerspectivePage.ts";
import { expect, test } from "../support/preparationPage.ts";
import {
  expandStorySummary,
  folderToggle,
  intentFile,
  selectTakenStoryInIntent,
  storyDisclosure,
  storyOnly,
} from "../support/intentStoryPage.ts";
import {
  changeWithDeepSpec,
  deepSpec,
  publishIntentTrunk,
} from "../support/intentStoryWorktree.ts";
import { openBacklog } from "../support/sessionDialog.ts";
import type { StartOrigin } from "../support/startOrigin.ts";

const column = (intent: Locator) => intent.locator(".intent-locations");
const readingPane = (intent: Locator) => intent.locator(".intent-reading");

async function box(element: Locator) {
  const found = await element.boundingBox();
  if (found === null) throw new Error("Not laid out.");
  return found;
}

// The reading pane spans the browser's whole width, and its whole height.
async function expectReadingFillsBrowser(intent: Locator) {
  const browser = await box(intent.locator(".intent-browser"));
  const pane = await box(readingPane(intent));
  expect(Math.abs(pane.width - browser.width)).toBeLessThanOrEqual(1);
  expect(Math.abs(pane.x - browser.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(pane.y + pane.height - (browser.y + browser.height)))
    // The browser's top border sits above the pane.
    .toBeLessThanOrEqual(1);
  expect(pane.y - browser.y).toBeLessThanOrEqual(1);
  return pane;
}

// Scrolls the tree partway, as the developer would, and returns the offset.
const scrollTree = (intent: Locator) =>
  column(intent).evaluate(
    (element) =>
      new Promise<number>((resolve) => {
        element.addEventListener(
          "scroll",
          () => {
            resolve(element.scrollTop);
          },
          { once: true },
        );
        element.scrollTo({
          top: Math.floor((element.scrollHeight - element.clientHeight) / 2),
        });
      }),
  );

// Intent with its locations published and no story selected.
async function openIntentWithoutStory(page: Page, origin: StartOrigin) {
  publishIntentTrunk(origin.project);
  await openBacklog(page, origin);
  const { intentChoice, intent } = parts(page);
  await intentChoice.click();
  await expect(ciPanel(intent)).toBeVisible();
  await expectFilesShown(intent, true);
  return intent;
}

test("Hide files gives the reading pane the width and the strip shows nothing of the summary; Show files returns the column as it was", async ({
  page,
  origin,
}) => {
  await page.setViewportSize({ width: 1280, height: 560 });
  const { intent } = await selectTakenStoryInIntent(
    page,
    origin,
    changeWithDeepSpec,
  );
  const purpose = purposeRegion(intent);
  await storyOnly(intent).check();
  await expandStorySummary(intent);
  await intentFile(intent, deepSpec).click();
  await expect(purpose.locator(".intent-story-diff-name")).toHaveText(deepSpec);
  const offset = await scrollTree(intent);
  expect(offset).toBeGreaterThan(20);
  const before = await box(readingPane(intent));

  await filesToggle(intent).click();
  await expectFilesShown(intent, false);
  const hidden = await expectReadingFillsBrowser(intent);
  expect(hidden.width).toBeGreaterThan(before.width);
  await expect(purpose.locator(".intent-story-diff-name")).toHaveText(deepSpec);
  // The strip shows nothing of the summary: no comparison state, Retry or
  // outside count.
  const bar = intentModeBar(intent);
  await expect(bar.getByRole("button")).toHaveCount(1);
  await expect(bar.getByRole("status")).toHaveCount(0);
  await expect(bar).toHaveText("IntentOptimization CandidatesShow files");

  await filesToggle(intent).click();
  await expectFilesShown(intent, true);
  await expect(storyDisclosure(intent)).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  await expect(storyOnly(intent)).toBeChecked();
  await expect(intentFile(intent, deepSpec)).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  for (const name of ["boundary", "deep"])
    await expect(folderToggle(intent, name, true)).toBeVisible();
  await expect
    .poll(() => column(intent).evaluate((element) => element.scrollTop))
    .toBe(offset);
  await expect(purpose.locator(".intent-story-diff-name")).toHaveText(deepSpec);
});

test("the hidden column stays hidden through Optimization Candidates and Development, and a project change shows it", async ({
  page,
  origin,
}) => {
  const { intent } = await selectTakenStoryInIntent(page, origin);
  await filesToggle(intent).click();
  await expectFilesShown(intent, false);

  await chooseOptimizationCandidates(intent);
  await expect(filesToggle(intent)).toHaveCount(0);
  await intentModeTab(intent, "Intent").click();
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
  await expectFilesShown(intent, true);
});

test("with no story, the toggle is reached by Tab after the tabs, works with Enter and Space, and CI status takes the width", async ({
  page,
  origin,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const intent = await openIntentWithoutStory(page, origin);

  await intentModeTab(intent, "Intent").focus();
  await page.keyboard.press("Tab");
  await expect(filesToggle(intent)).toBeFocused();
  await page.keyboard.press("Enter");
  await expectFilesShown(intent, false);
  await expect(intentModeBar(intent)).toHaveText(
    "IntentOptimization CandidatesShow files",
  );
  await expect(ciPanel(intent)).toBeVisible();
  await expectReadingFillsBrowser(intent);

  await expect(filesToggle(intent)).toBeFocused();
  await page.keyboard.press("Space");
  await expectFilesShown(intent, true);
});

test("narrow, the hidden column gives the reading pane the height under the strip", async ({
  page,
  origin,
}) => {
  await page.setViewportSize({ width: 640, height: 720 });
  const intent = await openIntentWithoutStory(page, origin);
  const browser = await box(intent.locator(".intent-browser"));
  const before = await box(readingPane(intent));
  expect(before.height).toBeLessThan(browser.height - 40);

  await filesToggle(intent).click();
  await expectFilesShown(intent, false);
  const pane = await expectReadingFillsBrowser(intent);
  expect(pane.height).toBeGreaterThan(before.height);
  const bar = await box(intentModeBar(intent));
  expect(pane.y).toBeGreaterThanOrEqual(bar.y + bar.height);
});
