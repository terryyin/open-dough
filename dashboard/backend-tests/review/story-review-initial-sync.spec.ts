import { mkdirSync, renameSync } from "node:fs";
import path from "node:path";
import { expect, onTestFinished, test } from "vitest";
import type { StoryReviewRead } from "../../src/storyReviewRead.ts";
import { ReviewInitialSync } from "../../server/reviewInitialSync.ts";
import { storyReview } from "../../server/storyReview.ts";
import { reviewInput } from "../../server/storyReviewInput.ts";
import { storyReviewRequest } from "../../server/storyReviewRequest.ts";
import { knownSource } from "../../server/sessionAdmission.ts";
import { git } from "../../test-support/support/storyReviewWorktree.ts";
import { trunkModeStory } from "../../test-support/support/storyReviewTrunkMode.ts";
import { takenStoryReader } from "../support/takenStoryReader.ts";

async function coldStory() {
  const story = await takenStoryReader(trunkModeStory({ published: 2 }));
  const source = knownSource(story.subject.source);
  const sync = new ReviewInitialSync();
  onTestFinished(() => sync.close());
  const observe = (operation: "status" | "start") =>
    sync.answer({ source, operation }, story.signal);
  const open = async (
    syncRequest: NonNullable<StoryReviewRead["initialSync"]>,
    taken = true,
  ) => {
    const url = new URL("http://localhost/__agent-launch/review");
    url.searchParams.set("source", source.id);
    url.searchParams.set("identity", story.subject.identity);
    url.searchParams.set("initialSync", String(syncRequest));
    if (taken) url.searchParams.set("taken", "true");
    const request = storyReviewRequest(url);
    const input = await reviewInput(request.read, story.signal);
    return storyReview(input, story.signal, undefined, sync);
  };
  return { ...story, open, observe };
}

test("a cold published review distinguishes its sync requirement from a story with no comparison", async () => {
  const story = await coldStory();

  await expect(story.open(true)).resolves.toEqual({
    kind: "initial-sync-required",
  });
  expect(story.observe("status")).toEqual({ kind: "idle" });
  await expect(story.open(true, false)).resolves.toMatchObject({
    kind: "unavailable",
  });
});

test("only the retained verified target covers the exact resumed review", async () => {
  const story = await coldStory();
  const { s1: earlier, s2: verified } = story.revisions;
  if (earlier === undefined || verified === undefined)
    throw new Error("The published story needs both recorded revisions.");
  expect(story.observe("start")).toEqual({ kind: "running" });
  await expect
    .poll(() => story.observe("status"))
    .toEqual({
      kind: "ready",
      revision: verified,
    });
  const away = `${story.origin}-away`;
  renameSync(story.origin, away);
  try {
    const resumed = await story.open(verified);
    expect(resumed).toMatchObject({ kind: "published-taken", head: verified });
    expect(resumed).not.toHaveProperty("syncFailure");
    const stale = await story.open(earlier);
    expect(stale).toMatchObject({
      kind: "published-taken",
      head: verified,
    });
    const problem =
      stale.kind === "published-taken" ? stale.syncFailure?.problem : undefined;
    expect(problem).toContain("repository");
  } finally {
    renameSync(away, story.origin);
  }
});

test("a failed initial attempt stays pending when Git wrote the target before the sync failed", async () => {
  const story = await coldStory();
  const directory = story.reviewRepository();
  mkdirSync(path.join(directory, "open-dough-sync.json"), { recursive: true });

  expect(story.observe("start")).toEqual({ kind: "running" });
  await expect
    .poll(() => story.observe("status"))
    .toMatchObject({ kind: "failed" });
  expect(git(directory, "rev-parse", "refs/remotes/origin/main")).toBe(
    story.revisions.s2,
  );

  await expect(story.open(true)).resolves.toEqual({
    kind: "initial-sync-required",
  });
  expect(story.observe("start")).toMatchObject({ kind: "failed" });
});
