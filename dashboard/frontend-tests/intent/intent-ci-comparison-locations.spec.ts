// A selected done story's CI comparison (../../src/IntentPage.tsx) does not
// wait for the story's historical Intent locations read: it is the story's
// default view under its one header while that read is held, and stays,
// without the browser reading the comparison again, once it settles; beside a
// failed locations read, Changed tests explains the failure with its Retry,
// which reads the completion revision again. The comparison is the canonical
// Summary-scope answer (../../tests/support/frontendIntentComparison.ts); a
// request log observes the browser's requests only. Real acquisition stays in
// ../../backend-tests/intent/ci-comparison-memory-*.spec.ts and
// ../../../e2e/intent/intent-ci-comparison{,-retry}.spec.ts.

import type { Page } from "@playwright/test";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import { holdAuthenticatedReadsWhere } from "../../tests/holdAuthenticatedReads.ts";
import { comparisonReading } from "../../tests/intentCiComparisonPage.ts";
import { readFailure, readRetry } from "../../tests/intentReadRecoveryPage.ts";
import { expect, test } from "../../tests/support/frontendApp.ts";
import { prepareFrontendDoneIntent } from "../../tests/support/frontendIntentDoneStory.ts";
import type { FrontendServiceState } from "../../tests/support/frontendServiceState.ts";
import { selectDoneStoryForCiComparison } from "../../tests/support/selectDoneStoryForCiComparison.ts";
import {
  chooseStoryTab,
  expectStoryTab,
  storySummary,
  storyTitle,
} from "../../tests/support/intentStoryPage.ts";

const releases: (() => void)[] = [];
test.afterEach(() => {
  for (const release of releases.splice(0)) release();
});

const readingLocations = "Reading the story's historical Intent locations…";

// Done Story A with its historical Intent locations read held, and the
// browser's locations revisions and comparison reads logged.
async function holdLocationsOfComparedStory(
  page: Page,
  services: FrontendServiceState,
) {
  const { completion } = await prepareFrontendDoneIntent(page, services);
  const locationRevisions: string[] = [];
  let comparisonReads = 0;
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname !== authenticatedReadEndpoint) return;
    const kind = url.searchParams.get("intent");
    if (kind === "locations")
      locationRevisions.push(url.searchParams.get("revision") ?? "");
    if (kind === "ci-comparison") comparisonReads += 1;
  });
  const held = await holdAuthenticatedReadsWhere(
    page,
    (params) =>
      params.get("intent") === "locations" &&
      params.get("revision") === completion,
    releases,
  );
  return {
    ...held,
    completion,
    locationRevisions,
    comparisonReads: () => comparisonReads,
  };
}

test("a selected story's CI comparison shows under its one header while the Intent locations read is held, and stays without reading it again once it settles", async ({
  page,
  frontendServices,
}) => {
  const locations = await holdLocationsOfComparedStory(page, frontendServices);
  const { intent, panel } = await selectDoneStoryForCiComparison(page);
  const reading = comparisonReading(panel);

  await test.step("the comparison is usable under one header while locations are held", async () => {
    await expect.poll(() => locations.held()).toBeGreaterThan(0);
    expect(locations.locationRevisions).toContain(locations.completion);
    await expectStoryTab(intent, "CI comparison");
    await expect(storyTitle(intent)).toHaveText("Story A");
    await expect(storySummary(intent)).toHaveCount(1);
    await expect(reading.activeComparison).toHaveText(
      "Baseline compared with Landed",
    );
    await expect(reading.wallTimes).not.toHaveCount(0);
  });
  const walls = await reading.wallTimes.allTextContents();

  await test.step("Changed tests says the locations are read; once settled, the comparison returns unread", async () => {
    await chooseStoryTab(intent, "Changed tests");
    const changedTests = intent.getByRole("tabpanel", {
      name: "Changed tests",
    });
    await expect(changedTests).toContainText(readingLocations);
    const readsBefore = locations.comparisonReads();
    expect(readsBefore).toBeGreaterThan(0);
    locations.release();
    await expect(changedTests).not.toContainText(readingLocations);
    await chooseStoryTab(intent, "CI comparison");
    await expect(reading.activeComparison).toHaveText(
      "Baseline compared with Landed",
    );
    await expect(reading.wallTimes).toHaveText(walls);
    expect(locations.comparisonReads()).toBe(readsBefore);
  });
});

test("a failed Intent locations read leaves the story's CI comparison shown while Changed tests explains the failure, and Retry reads the completion revision", async ({
  page,
  frontendServices,
}) => {
  const locations = await holdLocationsOfComparedStory(page, frontendServices);
  const { intent, panel } = await selectDoneStoryForCiComparison(page);
  const reading = comparisonReading(panel);
  await expect.poll(() => locations.held()).toBeGreaterThan(0);
  await expect(reading.wallTimes).not.toHaveCount(0);
  const walls = await reading.wallTimes.allTextContents();
  locations.fail();

  await chooseStoryTab(intent, "Changed tests");
  const changedTests = intent.getByRole("tabpanel", { name: "Changed tests" });
  const failure = readFailure(changedTests);
  await expect(failure).toContainText("could not be read");
  const retry = readRetry(failure);
  await expect(retry).toBeVisible();

  await chooseStoryTab(intent, "CI comparison");
  await expect(reading.activeComparison).toHaveText(
    "Baseline compared with Landed",
  );
  await expect(reading.wallTimes).toHaveText(walls);

  await chooseStoryTab(intent, "Changed tests");
  const readsBeforeRetry = locations.locationRevisions.length;
  await retry.click();
  await expect(failure).toHaveCount(0);
  await expect(changedTests).not.toContainText(readingLocations);
  expect(locations.locationRevisions.slice(readsBeforeRetry)).toEqual([
    locations.completion,
  ]);
});
