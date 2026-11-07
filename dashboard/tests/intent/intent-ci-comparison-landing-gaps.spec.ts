// Landing-merge Landed gaps for Intent's CI timing comparison
// (../../src/IntentCiComparison.tsx): a failed build at the trunk-first
// integration merge stays C's own result without figures from its trunk-side
// parent, while Branch versus Baseline stays readable (SEED-248 example E3).
// Cancelled landings live in ./intent-ci-comparison-cancelled-landing*.spec.ts;
// other gap journeys in ./intent-ci-comparison-gaps.spec.ts.

import { expect, test } from "../support/preparationPage.ts";
import { shortSha } from "../../src/baseCiWording.ts";
import { publishCodeLandedBeforeCompletion } from "../support/storyCiComparisonEarlierLanding.ts";
import { serveEarlierLandingWithLandedOutcome } from "../support/storyCiComparisonLandedOutcome.ts";
import { selectDoneStoryForCiComparison } from "../support/selectDoneStoryForCiComparison.ts";

test("a failed landing merge build is labelled failed without trunk-side figures", async ({
  page,
  origin,
}) => {
  const setup = await publishCodeLandedBeforeCompletion(page, origin);
  const landed = setup.landingMerge ?? setup.completion;
  serveEarlierLandingWithLandedOutcome(setup, "failure");
  const { panel } = await selectDoneStoryForCiComparison(page);
  await expect(panel.locator(".intent-ci-comparison-wall").nth(1)).toHaveText(
    "3 min 20 s",
  );
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(2),
  ).toContainText(shortSha(landed));
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(2),
  ).toContainText("failed");
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(2),
  ).toContainText("failed build");
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(2),
  ).not.toContainText(shortSha(setup.completion));
  if (setup.trunkSide !== undefined) {
    await expect(
      panel.locator(".intent-ci-comparison-identity").nth(2),
    ).not.toContainText(shortSha(setup.trunkSide));
  }
  await expect(panel).not.toContainText("run 398");
  await expect(panel).not.toContainText("run 304");
  await expect(panel).not.toContainText("10 min");
});
