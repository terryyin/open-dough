import { comparisonReading } from "../intentCiComparisonPage.ts";
// Real cancelled-landing acquisition retains the selected later build and its
// provenance through the authenticated comparison and rendered Landed row.

import { expect, test } from "../support/preparationPage.ts";
import { shortSha } from "../../src/baseCiWording.ts";
import { githubFor } from "../dashboardTest.ts";
import { proofCalls } from "../intentCiProofPage.ts";
import { publishCodeLandedBeforeCompletion } from "../support/storyCiComparisonEarlierLanding.ts";
import {
  laterTrunkRevisions,
  serveEarlierLandingWithLandedOutcome,
} from "../support/storyCiComparisonLandedOutcome.ts";
import {
  landedOf,
  laterProof,
  runListingsAt,
} from "../support/storyCiComparisonCancelledLanding.ts";
import { wall } from "../support/storyCiComparisonFixture.ts";
import { selectDoneStoryForCiComparison } from "../support/selectDoneStoryForCiComparison.ts";

test("a cancelled landing merge uses the next trunk push's passing build as a later build", async ({
  page,
  origin,
}) => {
  const setup = await publishCodeLandedBeforeCompletion(page, origin);
  const landing = setup.landingMerge ?? setup.completion;
  const later = laterTrunkRevisions(origin.origin, landing);
  expect(later[0]).toBe(setup.completion);
  serveEarlierLandingWithLandedOutcome(setup, "cancelled", {
    [setup.completion]: [
      wall(
        setup.completion,
        304,
        "2026-11-05T14:30:00Z",
        "2026-11-05T14:34:00Z",
      ),
    ],
  });
  setup.serveProofs(laterProof(304, setup.completion));
  const { panel } = await selectDoneStoryForCiComparison(page);
  const landed = landedOf(panel);
  await expect(landed.identity).toContainText(
    `Cancelled at ${shortSha(landing)}.`,
  );
  await expect(landed.identity).toContainText(shortSha(setup.completion));
  await expect(landed.identity).toContainText(
    "later trunk build: includes 1 later trunk revision",
  );
  await expect(landed.identity).not.toContainText("run 304");
  await expect(landed.wall).toHaveText("4 min");
  // Branch versus Baseline stays readable; the trunk-side parent never stands in.
  await expect(comparisonReading(panel).wallTimes.nth(1)).toHaveText(
    "3 min 20 s",
  );
  expect(runListingsAt(page, later)).toEqual([1, 0, 0]);
  expect(
    proofCalls(githubFor(page).calls).filter((call) =>
      call.startsWith("artifacts of run 304"),
    ),
  ).toEqual(["artifacts of run 304: ci-proof-summary-attempt-1"]);
});
