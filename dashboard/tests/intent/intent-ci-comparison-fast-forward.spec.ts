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
import { listedAttemptJobPages } from "../support/storyCiComparisonFixture.ts";
import { publishFastForwardLandedStory } from "../support/storyCiComparisonFastForward.ts";
import {
  publishEarlierLandingThenLaterFastForward,
  publishTrunkCompletionThenEarlierBranchFastForward,
} from "../support/storyCiComparisonLaterFastForward.ts";
import { selectDoneStoryForCiComparison } from "../support/selectDoneStoryForCiComparison.ts";

test("a fast-forward landing after a story-first merge of main names the tip as Branch and Landed (SEED-248 E6)", async ({
  page,
  origin,
}) => {
  test.slow();
  const setup = await publishFastForwardLandedStory(page, origin);
  const { panel } = await selectDoneStoryForCiComparison(page);

  await expect(panel.getByRole("heading")).toHaveText(
    `CI timing changes for ${setup.identity}`,
  );
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(1),
  ).toContainText(shortSha(setup.branchSide));
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(2),
  ).toContainText(shortSha(setup.branchSide));
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(2),
  ).toContainText("exact revision");
  // Main-side parent of the story-first merge is never Branch.
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(1),
  ).not.toContainText(shortSha(setup.mainSide));
  await expect(panel).not.toContainText("run 498");
  await expect(panel).not.toContainText("10 min");
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(1).getByRole("link", {
      name: "run 402 #1",
      exact: true,
    }),
  ).toHaveAttribute("href", "https://ci.invalid/runs/402");
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(2).getByRole("link", {
      name: "run 402 #1",
      exact: true,
    }),
  ).toHaveAttribute("href", "https://ci.invalid/runs/402");
  await expect(panel.locator(".intent-ci-comparison-wall").nth(1)).toHaveText(
    "3 min 20 s",
  );
  await expect(panel.locator(".intent-ci-comparison-wall").nth(2)).toHaveText(
    "3 min 20 s",
  );
  expect(listedAttemptJobPages(githubFor(page).calls)).toEqual([
    "401/1/1",
    "402/1/1",
  ]);
});

test("a later fast-forward keeps an earlier story's trunk-first landing and baseline (SEED-248 E7)", async ({
  page,
  origin,
}) => {
  test.slow();
  const setup = await publishEarlierLandingThenLaterFastForward(page, origin);
  const { panel } = await selectDoneStoryForCiComparison(page);
  const branchBuild = setup.firstBranchSide;
  const landed = setup.firstLandingMerge;

  await expect(panel.getByRole("heading")).toHaveText(
    `CI timing changes for ${setup.identity}`,
  );
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(0),
  ).toContainText(shortSha(setup.firstBaseline));
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(1),
  ).toContainText(shortSha(branchBuild));
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(2),
  ).toContainText(shortSha(landed));
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(2),
  ).toContainText("exact revision");
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(1).getByRole("link", {
      name: "run 302 #1",
      exact: true,
    }),
  ).toHaveAttribute("href", "https://ci.invalid/runs/302");
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(2).getByRole("link", {
      name: "run 303 #1",
      exact: true,
    }),
  ).toHaveAttribute("href", "https://ci.invalid/runs/303");
  // Later second-story tip and completion D must not replace A/B/C.
  await expect(panel).not.toContainText("run 501");
  await expect(panel).not.toContainText("run 304");
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
  test.slow();
  const setup = await publishTrunkCompletionThenEarlierBranchFastForward(
    page,
    origin,
  );
  const { panel } = await selectDoneStoryForCiComparison(page);

  await expect(panel.getByRole("heading")).toHaveText(
    `CI timing changes for ${setup.identity}`,
  );
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(0),
  ).toContainText(shortSha(setup.baseline));
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(2),
  ).toContainText(shortSha(setup.completion));
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(2).getByRole("link", {
      name: "run 103 #1",
      exact: true,
    }),
  ).toHaveAttribute("href", "https://ci.invalid/runs/103");
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(2),
  ).not.toContainText(shortSha(setup.later));
  await expect(panel).not.toContainText("run 501");
  await expect(panel).not.toContainText("10 min");
  await expect(panel.locator(".intent-ci-comparison-wall").nth(2)).toHaveText(
    "4 min",
  );
});
