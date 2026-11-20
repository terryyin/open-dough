import { revisionNotice } from "../../test-support/intentPerspectivePage.ts";
import {
  readFailure,
  showLatestRevision,
} from "../../test-support/intentReadRecoveryPage.ts";
// Intent's Optimization Candidates tab across a new trunk revision: while the
// new record's read is outstanding after **Show latest**, the departed
// old-revision read shows no failure, and its late answer never replaces the
// new record (../../src/IntentCandidatesRecord.tsx,
// ../../src/IntentRevisionNotice.tsx).

import { expect, test } from "../../test-support/support/frontendApp.ts";
import { parts } from "../../test-support/dashboardPage.ts";
import {
  candidatesRecord,
  chooseOptimizationCandidates,
  expectCandidatesRevision,
  expectIntentModeChosen,
} from "../../test-support/intentModePage.ts";
import {
  openUntilRead,
  untilPageReadsAnswered,
} from "../../test-support/pageRequestNotes.ts";
import {
  openDoughCandidatesRecord,
  openDoughSources,
  testOptimizationCandidatesPath,
} from "../../test-support/intentCandidatesFixtures.ts";
import {
  openDough,
  openDoughSettings,
} from "../../test-support/intentCodeBrowseFixtures.ts";
import {
  pausePageClock,
  passTimeUntilCheckedWhileReadsOutstanding,
} from "../../test-support/autoRefreshJourney.ts";
import { holdAuthenticatedReadsWhere } from "../../test-support/holdAuthenticatedReads.ts";
import { prepareCandidateProjects } from "../../test-support/support/frontendIntentCandidates.ts";

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
const releases: (() => void)[] = [];
test.afterEach(() => {
  for (const release of releases.splice(0)) release();
});
const candidatesReadAt = (revision: string) => (params: URLSearchParams) =>
  params.get("intent") === "test-optimization-candidates" &&
  params.get("revision") === revision;

test("a held answer for the old revision cannot replace the record Show latest selected", async ({
  page,
  frontendServices,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await pausePageClock(page);
  const { publish } = await prepareCandidateProjects(page, frontendServices, [
    openDoughAt(openDough.revision, openDoughCandidatesRecord),
  ]);
  const oldAnswer = await holdAuthenticatedReadsWhere(
    page,
    candidatesReadAt(openDough.revision),
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
  const newAnswer = await holdAuthenticatedReadsWhere(
    page,
    candidatesReadAt(movedRevision),
    releases,
  );
  await showLatestRevision(revisionNotice(intent)).click();
  await expectIntentModeChosen(intent, "Optimization Candidates");
  await expectCandidatesRevision(intent, movedRevision);
  await expect.poll(newAnswer.held).toBe(1);
  await expect(candidatesRecord(intent)).toContainText(
    "Reading Test Optimization Candidates",
  );
  await expect(readFailure(candidatesRecord(intent))).toHaveCount(0);

  newAnswer.release();
  await expect(entry("launch-records-page-clock")).toBeVisible();

  oldAnswer.release();
  await untilPageReadsAnswered(page);
  await expectCandidatesRevision(intent, movedRevision);
  await expect(entry("launch-records-page-clock")).toBeVisible();
  await expect(entry("launch-records-poll-waits")).toHaveCount(0);
});
