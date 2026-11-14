import { doneWallTimeHistory } from "../../dashboard/tests/priorBuildReferencePage.ts";
import { comparisonReading } from "../../dashboard/tests/intentCiComparisonPage.ts";
import {
  storyReviewEndpoint,
  storyReviewSchema,
} from "../../dashboard/src/storyReviewContract.ts";
import { shortSha } from "../../dashboard/src/baseCiWording.ts";
import { expect, test } from "../../dashboard/tests/support/preparationPage.ts";
import { publishSkippedPlanningLanding } from "../../dashboard/tests/support/storyCiComparisonSkippedFixture.ts";
import { publishCodeLandedBeforeCompletion } from "../../dashboard/tests/support/storyCiComparisonEarlierLanding.ts";
import { serveEarlierLandingWithLandedOutcome } from "../../dashboard/tests/support/storyCiComparisonLandedOutcome.ts";
import { laterProof } from "../../dashboard/tests/support/storyCiComparisonCancelledLanding.ts";
import { wall } from "../../dashboard/tests/support/storyCiComparisonFixture.ts";
import { selectDoneStoryForCiComparison } from "../../dashboard/tests/support/selectDoneStoryForCiComparison.ts";
import { keepDoneWallProvenanceHistory } from "../../dashboard/tests/support/doneWallProvenanceHistory.ts";

for (const selection of ["equivalent", "later"] as const) {
  test(`a Done ${selection} measurement keeps the represented landing distinct from completion and its selected build`, async ({
    page,
    dashboard,
    origin,
  }) => {
    // Ensure five real Git predecessors besides the selected shared attempt.
    for (const index of [1, 2, 3, 4, 5, 6])
      await origin.publishRevision({
        message: `prior build ${index}`,
        files: { [`prior-${index}.txt`]: `prior ${index}\n` },
      });
    const setup =
      selection === "equivalent"
        ? await publishSkippedPlanningLanding(page, origin)
        : await publishCodeLandedBeforeCompletion(page, origin);
    const endpoint = setup.landingMerge;
    if (endpoint === undefined) throw new Error("Distinct landing required");
    expect(endpoint).not.toBe(setup.completion);
    const measured =
      selection === "equivalent" ? setup.trunkSide : setup.completion;
    if (measured === undefined) throw new Error("Measured revision required");
    const runId = selection === "equivalent" ? 201 : 304;
    if (selection === "later") {
      serveEarlierLandingWithLandedOutcome(setup, "cancelled", {
        [measured]: [
          wall(measured, 304, "2026-11-05T14:30:00Z", "2026-11-05T14:34:00Z"),
        ],
      });
      setup.serveProofs(laterProof(304, measured));
    }
    await keepDoneWallProvenanceHistory(dashboard.home, origin, setup, {
      revision: measured,
      runId,
      selection,
      ms: selection === "equivalent" ? 300000 : 240000,
      startedAt:
        selection === "equivalent"
          ? "2026-11-05T13:30:00Z"
          : "2026-11-05T14:30:00Z",
    });
    const representedRequests: string[] = [];
    page.on("request", (request) => {
      const url = new URL(request.url());
      if (
        url.pathname === "/__authenticated-read" &&
        url.searchParams.get("intent") === "ci-history" &&
        !url.searchParams.has("scope")
      )
        representedRequests.push(url.searchParams.get("revision") ?? "");
    });
    const published = page.waitForResponse((response) => {
      const url = new URL(response.url());
      return (
        url.pathname === storyReviewEndpoint &&
        url.searchParams.get("historical") === "true"
      );
    });
    const { panel } = await selectDoneStoryForCiComparison(page);
    expect(
      storyReviewSchema.parse(await (await published).json()),
    ).toMatchObject({
      kind: "published",
      completion: setup.completion,
      landingRevision: endpoint,
    });
    const history = doneWallTimeHistory(panel);
    const standIn =
      selection === "equivalent"
        ? "Reused equivalent first-parent build"
        : "Later trunk build, includes later changes";
    const timing = selection === "equivalent" ? "5 min" : "4 min";
    await expect(history.selected).toHaveText(
      `Selected landing ${shortSha(endpoint)} · ${timing} · ${standIn}`,
    );
    await expect(history.average).toHaveText(
      "Prior-build average · 1 min 40 s · 5 prior builds used",
    );
    expect(representedRequests).toContain(endpoint);
    expect(representedRequests).not.toContain(setup.completion);
    await expect(history.chart.selected).toHaveCount(1);
    await expect(history.chart.readout).toHaveText(
      `Nov 5 · Selected landing · ${timing}`,
    );
    if (selection === "equivalent") {
      await expect(history.change).toHaveText(
        "vs. prior average · +3 min 20 s (+200%)",
      );
      await expect(comparisonReading(panel).identities.nth(2)).toContainText(
        "equivalent build",
      );
    } else {
      await expect(history.change).toHaveText(
        "vs. prior average · +2 min 20 s (+140%)",
      );
      await expect(comparisonReading(panel).identities.nth(2)).toContainText(
        `Cancelled at ${shortSha(endpoint)}`,
      );
    }
  });
}
