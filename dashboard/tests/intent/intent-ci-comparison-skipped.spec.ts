// Baseline requested-revision status on Intent's CI timing comparison
// (../../src/IntentCiComparison.tsx) and Summary evidence
// (../../src/IntentScopeComparisonTable.tsx endpointLabel): Skipped when
// paths-ignore accounts for the absence, Cancelled when the provider
// cancelled the run, and No build with the reason when the path rule cannot
// confirm a skip (SEED-254). Baseline / Branch walk past builds without
// usable proof. Landed confirmed-skip journeys are in
// ./intent-ci-comparison-skipped-landed.spec.ts.

import { expect, test } from "../support/preparationPage.ts";
import {
  anyComparisonLabels,
  expectLabelInFull,
} from "../ciEvidenceLabelsPage.ts";
import { shortSha } from "../../src/baseCiWording.ts";
import { readWaitLimitMs } from "../../src/authenticatedReadRules.ts";
import { githubFor } from "../dashboardTest.ts";
import { parts } from "../dashboardPage.ts";
import { proofCalls } from "../intentCiProofPage.ts";
import {
  publishCancelledBaseline,
  publishCodeStartWithoutBuild,
  publishSkippedBaselinePastProoflessParent,
  publishSkippedPlanningBaseline,
} from "../support/storyCiComparisonSkippedFixture.ts";
import { selectDoneStoryForCiComparison } from "../support/selectDoneStoryForCiComparison.ts";
import { openSummaryComparison } from "../support/selectDoneStoryForSummaryComparison.ts";
import {
  expectAncestorSourceCue,
  expectExactSourceCue,
  expectNoRunOrAttemptIds,
} from "../support/expectCiComparisonSourceCue.ts";

test("Baseline names Skipped at a planning-only start and keeps the ancestor build", async ({
  page,
  origin,
}) => {
  const setup = await publishSkippedPlanningBaseline(page, origin);
  const { panel } = await selectDoneStoryForCiComparison(page);
  const skippedAt = `Skipped at ${shortSha(setup.storyStart)} because CI ignores every change since its nearest built ancestor ${shortSha(setup.baseline)}.`;
  const baselineIdentity = panel
    .locator(".intent-ci-comparison-identity")
    .nth(0);
  const branchIdentity = panel.locator(".intent-ci-comparison-identity").nth(1);
  const landedIdentity = panel.locator(".intent-ci-comparison-identity").nth(2);
  const branchBuild = setup.branchAncestor ?? setup.branchSide;
  const branchSkippedAt = `Skipped at ${shortSha(setup.branchSide)} because CI ignores every change since its nearest built ancestor ${shortSha(branchBuild)}.`;
  // Routine Skipped stays out of the default Build cell; Summary still names it.
  await expect(baselineIdentity).not.toContainText(skippedAt);
  await expect(baselineIdentity).toContainText(shortSha(setup.baseline));
  await expectAncestorSourceCue(
    baselineIdentity,
    `ancestor: ${String(setup.laterWithoutBuild)} later revision`,
  );
  await expectNoRunOrAttemptIds(baselineIdentity);
  await expect(branchIdentity).not.toContainText(branchSkippedAt);
  await expect(branchIdentity).toContainText(shortSha(branchBuild));
  // Tip is complete + planning-only over the integrated ancestor (two later
  // revisions without a build); selection stays ancestor, not exact.
  await expectAncestorSourceCue(
    branchIdentity,
    "ancestor: 2 later revisions without a build",
  );
  await expectNoRunOrAttemptIds(branchIdentity);
  await expect(landedIdentity).toContainText(shortSha(setup.completion));
  await expectExactSourceCue(landedIdentity);
  await expectNoRunOrAttemptIds(landedIdentity);
  await expect(panel.locator(".intent-ci-comparison-wall").nth(0)).toHaveText(
    "3 min",
  );
  await expect(panel.locator(".intent-ci-comparison-wall").nth(1)).toHaveText(
    "3 min 20 s",
  );
  await expect(panel.locator(".intent-ci-comparison-wall").nth(2)).toHaveText(
    "4 min",
  );
  await expect(
    panel.getByRole("table", { name: "CI entry timing comparison" }),
  ).toBeVisible({ timeout: readWaitLimitMs + 15_000 });
  const { intent } = parts(page);
  const summary = await openSummaryComparison(intent, "dashboard/tests");
  // The Summary labels Baseline Skipped beside the ancestor build's revision,
  // the full status heard after it and on hover.
  await expectLabelInFull(
    anyComparisonLabels(summary),
    `Baseline Skipped ${shortSha(setup.baseline)}`,
    skippedAt,
  );
});

test("Baseline names Cancelled at a start whose run was cancelled and keeps the ancestor build", async ({
  page,
  origin,
}) => {
  const setup = await publishCancelledBaseline(page, origin);
  const { panel } = await selectDoneStoryForCiComparison(page);
  const baselineIdentity = panel
    .locator(".intent-ci-comparison-identity")
    .nth(0);
  await expect(baselineIdentity).toContainText(
    `Cancelled at ${shortSha(setup.storyStart)}.`,
  );
  await expect(baselineIdentity).toContainText(shortSha(setup.baseline));
  await expectAncestorSourceCue(baselineIdentity);
  await expectNoRunOrAttemptIds(baselineIdentity);
  await expect(panel.locator(".intent-ci-comparison-wall").nth(0)).toHaveText(
    "3 min",
  );
});

test("Baseline walks past a proofless parent to the grandparent's proof and counts two revisions", async ({
  page,
  origin,
}) => {
  const setup = await publishSkippedBaselinePastProoflessParent(page, origin);
  expect(setup.laterWithoutBuild).toBe(2);
  const github = githubFor(page);
  const { panel } = await selectDoneStoryForCiComparison(page);
  const skippedAt = `Skipped at ${shortSha(setup.storyStart)} because CI ignores every change since its nearest built ancestor ${shortSha(setup.prooflessParent)}.`;
  const baselineIdentity = panel
    .locator(".intent-ci-comparison-identity")
    .nth(0);
  await expect(baselineIdentity).not.toContainText(skippedAt);
  await expect(baselineIdentity).toContainText(shortSha(setup.baseline));
  await expectAncestorSourceCue(
    baselineIdentity,
    "ancestor: 2 later revisions without a build",
  );
  await expectNoRunOrAttemptIds(baselineIdentity);
  await expect(panel.locator(".intent-ci-comparison-wall").nth(0)).toHaveText(
    "3 min",
  );
  await expect(
    panel.getByRole("table", { name: "CI entry timing comparison" }),
  ).toBeVisible({ timeout: readWaitLimitMs + 15_000 });
  const listed = proofCalls(github.calls);
  expect(listed).toContain("artifacts of run 101: ci-proof-summary-attempt-1");
  expect(
    listed.filter(
      (call) =>
        call === "artifacts of run 100: ci-proof-summary-attempt-1" ||
        call === "zip 1000",
    ),
  ).toEqual(["artifacts of run 100: ci-proof-summary-attempt-1", "zip 1000"]);
});

test("Baseline names No build with the path reason when the start changes code", async ({
  page,
  origin,
}) => {
  const setup = await publishCodeStartWithoutBuild(page, origin);
  const { panel } = await selectDoneStoryForCiComparison(page);
  const baselineIdentity = panel
    .locator(".intent-ci-comparison-identity")
    .nth(0);
  await expect(baselineIdentity).toContainText(
    `No build at ${shortSha(setup.storyStart)}: changes CI does not ignore.`,
  );
  await expect(baselineIdentity).toContainText(shortSha(setup.baseline));
  await expectAncestorSourceCue(baselineIdentity);
  await expectNoRunOrAttemptIds(baselineIdentity);
  await expect(panel.locator(".intent-ci-comparison-wall").nth(0)).toHaveText(
    "3 min",
  );
});
