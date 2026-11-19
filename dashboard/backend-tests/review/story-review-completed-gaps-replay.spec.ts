// Deferred gap cases still on completedPublishedStory replay: missing-agent
// (slice 3) and own-conflict (slice 5).
import { expect, test } from "../../test-support/support/preparationPage.ts";
import {
  getReview as get,
  completedStoryQuery as named,
  completedReviewQuery as completed,
} from "../../test-support/support/completedReviewRequests.ts";
import {
  completedPublishedStory,
  keepUnusableCompletedCapture,
} from "../../test-support/support/completedPublishedStory.ts";
import {
  storyReviewEndpoint,
  storyReviewSchema,
} from "../../src/storyReviewContract.ts";
import { git } from "../../test-support/support/storyReviewWorktree.ts";
import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";

test.use({ serverMode: "boundary" });

test("an unreadable workspace preserves active captured gaps and completed review recovers the published owner", async ({
  request,
  dashboard,
  origin,
}) => {
  const story = await completedPublishedStory(origin, "trunk", "missing-agent");
  const workspace = `${origin.machine}/unreadable-workspace`;
  mkdirSync(workspace);
  keepUnusableCompletedCapture(dashboard, origin, {
    ...story,
    workspace,
    baseline: git(origin.project, "rev-parse", `${story.completion}^`),
  });
  const active = storyReviewSchema.parse(
    await (await get(request, dashboard, storyReviewEndpoint, named)).json(),
  );
  expect(active).toMatchObject({
    kind: "landing-unavailable",
    explanation: "The captured landing repository is missing or unreadable.",
  });
  expect(active.selectedRun).toBe(active.runs?.[0]?.key);
  const historical = await get(
    request,
    dashboard,
    storyReviewEndpoint,
    completed,
  );
  expect(historical.status()).toBe(200);
  expect(await historical.json()).toMatchObject({
    kind: "published",
    agent: story.agent,
  });
  expect(await historical.json()).not.toHaveProperty("selectedRun");
  expect(await historical.json()).toHaveProperty("files");
  const absent = { source: "open-dough", identity: "SEED-B#b" };
  expect(
    (await get(request, dashboard, storyReviewEndpoint, absent)).status(),
  ).toBe(404);
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

test("an agentless story-branch completion recovers its unique claim", async ({
  request,
  dashboard,
  origin,
}) => {
  await completedPublishedStory(origin, "story-branch", "missing-agent");
  const response = await get(
    request,
    dashboard,
    storyReviewEndpoint,
    completed,
  );
  expect(response.status()).toBe(200);
  expect(await response.json()).toMatchObject({ kind: "published" });
  expect(await response.json()).toHaveProperty("files");
});

test("an unreadable merge edit object explains the Git gap instead of a partial comparison", async ({
  request,
  dashboard,
  origin,
}) => {
  const { completion } = await completedPublishedStory(
    origin,
    "story-branch",
    "own-conflict-extra",
  );
  const blob = git(
    origin.project,
    "rev-parse",
    `${completion}:merge-resolution.txt`,
  );
  const objects = git(origin.project, "rev-parse", "--git-path", "objects");
  rmSync(
    path.resolve(origin.project, objects, blob.slice(0, 2), blob.slice(2)),
  );
  const response = await get(
    request,
    dashboard,
    storyReviewEndpoint,
    completed,
  );
  expect(response.status()).toBe(200);
  expect(await response.json()).toMatchObject({
    kind: "unavailable",
    explanation: expect.stringContaining(
      "Published completion history could not be read",
    ),
  });
  expect(await response.json()).not.toHaveProperty("files");
});
