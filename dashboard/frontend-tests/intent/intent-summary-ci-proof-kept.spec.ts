// A selected Intent entry's Summary when Intent's CI judgment is previously
// retrieved, not newly verified (../../src/IntentScopeEvidence.tsx,
// ../../src/IntentCiJudgedBranch.tsx): after a failed refresh the judgment
// and its run's proof stay readable, and the Summary's evidence labels say
// when its judgment was retrieved and that the refresh failed, announcing
// the failure in the homepage's own words. The judgment's keeping:
// ../../backend-tests/intent/; the Summary's journey:
// ../../../e2e/intent/intent-summary-ci-proof.spec.ts.

import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { ciReadingText, intentCiProof } from "./intent-attempt-proof-page.ts";
import {
  mountAttemptSummary,
  summaryEntries,
} from "./intent-attempt-summary-fixture.ts";
import { activateChosenCiTab } from "./intent-ci-homepage-page.ts";
import { judgedRun, openDoughSource } from "./intent-ci-status-fixtures.ts";
import { intentCiStatus } from "./intent-ci-status-page.ts";
import {
  evidenceLabel,
  evidenceLabels,
  expectEvidenceLabels,
  expectInFull,
  expectLabelInFull,
  labelWords,
} from "./intent-summary-evidence-page.ts";
import { childName, openSummary } from "./intent-summary-proof-page.ts";

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
  "Tree at b2b2b2b — newer files unproved here",
] as const;

test("a Summary qualifies a previously retrieved judgment and its failed refresh as the homepage does, the judgment and its proof still readable", async () => {
  const failedServiceRead = "GitHub answered 503 Service Unavailable";
  const { readProof } = await mountAttemptSummary(summaryEntries(true), {
    refreshFailure: failedServiceRead,
  });
  const ci = intentCiStatus();
  const proof = intentCiProof();
  await proof.showsRows(homeRows);
  await ci.showsChecked();
  const freshSummary = await openSummary("tests");
  await expectEvidenceLabels(evidenceLabels(freshSummary), runEvidence);
  await expect.element(freshSummary.getByRole("alert")).not.toBeInTheDocument();

  await activateChosenCiTab("click");
  await ci.checkAgain();
  const homeFailure = () => ciReadingText(ci.alert.query()?.textContent);
  await expect.poll(homeFailure).toContain("503");
  const failure = homeFailure();
  await expect.element(ci.checkAgainButton).toBeEnabled();
  const kept = ciReadingText(ci.status.element().textContent);
  expect(kept).toMatch(/^Previously retrieved at .+\.$/);
  await ci.answers(verdict);
  await proof.showsRows(homeRows);
  const keptAt = ci.status
    .element()
    .querySelector("time")
    ?.getAttribute("datetime");
  expect(keptAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);

  const summary = await openSummary("tests");
  await expectEvidenceLabels(evidenceLabels(summary), [
    kept,
    "Refresh failed",
    ...runEvidence,
  ]);
  const retrieved = await evidenceLabel(summary, kept);
  expect(labelWords(retrieved)).toBe(kept);
  await expectInFull(retrieved, "Previously retrieved, not newly verified");
  expect(
    retrieved.element().querySelector("time")?.getAttribute("datetime"),
  ).toBe(keptAt);
  await expectLabelInFull(summary, "Refresh failed", failure);
  await expect
    .poll(() => ciReadingText(summary.getByRole("alert").query()?.textContent))
    .toBe(failure);

  await userEvent.click(childName(summary, "root.sh"));
  await expect
    .element(page.getByLabelText("tests/root.sh source", { exact: true }))
    .toBeVisible();
  const returned = await openSummary("tests");
  await expectEvidenceLabels(evidenceLabels(returned), [
    kept,
    "Refresh failed",
    ...runEvidence,
  ]);
  expect(
    readProof.mock.calls.map(([source, subject]) => [source, subject]),
  ).toEqual([[openDoughSource, judgedRun]]);
});
