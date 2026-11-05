// Shared inputs and page actions for Intent read recovery journeys.

import { filesOf } from "./catalogProjectRecords.ts";
import { expect } from "./dashboardTest.ts";
import { expectSettledPage, parts } from "./dashboardPage.ts";
import {
  openDoughSources,
  testOptimizationCandidatesPath,
} from "./intentCandidatesFixtures.ts";
import {
  doughnut,
  nodeTest,
  openDough,
  openDoughSettings,
} from "./intentCodeBrowseFixtures.ts";
import { intentLocationName } from "./intentPerspectivePage.ts";
import {
  candidatesRecord,
  chooseOptimizationCandidates,
  expectCandidatesRevision,
} from "./intentModePage.ts";
import {
  openUntilRead,
  untilPageRequestsAnswered,
} from "./pageRequestNotes.ts";
import { publishes } from "./support/fakeGitHub.ts";
import type { GhRequest } from "./support/ghRequest.ts";

export const opened = new Date("2026-11-05T08:00:00.000Z");
export const locationsRequest = /[?&]intent=locations(&|$)/;
export const candidatesRequest = /[?&]intent=test-optimization-candidates(&|$)/;
export const settingsPath = ".planning/open-dough.json";
export const locationFiles = { "scripts/example.test.mjs": nodeTest };

type Page = Parameters<typeof parts>[0];

export async function openDoughnut(page: Page) {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openUntilRead(page, "/?project=doughnut");
  await expectSettledPage(page, {
    taken: [doughnut.taken],
    backlog: [doughnut.queued],
  });
  await untilPageRequestsAnswered(page);
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  return intent;
}

export async function advanceRecoveryClock(page: Page, milliseconds: number) {
  await page.clock.runFor(milliseconds);
  await untilPageRequestsAnswered(page);
}

export function publishedCandidates() {
  return publishes({
    revision: openDough.revision,
    files: {
      ...filesOf(openDough),
      [settingsPath]: openDoughSettings,
      ...openDoughSources,
    },
  });
}

export function isCandidatesContent(request: GhRequest) {
  return (
    request.kind === "content" &&
    request.path === testOptimizationCandidatesPath
  );
}

export function countCandidatesReads(page: Page) {
  let reads = 0;
  page.on("request", (request) => {
    if (candidatesRequest.test(request.url())) reads += 1;
  });
  return () => reads;
}

export async function openCandidates(page: Page) {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openUntilRead(page, "/?project=open-dough&perspective=intent");
  const { intent } = parts(page);
  await expect(intentLocationName(intent, "dashboard/tests")).toBeVisible();
  await chooseOptimizationCandidates(intent);
  await expectCandidatesRevision(intent, openDough.revision);
  return candidatesRecord(intent);
}
