// Test execution time beside each CI proof entry on Intent's homepage
// (../../src/IntentCiProof.tsx, ../../src/ciProofWording.ts,
// ../../src/ciProofTimeWords.ts): complete durations show test execution time
// 4 min, 2 min and 57.6 s beside entry counts with CI wall time 3 min;
// a present shard with zero results adds no duration gap; an older
// summary shows No timings while wall time still comes from the CI read; a
// missing shard shows Part 2 missing; an untimed part shows Part 2 untimed
// while parts timed at zero show 0 ms; each gap label's full explanation is
// the cell's accessible description and hover; missing timing is never
// shown as zero (SEED-239 examples 2 and 6, SEED-259 key example 4).

import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { mountJudgedRunProof } from "./intent-ci-status-fixtures.ts";
import { intentCiProof, intentCiStatus } from "./intent-ci-status-page.ts";

const wallTime = "CI wall time 3 min";
const noTimings = "No timings";
const noTimingsWhy =
  "Not recorded: this summary has no test execution durations";

const timedEntries = () => [
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
  makeMe.aCiProofEntry
    .at("dashboard/frontend-tests")
    .holding(
      makeMe.aCiProofEvidence
        .inUnit("case")
        .withFile("dashboard/frontend-tests/frontend.spec.ts", {
          passed: 26,
          durationMs: 57_551,
        })
        .withPresentPart(2, { passed: 0, failed: 0, other: 0 })
        .please(),
    )
    .please(),
];

const olderEntries = () => [
  makeMe.aCiProofEntry.at("tests").counting(5, "file").please(),
  makeMe.aCiProofEntry.at("dashboard/tests").counting(12, "case").please(),
];

const missingShardEntries = () => [
  makeMe.aCiProofEntry
    .at("dashboard/tests")
    .counting(10, "case")
    .timed(90_000)
    .inParts(2, { missing: [2] })
    .please(),
];

// The run's Passed judgment ran from 10:00 to 10:03.
const runTimes = {
  startedAt: "2026-11-05T10:00:00Z",
  completedAt: "2026-11-05T10:03:00Z",
};

test("complete entry durations include entries with empty shards and stay distinct from CI wall time", async () => {
  await mountJudgedRunProof({ entries: timedEntries(), judgment: runTimes });
  const ci = intentCiStatus();
  const proof = intentCiProof();
  await ci.answers("Passed at a1b2c3d (Add login)");
  await proof.showsEvidenceLabel(wallTime);
  await proof.showsRows([
    ["tests", "5 passed test files", "4 min"],
    ["dashboard/tests", "12 passed test cases", "2 min"],
    ["dashboard/frontend-tests", "26 passed test cases", "57.6 s"],
  ]);
  // Summed execution is never CI wall time, nor their total.
  expect(proof.proof.element().textContent).not.toContain("6 min");
  expect(proof.table.element().textContent).not.toContain("3 min");
});

test("an older summary without durations shows No timings while wall time still shows", async () => {
  await mountJudgedRunProof({ entries: olderEntries(), judgment: runTimes });
  const proof = intentCiProof();
  await proof.showsEvidenceLabel(wallTime);
  await proof.showsRows([
    ["tests", "5 passed test files", noTimings],
    ["dashboard/tests", "12 passed test cases", noTimings],
  ]);
  const cells = proof.executionCells();
  expect(cells).toHaveLength(2);
  for (const cell of cells) {
    await expect.element(cell).toHaveTextContent(noTimings);
    await expect.element(cell).toHaveAccessibleDescription(noTimingsWhy);
    await expect.element(cell).toHaveAttribute("title", noTimingsWhy);
  }
});

test("a missing shard shows Part 2 missing with the full explanation", async () => {
  await mountJudgedRunProof({
    entries: missingShardEntries(),
    judgment: runTimes,
  });
  const proof = intentCiProof();
  await proof.showsRows([
    ["dashboard/tests", "10 passed test cases", "Part 2 missing"],
  ]);
  // The present part's 90 s is not shown as if it were the whole entry's.
  const cells = proof.executionCells();
  expect(cells).toHaveLength(1);
  const [cell] = cells;
  if (cell === undefined) throw new Error("Expected one execution cell");
  await expect.element(cell).toHaveTextContent("Part 2 missing");
  await expect
    .element(cell)
    .toHaveAccessibleDescription("Partial: part 2 of 2 missing");
  await expect
    .element(cell)
    .toHaveAttribute("title", "Partial: part 2 of 2 missing");
});

test("an untimed part shows Part 2 untimed while parts timed at zero show 0 ms", async () => {
  await mountJudgedRunProof({
    entries: [
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
    ],
    judgment: runTimes,
  });
  const proof = intentCiProof();
  await expect.element(proof.table).toBeVisible();
  const [zeroTimed, untimed] = proof.executionCells();
  if (zeroTimed === undefined || untimed === undefined) {
    throw new Error("Expected two execution cells");
  }
  await expect.element(zeroTimed).toHaveTextContent("0 ms");
  await expect.element(untimed).toHaveTextContent("Part 2 untimed");
  // A measured zero is a figure with nothing to explain; the gap label's
  // explanation reaches assistive technology and hover, without a lower bound.
  expect(zeroTimed.element().getAttribute("title")).toBeNull();
  await expect
    .element(untimed)
    .toHaveAccessibleDescription("Partial: part 2 of 3 has no duration");
  await expect
    .element(untimed)
    .toHaveAttribute("title", "Partial: part 2 of 3 has no duration");
  expect(proof.table.element().textContent).not.toContain("1 min 20 s");
});
