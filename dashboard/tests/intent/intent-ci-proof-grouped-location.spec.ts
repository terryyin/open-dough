import {
  ciProofReading,
  artifactId,
  expectProofRows,
  openFailedRun,
  run,
} from "../intentCiProofPage.ts";
// One CI status Proof row per declared location with every result type's own
// counts, times, and genuine gaps labeled in that row (../../src/IntentCiProof.tsx,
// ../../src/ciProofEntryCells.ts). Decisive published-summary facts — shard
// totals, empty reports that need no duration, a file failure kept beside
// cases — expressed through MakeMe. Units journey across Summary and file:
// ../../../e2e/intent/intent-ci-proof-units.spec.ts.

import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { expect, test } from "../dashboardTest.ts";

import {
  proofSummaryForEntries,
  runArtifactsAnswer,
  summaryZipAnswer,
} from "../support/ciProofArtifacts.ts";

const groupedLocationSummary = () =>
  proofSummaryForEntries(run, [
    makeMe.aCiProofEntry
      .at("frontend/tests")
      .holding(
        makeMe.aCiProofEvidence
          .inUnit("case")
          .inParts(2)
          .withPresentPart(1, {
            passed: 1_271,
            failed: 0,
            other: 0,
            durationMs: 32_000,
          })
          .withPresentPart(2, {
            passed: 1_271,
            failed: 0,
            other: 0,
            durationMs: 32_995.5,
          })
          .please(),
        makeMe.aCiProofEvidence
          .inUnit("file")
          .inParts(2)
          .withPresentPart(1, { passed: 0, failed: 0, other: 0 })
          .withPresentPart(2, { passed: 0, failed: 0, other: 0 })
          .please(),
      )
      .please(),
    makeMe.aCiProofEntry
      .at("scripts")
      .holding(
        makeMe.aCiProofEvidence
          .inUnit("case")
          .counting(450)
          .timed(98_861.103_353)
          .please(),
        makeMe.aCiProofEvidence
          .inUnit("file")
          .counting(22)
          .timed(34_203.487)
          .inParts(14)
          .please(),
      )
      .please(),
    makeMe.aCiProofEntry
      .at("mixed/gap")
      .holding(
        makeMe.aCiProofEvidence
          .inUnit("case")
          .counting(8)
          .timed(1_200)
          .please(),
        makeMe.aCiProofEvidence
          .inUnit("file")
          .inParts(2, { missing: [2] })
          .withPresentPart(1, {
            passed: 3,
            failed: 0,
            other: 0,
            durationMs: 400,
          })
          .please(),
      )
      .please(),
    makeMe.aCiProofEntry
      .at("with-failure")
      .holding(
        makeMe.aCiProofEvidence.inUnit("case").counting(4).timed(800).please(),
        makeMe.aCiProofEvidence
          .inUnit("file")
          .counting(0, 1, 0)
          .timed(12)
          .please(),
      )
      .please(),
  ]);

test("one location row keeps each result type's shard totals, empty reports, file failure beside cases, and a typed timing gap", async ({
  page,
}) => {
  const { proof } = await openFailedRun(
    page,
    () => runArtifactsAnswer(run, artifactId),
    () => summaryZipAnswer(groupedLocationSummary()),
  );
  await expectProofRows(proof, [
    [
      "frontend/tests",
      ["test cases: 2542 passed test cases", "test files: no test files"],
      ["test cases: 1 min 5 s", "test files: No timings"],
    ],
    [
      "scripts",
      ["test cases: 450 passed test cases", "test files: 22 passed test files"],
      ["test cases: 1 min 39 s", "test files: 34.2 s"],
    ],
    [
      "mixed/gap",
      ["test cases: 8 passed test cases", "test files: 3 passed test files"],
      ["test cases: 1.2 s", "test files: Part 2 missing"],
    ],
    [
      "with-failure",
      ["test cases: 4 passed test cases", "test files: 1 failed test file"],
      ["test cases: 800 ms", "test files: 12 ms"],
    ],
  ]);
  const fileGap = ciProofReading(proof).unitLines.filter({
    hasText: "Part 2 missing",
  });
  await expect(fileGap).toHaveAttribute(
    "title",
    "Partial: part 2 of 2 missing",
  );
  await expect(fileGap).toHaveAccessibleDescription(
    "Partial: part 2 of 2 missing",
  );
  await expect(proof.getByRole("row")).toHaveCount(5);
});
