// A marked story's review opens on the changes since the review, of Story
// A's twelve-file worktree (./support/storyReviewMark.ts), its baseline
// unchanged throughout: the files changed from the marked snapshot to a fresh
// one, headed by what it compares and when the mark was made, each diff
// holding only what changed after the mark. A file written after the
// snapshot and before the mark is listed; marking while the changes since
// the review are shown marks the whole snapshot. A mark whose tree the
// repository does not hold cannot be compared: the review says so and shows
// all changes until marking starts again. The review with no later change
// and an unmarked story's review are in ./story-review-comparison.spec.ts.

import { writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "./support/preparationPage.ts";
import { treeRows } from "./support/reviewTreeRows.ts";
import { openBacklog } from "./support/sessionDialog.ts";
import {
  editLater,
  expectSinceTheReview,
  keptStoryAMark,
  markReviewed,
  openReview,
  reopenReview,
  reviewRegion,
  rewriteStoryAMark,
  storyFile,
  twelveFileWorktree,
} from "./support/storyReviewMark.ts";
import { keepLaunchRecord } from "./support/storyLaunchRecord.ts";

test("a marked story's review lists only the files changed since the review, each diff holding only the later edit", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = twelveFileWorktree(origin);
  await keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  const marked = await openReview(page, card);
  const review = reviewRegion(page);
  await expect(
    review.getByRole("list", { name: "12 changed files" }),
  ).toBeVisible();
  await markReviewed(review);

  editLater(workspace, 2);
  editLater(workspace, 9);
  writeFileSync(path.join(workspace, storyFile(13)), "added later\n");
  const since = await reopenReview(page, card);
  expect(since.since?.from).toBe(marked.tree);
  expect(since.files).toHaveLength(13);
  await expectSinceTheReview(review, keptStoryAMark(dashboard));
  const files = review.getByRole("list", { name: "3 changed files" });
  await expect
    .poll(() => treeRows(files))
    .toEqual([storyFile(2), storyFile(9), storyFile(13)]);

  await files
    .getByRole("button", { name: `Modified ${storyFile(2)}` })
    .press("Enter");
  const diff = review.getByRole("region", {
    name: `Modified ${storyFile(2)}`,
  });
  await expect(diff.locator(".story-review-added")).toHaveText(["+f2 five"]);
  await expect(diff.locator(".story-review-removed")).toHaveText(["-f2 5"]);
});

test("a file written after the snapshot and before the mark is listed since the review", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = twelveFileWorktree(origin);
  await keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  await openReview(page, card);
  const review = reviewRegion(page);
  await expect(
    review.getByRole("list", { name: "12 changed files" }),
  ).toBeVisible();

  // The agent writes after the snapshot; the developer marks it unrefreshed.
  writeFileSync(path.join(workspace, "after-snapshot.txt"), "later\n");
  await markReviewed(review);
  await reopenReview(page, card);
  await expectSinceTheReview(review, keptStoryAMark(dashboard));
  const files = review.getByRole("list", { name: "1 changed file" });
  await expect.poll(() => treeRows(files)).toEqual(["after-snapshot.txt"]);
});

test("marking while the changes since the review are shown marks the whole snapshot", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = twelveFileWorktree(origin);
  await keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  await openReview(page, card);
  const review = reviewRegion(page);
  await markReviewed(review);

  editLater(workspace, 3);
  const first = await reopenReview(page, card);
  await expect(
    review.getByRole("list", { name: "1 changed file" }),
  ).toBeVisible();
  await markReviewed(review);
  expect(keptStoryAMark(dashboard)).toMatchObject({
    tree: first.tree,
    baseline: first.baseline,
  });
  await expect(review).toContainText("This snapshot is marked reviewed,");

  editLater(workspace, 4);
  const second = await reopenReview(page, card);
  expect(second.since?.from).toBe(first.tree);
  await expectSinceTheReview(review, keptStoryAMark(dashboard));
  const files = review.getByRole("list", { name: "1 changed file" });
  await expect.poll(() => treeRows(files)).toEqual([storyFile(4)]);
});

test("a mark whose tree the repository does not hold is said, all changes are shown, and marking starts again", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = twelveFileWorktree(origin);
  await keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  await openReview(page, card);
  const review = reviewRegion(page);
  await markReviewed(review);
  // The store names a tree the repository never held.
  rewriteStoryAMark(dashboard, { tree: `${"0".repeat(39)}1` });

  const gone = await reopenReview(page, card);
  expect(gone.since).toBeUndefined();
  expect(gone.markUncomparable).toBe("unreadable");
  await expect(review).toContainText(
    "but it can no longer be read, so the earlier review cannot be compared: all changes are shown.",
  );
  await expect(
    review.getByRole("list", { name: "12 changed files" }),
  ).toBeVisible();
  await expect(
    review.getByRole("radiogroup", { name: "Comparison" }),
  ).toHaveCount(0);
  await expect(review).not.toContainText("since the review");

  await markReviewed(review);
  expect(keptStoryAMark(dashboard)?.tree).toBe(gone.tree);
  editLater(workspace, 5);
  const again = await reopenReview(page, card);
  expect(again.since?.from).toBe(gone.tree);
  await expectSinceTheReview(review, keptStoryAMark(dashboard));
  const files = review.getByRole("list", { name: "1 changed file" });
  await expect.poll(() => treeRows(files)).toEqual([storyFile(5)]);
});
