import { realpathSync, renameSync } from "node:fs";
import type { APIRequestContext } from "@playwright/test";
import { expect, test } from "../../test-support/support/preparationPage.ts";
import {
  getReview as get,
  completedStoryQuery as named,
  completedReviewQuery as completed,
} from "../../test-support/support/completedReviewRequests.ts";
import { ordinaryTrunkModeCompletedHistory } from "../../test-support/support/completedStoryHistory.ts";
import { advanceCompletedTrunk } from "../../test-support/support/completedStoryVisibleActions.ts";
import type { DashboardServer } from "../../test-support/support/dashboardServer.ts";
import { fixtureReviewRepository } from "../../test-support/support/reviewRepositoryFixture.ts";
import { remoteRequestRecordingDashboard } from "../../test-support/support/remoteRequestRecordingDashboard.ts";
import type { StartOrigin } from "../../test-support/support/startOrigin.ts";
import {
  storyReviewEndpoint,
  storyReviewFileEndpoint,
  storyReviewSchema,
  type StoryReview,
} from "../../src/storyReviewContract.ts";

test.use({
  serverMode: "boundary",
  originRepository: ordinaryTrunkModeCompletedHistory(),
});

const opened = async (request: APIRequestContext, dashboard: DashboardServer) =>
  storyReviewSchema.parse(
    await (
      await get(request, dashboard, storyReviewEndpoint, completed)
    ).json(),
  );

// One file of the published completion, read as Review changes reads it.
const fileRead = (
  request: APIRequestContext,
  dashboard: DashboardServer,
  review: StoryReview,
  completion: string,
) => {
  if (review.kind !== "published") throw new Error("No published review");
  return get(request, dashboard, storyReviewFileEndpoint, {
    ...named,
    completion,
    baseline: review.baseline,
    tree: review.tree,
    path: "[literal]*.txt",
  });
};

// A Done review opened once, then reopened with origin unreachable.
async function reopenedOffline(
  request: APIRequestContext,
  dashboard: DashboardServer,
  origin: StartOrigin,
) {
  const synced = await opened(request, dashboard);
  renameSync(origin.origin, `${origin.origin}-away`);
  return { synced, reopened: await opened(request, dashboard) };
}

// A Done review opened on a dashboard recording remote requests, after which
// trunk advances beyond its completion; `laterRequests` lists those made
// since the open.
async function openedWithRemoteRequestsRecorded(
  request: APIRequestContext,
  dashboard: DashboardServer,
  origin: StartOrigin,
) {
  const { server, recording } = await remoteRequestRecordingDashboard(
    dashboard,
    origin.machine,
  );
  const review = await opened(request, server);
  const repository = fixtureReviewRepository(realpathSync(origin.machine));
  if (recording.fetchesIn(repository) !== 1)
    throw new Error("The open's sync was not recorded");
  const beyond = advanceCompletedTrunk(origin);
  const openRequests = recording.requests().length;
  const laterRequests = () => recording.requests().slice(openRequests);
  return { server, review, beyond, laterRequests };
}

test("a synced Done review reopens offline from its last sync with the sync notice", async ({
  request,
  dashboard,
  origin,
}) => {
  const { synced, reopened } = await reopenedOffline(
    request,
    dashboard,
    origin,
  );

  expect(reopened).toMatchObject({
    kind: "published",
    completion: origin.revision("completion"),
    syncFailure: { lastSyncedAt: expect.any(String) },
  });
  if (synced.kind !== "published" || reopened.kind !== "published")
    throw new Error("No published review");
  expect(reopened.files).toEqual(synced.files);
});

test("a synced Done review reopened offline shows its file diff from the last sync", async ({
  request,
  dashboard,
  origin,
}) => {
  const { reopened } = await reopenedOffline(request, dashboard, origin);

  const diff = await fileRead(
    request,
    dashboard,
    reopened,
    origin.revision("completion"),
  );

  expect(await diff.json()).toMatchObject({
    kind: "diff",
    printed: expect.stringContaining("+delivered on another machine"),
  });
});

test("an opened Done review reads its file diff from the last sync without a remote request", async ({
  request,
  dashboard,
  origin,
}) => {
  const { server, review, laterRequests } =
    await openedWithRemoteRequestsRecorded(request, dashboard, origin);
  try {
    const completion = origin.revision("completion");
    const diff = await fileRead(request, server, review, completion);

    expect(await diff.json()).toMatchObject({
      kind: "diff",
      printed: expect.stringContaining("+delivered on another machine"),
    });
    expect(laterRequests()).toEqual([]);
  } finally {
    await server.close();
  }
});

test("an opened Done review refuses a completion beyond its last sync without a remote request", async ({
  request,
  dashboard,
  origin,
}) => {
  const { server, review, beyond, laterRequests } =
    await openedWithRemoteRequestsRecorded(request, dashboard, origin);
  try {
    const refused = await fileRead(request, server, review, beyond);

    expect(refused.status()).toBe(409);
    expect(laterRequests()).toEqual([]);
  } finally {
    await server.close();
  }
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
