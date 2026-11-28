// A Done review opens its immutable published comparison from the admitted
// sync, and its exact file reads stay on that sync.
import { realpathSync, renameSync } from "node:fs";
import { expect, test } from "vitest";
import { stubRemoteRequestRecording } from "../support/fixtureHome.ts";
import { configuredFixtureProject } from "../support/fixtureProject.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { RepositoryDescription } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import { agentIdentity } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { storyReview } from "../../server/storyReview.ts";
import { reviewedFileDiff } from "../../server/storyReviewFileResponse.ts";
import type { StoryReview } from "../../src/storyReviewContract.ts";
import {
  agentWorktree,
  claimWorktree,
} from "../../test-support/support/agentAuthoredWorktree.ts";
import {
  ordinaryCompletedReviewHistories,
  ordinaryTrunkModeCompletedHistory,
} from "../../test-support/support/completedStoryHistory.ts";
import {
  advanceCompletedTrunk,
  laterDeveloperCarriesDoneRecord,
} from "../../test-support/support/completedStoryVisibleActions.ts";
import {
  homeReviewRepository,
  renameExecutionCheckout,
  trunkAdvancedPastCheckout,
} from "../../test-support/support/reviewRepositoryFixture.ts";
import { queuedIdentity } from "../../test-support/support/startOrigin.ts";
import { git } from "../../test-support/support/storyReviewWorktree.ts";

const subject = { source: "open-dough", identity: queuedIdentity };
const signal = new AbortController().signal;
const yui = agentIdentity("Yui").agent;
type Published = Extract<StoryReview, { kind: "published" }>;

// The described Done history on origin, configured as the open-dough project
// whose execution checkout is the integration checkout.
async function doneStory(history: RepositoryDescription<string>) {
  const { repository, home } = await configuredFixtureProject(history);
  const origin = {
    machine: repository.fixture,
    origin: repository.origin,
    project: repository.integration,
  };
  const { completion } = repository.revisions;
  if (completion === undefined) throw new Error("No completion revision");
  const open = () =>
    storyReview({ read: { subject, completed: true } }, signal);
  const published = async () => {
    const review = await open();
    if (review.kind !== "published") throw new Error("No published review");
    return review;
  };
  const readFile = (
    { baseline, tree }: Published,
    path = "[literal]*.txt",
    at = completion,
  ) => {
    return reviewedFileDiff(
      { read: { subject, completion: at, baseline, tree, path } },
      signal,
    );
  };
  // Records origin requests from here on; `since()` lists the later ones.
  const recordOriginRequests = () => {
    const recording = stubRemoteRequestRecording(origin.machine);
    const reviewRepository = homeReviewRepository(realpathSync(home));
    const mark = () => recording.requests().length;
    let from = mark();
    return {
      fetches: () => recording.fetchesIn(reviewRepository),
      startHere: () => {
        from = mark();
      },
      since: () => recording.requests().slice(from),
    };
  };
  const takeOriginAway = () => {
    renameSync(origin.origin, `${origin.origin}-away`);
  };
  return {
    origin,
    completion,
    open,
    published,
    readFile,
    recordOriginRequests,
    takeOriginAway,
  };
}

const diffContaining = (text: string) => ({
  kind: "diff",
  printed: expect.stringContaining(text) as unknown,
});

for (const [mode, history] of ordinaryCompletedReviewHistories())
  test(`a ${mode} completion keeps its comparison and file diffs through interleaved work and later trunk, reading files without origin requests`, async () => {
    const story = await doneStory(history);
    const review = await story.published();
    expect(review).toMatchObject({ completion: story.completion, agent: yui });
    const paths = review.files.map(({ path }) => path);
    expect(paths).toContain("shared.txt");
    expect(paths).not.toContain("other-story.txt");
    expect(paths).not.toContain("integration-other.txt");
    const requests = story.recordOriginRequests();

    const literal = await story.readFile(review);
    const shared = await story.readFile(review, "shared.txt");

    expect(requests.since()).toEqual([]);
    expect(literal).toMatchObject(
      diffContaining("+delivered on another machine"),
    );
    expect(shared).toMatchObject(diffContaining("+story first"));
    if (shared.kind !== "diff") throw new Error("No shared diff");
    expect(shared.printed).not.toContain("+other last");
    expect(shared.printed).not.toContain("-line 11");
    advanceCompletedTrunk(story.origin);
    expect(await story.open()).toEqual(review);
    expect(await story.readFile(review)).toEqual(literal);
  });

for (const [mode, history] of ordinaryCompletedReviewHistories())
  test(`a ${mode} completion keeps its own delivery after a later story's branch merges trunk and fast-forwards`, async () => {
    const story = await doneStory(history);
    const delivered = await story.published();
    expect(delivered.completion).toBe(story.completion);
    // Started from trunk before the story's done record arrived.
    laterDeveloperCarriesDoneRecord(story.origin, story.completion);

    const review = await story.open();

    expect(review).toEqual(delivered);
    expect(await story.readFile(delivered, "shared.txt")).toMatchObject(
      diffContaining("+story first"),
    );
  });

test("a published completion stays fixed with competing dirty worktrees", async () => {
  const story = await doneStory(ordinaryTrunkModeCompletedHistory());
  const original = await story.published();
  const first = await claimWorktree(
    story.origin,
    yui,
    "ambiguous-a",
    story.completion,
    subject.identity,
  );
  git(first, "push", "--quiet", "origin", "HEAD:main");
  const second = await agentWorktree(
    story.origin,
    yui,
    "ambiguous-b",
    git(first, "rev-parse", "HEAD"),
  );
  makeMe.theWorkspace(first).writeAt("local-a.txt", "first only\n").please();
  makeMe.theWorkspace(second).writeAt("local-b.txt", "second only\n").please();

  const active = await storyReview({ read: { subject } }, signal);
  const historical = await story.open();

  expect(active).toEqual({
    kind: "unavailable",
    explanation: "No published comparison is available for this story.",
  });
  expect(historical).toEqual(original);
  expect(await story.readFile(original)).toMatchObject(
    diffContaining("+delivered on another machine"),
  );
});

test("a moved execution checkout leaves the published review and its file diffs readable", async () => {
  const story = await doneStory(ordinaryTrunkModeCompletedHistory());
  const review = await story.published();
  renameExecutionCheckout(story.origin);

  const reopened = await story.open();

  expect(reopened).toEqual(review);
  expect(await story.readFile(review)).toMatchObject(
    diffContaining("+delivered on another machine"),
  );
});

test("opening a published review leaves the execution checkout's tracked trunk and working state where they were", async () => {
  const story = await doneStory(ordinaryTrunkModeCompletedHistory());
  const synced = trunkAdvancedPastCheckout(story.origin);
  makeMe
    .theWorkspace(story.origin.project)
    .writeAt("uncommitted.txt", "kept\n")
    .please();
  const status = git(story.origin.project, "status", "--porcelain");

  expect(await story.open()).toMatchObject({ kind: "published" });

  expect(
    git(story.origin.project, "rev-parse", "refs/remotes/origin/main"),
  ).toBe(synced);
  expect(git(story.origin.project, "status", "--porcelain")).toBe(status);
});

test("a synced Done review reopens offline from its last sync, naming the failed sync, and reads its file diff", async () => {
  const story = await doneStory(ordinaryTrunkModeCompletedHistory());
  const synced = await story.published();
  story.takeOriginAway();

  const reopened = await story.published();

  expect(reopened).toMatchObject({
    completion: story.completion,
    syncFailure: { lastSyncedAt: expect.any(String) as unknown },
  });
  expect(reopened.files).toEqual(synced.files);
  expect(await story.readFile(reopened)).toMatchObject(
    diffContaining("+delivered on another machine"),
  );
});

test("an opened Done review refuses a completion beyond its last sync without an origin request", async () => {
  const story = await doneStory(ordinaryTrunkModeCompletedHistory());
  const requests = story.recordOriginRequests();
  const review = await story.published();
  expect(requests.fetches()).toBe(1);
  const beyond = advanceCompletedTrunk(story.origin);
  requests.startHere();

  await expect(
    story.readFile(review, "[literal]*.txt", beyond),
  ).rejects.toMatchObject({ status: 409 });
  expect(requests.since()).toEqual([]);
});

test("a Done review never synced and opened offline is unavailable and names the failed sync", async () => {
  const story = await doneStory(ordinaryTrunkModeCompletedHistory());
  story.takeOriginAway();

  const review = await story.open();

  expect(review).toMatchObject({
    kind: "unavailable",
    explanation: expect.stringMatching(
      /^The review could not sync from origin/,
    ) as unknown,
  });
});
