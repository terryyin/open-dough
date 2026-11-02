// Intent's Optimization Candidates tab, shown across a new trunk revision,
// stays chosen (kept per project by ../src/pageIntentMode.tsx) and reads the
// record published at that revision (../src/IntentCandidatesRecord.tsx).

import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import {
  candidatesRecord,
  chooseOptimizationCandidates,
  expectCandidatesRevision,
  expectIntentModeChosen,
} from "./intentPerspectivePage.ts";
import { openUntilRead, untilPageReadsAnswered } from "./pageRequestNotes.ts";
import { openDoughCandidatesRecord } from "./intentCandidatesFixtures.ts";
import { openDough } from "./intentCodeBrowseFixtures.ts";
import {
  moveOpenDoughTrunk,
  publishMovingOpenDough,
} from "./intentMovingOpenDough.ts";
import {
  pausePageClock,
  passTimeUntilCheckedAfterSettled,
} from "./autoRefreshJourney.ts";

test("Optimization Candidates shown across a new revision stays chosen and reads that revision's record", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await pausePageClock(page);
  const origin = publishMovingOpenDough(page);
  await openUntilRead(page, "/?project=open-dough&perspective=intent");
  const { intent } = parts(page);
  const entry = (name: string) =>
    candidatesRecord(intent).getByRole("article", { name });
  await chooseOptimizationCandidates(intent);
  await expectCandidatesRevision(intent, openDough.revision);
  await expect(entry("launch-records-poll-waits")).toBeVisible();

  const revision = "e9".repeat(20);
  moveOpenDoughTrunk(
    origin,
    revision,
    openDoughCandidatesRecord.replace(
      "launch-records-poll-waits",
      "launch-records-page-clock",
    ),
  );
  await passTimeUntilCheckedAfterSettled(page);
  await untilPageReadsAnswered(page);

  await expectIntentModeChosen(intent, "Optimization Candidates");
  await expectCandidatesRevision(intent, revision);
  await expect(entry("launch-records-page-clock")).toBeVisible();
  await expect(entry("launch-records-poll-waits")).toHaveCount(0);
});
