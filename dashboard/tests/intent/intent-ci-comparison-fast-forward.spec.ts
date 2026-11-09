// SEED-248 fast-forward landing journeys for Intent's CI timing comparison
// (../../src/IntentCiComparison.tsx): B and C name the tip after a story-first
// merge then trunk fast-forward, and a later second-story fast-forward keeps
// an earlier trunk-first landing, and a later branch started before a Trunk
// Mode completion keeps that completion as Landed (SEED-253). Happy-path, SEED-236 and unrecoverable
// journeys live in ./intent-ci-comparison.spec.ts; no-build gaps at a
// fast-forward tip live in ./intent-ci-comparison-gaps.spec.ts.

import { expect, test } from "../support/preparationPage.ts";
import { shortSha } from "../../src/baseCiWording.ts";
import { githubFor } from "../dashboardTest.ts";
import {
  listedAttemptJobPages,
  runsListedAgain,
} from "../support/storyCiComparisonRequests.ts";
import { publishFastForwardLandedStory } from "../support/storyCiComparisonFastForward.ts";
import {
  publishEarlierLandingThenLaterFastForward,
  publishTrunkCompletionThenEarlierBranchFastForward,
} from "../support/storyCiComparisonLaterFastForward.ts";
import { selectDoneStoryForCiComparison } from "../support/selectDoneStoryForCiComparison.ts";
import {
  expectExactSourceCue,
  expectNoRunOrAttemptIds,
} from "../support/expectCiComparisonSourceCue.ts";

test("a fast-forward landing after a story-first merge of main names the tip as Branch and Landed (SEED-248 E6)", async ({
  page,
  origin,
}) => {
  const setup = await publishFastForwardLandedStory(page, origin);
  const { panel } = await selectDoneStoryForCiComparison(page);

  await expect(panel.getByRole("heading")).toHaveText([
    /^Baseline compared with /,
    "CI entry timing comparison",
  ]);
  const branchIdentity = panel.locator(".intent-ci-comparison-identity").nth(1);
  const landedIdentity = panel.locator(".intent-ci-comparison-identity").nth(2);
  await expect(branchIdentity).toContainText(shortSha(setup.branchSide));
  await expect(landedIdentity).toContainText(shortSha(setup.branchSide));
  await expectExactSourceCue(landedIdentity);
  await expectExactSourceCue(branchIdentity);
  // Main-side parent of the story-first merge is never Branch.
  await expect(branchIdentity).not.toContainText(shortSha(setup.mainSide));
  await expect(panel).not.toContainText("10 min");
  await expectNoRunOrAttemptIds(branchIdentity);
  await expectNoRunOrAttemptIds(landedIdentity);
  await expect(panel.locator(".intent-ci-comparison-wall").nth(1)).toHaveText(
    "3 min 20 s",
  );
  await expect(panel.locator(".intent-ci-comparison-wall").nth(2)).toHaveText(
    "3 min 20 s",
  );
  const { calls } = githubFor(page);
  expect(listedAttemptJobPages(calls)).toEqual(["401/1/1", "402/1/1"]);
  // One read lists each revision's runs once, though Branch and Landed both
  // name the tip.
  expect(runsListedAgain(calls)).toEqual([]);
});

test("a later fast-forward keeps an earlier story's trunk-first landing and baseline (SEED-248 E7)", async ({
  page,
  origin,
}) => {
  const setup = await publishEarlierLandingThenLaterFastForward(page, origin);
  const { panel } = await selectDoneStoryForCiComparison(page);
  const branchBuild = setup.firstBranchSide;
  const landed = setup.firstLandingMerge;

  await expect(panel.getByRole("heading")).toHaveText([
    /^Baseline compared with /,
    "CI entry timing comparison",
  ]);
  const baselineIdentity = panel
    .locator(".intent-ci-comparison-identity")
    .nth(0);
  const branchIdentity = panel.locator(".intent-ci-comparison-identity").nth(1);
  const landedIdentity = panel.locator(".intent-ci-comparison-identity").nth(2);
  await expect(baselineIdentity).toContainText(shortSha(setup.firstBaseline));
  await expect(branchIdentity).toContainText(shortSha(branchBuild));
  await expect(landedIdentity).toContainText(shortSha(landed));
  await expectExactSourceCue(landedIdentity);
  await expectNoRunOrAttemptIds(branchIdentity);
  await expectNoRunOrAttemptIds(landedIdentity);
  // Later second-story tip and completion D must not replace A/B/C.
  await expect(panel).not.toContainText("10 min");
  await expect(panel.locator(".intent-ci-comparison-wall").nth(1)).toHaveText(
    "3 min 20 s",
  );
  await expect(panel.locator(".intent-ci-comparison-wall").nth(2)).toHaveText(
    "4 min",
  );
});

test("a later branch started before a Trunk Mode completion keeps that completion as Landed after it merges main and fast-forwards (SEED-253)", async ({
  page,
  origin,
}) => {
  const setup = await publishTrunkCompletionThenEarlierBranchFastForward(
    page,
    origin,
  );
  const { panel } = await selectDoneStoryForCiComparison(page);

  await expect(panel.getByRole("heading")).toHaveText([
    /^Baseline compared with /,
    "CI entry timing comparison",
  ]);
  const landedIdentity = panel.locator(".intent-ci-comparison-identity").nth(2);
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(0),
  ).toContainText(shortSha(setup.baseline));
  await expect(landedIdentity).toContainText(shortSha(setup.completion));
  await expectExactSourceCue(landedIdentity);
  await expectNoRunOrAttemptIds(landedIdentity);
  await expect(landedIdentity).not.toContainText(shortSha(setup.later));
  await expect(panel).not.toContainText("10 min");
  await expect(panel.locator(".intent-ci-comparison-wall").nth(2)).toHaveText(
    "4 min",
  );
});
