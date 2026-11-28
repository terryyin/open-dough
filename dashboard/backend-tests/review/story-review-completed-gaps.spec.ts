import { expect, test } from "../../test-support/support/preparationPage.ts";
import {
  getReview as get,
  completedStoryQuery as named,
  completedReviewQuery as completed,
} from "../../test-support/support/completedReviewRequests.ts";
import { keepUnusableCompletedCapture } from "../../test-support/support/completedStoryVisibleActions.ts";
import {
  missingAgentTrunkCompletedHistory,
  ordinaryTrunkModeCompletedHistory,
} from "../../test-support/support/completedStoryHistory.ts";
import {
  storyReviewEndpoint,
  storyReviewSchema,
} from "../../src/storyReviewContract.ts";

test.use({ serverMode: "boundary" });

const noPublishedComparison = {
  kind: "unavailable",
  explanation: "No published comparison is available for this story.",
};

test.describe("ordinary trunk", () => {
  test.use({ originRepository: ordinaryTrunkModeCompletedHistory() });

  test("a missing capture repository leaves the published completion and exact landing readable", async ({
    request,
    dashboard,
    origin,
  }) => {
    const completion = origin.revision("completion");
    const baseline = origin.revision("interleaving");
    keepUnusableCompletedCapture(dashboard, origin, {
      workspace: `${origin.machine}/retired-completion-workspace`,
      completion,
      baseline,
    });
    const review = storyReviewSchema.parse(
      await (
        await get(request, dashboard, storyReviewEndpoint, completed)
      ).json(),
    );
    expect(review).toMatchObject({
      kind: "published",
      completion,
    });
    expect(review.selectedRun).toBeUndefined();
    expect(review.runs).toHaveLength(1);
    const explicit = await get(request, dashboard, storyReviewEndpoint, {
      ...completed,
      run: review.runs?.[0]?.key ?? "",
    });
    expect(await explicit.json()).toMatchObject({
      kind: "landed",
      baseline,
      tree: completion,
    });
  });
});

test.describe("missing-agent trunk", () => {
  test.use({ originRepository: missingAgentTrunkCompletedHistory() });

  test("a retired workspace preserves a published prior landing", async ({
    request,
    dashboard,
    origin,
  }) => {
    const completion = origin.revision("completion");
    const baseline = origin.revision("interleaving");
    keepUnusableCompletedCapture(dashboard, origin, {
      workspace: `${origin.machine}/unreadable-workspace`,
      completion,
      baseline,
    });
    const active = storyReviewSchema.parse(
      await (await get(request, dashboard, storyReviewEndpoint, named)).json(),
    );
    expect(active).toMatchObject({
      kind: "landed",
      baseline,
      tree: completion,
    });
    expect(active.selectedRun).toBe(active.runs?.[0]?.key);
    const absent = { source: "open-dough", identity: "SEED-B#b" };
    const missingComparison = await get(
      request,
      dashboard,
      storyReviewEndpoint,
      absent,
    );
    expect(missingComparison.status()).toBe(200);
    expect(await missingComparison.json()).toEqual(noPublishedComparison);
    const missingRecord = await get(request, dashboard, storyReviewEndpoint, {
      ...absent,
      completed: "true",
    });
    expect(missingRecord.status()).toBe(200);
    expect(await missingRecord.json()).toMatchObject({
      kind: "unavailable",
      explanation: expect.stringContaining("No published completion record"),
    });
    expect(await missingRecord.json()).not.toHaveProperty("files");
  });
});
