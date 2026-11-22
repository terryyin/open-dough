import { selectTakenStoryInIntent } from "../../test-support/support/frontendIntentVisits.ts";
import { filesColumn } from "../../test-support/intentModePage.ts";
// Intent's reading place is kept by the page for the project
// (../../src/pageIntentReading.tsx): with a selected Taken story
// (../../test-support/support/frontendIntentVisits.ts) that also adds a long spec two folders
// deep, that file selected, "Selected story only" on, a folder collapsed by
// hand and Purpose scrolled show the same after the story's other views
// (../../src/intentStoryTabs.tsx), and after Development and back on the same
// Changes view, and the return reads neither the locations nor the
// file's diff or text again (../../src/answerMemo.ts). Another project shows
// none of it, and choosing the project again starts its reading afresh, at
// the story's CI comparison.

import type { Locator, Page } from "@playwright/test";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import {
  storyReviewFileEndpoint,
  storyReviewFileTextEndpoint,
} from "../../src/storyReviewContract.ts";
import { chooseProject, parts } from "../../test-support/dashboardPage.ts";
import { ciPanel } from "../../test-support/intentCiStatusPage.ts";
import {
  intentGroupToggle,
  purposeRegion,
} from "../../test-support/intentPerspectivePage.ts";
import {
  intentReadingPane,
  intentReadingScroll,
  scrollIntentReadingHalfway,
} from "../../test-support/intentReadingPlacePage.ts";
import { expect, test } from "../../test-support/support/frontendApp.ts";
import {
  chooseStoryTab,
  expectStoryComparisonRead,
  expectStoryTab,
  folderToggle,
  intentFile,
  storyOnly,
  intentDiffReading,
} from "../../test-support/support/intentStoryPage.ts";
import { deepSpec } from "../../test-support/support/intentStoryWorktree.ts";

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

// The deep spec selected with "Selected story only" on and `out` collapsed by
// hand, its diff shown and Purpose scrolled halfway, as the developer would.
// Proof stays on its own tab, so settling comparison no longer changes the
// Purpose reading pane's height.
async function readDeepSpec(intent: Locator) {
  await storyOnly(intent).check();
  await folderToggle(intent, "out", true).click();
  await intentFile(intent, deepSpec).click();
  await expect(intentDiffReading(intent).name).toHaveText(deepSpec);
  await expect(intentDiffReading(intent).code).toHaveAttribute(
    "aria-busy",
    "false",
  );
  return scrollIntentReadingHalfway(intent);
}

test("a file selected two folders deep, with Selected story only and Purpose scrolled, is shown the same after Development and back without reading again", async ({
  page,
  frontendServices,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const { intent } = await selectTakenStoryInIntent(page, frontendServices);
  const offset = await readDeepSpec(intent);

  const reads = intentReads(page);
  for (const view of ["CI comparison", "Intent coverage"] as const) {
    await chooseStoryTab(intent, view);
    await expect(intentReadingPane(intent)).toBeHidden();
    await chooseStoryTab(intent, "Changes");
    await expect.poll(() => intentReadingScroll(intent)).toBe(offset);
  }
  const { development, intentChoice } = parts(page);
  await development.click();
  await expect(intent).toHaveCount(0);
  await intentChoice.click();
  await expectStoryTab(intent, "Changes");
  await expectStoryComparisonRead(intent);

  await expect(storyOnly(intent)).toBeChecked();
  await expect(intentFile(intent, deepSpec)).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(intentDiffReading(intent).name).toHaveText(deepSpec);
  await expect(intentDiffReading(intent).code).toHaveAttribute(
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
  await expect.poll(() => intentReadingScroll(intent)).toBe(offset);
  expect(reads).toEqual([]);
});

test("another project shows none of the reading place, and choosing the project again starts its reading afresh", async ({
  page,
  frontendServices,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const { intent } = await selectTakenStoryInIntent(page, frontendServices);
  await readDeepSpec(intent);

  await chooseProject(page, "Doughnut");
  await expect(intent).toContainText(
    "No Intent locations are configured for Doughnut.",
  );
  await expect(intent.getByRole("button", { name: deepSpec })).toHaveCount(0);
  await expect(intent.locator('[aria-pressed="true"]')).toHaveCount(0);

  // The story stays selected and opens at its CI comparison; its tree is
  // expanded as when first compared, with the toggle off and nothing
  // selected, so Changes asks for a choice.
  await chooseProject(page, "Open Dough");
  await expectStoryTab(intent, "CI comparison");
  await expect(ciPanel(intent)).toBeVisible();
  await chooseStoryTab(intent, "Changes");
  await expect(intentReadingPane(intent)).toContainText(
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
    filesColumn(intent).locator('[aria-pressed="true"]'),
  ).toHaveCount(0);
  expect(await intentReadingScroll(intent)).toBe(0);
});
