// Test execution time beside each CI proof entry on Intent's homepage
// (../../src/IntentCiProof.tsx, ../../src/ciProofWording.ts,
// ../../src/ciProofTimeWords.ts): complete durations show test execution time
// 4 min and 2 min beside entry counts with CI wall time 3 min; an older
// summary shows not recorded with why while wall time still comes from the CI
// read; a missing shard shows partial with that part named; missing timing
// is never shown as zero (SEED-239 examples 2 and 6).

import type { Locator } from "@playwright/test";
import { expect, test } from "../dashboardTest.ts";
import {
  artifactId,
  expectProofRows,
  openFailedRun,
  proofTable,
  run,
} from "../intentCiProofPage.ts";
import { judged, runUrl } from "../intentCiStatusPage.ts";
import {
  counts,
  proofSummary,
  runArtifactsAnswer,
  summaryZipAnswer,
} from "../support/ciProofArtifacts.ts";

const wallTime = "CI wall time 3 min.";
const notRecorded =
  "not recorded: this summary has no test execution durations";

// The Test execution time column, one cell per entry row.
const executionCells = (proof: Locator) =>
  proofTable(proof).locator("tbody tr td:nth-of-type(2)");

const timedSummary = () =>
  proofSummary(
    run,
    [
      ["tests", 2],
      ["dashboard/tests", 2],
    ],
    [
      ["tests", 1, 2, "checks", counts(3), 180_000],
      ["tests", 2, 2, "checks", counts(2), 60_000],
      ["dashboard/tests", 1, 2, "tests", counts(8), 75_000],
      ["dashboard/tests", 2, 2, "tests", counts(4), 45_000],
    ],
  );

const olderSummary = () =>
  proofSummary(
    run,
    [
      ["tests", 1],
      ["dashboard/tests", 1],
    ],
    [
      ["tests", 1, 1, "checks", counts(5)],
      ["dashboard/tests", 1, 1, "tests", counts(12)],
    ],
  );

const missingShardSummary = () =>
  proofSummary(
    run,
    [["dashboard/tests", 2]],
    [["dashboard/tests", 1, 2, "tests", counts(10), 90_000]],
  );

async function openWithSummary(
  page: Parameters<typeof openFailedRun>[0],
  summary: unknown,
) {
  return openFailedRun(
    page,
    () => runArtifactsAnswer(run, artifactId),
    () => summaryZipAnswer(summary),
    () => [
      {
        headSha: judged,
        conclusion: "success",
        url: runUrl,
        id: run.runId,
        startedAt: "2026-11-05T10:00:00Z",
        completedAt: "2026-11-05T10:03:00Z",
      },
    ],
  );
}

test("complete entry durations show test execution time 4 min and 2 min beside counts with CI wall time 3 min", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const { panel, proof } = await openWithSummary(page, timedSummary());
  await expect(panel.locator(".intent-ci-state")).toContainText("Passed");
  await expect(proof.locator(".intent-ci-wall-time")).toHaveText(wallTime);
  await expectProofRows(proof, [
    ["tests", "5 passed checks", "4 min", "2 of 2 parts present"],
    ["dashboard/tests", "12 passed tests", "2 min", "2 of 2 parts present"],
  ]);
  await expect(executionCells(proof)).toHaveText(["4 min", "2 min"]);
  // Summed execution is never CI wall time, nor their total.
  await expect(proof).not.toContainText("6 min");
  await expect(proofTable(proof)).not.toContainText("3 min");
});

test("an older summary without durations shows test execution time not recorded while wall time still shows", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const { proof } = await openWithSummary(page, olderSummary());
  await expect(proof.locator(".intent-ci-wall-time")).toHaveText(wallTime);
  await expectProofRows(proof, [
    ["tests", "5 passed checks", notRecorded, "1 of 1 part present"],
    ["dashboard/tests", "12 passed tests", notRecorded, "1 of 1 part present"],
  ]);
  await expect(executionCells(proof)).toHaveText([notRecorded, notRecorded]);
});

test("a missing shard shows test execution time partial with that part named", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const { proof } = await openWithSummary(page, missingShardSummary());
  await expectProofRows(proof, [
    [
      "dashboard/tests",
      "10 passed tests",
      "partial: part 2 of 2 missing",
      "1 of 2 parts present; part 2 of 2 missing",
    ],
  ]);
  // The present part's 90 s is not shown as if it were the whole entry's.
  await expect(executionCells(proof)).toHaveText([
    "partial: part 2 of 2 missing",
  ]);
});
