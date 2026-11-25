import { realpathSync, renameSync } from "node:fs";
import { beforeAll, expect, test, vi } from "vitest";
import {
  commitStoryFile,
  publishBranch,
  takenStoryReader,
} from "../support/takenStoryReader.ts";
import {
  lastSync,
  syncedReviewRepository,
  type ReviewSyncDeadline,
} from "../../server/reviewRepository.ts";
import { knownSource } from "../../server/sessionAdmission.ts";
import { storyReview } from "../../server/storyReview.ts";
import { stubRemoteRequestRecording } from "../support/fixtureHome.ts";
import {
  reviewOriginHangs,
  shortSyncDeadline,
  timedOutSync,
} from "../support/hangingOrigin.ts";
import { prepareRepository } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { takenBranchContributionHistory } from "../../test-support/support/takenBranchContributionHistory.ts";
import { branch } from "../../test-support/support/storyReviewWorktree.ts";

beforeAll(() => prepareRepository(takenBranchContributionHistory()));

async function publishedStory() {
  const reader = await takenStoryReader();
  const head = commitStoryFile(reader.writer, "src/a.ts", "first\n");
  publishBranch(reader.writer);
  const open = (syncDeadline?: ReviewSyncDeadline) =>
    storyReview(
      { read: { subject: reader.subject, taken: true } },
      reader.signal,
      syncDeadline,
    );
  const moveOrigin = () => {
    renameSync(reader.origin, `${reader.origin}-moved`);
  };
  const restoreOrigin = () => {
    renameSync(`${reader.origin}-moved`, reader.origin);
  };
  return { ...reader, head, open, moveOrigin, restoreOrigin };
}

test("a synced Taken review reopens offline from its last sync with a notice naming the problem and the sync time", async () => {
  const story = await publishedStory();
  const synced = await story.open();
  if (synced.kind !== "published-taken") throw new Error("No first sync");
  const { lastSyncedAt } = await lastSync(story.reviewRepository());
  story.moveOrigin();

  const reopened = await story.open();

  expect(reopened).toMatchObject({
    kind: "published-taken",
    head: synced.head,
    syncFailure: { lastSyncedAt },
  });
  if (reopened.kind !== "published-taken") throw new Error("Not shown");
  expect(reopened.syncFailure?.problem).not.toBe("");
  expect(await lastSync(story.reviewRepository())).toMatchObject({
    lastSyncedAt,
    lastFailure: { problem: reopened.syncFailure?.problem },
  });
});

test("a never synced Taken review opened offline is unavailable and names the failed sync", async () => {
  const story = await publishedStory();
  story.moveOrigin();

  const review = await story.open();

  expect(review.kind).toBe("unavailable");
  if (review.kind !== "unavailable") throw new Error("Shown");
  expect(review.explanation).toMatch(/^The review could not sync from origin/);
  expect(review.explanation).not.toMatch(/not published on origin/);
});

test("a sync after origin returns advances the comparison, records the time and clears the failure", async () => {
  const story = await publishedStory();
  await story.open();
  story.moveOrigin();
  await story.open();
  story.restoreOrigin();
  const later = commitStoryFile(story.writer, "src/a.ts", "second\n");
  publishBranch(story.writer);

  const refreshed = await story.open();

  expect(refreshed).toMatchObject({ kind: "published-taken", head: later });
  expect(refreshed).not.toHaveProperty("syncFailure");
  const record = await lastSync(story.reviewRepository());
  expect(record.lastSyncedAt).toBeDefined();
  expect(record).not.toHaveProperty("lastFailure");
});

const deadlineMs = 1500;

async function syncedStoryWithHangingOrigin() {
  const story = await publishedStory();
  const source = knownSource(story.subject.source);
  await syncedReviewRepository(source, story.signal);
  const repository = await syncedReviewRepository(source, story.signal, branch);
  const { lastSyncedAt } = await lastSync(repository);
  await reviewOriginHangs(repository);
  return { ...story, lastSyncedAt };
}

test("a synced Taken review reopened while origin hangs shows its last sync, naming the timeout", async () => {
  const story = await syncedStoryWithHangingOrigin();

  const review = await story.open(shortSyncDeadline(deadlineMs));

  expect(review).toMatchObject({
    kind: "published-taken",
    head: story.head,
    syncFailure: {
      lastSyncedAt: story.lastSyncedAt,
      problem: timedOutSync(deadlineMs),
    },
  });
});

test("a Taken reopen whose trunk sync used up the deadline starts no branch fetch", async () => {
  const story = await syncedStoryWithHangingOrigin();
  const directory = realpathSync(story.reviewRepository());
  const recording = stubRemoteRequestRecording(story.home);
  const trunkFetch = [{ command: "fetch", directory }];
  const elapsed = new AbortController();
  const deadline = shortSyncDeadline(deadlineMs);
  vi.spyOn(deadline, "of").mockResolvedValue({
    signal: elapsed.signal,
    seconds: deadlineMs / 1000,
  });

  const reopened = story.open(deadline);
  try {
    // Expire the deadline only after Git has started the trunk fetch.
    await expect.poll(recording.requests).toEqual(trunkFetch);
  } finally {
    elapsed.abort();
    await reopened;
  }

  // The branch sync shares the trunk sync's spent deadline, so it never
  // reaches origin; a fresh deadline would have fetched again.
  expect(recording.requests()).toEqual(trunkFetch);
});

test("a never synced Taken review opened while origin hangs is unavailable and names the timed-out sync", async () => {
  const story = await publishedStory();
  await reviewOriginHangs(story.reviewRepository());

  const review = await story.open(shortSyncDeadline(deadlineMs));

  expect(review).toMatchObject({
    kind: "unavailable",
    explanation: expect.stringMatching(
      /^The review could not sync from origin/,
    ) as unknown,
  });
  if (review.kind !== "unavailable") throw new Error("Shown");
  expect(review.explanation).toContain(timedOutSync(deadlineMs));
});
