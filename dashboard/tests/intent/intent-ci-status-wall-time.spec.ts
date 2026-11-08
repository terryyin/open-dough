// CI wall time of the attempt Intent's homepage shows
// (../../src/IntentCiProof.tsx, ../../src/ciProofTimeWords.ts): a listed Actions run
// 10:00→10:03 shows CI wall time 3 min with the attempt; a running result
// shows its completed ancestor's wall time; a ciAdapter attempt without
// startedAt/completedAt shows CI wall time not recorded (SEED-239 examples
// 2 and 7).

import { expect, test } from "../dashboardTest.ts";
import {
  evidenceLabel,
  evidenceLabels,
  expectEvidenceLabels,
  expectInFull,
  expectLeadingEvidenceLabels,
  labelWords,
} from "../ciEvidenceLabelsPage.ts";
import { parts } from "../dashboardPage.ts";
import {
  adapterProject,
  openAdapterProof,
  passed,
  testsSummary,
  uuid,
} from "../intentCiAdapterProofProject.ts";
import { proofOf } from "../intentCiProofPage.ts";
import {
  chooseCiStatus,
  judged,
  publishProject,
  runUrl,
  trunkCi,
} from "../intentCiStatusPage.ts";
import { openDough } from "../intentCodeBrowseFixtures.ts";
import { running } from "../intentCiStoryBoard.ts";
import {
  login,
  mainRun,
  publishStoryCi,
  signup,
  started,
  toggleOnDevelopment,
} from "../intentCiStoryRecords.ts";
import { openUntilRead } from "../pageRequestNotes.ts";

const wallTime = "CI wall time 3 min";
const notRecorded = "CI wall time not recorded";

test("a listed run from 10:00 to 10:03 shows CI wall time 3 min with the attempt", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  publishProject(page, openDough).serveCi(
    trunkCi(openDough.revision, () => [
      {
        headSha: judged,
        conclusion: "success",
        url: runUrl,
        id: 41,
        startedAt: "2026-11-05T10:00:00Z",
        completedAt: "2026-11-05T10:03:00Z",
      },
    ]),
  );
  await openUntilRead(page);
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  const panel = await chooseCiStatus(intent);
  const proof = proofOf(panel);
  await expect(panel.locator(".intent-ci-state")).toHaveText(
    "Passed at a1b2c3d (Add login)",
  );
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
    {
      headSha: login,
      conclusion: "success",
      url: mainRun,
      id: 11,
      startedAt: "2026-11-05T09:00:00Z",
      completedAt: "2026-11-05T09:05:00Z",
    },
    {
      headSha: signup,
      conclusion: "success",
      url: mainRun,
      id: 12,
      attempt: 2,
      startedAt: "2026-11-05T10:00:00Z",
      completedAt: "2026-11-05T10:03:00Z",
    },
  ];
  ci.runs[running.branch] = [
    { headSha: started, status: "in_progress", url: runUrl, id: 13 },
  ];
  await openUntilRead(page, "/?project=open-dough&perspective=intent");
  await chooseCiStatus(parts(page).intent);
  const panel = await toggleOnDevelopment(page, running.title);
  const proof = proofOf(panel);
  await expect(panel.locator(".intent-ci-state")).toHaveText(
    "Running at 70a0001 (Start the story)",
  );
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
  await expect(panel.locator(".intent-ci-state")).toContainText("Passed");
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
