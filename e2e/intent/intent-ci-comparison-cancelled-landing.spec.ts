import { comparisonReading } from "../../dashboard/tests/intentCiComparisonPage.ts";
// Real cancelled-landing acquisition retains the selected later build and its
// provenance through the authenticated comparison and rendered Landed row.

import { expect, test } from "../../dashboard/tests/support/preparationPage.ts";
import { shortSha } from "../../dashboard/src/baseCiWording.ts";
import { githubFor } from "../../dashboard/tests/dashboardTest.ts";
import { proofCalls } from "../../dashboard/tests/intentCiProofPage.ts";
import { publishCodeLandedBeforeCompletion } from "../../dashboard/tests/support/storyCiComparisonEarlierLanding.ts";
import {
  laterTrunkRevisions,
  serveEarlierLandingWithLandedOutcome,
} from "../../dashboard/tests/support/storyCiComparisonLandedOutcome.ts";
import {
  landedOf,
  laterProof,
  runListingsAt,
} from "../../dashboard/tests/support/storyCiComparisonCancelledLanding.ts";
import { wall } from "../../dashboard/tests/support/storyCiComparisonFixture.ts";
import { selectDoneStoryForCiComparison } from "../../dashboard/tests/support/selectDoneStoryForCiComparison.ts";

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
