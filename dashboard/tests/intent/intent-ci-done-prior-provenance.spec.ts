import { priorBuildReferenceReading } from "../priorBuildReferencePage.ts";
import { comparisonReading } from "../intentCiComparisonPage.ts";
import {
  storyReviewEndpoint,
  storyReviewSchema,
} from "../../src/storyReviewContract.ts";
import { shortSha } from "../../src/baseCiWording.ts";
import { expect, test } from "../support/preparationPage.ts";
import { publishSkippedPlanningLanding } from "../support/storyCiComparisonSkippedFixture.ts";
import { publishCodeLandedBeforeCompletion } from "../support/storyCiComparisonEarlierLanding.ts";
import { serveEarlierLandingWithLandedOutcome } from "../support/storyCiComparisonLandedOutcome.ts";
import { laterProof } from "../support/storyCiComparisonCancelledLanding.ts";
import { wall } from "../support/storyCiComparisonFixture.ts";
import { selectDoneStoryForCiComparison } from "../support/selectDoneStoryForCiComparison.ts";
import { keepDoneWallProvenanceHistory } from "../support/doneWallProvenanceHistory.ts";

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
    keepDoneWallProvenanceHistory(dashboard.home, origin, setup, {
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
    const history = panel.getByRole("region", {
      name: "Done CI wall time reference",
      exact: true,
    });
    await expect(history).toContainText(
      `Selected landing ${shortSha(endpoint)}`,
    );
    await expect(history).toContainText("Prior-build average · 1 min 40 s");
    await expect(history).toContainText("5 prior builds used");
    expect(representedRequests).toContain(endpoint);
    expect(representedRequests).not.toContain(setup.completion);
    const samples = priorBuildReferenceReading(history);
    await expect(samples.selected).toHaveCount(1);
    await expect(samples.included).toHaveCount(5);
    const selected = samples.selected;
    await expect(selected).toContainText(shortSha(measured));
    await expect(
      selected.getByRole("link", { name: `Run ${runId} · attempt 1` }),
    ).toHaveAttribute("href", `https://ci.invalid/runs/${runId}`);
    if (selection === "equivalent") {
      await expect(selected).toContainText("reused equivalent");
      await expect(samples.excluded).toContainText(
        "Measured build is at or after the selected endpoint",
      );
      await expect(history).toContainText("+3 min 20 s (+200%)");
      await expect(comparisonReading(panel).identities.nth(2)).toContainText(
        "equivalent build",
      );
    } else {
      await expect(selected).toContainText("later trunk build");
      await expect(history).toContainText(
        "Selected measurement uses a later trunk build and includes later changes",
      );
      await expect(history).toContainText("+2 min 20 s (+140%)");
      await expect(comparisonReading(panel).identities.nth(2)).toContainText(
        `Cancelled at ${shortSha(endpoint)}`,
      );
    }
  });
}
