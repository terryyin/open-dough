import { readFailure, readRetry } from "../intentReadRecoveryPage.ts";
import { comparisonReading } from "../intentCiComparisonPage.ts";
// A selected done story's CI comparison (../../src/IntentPage.tsx) does
// not wait for the Intent locations read: it is the story's default view
// under its one header while that read is still held, and stays, without
// reading CI again, once it settles; beside a failed locations read, Changed
// tests explains the failure with its Retry. The comparison's own content
// lives in ../../../e2e/intent/intent-ci-comparison.spec.ts.

import { expect, test } from "../support/preparationPage.ts";
import { comparisonWorkflowPath } from "../support/storyCiComparisonFixture.ts";
import { serveObservedComparisonAttempts } from "../support/storyCiObservedJobs.ts";
import { publishComparedStoryBranch } from "../support/storyCiComparisonDoneFixture.ts";
import { selectDoneStoryForCiComparison } from "../support/selectDoneStoryForCiComparison.ts";
import { commitAll, writeAt } from "../support/storyReviewWorktree.ts";
import {
  authenticatedReadRoute,
  holdAuthenticatedReadsWhere,
} from "../holdAuthenticatedReads.ts";
import {
  chooseStoryTab,
  expectStoryTab,
  storySummary,
  storyTitle,
} from "../support/intentStoryPage.ts";
import type { Page } from "@playwright/test";
import type { StartOrigin } from "../support/startOrigin.ts";

const releases: (() => void)[] = [];
test.afterEach(() => {
  for (const release of releases.splice(0)) release();
});

const comparedWalls = ["4 min 57 s", "13 min 27 s", "5 min 19 s"];

// A compared done Story A whose Intent locations read is held from the
// start.
async function holdLocationsOfComparedStory(page: Page, origin: StartOrigin) {
  const setup = await publishComparedStoryBranch(page, origin, undefined);
  writeAt(origin.project, comparisonWorkflowPath, "jobs: {}\n");
  commitAll(origin.project, "change the workflow after the compared builds");
  serveObservedComparisonAttempts(setup, "rerun");
  const revisions: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (
      url.pathname === "/__authenticated-read" &&
      url.searchParams.get("intent") === "locations"
    )
      revisions.push(url.searchParams.get("revision") ?? "");
  });
  const held = await holdAuthenticatedReadsWhere(
    page,
    (params) => params.get("intent") === "locations",
    releases,
  );
  return { ...held, revisions, completion: setup.completion };
}

test("a selected story's CI comparison shows under its one header while the Intent locations read is held, and stays without reading CI again once it settles", async ({
  page,
  origin,
}) => {
  const locations = await holdLocationsOfComparedStory(page, origin);
  let comparisonReads = 0;
  await page.route(authenticatedReadRoute, async (route) => {
    if (
      new URL(route.request().url()).searchParams.get("intent") ===
      "ci-comparison"
    )
      comparisonReads += 1;
    await route.fallback();
  });
  const { intent, panel } = await selectDoneStoryForCiComparison(page);
  expect(locations.held()).toBeGreaterThan(0);
  await expectStoryTab(intent, "CI comparison");
  await expect(storyTitle(intent)).toHaveText("Story A");
  await expect(storySummary(intent)).toHaveCount(1);
  await expect(
    intent.getByRole("tabpanel", { name: "CI comparison" }),
  ).toContainText("Baseline compared with Landed");
  await expect(comparisonReading(panel).wallTimes).toHaveText(comparedWalls);
  await expect.poll(() => locations.revisions).toContain(locations.completion);

  // Still held, Changed tests says so; once the locations settle, CI
  // comparison shows the same comparison without reading it again.
  await chooseStoryTab(intent, "Changed tests");
  const changedTests = intent.getByRole("tabpanel", { name: "Changed tests" });
  await expect(changedTests).toContainText(
    "Reading the story's historical Intent locations…",
  );
  const readsBefore = comparisonReads;
  expect(readsBefore).toBeGreaterThan(0);
  locations.release();
  await expect(changedTests).not.toContainText(
    "Reading the story's historical Intent locations…",
  );
  await chooseStoryTab(intent, "CI comparison");
  await expect(comparisonReading(panel).wallTimes).toHaveText(comparedWalls);
  expect(comparisonReads).toBe(readsBefore);
});

test("a failed Intent locations read leaves the story's CI comparison shown while Changed tests explains the failure with its Retry", async ({
  page,
  origin,
}) => {
  const locations = await holdLocationsOfComparedStory(page, origin);
  const { intent, panel } = await selectDoneStoryForCiComparison(page);
  await expect.poll(() => locations.revisions).toContain(locations.completion);
  expect(locations.held()).toBeGreaterThan(0);
  locations.fail();

  await chooseStoryTab(intent, "Changed tests");
  const changedTests = intent.getByRole("tabpanel", { name: "Changed tests" });
  const failure = readFailure(changedTests);
  await expect(failure).toContainText("could not be read");
  const retry = readRetry(failure);
  await expect(retry).toBeVisible();

  await chooseStoryTab(intent, "CI comparison");
  await expect(comparisonReading(panel).activeComparison).toHaveText(
    "Baseline compared with Landed",
  );
  await expect(comparisonReading(panel).wallTimes).toHaveText(comparedWalls);

  // Retry reads the locations again, now answered.
  await chooseStoryTab(intent, "Changed tests");
  await retry.click();
  await expect(failure).toHaveCount(0);
  await expect(changedTests).not.toContainText(
    "Reading the story's historical Intent locations…",
  );
  expect(locations.revisions.at(-1)).toBe(locations.completion);
});
