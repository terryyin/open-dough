// Intent locations recover through the page's shared schedule while the
// published observation keeps checking its own revision.

import { setPageVisibility } from "../../test-support/autoRefreshJourney.ts";
import { expect, test } from "../../test-support/support/frontendApp.ts";
import { pausePageClockAt } from "../../test-support/dashboardTest.ts";
import { doughnut } from "../../test-support/intentCodeBrowseFixtures.ts";
import {
  countLocationsReads,
  intentLocationName,
} from "../../test-support/intentPerspectivePage.ts";
import {
  advanceRecoveryClock,
  locationFiles,
  openDoughnut,
  opened,
  readFailure,
  readRetry,
} from "../../test-support/intentReadRecoveryPage.ts";
import { putFrontendIntentSources } from "../../test-support/support/frontendIntentSources.ts";
import type { FrontendServiceState } from "../../test-support/support/frontendServiceState.ts";
import {
  controlFrontendAuthenticatedRead,
  countAuthenticatedReads,
} from "../../test-support/support/frontendAuthenticatedReadControl.ts";
import { preholdRevisionStreamSlots } from "../../test-support/support/revisionStreamSlots.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { noticedResumeTime } from "../../test-support/limitNotice.ts";
import {
  untilPageRequestsAnswered,
  whileNotingChecks,
} from "../../test-support/pageRequestNotes.ts";

function putScriptIntentSources(services: FrontendServiceState): void {
  const location = makeMe.anIntentLocation
    .at("scripts")
    .ofKind("javascript", ["**/*.test.mjs"])
    .selecting(...Object.keys(locationFiles))
    .please();
  putFrontendIntentSources(services, doughnut, [location], locationFiles);
}

test("unreachable Intent locations recover after 15, 30, 60 and 60 seconds while revision checks continue", async ({
  page,
  frontendServices,
}) => {
  await pausePageClockAt(page, opened);
  await preholdRevisionStreamSlots(page);
  putScriptIntentSources(frontendServices);
  const reads = countLocationsReads(page);
  let unreachable = true;
  const locations = await controlFrontendAuthenticatedRead(
    page,
    (params) => params.get("intent") === "locations",
  );
  locations.unreachable();

  const intent = await openDoughnut(page);
  const problem = readFailure(intent);
  await expect(problem).toContainText(
    "The local authenticated read could not be reached",
  );
  await expect(readRetry(problem)).toBeVisible();
  expect(reads()).toBe(1);

  await whileNotingChecks(page, async (askedAfter) => {
    await advanceRecoveryClock(page, 14_999);
    expect(reads()).toBe(1);
    expect(await askedAfter()).toEqual([]);
    await advanceRecoveryClock(page, 251);
    expect(await askedAfter()).toEqual([15_000]);
    expect(reads()).toBe(2);
    await expect(problem).toContainText("could not be reached");
  });

  for (const [wait, before] of [
    [30_000, 2],
    [60_000, 3],
    [60_000, 4],
  ] as const) {
    // Leave room for the preceding request to settle during its clock step.
    await advanceRecoveryClock(page, wait - 1_000);
    expect(reads()).toBe(before);
    if (before === 4) {
      unreachable = false;
      locations.pass();
    }
    await advanceRecoveryClock(page, 1_250);
    expect(reads()).toBe(before + 1);
    if (unreachable) {
      await expect(problem).toContainText("could not be reached");
    }
  }

  await expect(intentLocationName(intent, "scripts")).toBeVisible();
  await expect(problem).toHaveCount(0);
  await advanceRecoveryClock(page, 61_000);
  expect(reads()).toBe(5);
});

test("Intent locations make no recovery request while hidden and ask once on reveal", async ({
  page,
  frontendServices,
}) => {
  await pausePageClockAt(page, opened);
  await preholdRevisionStreamSlots(page);
  putScriptIntentSources(frontendServices);
  const reads = countLocationsReads(page);
  const locations = await controlFrontendAuthenticatedRead(
    page,
    (params) => params.get("intent") === "locations",
  );
  locations.unreachable();

  const intent = await openDoughnut(page);
  await expect(readFailure(intent)).toContainText("could not be reached");
  await setPageVisibility(page, "hidden");
  await advanceRecoveryClock(page, 65_000);
  expect(reads()).toBe(1);

  locations.pass();
  await setPageVisibility(page, "visible");
  await untilPageRequestsAnswered(page);
  expect(reads()).toBe(2);
  await expect(intentLocationName(intent, "scripts")).toBeVisible();
  await advanceRecoveryClock(page, 61_000);
  expect(reads()).toBe(2);
});

test("published detail and Intent locations share a wait, and healing detail leaves Intent pending", async ({
  page,
  frontendServices,
}) => {
  await pausePageClockAt(page, opened);
  await preholdRevisionStreamSlots(page);
  putScriptIntentSources(frontendServices);
  const detailReads = countAuthenticatedReads(
    page,
    (params) => params.get("path") === ".planning/seeds/SEED-302-queued.md",
  );
  const detail = await controlFrontendAuthenticatedRead(
    page,
    (params) => params.get("path") === ".planning/seeds/SEED-302-queued.md",
  );
  detail.unreachable();
  const reads = countLocationsReads(page);
  const locations = await controlFrontendAuthenticatedRead(
    page,
    (params) => params.get("intent") === "locations",
  );
  locations.unreachable();

  const intent = await openDoughnut(page);
  const publishedProblem = page.getByRole("alert").filter({
    hasText: "Reading unanswered detail again",
  });
  const intentProblem = readFailure(intent);
  await expect(publishedProblem).toBeVisible();
  await expect(intentProblem).toContainText("could not be reached");
  expect([detailReads(), reads()]).toEqual([1, 1]);

  detail.pass();
  await advanceRecoveryClock(page, 14_000);
  expect([detailReads(), reads()]).toEqual([1, 1]);
  await advanceRecoveryClock(page, 1_250);
  expect([detailReads(), reads()]).toEqual([2, 2]);
  await expect(publishedProblem).toHaveCount(0);
  await expect(intentProblem).toContainText("could not be reached");

  locations.pass();
  await advanceRecoveryClock(page, 29_000);
  expect([detailReads(), reads()]).toEqual([2, 2]);
  await advanceRecoveryClock(page, 1_250);
  expect([detailReads(), reads()]).toEqual([2, 3]);
  await expect(intentLocationName(intent, "scripts")).toBeVisible();
});

test("malformed Intent settings stay visible until manual Retry", async ({
  page,
  frontendServices,
}) => {
  await pausePageClockAt(page, opened);
  await preholdRevisionStreamSlots(page);
  putFrontendIntentSources(frontendServices, doughnut, [], locationFiles);
  Object.assign(frontendServices, {
    locations: {
      revision: doughnut.revision,
      locations: null,
      settingsProblem: "malformed",
    },
  });
  const reads = countLocationsReads(page);

  const intent = await openDoughnut(page);
  const problem = readFailure(intent);
  await expect(problem).toContainText(
    ".planning/open-dough.json is not valid JSON",
  );
  await advanceRecoveryClock(page, 70_000);
  expect(reads()).toBe(1);
  await expect(problem).toBeVisible();

  await readRetry(problem).click();
  await untilPageRequestsAnswered(page);
  expect(reads()).toBe(2);
  await expect(problem).toContainText(
    ".planning/open-dough.json is not valid JSON",
  );
});

test("rate-limited Intent locations reread when the standing limit ends", async ({
  page,
  frontendServices,
}) => {
  await pausePageClockAt(page, opened);
  await preholdRevisionStreamSlots(page);
  putScriptIntentSources(frontendServices);
  const directedSeconds = 2;
  const locations = await controlFrontendAuthenticatedRead(
    page,
    (params) => params.get("intent") === "locations",
  );
  locations.respond(
    { error: "GitHub limited the rate", retryAfterSeconds: directedSeconds },
    502,
  );
  const reads = countLocationsReads(page);

  const intent = await openDoughnut(page);
  await expect(readFailure(intent)).toContainText("GitHub limited the rate");
  const resumesAt = await noticedResumeTime(page);
  locations.pass();

  await advanceRecoveryClock(page, resumesAt - opened.getTime() - 1);
  expect(reads()).toBe(1);
  await advanceRecoveryClock(page, 251);
  expect(reads()).toBe(2);
  await expect(intentLocationName(intent, "scripts")).toBeVisible();
});
