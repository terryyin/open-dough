// Requested-revision status on Intent's CI timing comparison
// (../../src/IntentCiComparison.tsx) and Summary evidence
// (../../src/IntentScopeComparisonTable.tsx SlotSha): Skipped when
// paths-ignore accounts for the absence, Cancelled when the provider
// cancelled the run, and No build with the reason when the path rule cannot
// confirm a skip (SEED-254 slice 1). Proof selection stays today's
// measured-ancestor / exact-only rules.

import { expect, test } from "../support/preparationPage.ts";
import { shortSha } from "../../src/baseCiWording.ts";
import { readWaitLimitMs } from "../../src/authenticatedReadRules.ts";
import { parts } from "../dashboardPage.ts";
import {
  publishCancelledBaseline,
  publishCodeStartWithoutBuild,
  publishSkippedPlanningBaseline,
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
