import { expect, test } from "../support/preparationPage.ts";
import {
  getReview as get,
  completedStoryQuery as named,
  completedReviewQuery as completed,
} from "../support/completedReviewRequests.ts";
import {
  completedPublishedStory,
  keepUnusableCompletedCapture,
} from "../support/completedPublishedStory.ts";
import {
  storyReviewEndpoint,
  storyReviewFileEndpoint,
  storyReviewSchema,
} from "../../src/storyReviewContract.ts";
import { git, writeAt } from "../support/storyReviewWorktree.ts";
import {
  agentWorktree,
  claimWorktree,
} from "../support/agentAuthoredWorktree.ts";
import { mkdirSync } from "node:fs";

test.use({ serverMode: "boundary" });

test("a published completion remains reviewable while local workspaces are ambiguous", async ({
  request,
  dashboard,
  origin,
}) => {
  const story = await completedPublishedStory(origin);
  const original = storyReviewSchema.parse(
    await (
      await get(request, dashboard, storyReviewEndpoint, completed)
    ).json(),
  );
  expect(original.kind).toBe("published");
  if (original.kind !== "published")
    throw new Error("No initial published review");
  const first = await claimWorktree(
    origin,
    story.agent,
    "ambiguous-a",
    story.completion,
    named.identity,
  );
  git(first, "push", "--quiet", "origin", "HEAD:main");
  const second = await agentWorktree(
    origin,
    story.agent,
    "ambiguous-b",
    git(first, "rev-parse", "HEAD"),
  );
  writeAt(first, "local-a.txt", "first workspace only\n");
  writeAt(second, "local-b.txt", "second workspace only\n");
  const active = await get(request, dashboard, storyReviewEndpoint, named);
  expect(active.status()).toBe(200);
  const ambiguity = {
    kind: "unavailable",
    explanation: `Several worktrees on this machine hold this story's claim for ${story.agent}: ~/git/open-dough/.worktrees/ambiguous-a, ~/git/open-dough/.worktrees/ambiguous-b. The review cannot choose one.`,
  };
  expect(await active.json()).toEqual(ambiguity);
  const historical = await get(
    request,
    dashboard,
    storyReviewEndpoint,
    completed,
  );
  expect(historical.status()).toBe(200);
  expect(storyReviewSchema.parse(await historical.json())).toEqual(original);
  const file = await get(request, dashboard, storyReviewFileEndpoint, {
    ...named,
    completion: original.completion,
    baseline: original.baseline,
    tree: original.tree,
    path: "[literal]*.txt",
  });
  expect(file.status()).toBe(200);
  expect(await file.json()).toMatchObject({
    kind: "diff",
    printed: expect.stringContaining("+delivered on another machine"),
  });
  expect(
    await (await get(request, dashboard, storyReviewEndpoint, named)).json(),
  ).toEqual(ambiguity);
});

test("an unusable local captured run falls back to published completion while its explicit choice retains its gap", async ({
  request,
  dashboard,
  origin,
}) => {
  const story = await completedPublishedStory(origin);
  await keepUnusableCompletedCapture(dashboard, origin, story);
  const review = storyReviewSchema.parse(
    await (
      await get(request, dashboard, storyReviewEndpoint, completed)
    ).json(),
  );
  expect(review).toMatchObject({
    kind: "published",
    completion: story.completion,
  });
  expect(review.selectedRun).toBeUndefined();
  expect(review.runs).toHaveLength(1);
  const explicit = await get(request, dashboard, storyReviewEndpoint, {
    ...completed,
    run: review.runs?.[0]?.key ?? "",
  });
  expect(await explicit.json()).toMatchObject({
    kind: "landing-unavailable",
    explanation: "The captured landing repository is missing or unreadable.",
  });
});

test("an unreadable workspace preserves active captured gaps and completed review recovers the published owner", async ({
  request,
  dashboard,
  origin,
}) => {
  const story = await completedPublishedStory(origin, "trunk", "missing-agent");
  const workspace = `${origin.machine}/unreadable-workspace`;
  mkdirSync(workspace);
  await keepUnusableCompletedCapture(dashboard, origin, {
    ...story,
    workspace,
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

for (const variant of ["missing-agent", "ambiguous-merge"] as const) {
  test(`${variant} recovers a unique claim or explains the remaining attribution gap`, async ({
    request,
    dashboard,
    origin,
  }) => {
    await completedPublishedStory(origin, "story-branch", variant);
    const response = await get(
      request,
      dashboard,
      storyReviewEndpoint,
      completed,
    );
    expect(response.status()).toBe(200);
    if (variant === "missing-agent") {
      expect(await response.json()).toMatchObject({ kind: "published" });
      expect(await response.json()).toHaveProperty("files");
    } else {
      expect(await response.json()).toMatchObject({
        kind: "unavailable",
        explanation: expect.stringMatching(/merge resolutions/),
      });
      expect(await response.json()).not.toHaveProperty("files");
    }
  });
}

test("missing claim history explains the gap rather than showing a partial comparison", async ({
  request,
  dashboard,
  origin,
}) => {
  await completedPublishedStory(origin);
  git(origin.project, "fetch", "--quiet", "--depth=1", "origin", "main");
  expect(git(origin.project, "rev-parse", "--is-shallow-repository")).toBe(
    "true",
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
    explanation: expect.stringMatching(/claim|history/),
  });
  expect(await response.json()).not.toHaveProperty("files");
});
