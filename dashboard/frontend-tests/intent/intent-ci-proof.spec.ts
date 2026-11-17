// The CI proof of the run Intent's CI status tab shows a result of
// (../../src/IntentCiProof.tsx): after the judgment, which reads as it always
// has, Proof names that run once as short labels -- its linked run and attempt,
// revision and CI wall time -- then a table with one row per entry the run's CI
// declared, in its order, read cell by cell under the Entry, Counts, Test
// execution time headers (unit and any timing gap). The proof answer is
// controlled (../../tests/support/frontendCiRunProofAnswers.ts); reading the
// run's artifacts into it, the omitted-attempt refusal and per-attempt memory:
// ../../backend-tests/intent/ci-proof-*.spec.ts,
// ../../backend-tests/intent/intent-ci-proof-read.spec.ts and
// ../../../e2e/intent/intent-ci-proof-{reasons,units}.spec.ts.

import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  expectAttemptAt,
  expectAttemptLinked,
} from "../../tests/ciEvidenceLabelsPage.ts";
import { parts } from "../../tests/dashboardPage.ts";
import {
  ciEntryName,
  ciProofReading,
  expectProofRows,
  failedVerdict,
  openCiEntry,
  proofTable,
} from "../../tests/intentCiProofPage.ts";
import { expectCiAnswer, runUrl } from "../../tests/intentCiStatusPage.ts";
import { intentLocationName } from "../../tests/intentPerspectivePage.ts";
import { intentReadingPane } from "../../tests/intentReadingPlacePage.ts";
import { summaryRegion } from "../../tests/intentScopeProofPage.ts";
import { openFrontendRunProof } from "../../tests/support/frontendCiRunProofAnswers.ts";
import { expect, test } from "../../tests/support/frontendApp.ts";

const notRecorded = "No timings";
const failed = { state: "failed" } as const;

test("a failed run shows Failed while its Proof is held, then Proof of that run's revision, link and attempt with each entry's counts and timing", async ({
  page,
}) => {
  const { panel, proof, held, reads } = await openFrontendRunProof(
    page,
    [
      makeMe.aCiProofEntry
        .at("dashboard/tests")
        .holding(
          makeMe.aCiProofEvidence
            .inUnit("case")
            .counting(12, 0, 0)
            .inParts(2)
            .withPresentPart(2, { passed: 7, failed: 1, other: 0, untimed: 0 })
            .please(),
        )
        .please(),
      makeMe.aCiProofEntry.at("tests").counting(5, "file").please(),
      makeMe.aCiProofEntry.at("retired-tests").counting(1, "file").please(),
    ],
    failed,
    { hold: true },
  );

  await test.step("the verdict is shown while Proof is still being read", async () => {
    await expectCiAnswer(panel, failedVerdict);
    await expect(proof).toContainText("Checking the CI proof of this run…");
    await expect(
      panel.locator(".intent-ci-state ~ .intent-ci-proof"),
    ).toBeVisible();
    held?.release();
  });

  await test.step("Proof names the run once, then one row per declared entry", async () => {
    await expectAttemptAt(proof, "Run 41 · attempt 1", "a1b2c3d");
    await expectAttemptLinked(proof, "Run 41 · attempt 1", runUrl);
    await expectProofRows(proof, [
      ["dashboard/tests", "19 passed and 1 failed test cases", notRecorded],
      ["tests", "5 passed test files", notRecorded],
      ["retired-tests", "1 passed test file", notRecorded],
    ]);
    await expectCiAnswer(panel, failedVerdict);
    expect(reads()).toBe(1);
  });

  await test.step("a configured entry opens its directory Summary; historical-only entries have no dead link", async () => {
    await expect(ciEntryName(proof, "retired-tests")).toHaveCount(0);
    await openCiEntry(proof, "dashboard/tests");
    const { intent } = parts(page);
    await expect(
      summaryRegion(intent).locator(".intent-summary-path"),
    ).toHaveText("dashboard/tests");
    await expect(intentLocationName(intent, "dashboard/tests")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(intentReadingPane(intent)).toBeFocused();
  });
});

test("a missing part is shown as a gap and its counts are not counted", async ({
  page,
}) => {
  const evidence = makeMe.aCiProofEvidence
    .inUnit("case")
    .counting(10)
    .inParts(12, { missing: [4] });
  for (const part of [2, 3, 5, 6, 7, 8, 9, 10, 11, 12])
    evidence.withPresentPart(part, { passed: 10, untimed: 0 });
  const { proof } = await openFrontendRunProof(
    page,
    [
      makeMe.aCiProofEntry
        .at("dashboard/tests")
        .holding(evidence.please())
        .please(),
    ],
    failed,
  );
  await expectProofRows(proof, [
    ["dashboard/tests", "110 passed test cases", "Part 4 missing"],
  ]);
  await expect(
    proofTable(proof).getByRole("cell", { name: "Part 4 missing" }),
  ).toHaveAccessibleDescription("Partial: part 4 of 12 missing");
});

test("an unavailable proof leaves the judgment readable and says no proof can be shown", async ({
  page,
}) => {
  const { panel, proof } = await openFrontendRunProof(page, [], failed, {
    proof: { kind: "unavailable", reason: "none" },
  });
  await expect(ciProofReading(proof).unavailable).toBeVisible();
  await expectCiAnswer(panel, failedVerdict);
});
