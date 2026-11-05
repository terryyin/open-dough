// Intent's Optimization Candidates tab, shown across a new trunk revision,
// stays chosen (kept per project by ../src/pageIntentMode.tsx) and keeps the
// record of the revision Intent reads until **Show latest**, which reads the
// record published at the new revision (../src/IntentCandidatesRecord.tsx,
// ../src/IntentRevisionNotice.tsx).

import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import {
  candidatesRecord,
  chooseOptimizationCandidates,
  expectCandidatesRevision,
  expectIntentModeChosen,
} from "./intentModePage.ts";
import { revisionNotice } from "./intentPerspectivePage.ts";
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

test("Optimization Candidates shown across a new revision stays chosen and reads that revision's record after Show latest", async ({
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
  await expectCandidatesRevision(intent, openDough.revision);
  await expect(entry("launch-records-poll-waits")).toBeVisible();
  await revisionNotice(intent)
    .getByRole("button", { name: "Show latest" })
    .click();

  await expectIntentModeChosen(intent, "Optimization Candidates");
  await expectCandidatesRevision(intent, revision);
  await expect(entry("launch-records-page-clock")).toBeVisible();
  await expect(entry("launch-records-poll-waits")).toHaveCount(0);
});
