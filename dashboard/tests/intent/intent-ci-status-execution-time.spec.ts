// Test execution time beside each CI proof entry on Intent's homepage
// (../../src/IntentCiProof.tsx, ../../src/ciProofWording.ts,
// ../../src/ciProofTimeWords.ts): complete durations show test execution time
// 4 min and 2 min beside entry counts with CI wall time 3 min; an older
// summary shows No timings while wall time still comes from the CI read; a
// missing shard shows Part 2 missing; an untimed part shows Part 2 untimed
// while parts timed at zero show 0 ms; each gap label's full explanation is
// the cell's accessible description and hover; missing timing is never
// shown as zero (SEED-239 examples 2 and 6, SEED-259 key example 4).

import type { Locator } from "@playwright/test";
import { expect, test } from "../dashboardTest.ts";
import { evidenceLabel, labelWords } from "../ciEvidenceLabelsPage.ts";
import {
  artifactId,
  expectProofRows,
  openFailedRun,
  proofTable,
  run,
} from "../intentCiProofPage.ts";
import { judged, runUrl } from "../intentCiStatusPage.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import {
  proofSummaryForEntries,
  runArtifactsAnswer,
  summaryZipAnswer,
} from "../support/ciProofArtifacts.ts";

const wallTime = "CI wall time 3 min";
const noTimings = "No timings";
const noTimingsWhy =
  "Not recorded: this summary has no test execution durations";

// The Test execution time column, one cell per entry row.
const executionCells = (proof: Locator) =>
  proofTable(proof).locator("tbody tr td:nth-of-type(2)");

const timedSummary = () =>
  proofSummaryForEntries(run, [
    makeMe.aCiProofEntry
      .at("tests")
      .holding(
        makeMe.aCiProofEvidence
          .inUnit("file")
          .counting(3, 0, 0)
          .timed(180_000)
          .inParts(2)
          .withPresentPart(2, {
            passed: 2,
            failed: 0,
            other: 0,
            durationMs: 60_000,
          })
          .please(),
      )
      .please(),
    makeMe.aCiProofEntry
      .at("dashboard/tests")
      .holding(
        makeMe.aCiProofEvidence
          .inUnit("case")
          .counting(8, 0, 0)
          .timed(75_000)
          .inParts(2)
          .withPresentPart(2, {
            passed: 4,
            failed: 0,
            other: 0,
            durationMs: 45_000,
          })
          .please(),
      )
      .please(),
  ]);

const olderSummary = () =>
  proofSummaryForEntries(run, [
    makeMe.aCiProofEntry.at("tests").counting(5, "file").please(),
    makeMe.aCiProofEntry.at("dashboard/tests").counting(12, "case").please(),
  ]);

const missingShardSummary = () =>
  proofSummaryForEntries(run, [
    makeMe.aCiProofEntry
      .at("dashboard/tests")
      .counting(10, "case")
      .timed(90_000)
      .inParts(2, { missing: [2] })
      .please(),
  ]);

async function openWithSummary(
  page: Parameters<typeof openFailedRun>[0],
  summary: unknown,
) {
  return openFailedRun(
    page,
    () => runArtifactsAnswer(run, artifactId),
    () => summaryZipAnswer(summary),
    () => [
      makeMe.aCiRun
        .with({
          headSha: judged,
          conclusion: "success",
          url: runUrl,
          databaseId: run.runId,
          startedAt: "2026-11-05T10:00:00Z",
          completedAt: "2026-11-05T10:03:00Z",
        })
        .please(),
    ],
  );
}

test("complete entry durations show test execution time 4 min and 2 min beside counts with CI wall time 3 min", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const { panel, proof } = await openWithSummary(page, timedSummary());
  await expect(panel.locator(".intent-ci-state")).toContainText("Passed");
  await expect(labelWords(evidenceLabel(proof, wallTime))).toHaveText(wallTime);
  await expectProofRows(proof, [
    ["tests", "5 passed test files", "4 min"],
    ["dashboard/tests", "12 passed test cases", "2 min"],
  ]);
  await expect(executionCells(proof)).toHaveText(["4 min", "2 min"]);
  // Summed execution is never CI wall time, nor their total.
  await expect(proof).not.toContainText("6 min");
  await expect(proofTable(proof)).not.toContainText("3 min");
});

test("an older summary without durations shows No timings while wall time still shows", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const { proof } = await openWithSummary(page, olderSummary());
  await expect(labelWords(evidenceLabel(proof, wallTime))).toHaveText(wallTime);
  await expectProofRows(proof, [
    ["tests", "5 passed test files", noTimings],
    ["dashboard/tests", "12 passed test cases", noTimings],
  ]);
  await expect(executionCells(proof)).toHaveText([noTimings, noTimings]);
  for (const cell of await executionCells(proof).all()) {
    await expect(cell).toHaveAccessibleDescription(noTimingsWhy);
    await expect(cell).toHaveAttribute("title", noTimingsWhy);
  }
});

test("a missing shard shows Part 2 missing with the full explanation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const { proof } = await openWithSummary(page, missingShardSummary());
  await expectProofRows(proof, [
    ["dashboard/tests", "10 passed test cases", "Part 2 missing"],
  ]);
  // The present part's 90 s is not shown as if it were the whole entry's.
  await expect(executionCells(proof)).toHaveText(["Part 2 missing"]);
  await expect(executionCells(proof)).toHaveAccessibleDescription(
    "Partial: part 2 of 2 missing",
  );
});

test("an untimed part shows Part 2 untimed while parts timed at zero show 0 ms", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const { proof } = await openWithSummary(
    page,
    proofSummaryForEntries(run, [
      makeMe.aCiProofEntry
        .at("tests")
        .holding(
          makeMe.aCiProofEvidence
            .inUnit("file")
            .counting(3, 0, 0)
            .timed(0)
            .inParts(2)
            .withPresentPart(2, {
              passed: 2,
              failed: 0,
              other: 0,
              durationMs: 0,
            })
            .please(),
        )
        .please(),
      makeMe.aCiProofEntry
        .at("dashboard/tests")
        .holding(
          makeMe.aCiProofEvidence
            .inUnit("case")
            .counting(8, 0, 0)
            .timed(75_000)
            .inParts(3)
            .withPresentPart(2, { passed: 4, failed: 0, other: 0, untimed: 0 })
            .withPresentPart(3, {
              passed: 1,
              failed: 0,
              other: 0,
              durationMs: 5_000,
            })
            .please(),
        )
        .please(),
    ]),
  );
  await expect(executionCells(proof)).toHaveText(["0 ms", "Part 2 untimed"]);
  // A measured zero is a figure with nothing to explain; the gap label's
  // explanation reaches assistive technology and hover, without a lower bound.
  await expect(executionCells(proof).first()).not.toHaveAttribute(
    "title",
    /./u,
  );
  const untimed = executionCells(proof).nth(1);
  await expect(untimed).toHaveAccessibleDescription(
    "Partial: part 2 of 3 has no duration",
  );
  await expect(untimed).toHaveAttribute(
    "title",
    "Partial: part 2 of 3 has no duration",
  );
  await expect(proofTable(proof)).not.toContainText("1 min 20 s");
});
