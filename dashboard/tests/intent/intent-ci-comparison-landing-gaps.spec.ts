// Landing-merge Landed gaps for Intent's CI timing comparison
// (../../src/IntentCiComparison.tsx): a failed or cancelled build at the
// trunk-first integration merge stays C's own gap without figures from its
// trunk-side parent, while Branch versus Baseline stays readable (SEED-248
// examples E3/E8). Other gap journeys live in ./intent-ci-comparison-gaps.spec.ts.

import { expect, test } from "../support/preparationPage.ts";
import { shortSha } from "../../src/baseCiWording.ts";
import {
  publishCodeLandedBeforeCompletion,
  serveEarlierLandingWithLandedOutcome,
} from "../support/storyCiComparisonEarlierLanding.ts";
import { selectDoneStoryForCiComparison } from "../support/selectDoneStoryForCiComparison.ts";

test.setTimeout(240_000);

test("a failed landing merge build is labelled failed without trunk-side figures", async ({
  page,
  origin,
}) => {
  test.slow();
  const setup = await publishCodeLandedBeforeCompletion(page, origin);
  const landed = setup.landingMerge ?? setup.completion;
  serveEarlierLandingWithLandedOutcome(setup, "failure");
  const { panel } = await selectDoneStoryForCiComparison(page);
  await expect(
    panel.locator(".intent-ci-comparison-wall").nth(1),
  ).toContainText("+20 s");
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

test("a cancelled landing merge build explains cancelled without trunk-side figures", async ({
  page,
  origin,
}) => {
  test.slow();
  const setup = await publishCodeLandedBeforeCompletion(page, origin);
  serveEarlierLandingWithLandedOutcome(setup, "cancelled");
  const { panel } = await selectDoneStoryForCiComparison(page);
  await expect(panel.locator(".intent-ci-comparison-active")).toHaveText(
    "Baseline compared with Branch",
  );
  await expect(
    panel.locator(".intent-ci-comparison-active-reason"),
  ).toContainText("Landed is not used:");
  await expect(
    panel.locator(".intent-ci-comparison-active-reason"),
  ).toContainText("cancelled");
  await expect(
    panel.locator(".intent-ci-comparison-wall").nth(1),
  ).toContainText("+20 s");
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(2),
  ).toContainText("cancelled");
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(2),
  ).toContainText("landing merge");
  await expect(panel.locator(".intent-ci-comparison-wall").nth(2)).toHaveText(
    "—",
  );
  await expect(panel).not.toContainText("run 398");
  await expect(panel).not.toContainText("run 304");
  await expect(panel).not.toContainText("10 min");
  if (setup.trunkSide !== undefined) {
    await expect(panel).not.toContainText(shortSha(setup.trunkSide));
  }
});
