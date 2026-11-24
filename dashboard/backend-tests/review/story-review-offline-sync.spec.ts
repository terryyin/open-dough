import { renameSync } from "node:fs";
import { beforeAll, expect, test } from "vitest";
import {
  commitStoryFile,
  publishBranch,
  takenStoryReader,
} from "../support/takenStoryReader.ts";
import { lastSync } from "../../server/reviewRepository.ts";
import { storyReview } from "../../server/storyReview.ts";
import { prepareRepository } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { takenBranchContributionHistory } from "../../test-support/support/takenBranchContributionHistory.ts";

beforeAll(() => prepareRepository(takenBranchContributionHistory()));

async function publishedStory() {
  const reader = await takenStoryReader();
  commitStoryFile(reader.writer, "src/a.ts", "first\n");
  publishBranch(reader.writer);
  const open = () =>
    storyReview(
      { read: { subject: reader.subject, taken: true } },
      reader.signal,
    );
  const moveOrigin = () => {
    renameSync(reader.origin, `${reader.origin}-moved`);
  };
  const restoreOrigin = () => {
    renameSync(`${reader.origin}-moved`, reader.origin);
  };
  return { ...reader, open, moveOrigin, restoreOrigin };
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
