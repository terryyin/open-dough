import {
  ciStatusReading,
  expectCiAnswer,
  chooseCiStatus,
  judged,
  publishProject,
  runUrl,
  trunkCi,
} from "../../dashboard/tests/intentCiStatusPage.ts";
// CI wall time of the attempt Intent's homepage shows
// (../../dashboard/src/IntentCiProof.tsx, ../../dashboard/src/ciProofTimeWords.ts): a listed Actions run
// 10:00→10:03 shows CI wall time 3 min with the attempt; a running result
// shows its completed ancestor's wall time; a ciAdapter attempt without
// startedAt/completedAt shows CI wall time not recorded (SEED-239 examples
// 2 and 7).

import { expect, test } from "../../dashboard/tests/dashboardTest.ts";
import {
  evidenceLabel,
  evidenceLabels,
  expectEvidenceLabels,
  expectInFull,
  expectLeadingEvidenceLabels,
  labelWords,
} from "../../dashboard/tests/ciEvidenceLabelsPage.ts";
import { parts } from "../../dashboard/tests/dashboardPage.ts";
import {
  adapterProject,
  openAdapterProof,
  passed,
  testsSummary,
  uuid,
} from "../../dashboard/tests/intentCiAdapterProofProject.ts";
import { proofOf } from "../../dashboard/tests/intentCiProofPage.ts";

import { openDough } from "../../dashboard/tests/intentCodeBrowseFixtures.ts";
import { running } from "../../dashboard/tests/intentCiStoryBoard.ts";
import {
  login,
  mainRun,
  publishStoryCi,
  signup,
  started,
  toggleOnDevelopment,
} from "../../dashboard/tests/intentCiStoryRecords.ts";
import { openUntilRead } from "../../dashboard/tests/pageRequestNotes.ts";
import { makeMe } from "../../tests/support/makeMe.mjs";

const wallTime = "CI wall time 3 min";
const notRecorded = "CI wall time not recorded";

test("a listed run from 10:00 to 10:03 shows CI wall time 3 min with the attempt", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  publishProject(page, openDough).serveCi(
    trunkCi(openDough.revision, () => [
      makeMe.aCiRun
        .with({
          headSha: judged,
          conclusion: "success",
          url: runUrl,
          databaseId: 41,
          startedAt: "2026-11-05T10:00:00Z",
          completedAt: "2026-11-05T10:03:00Z",
        })
        .please(),
    ]),
  );
  await openUntilRead(page);
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  const panel = await chooseCiStatus(intent);
  const proof = proofOf(panel);
  await expectCiAnswer(panel, "Passed at a1b2c3d (Add login)");
  await expectEvidenceLabels(evidenceLabels(proof), [
    "Run 41 · attempt 1",
    "Revision a1b2c3d",
    wallTime,
  ]);
});

test("a running result shows its completed ancestor's CI wall time", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const ci = publishStoryCi(page);
  ci.runs.main = [
    makeMe.aCiRun
      .with({
        headSha: login,
        conclusion: "success",
        url: mainRun,
        databaseId: 11,
        startedAt: "2026-11-05T09:00:00Z",
        completedAt: "2026-11-05T09:05:00Z",
      })
      .please(),
    makeMe.aCiRun
      .with({
        headSha: signup,
        conclusion: "success",
        url: mainRun,
        databaseId: 12,
        attempt: 2,
        startedAt: "2026-11-05T10:00:00Z",
        completedAt: "2026-11-05T10:03:00Z",
      })
      .please(),
  ];
  ci.runs[running.branch] = [
    makeMe.aCiRun
      .with({
        headSha: started,
        status: "in_progress",
        url: runUrl,
        databaseId: 13,
      })
      .please(),
  ];
  await openUntilRead(page, "/?project=open-dough&perspective=intent");
  await chooseCiStatus(parts(page).intent);
  const panel = await toggleOnDevelopment(page, running.title);
  const proof = proofOf(panel);
  await expectCiAnswer(panel, "Running at 70a0001 (Start the story)");
  await expectEvidenceLabels(evidenceLabels(proof), [
    "Run 12 · attempt 2",
    "Revision d4e5f6a",
    "Completed ancestor",
    wallTime,
  ]);
});

test("a ciAdapter attempt without start and completion shows CI wall time not recorded", async ({
  page,
  dashboard,
}) => {
  const adapter = adapterProject(dashboard.home);
  adapter.answer({
    discover: { main: [passed(uuid, uuid, login, "main")] },
    proof: testsSummary(uuid, login),
  });
  const { panel, proof } = await openAdapterProof(page);
  await expect(ciStatusReading(panel).state).toContainText("Passed");
  await expectLeadingEvidenceLabels(evidenceLabels(proof), [`Attempt ${uuid}`]);
  const wall = evidenceLabel(proof, notRecorded);
  await expect(labelWords(wall)).toHaveText(notRecorded);
  await expectInFull(
    wall,
    "This attempt's CI read has no start and completion times.",
  );
  await expect(panel.getByText("CI time without runner waits")).toHaveCount(0);
  expect(adapter.jobsRequests()).toEqual([]);
});
