// Requested-revision status on Intent's CI timing comparison
// (../../src/IntentCiComparison.tsx) and Summary evidence
// (../../src/IntentScopeComparisonTable.tsx SlotSha): Skipped when
// paths-ignore accounts for the absence, Cancelled when the provider
// cancelled the run, and No build with the reason when the path rule cannot
// confirm a skip (SEED-254). Landed uses a confirmed skip's equivalent-build
// proof only (slice 2). Baseline / Branch walk past builds without usable
// proof (slice 3).

import { expect, test } from "../support/preparationPage.ts";
import { shortSha } from "../../src/baseCiWording.ts";
import { readWaitLimitMs } from "../../src/authenticatedReadRules.ts";
import { githubFor } from "../dashboardTest.ts";
import { parts } from "../dashboardPage.ts";
import { proofCalls } from "../intentCiProofPage.ts";
import { expectCiComparisonEntryRows } from "../support/expectCiComparisonEntryRows.ts";
import {
  publishCancelledBaseline,
  publishCodeLandingWithoutBuild,
  publishCodeStartWithoutBuild,
  publishSkippedBaselinePastProoflessParent,
  publishSkippedLandingWithoutProof,
  publishSkippedPlanningBaseline,
  publishSkippedPlanningLanding,
} from "../support/storyCiComparisonSkippedFixture.ts";
import { selectDoneStoryForCiComparison } from "../support/selectDoneStoryForCiComparison.ts";
import { openSummaryComparison } from "../support/selectDoneStoryForSummaryComparison.ts";

test.setTimeout(240_000);

test("Baseline names Skipped at a planning-only start and keeps the ancestor build", async ({
  page,
  origin,
}) => {
  test.slow();
  const setup = await publishSkippedPlanningBaseline(page, origin);
  const { panel } = await selectDoneStoryForCiComparison(page);
  const skippedAt = `Skipped at ${shortSha(setup.storyStart)} because CI ignores every change since its nearest built ancestor ${shortSha(setup.baseline)}.`;
  const baselineIdentity = panel
    .locator(".intent-ci-comparison-identity")
    .nth(0);
  await expect(baselineIdentity).toContainText(skippedAt);
  await expect(baselineIdentity).toContainText(shortSha(setup.baseline));
  await expect(baselineIdentity).toContainText("run 101 #1");
  await expect(baselineIdentity).toContainText(
    `ancestor: ${String(setup.laterWithoutBuild)} later revision`,
  );
  await expect(panel.locator(".intent-ci-comparison-wall").nth(0)).toHaveText(
    "3 min",
  );
  await expect(
    panel.getByRole("table", { name: "CI entry timing comparison" }),
  ).toBeVisible({ timeout: readWaitLimitMs + 15_000 });
  const { intent } = parts(page);
  const summary = await openSummaryComparison(intent, "dashboard/tests");
  await expect(summary.locator(".intent-summary-evidence")).toContainText(
    skippedAt,
  );
  await expect(summary.locator(".intent-summary-evidence")).toContainText(
    shortSha(setup.baseline),
  );
});

test("Baseline names Cancelled at a start whose run was cancelled and keeps the ancestor build", async ({
  page,
  origin,
}) => {
  test.slow();
  const setup = await publishCancelledBaseline(page, origin);
  const { panel } = await selectDoneStoryForCiComparison(page);
  const baselineIdentity = panel
    .locator(".intent-ci-comparison-identity")
    .nth(0);
  await expect(baselineIdentity).toContainText(
    `Cancelled at ${shortSha(setup.storyStart)}.`,
  );
  await expect(baselineIdentity).toContainText(shortSha(setup.baseline));
  await expect(baselineIdentity).toContainText("run 101 #1");
  await expect(panel.locator(".intent-ci-comparison-wall").nth(0)).toHaveText(
    "3 min",
  );
});

test("Baseline walks past a proofless parent to the grandparent's proof and counts two revisions", async ({
  page,
  origin,
}) => {
  test.slow();
  const setup = await publishSkippedBaselinePastProoflessParent(page, origin);
  expect(setup.laterWithoutBuild).toBe(2);
  const github = githubFor(page);
  const { panel } = await selectDoneStoryForCiComparison(page);
  const skippedAt = `Skipped at ${shortSha(setup.storyStart)} because CI ignores every change since its nearest built ancestor ${shortSha(setup.prooflessParent)}.`;
  const baselineIdentity = panel
    .locator(".intent-ci-comparison-identity")
    .nth(0);
  await expect(baselineIdentity).toContainText(skippedAt);
  await expect(baselineIdentity).toContainText(shortSha(setup.baseline));
  await expect(baselineIdentity).toContainText("run 100 #1");
  await expect(baselineIdentity).not.toContainText("run 101");
  await expect(baselineIdentity).toContainText(
    "ancestor: 2 later revisions without a build",
  );
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
  test.slow();
  const setup = await publishCodeStartWithoutBuild(page, origin);
  const { panel } = await selectDoneStoryForCiComparison(page);
  const baselineIdentity = panel
    .locator(".intent-ci-comparison-identity")
    .nth(0);
  await expect(baselineIdentity).toContainText(
    `No build at ${shortSha(setup.storyStart)}: changes CI does not ignore.`,
  );
  await expect(baselineIdentity).toContainText(shortSha(setup.baseline));
  await expect(baselineIdentity).toContainText("run 101 #1");
  await expect(panel.locator(".intent-ci-comparison-wall").nth(0)).toHaveText(
    "3 min",
  );
});

test("Landed names Skipped at a planning-only merge and uses the equivalent build proof", async ({
  page,
  origin,
}) => {
  test.slow();
  const setup = await publishSkippedPlanningLanding(page, origin);
  const { panel } = await selectDoneStoryForCiComparison(page);
  const skippedAt = `Skipped at ${shortSha(setup.landingMerge)} because CI ignores every change since its nearest built ancestor ${shortSha(setup.trunkSide)}.`;
  const landedIdentity = panel.locator(".intent-ci-comparison-identity").nth(2);
  await expect(landedIdentity).toContainText(skippedAt);
  await expect(landedIdentity).toContainText(shortSha(setup.trunkSide));
  await expect(landedIdentity).toContainText("run 201 #1");
  await expect(landedIdentity).toContainText("equivalent build");
  await expect(landedIdentity).not.toContainText(shortSha(setup.olderBaseline));
  await expect(panel.locator(".intent-ci-comparison-wall").nth(2)).toHaveText(
    "5 min",
  );
  await expect(
    panel.getByRole("table", { name: "CI entry timing comparison" }),
  ).toBeVisible({ timeout: readWaitLimitMs + 15_000 });
  await expectCiComparisonEntryRows(panel, [
    [
      "dashboard/tests",
      "2,090 → 2,092 +2 tests",
      "4 min",
      "4 min 30 s +30 s",
      "5 min +1 min",
      "1 of 1 part present",
    ],
    [
      "tests",
      "5 → 5 0 checks",
      "2 min",
      "1 min 30 s -30 s",
      "1 min -1 min",
      "1 of 1 part present",
    ],
    [
      "src/skills",
      "added → 3 checks",
      "added",
      "30 s",
      "30 s",
      "1 of 1 part present",
    ],
  ]);
});

test("Landed names Skipped when the equivalent build published no proof and walks no further", async ({
  page,
  origin,
}) => {
  test.slow();
  const setup = await publishSkippedLandingWithoutProof(page, origin);
  const { panel } = await selectDoneStoryForCiComparison(page);
  const landedIdentity = panel.locator(".intent-ci-comparison-identity").nth(2);
  await expect(landedIdentity).toContainText(
    `Skipped at ${shortSha(setup.landingMerge)} because CI ignores every change since its nearest built ancestor ${shortSha(setup.trunkSide)}.`,
  );
  await expect(landedIdentity).toContainText(
    `The equivalent build at ${shortSha(setup.trunkSide)} published no CI proof summary.`,
  );
  await expect(landedIdentity).not.toContainText("run 201");
  await expect(landedIdentity).not.toContainText("run 101");
  await expect(landedIdentity).not.toContainText(shortSha(setup.olderBaseline));
  await expect(panel.locator(".intent-ci-comparison-wall").nth(2)).toHaveText(
    "—",
  );
});

test("Landed names No build for a code landing with no run and uses no ancestor proof", async ({
  page,
  origin,
}) => {
  test.slow();
  const setup = await publishCodeLandingWithoutBuild(page, origin);
  const { panel } = await selectDoneStoryForCiComparison(page);
  const landedIdentity = panel.locator(".intent-ci-comparison-identity").nth(2);
  await expect(landedIdentity).toContainText(
    `No build at ${shortSha(setup.landingMerge)}: changes CI does not ignore.`,
  );
  await expect(landedIdentity).not.toContainText(shortSha(setup.trunkSide));
  await expect(landedIdentity).not.toContainText("run 201");
  await expect(landedIdentity).not.toContainText("equivalent build");
  await expect(panel.locator(".intent-ci-comparison-wall").nth(2)).toHaveText(
    "—",
  );
});
