// Concurrent Review changes opens for one project share one fetch into its
// Review repository.
import { realpathSync } from "node:fs";
import { expect, test } from "../../test-support/support/preparationPage.ts";
import {
  getReview as get,
  completedReviewQuery as completed,
} from "../../test-support/support/completedReviewRequests.ts";
import { ordinaryTrunkModeCompletedHistory } from "../../test-support/support/completedStoryHistory.ts";
import { fixtureReviewRepository } from "../../test-support/support/reviewRepositoryFixture.ts";
import { remoteRequestRecordingDashboard } from "../../test-support/support/remoteRequestRecordingDashboard.ts";
import { storyReviewEndpoint } from "../../src/storyReviewContract.ts";

test.use({
  serverMode: "boundary",
  originRepository: ordinaryTrunkModeCompletedHistory(),
});

test("two concurrent opens of a Done story's review share one fetch", async ({
  request,
  dashboard,
  origin,
}) => {
  const { server, recording } = await remoteRequestRecordingDashboard(
    dashboard,
    origin.machine,
  );
  try {
    const reviews = await Promise.all([
      get(request, server, storyReviewEndpoint, completed),
      get(request, server, storyReviewEndpoint, completed),
    ]);
    for (const review of reviews)
      expect(await review.json()).toMatchObject({ kind: "published" });
    expect(
      recording.fetchesIn(
        fixtureReviewRepository(realpathSync(origin.machine)),
      ),
    ).toBe(1);
  } finally {
    await server.close();
  }
});
