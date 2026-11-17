import { revisionNotice } from "../../tests/intentPerspectivePage.ts";
import { showLatestRevision } from "../../tests/intentReadRecoveryPage.ts";
// Intent's Optimization Candidates tab, shown across a new trunk revision,
// stays chosen (kept per project by ../../src/pageIntentMode.tsx) and keeps the
// record of the revision Intent reads until **Show latest**, which reads the
// record published at the new revision; a late answer for the old revision
// never replaces it (../../src/IntentCandidatesRecord.tsx,
// ../../src/IntentRevisionNotice.tsx).

import { expect, test } from "../../tests/support/frontendApp.ts";
import { parts } from "../../tests/dashboardPage.ts";
import {
  candidatesRecord,
  chooseOptimizationCandidates,
  expectCandidatesRevision,
  expectIntentModeChosen,
} from "../../tests/intentModePage.ts";
import {
  openUntilRead,
  untilPageReadsAnswered,
} from "../../tests/pageRequestNotes.ts";
import {
  openDoughCandidatesRecord,
  openDoughSources,
  testOptimizationCandidatesPath,
} from "../../tests/intentCandidatesFixtures.ts";
import {
  openDough,
  openDoughSettings,
} from "../../tests/intentCodeBrowseFixtures.ts";
import {
  pausePageClock,
  passTimeUntilChecked,
  passTimeUntilCheckedWhileReadsOutstanding,
} from "../../tests/autoRefreshJourney.ts";
import { holdAuthenticatedReadsWhere } from "../../tests/holdAuthenticatedReads.ts";
import { prepareCandidateProjects } from "../../tests/support/frontendIntentCandidates.ts";

const movedRevision = "e9".repeat(20);
const openDoughAt = (revision: string, record: string) => ({
  project: { ...openDough, revision },
  settings: openDoughSettings,
  files: { ...openDoughSources, [testOptimizationCandidatesPath]: record },
});
const movedRecord = openDoughCandidatesRecord.replace(
  "launch-records-poll-waits",
  "launch-records-page-clock",
);

test("Optimization Candidates shown across a new revision stays chosen and reads that revision's record after Show latest", async ({
  page,
  frontendServices,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await pausePageClock(page);
  const { publish } = await prepareCandidateProjects(page, frontendServices, [
    openDoughAt(openDough.revision, openDoughCandidatesRecord),
  ]);
  await openUntilRead(page, "/?project=open-dough&perspective=intent");
  const { intent } = parts(page);
  const entry = (name: string) =>
    candidatesRecord(intent).getByRole("article", { name });
  await chooseOptimizationCandidates(intent);
  await expectCandidatesRevision(intent, openDough.revision);
  await expect(entry("launch-records-poll-waits")).toBeVisible();

  publish(openDoughAt(movedRevision, movedRecord));
  await passTimeUntilChecked(page);
  await untilPageReadsAnswered(page);

  await expectIntentModeChosen(intent, "Optimization Candidates");
  await expectCandidatesRevision(intent, openDough.revision);
  await expect(entry("launch-records-poll-waits")).toBeVisible();
  await showLatestRevision(revisionNotice(intent)).click();

  await expectIntentModeChosen(intent, "Optimization Candidates");
  await expectCandidatesRevision(intent, movedRevision);
  await expect(entry("launch-records-page-clock")).toBeVisible();
  await expect(entry("launch-records-poll-waits")).toHaveCount(0);
});

test("a held answer for the old revision cannot replace the record Show latest selected", async ({
  page,
  frontendServices,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await pausePageClock(page);
  const { publish } = await prepareCandidateProjects(page, frontendServices, [
    openDoughAt(openDough.revision, openDoughCandidatesRecord),
  ]);
  const releases: (() => void)[] = [];
  const oldAnswer = await holdAuthenticatedReadsWhere(
    page,
    (params) =>
      params.get("intent") === "test-optimization-candidates" &&
      params.get("revision") === openDough.revision,
    releases,
  );
  await openUntilRead(page, "/?project=open-dough&perspective=intent");
  const { intent } = parts(page);
  const entry = (name: string) =>
    candidatesRecord(intent).getByRole("article", { name });
  await chooseOptimizationCandidates(intent);
  await expect.poll(oldAnswer.held).toBe(1);

  publish(openDoughAt(movedRevision, movedRecord));
  await passTimeUntilCheckedWhileReadsOutstanding(page);
  await showLatestRevision(revisionNotice(intent)).click();
  await expectIntentModeChosen(intent, "Optimization Candidates");
  await expectCandidatesRevision(intent, movedRevision);
  await expect(entry("launch-records-page-clock")).toBeVisible();

  oldAnswer.release();
  await untilPageReadsAnswered(page);
  await expectCandidatesRevision(intent, movedRevision);
  await expect(entry("launch-records-page-clock")).toBeVisible();
  await expect(entry("launch-records-poll-waits")).toHaveCount(0);
});
