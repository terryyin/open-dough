import { renameSync } from "node:fs";
import { expect, test } from "../../test-support/support/preparationPage.ts";
import {
  getReview as get,
  completedReviewQuery as completed,
} from "../../test-support/support/completedReviewRequests.ts";
import { ordinaryTrunkModeCompletedHistory } from "../../test-support/support/completedStoryHistory.ts";
import {
  storyReviewEndpoint,
  storyReviewSchema,
} from "../../src/storyReviewContract.ts";

test.use({
  serverMode: "boundary",
  originRepository: ordinaryTrunkModeCompletedHistory(),
});

test("a synced Done review reopens offline from its last sync with the sync notice", async ({
  request,
  dashboard,
  origin,
}) => {
  const open = async () =>
    storyReviewSchema.parse(
      await (
        await get(request, dashboard, storyReviewEndpoint, completed)
      ).json(),
    );
  const synced = await open();
  renameSync(origin.origin, `${origin.origin}-away`);

  const reopened = await open();

  expect(reopened).toMatchObject({
    kind: "published",
    completion: origin.revision("completion"),
    syncFailure: { lastSyncedAt: expect.any(String) },
  });
  if (synced.kind !== "published" || reopened.kind !== "published")
    throw new Error("No published review");
  expect(reopened.files).toEqual(synced.files);
});

test("a Done review never synced and opened offline is unavailable and names the failed sync", async ({
  request,
  dashboard,
  origin,
}) => {
  renameSync(origin.origin, `${origin.origin}-away`);

  const review = storyReviewSchema.parse(
    await (
      await get(request, dashboard, storyReviewEndpoint, completed)
    ).json(),
  );

  expect(review).toMatchObject({ kind: "unavailable" });
  if (review.kind !== "unavailable") throw new Error("Shown");
  expect(review.explanation).toMatch(/^The review could not sync from origin/);
});
