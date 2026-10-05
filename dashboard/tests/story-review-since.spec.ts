// A marked story's review opens on the changes since the review, of Story
// A's twelve-file worktree (./support/storyReviewMark.ts), its baseline
// unchanged throughout: the files changed from the marked snapshot to a fresh
// one, headed by what it compares and when the mark was made, each diff
// holding only what changed after the mark. A file written after the
// snapshot and before the mark is listed; with no later change the review
// says nothing changed since the review; marking there marks the whole
// snapshot. An unmarked story opens on all its changes.

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
  storyFile,
  twelveFileWorktree,
} from "./support/storyReviewMark.ts";
import { keepLaunchRecord } from "./support/storyReviewWorktree.ts";

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

test("a marked story with no later change says nothing changed since the review", async ({
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

  const since = await reopenReview(page, card);
  expect(since.since?.files).toEqual([]);
  await expectSinceTheReview(review, keptStoryAMark(dashboard));
  await expect(review).toContainText("Nothing changed since the review.");
  await expect(review.getByRole("list", { name: /changed file/ })).toHaveCount(
    0,
  );
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

test("an unmarked story's review opens on all its changes", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = twelveFileWorktree(origin);
  await keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  const shown = await openReview(page, card);
  const review = reviewRegion(page);
  expect(shown.since).toBeUndefined();
  await expect(
    review.getByRole("list", { name: "12 changed files" }),
  ).toBeVisible();
  await expect(review).not.toContainText("since the review");
  await expect(review.locator("time")).toHaveCount(0);
});
