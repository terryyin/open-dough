// Intent's reading place is kept by the page for the project
// (../../src/pageIntentReading.tsx): with a selected Taken story
// (../support/intentStoryWorktree.ts) that also adds a long spec two folders
// deep, that file selected, "Selected story only" on, a folder collapsed by
// hand and Purpose scrolled show the same after the story's other views
// (../../src/intentStoryTabs.tsx), and after Development and back on the same
// Changed tests view, and the return reads neither the locations nor the
// file's diff or text again (../../src/answerMemo.ts). Another project shows
// none of it, and choosing the project again starts its reading afresh, at
// the story's CI comparison.

import type { Locator, Page } from "@playwright/test";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import {
  storyReviewFileEndpoint,
  storyReviewFileTextEndpoint,
} from "../../src/storyReviewContract.ts";
import { chooseProject, parts } from "../dashboardPage.ts";
import { ciPanel } from "../intentCiStatusPage.ts";
import { intentGroupToggle, purposeRegion } from "../intentPerspectivePage.ts";
import { expect, test } from "../support/preparationPage.ts";
import {
  chooseStoryTab,
  expectStoryTab,
  folderToggle,
  intentFile,
  selectTakenStoryInIntent,
  storyOnly,
} from "../support/intentStoryPage.ts";
import {
  changeWithDeepSpec,
  deepSpec,
} from "../support/intentStoryWorktree.ts";

// The page's reads, from now on, of Intent's locations, of published text in
// a location, and of a story file's diff and texts.
function intentReads(page: Page) {
  const reads: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    const path = url.searchParams.get("path") ?? "";
    if (url.pathname === authenticatedReadEndpoint) {
      if (url.searchParams.get("intent") === "locations")
        reads.push("locations");
      else if (path.startsWith("dashboard/tests/") || path.startsWith("tests/"))
        reads.push(`text ${path}`);
    }
    if (
      url.pathname === storyReviewFileEndpoint ||
      url.pathname === storyReviewFileTextEndpoint
    )
      reads.push(`story ${path}`);
  });
  return reads;
}

const readingPane = (intent: Locator) => intent.locator(".intent-reading");
const scrollOf = (intent: Locator) =>
  readingPane(intent).evaluate((element) => element.scrollTop);

// The deep spec selected with "Selected story only" on and `out` collapsed by
// hand, its diff shown and Purpose scrolled halfway, as the developer would.
// Proof stays on its own tab, so settling comparison no longer changes the
// Purpose reading pane's height.
async function readDeepSpec(intent: Locator) {
  const purpose = purposeRegion(intent);
  await storyOnly(intent).check();
  await folderToggle(intent, "out", true).click();
  await intentFile(intent, deepSpec).click();
  await expect(purpose.locator(".intent-story-diff-name")).toHaveText(deepSpec);
  await expect(purpose.locator(".story-review-code")).toHaveAttribute(
    "aria-busy",
    "false",
  );
  const offset = await readingPane(intent).evaluate(
    (element) =>
      new Promise<number>((resolve) => {
        const most = element.scrollHeight - element.clientHeight;
        if (most < 40) {
          resolve(0);
          return;
        }
        element.addEventListener(
          "scroll",
          () => {
            resolve(element.scrollTop);
          },
          { once: true },
        );
        element.scrollTo({ top: Math.floor(most / 2) });
      }),
  );
  expect(offset).toBeGreaterThan(20);
  return offset;
}

test("a file selected two folders deep, with Selected story only and Purpose scrolled, is shown the same after Development and back without reading again", async ({
  page,
  origin,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const { intent } = await selectTakenStoryInIntent(
    page,
    origin,
    changeWithDeepSpec,
  );
  const offset = await readDeepSpec(intent);

  const reads = intentReads(page);
  for (const view of ["CI comparison", "Intent coverage"] as const) {
    await chooseStoryTab(intent, view);
    await expect(readingPane(intent)).toBeHidden();
    await chooseStoryTab(intent, "Changed tests");
    await expect.poll(() => scrollOf(intent)).toBe(offset);
  }
  const { development, intentChoice } = parts(page);
  await development.click();
  await expect(intent).toHaveCount(0);
  await intentChoice.click();
  await expectStoryTab(intent, "Changed tests");

  const purpose = purposeRegion(intent);
  await expect(storyOnly(intent)).toBeChecked();
  await expect(intentFile(intent, deepSpec)).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(purpose.locator(".intent-story-diff-name")).toHaveText(deepSpec);
  await expect(purpose.locator(".story-review-code")).toHaveAttribute(
    "aria-busy",
    "false",
  );
  await expect(intentGroupToggle(intent, "dashboard/tests")).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  for (const name of ["boundary", "deep", "arriving"])
    await expect(folderToggle(intent, name, true)).toBeVisible();
  await expect(folderToggle(intent, "out", false)).toBeVisible();
  await expect.poll(() => scrollOf(intent)).toBe(offset);
  expect(reads).toEqual([]);
});

test("another project shows none of the reading place, and choosing the project again starts its reading afresh", async ({
  page,
  origin,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const { intent } = await selectTakenStoryInIntent(
    page,
    origin,
    changeWithDeepSpec,
  );
  await readDeepSpec(intent);

  await chooseProject(page, "Doughnut");
  await expect(intent).toContainText(
    "No intent locations are configured for Doughnut.",
  );
  await expect(intent.getByRole("button", { name: deepSpec })).toHaveCount(0);
  await expect(intent.locator('[aria-pressed="true"]')).toHaveCount(0);

  // The story stays selected and opens at its CI comparison; its tree is
  // expanded as when first compared, with the toggle off and nothing
  // selected, so Changed tests asks for a choice.
  await chooseProject(page, "Open Dough");
  await expectStoryTab(intent, "CI comparison");
  await expect(ciPanel(intent)).toBeVisible();
  await chooseStoryTab(intent, "Changed tests");
  await expect(readingPane(intent)).toContainText(
    "Choose a test, folder or location to read its Purpose and Proof.",
  );
  await expect(ciPanel(intent)).toHaveCount(0);
  await expect(purposeRegion(intent)).toHaveCount(0);
  await expect(storyOnly(intent)).not.toBeChecked();
  await expect(folderToggle(intent, "out", true)).toBeVisible();
  await expect(intentFile(intent, deepSpec)).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect(
    intent.locator('.intent-locations [aria-pressed="true"]'),
  ).toHaveCount(0);
  expect(await scrollOf(intent)).toBe(0);
});
