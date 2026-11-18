// A selected Intent entry's Summary when Intent's CI judgment is previously
// retrieved, not newly verified (../../src/IntentScopeEvidence.tsx,
// ../../src/IntentCiJudgedBranch.tsx): after a failed refresh the judgment
// and its run's proof stay readable, and the Summary's evidence labels say
// when its judgment was retrieved and that the refresh failed, announcing
// the failure in the homepage's own words. The judgment's keeping:
// ../../backend-tests/intent/; the Summary's journey:
// ../../../e2e/intent/intent-summary-ci-proof.spec.ts.

import {
  evidenceLabel,
  evidenceLabels,
  expectEvidenceLabels,
  expectInFull,
  expectLabelInFull,
  labelWords,
} from "../../test-support/ciEvidenceLabelsPage.ts";
import { expectProofRows } from "../../test-support/intentCiProofPage.ts";
import {
  openSummary,
  treeGap,
} from "../../test-support/intentSummaryCiProofFixtures.ts";
import {
  activateIntentHome,
  ciStatusReading,
  expectCiAnswer,
} from "../../test-support/intentCiStatusPage.ts";
import {
  bothEntries,
  openSummaryCiProof,
} from "../../test-support/support/frontendSummaryCiProof.ts";
import { expect, test } from "../../test-support/support/frontendApp.ts";

const verdict = "Passed at a1b2c3d (Add login)";
const homeRows = [
  [
    "dashboard/tests",
    "5 passed, 1 failed and 1 other test cases",
    "1 test case untimed",
  ],
  ["tests", "2 passed test files", "3.0 s"],
] as const;

// How the Summary names run 41's proof: its run and attempt, revision,
// branch, and that the tree shows a newer revision.
const runEvidence = [
  "Run 41 · attempt 1",
  "Revision a1b2c3d",
  "Branch main",
  treeGap,
] as const;

test("a Summary qualifies a previously retrieved judgment and its failed refresh as the homepage does, the judgment and its proof still readable", async ({
  page,
  frontendServices,
}) => {
  const { panel, proof, ci, intent } = await openSummaryCiProof(
    page,
    frontendServices,
    bothEntries(true),
  );
  await expectProofRows(proof, homeRows);
  await expect(ciStatusReading(panel).freshness).toContainText("Checked at");
  const freshSummary = await openSummary(intent, "tests");
  await expectEvidenceLabels(evidenceLabels(freshSummary), runEvidence);
  await expect(freshSummary.getByRole("alert")).toHaveCount(0);

  await activateIntentHome(intent);
  ci.failNext("main", 502, "GitHub answered 503 Service Unavailable");
  await panel.getByRole("button", { name: "Check again" }).click();
  await expect(panel.getByRole("alert")).toContainText("503");
  await expect(
    panel.getByRole("button", { name: "Check again" }),
  ).toBeEnabled();
  const kept = (await ciStatusReading(panel).freshness.textContent()) ?? "";
  expect(kept).toMatch(/^Previously retrieved at .+\.$/);
  // The previously retrieved judgment and its run's proof stay readable.
  await expectCiAnswer(panel, verdict);
  await expectProofRows(proof, homeRows);
  const keptAt =
    await ciStatusReading(panel).checkedTime.getAttribute("datetime");
  const failure = (await panel.getByRole("alert").textContent()) ?? "";

  const summary = await openSummary(intent, "tests");
  // Short labels lead the evidence: when it was retrieved, in the homepage's
  // words, and that the refresh failed, its failure announced in full.
  await expectEvidenceLabels(evidenceLabels(summary), [
    kept,
    "Refresh failed",
    ...runEvidence,
  ]);
  const retrieved = evidenceLabel(summary, kept);
  await expect(labelWords(retrieved)).toHaveText(kept);
  await expectInFull(retrieved, "Previously retrieved, not newly verified");
  await expect(retrieved.locator("time")).toHaveAttribute(
    "datetime",
    keptAt ?? "",
  );
  await expectLabelInFull(summary, "Refresh failed", failure);
  await expect(summary.getByRole("alert")).toHaveText(failure);
});
