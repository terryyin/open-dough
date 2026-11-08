// Landing-merge Landed gaps for Intent's CI timing comparison
// (../../src/IntentCiComparison.tsx): a failed build at the trunk-first
// integration merge stays C's own result without figures from its trunk-side
// parent, while Branch versus Baseline stays readable (SEED-248 example E3).
// Cancelled landings live in ./intent-ci-comparison-cancelled-landing*.spec.ts;
// other gap journeys in ./intent-ci-comparison-gaps.spec.ts.

import { expect, test } from "../support/preparationPage.ts";
import { shortSha } from "../../src/baseCiWording.ts";
import {
  expectExactSourceCue,
  expectNoRunOrAttemptIds,
} from "../support/expectCiComparisonSourceCue.ts";
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
  const landedIdentity = panel.locator(".intent-ci-comparison-identity").nth(2);
  await expect(landedIdentity).toContainText(shortSha(landed));
  await expectExactSourceCue(landedIdentity);
  await expect(landedIdentity).toContainText("failed build");
  await expect(landedIdentity).not.toContainText(shortSha(setup.completion));
  if (setup.trunkSide !== undefined) {
    await expect(landedIdentity).not.toContainText(shortSha(setup.trunkSide));
  }
  await expectNoRunOrAttemptIds(landedIdentity);
  await expect(panel).not.toContainText("10 min");
});
