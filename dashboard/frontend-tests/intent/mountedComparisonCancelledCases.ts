import { comparisonReading } from "../../test-support/intentCiComparisonPage.ts";
// Cancelled landing gaps keep Branch readable and show their exact reason.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { test, expect } from "../../test-support/support/pageTest.ts";

for (const [name, reason, forbidden] of [
  [
    "nearest proofless later build",
    "The CI build at the landing merge was cancelled. The nearest later trunk build at eeeeeee (run 399 #1) published no CI proof summary.",
    "5 min",
  ],
  [
    "running later build",
    "The CI build at the landing merge was cancelled. A later trunk build at fffffff (run 403 #1) is still running, so no later trunk build has finished yet.",
    "7 min",
  ],
  [
    "proofless then running",
    "The CI build at the landing merge was cancelled. The nearest later trunk build at eeeeeee (run 304 #1) published no CI proof summary. A later trunk build at fffffff (run 305 #1) is still running.",
    "no later trunk build has finished yet",
  ],
  [
    "no later result at the read head",
    "The CI build at the landed story revision was cancelled. No later trunk build has finished yet.",
    "7 min",
  ],
] as const) {
  test(`cancelled Landed fallback preserves ${name} explanation without borrowed timing`, async ({
    renderComparison,
  }) => {
    const panel = await renderComparison(
      makeMe.aComparedStory
        .wallTimed()
        .withAnswer({
          landed: {
            kind: "none",
            explanation: reason,
            awaitingLaterBuild: true,
            requestedStatus: {
              kind: "cancelled",
              explanation: "Cancelled at ddddddd.",
            },
          },
        })
        .withMixedEntries()
        .please(),
    );
    const identity = comparisonReading(panel).identities.last();
    await expect(identity).toContainText("Cancelled at ddddddd.");
    await expect(identity).toContainText(reason);
    await expect(comparisonReading(panel).activeComparison).toHaveText(
      "Baseline compared with Branch",
    );
    await expect(comparisonReading(panel).fallbackReason).toHaveText(
      `Landed is not used: ${reason}`,
    );
    await expect(comparisonReading(panel).wallTimes.last()).toHaveText("—");
    await expect(comparisonReading(panel).timesWithoutWaits.last()).toHaveText(
      "—",
    );
    await expect(panel).not.toContainText(forbidden);
  });
}
