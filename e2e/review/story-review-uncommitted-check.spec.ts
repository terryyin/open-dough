// All changes of a story's review can leave its uncommitted changes out, of
// Story A's worktree (../../dashboard/test-support/support/storyReviewWorktree.ts) with a committed
// file edited again: the check “Include uncommitted changes” is on at
// opening over the whole snapshot. Off, the review lists the committed files
// alone with their committed lines and counts, and says in words, as the
// check's description, that uncommitted changes are left out; on again shows
// the whole snapshot without reading a new snapshot or commit range. The
// selected file stays selected while both list it, and otherwise the first
// file is. A worktree without uncommitted changes offers no check; one with
// nothing committed says so while the check is off and keeps the check.

import { writeFileSync } from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";
import {
  storyReviewEndpoint,
  storyReviewRangeEndpoint,
} from "../../dashboard/src/storyReviewContract.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import { reviewBody } from "../../dashboard/test-support/support/reviewContextLine.ts";
import {
  expectFileSelected,
  expectLineCounts,
  expectTreeRows,
  fileRow,
  changedFilesList,
  fileDiff,
} from "../../dashboard/test-support/support/reviewTreeRows.ts";
import { openBacklog } from "../../dashboard/test-support/support/sessionDialog.ts";
import type { StartOrigin } from "../../dashboard/test-support/support/startOrigin.ts";
import { keepLaunchRecord } from "../../dashboard/test-support/support/storyLaunchRecord.ts";
import { openStoryReview } from "../../dashboard/test-support/support/reviewRead.ts";
import {
  reviewRegion,
  uncommittedCheck as check,
} from "../../dashboard/test-support/support/reviewControls.ts";
import {
  nestedWorktree,
  storyWorktree,
  unchangedWorktree,
} from "../../dashboard/test-support/support/storyReviewWorktree.ts";

// Story A's worktree with its committed story file edited again, uncommitted.
function storyWorktreeEditedAgain(origin: StartOrigin) {
  const { workspace } = storyWorktree(origin);
  writeFileSync(path.join(workspace, "story.txt"), "story\nmore\n");
  return { workspace };
}

// The snapshot and range requests the page has made so far.
function reviewRequests(page: Page) {
  const made: string[] = [];
  page.on("request", (request) => {
    const { pathname } = new URL(request.url());
    if ([storyReviewEndpoint, storyReviewRangeEndpoint].includes(pathname))
      made.push(pathname);
  });
  return () => made;
}

test("the check leaves uncommitted changes out of all changes and back without reading the snapshot again", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = storyWorktreeEditedAgain(origin);
  keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  await openStoryReview(page, card);
  const review = reviewRegion(page);
  const whole = changedFilesList(review, "7 changed files");
  const diff = fileDiff(review, "Added story.txt");

  // On at opening: the whole snapshot.
  await expect(whole).toBeVisible();
  await expect(check(review)).toBeChecked();
  await fileRow(review, "Added story.txt").press("Enter");
  await expectLineCounts(review, "Added story.txt", "+2 −0");
  await expect(diff).toContainText("+story");
  await expect(diff).toContainText("+more");
  const requests = reviewRequests(page);

  // Off: the committed files, lines, and counts alone.
  await check(review).uncheck();
  const committed = changedFilesList(review, "4 changed files");
  await expectTreeRows(committed, [
    "gone.txt",
    "image.png",
    "new.txt",
    "story.txt",
  ]);
  await expect(
    review.getByRole("heading", { name: "4 changed files" }),
  ).toBeVisible();
  await expect(whole).toHaveCount(0);
  await expectLineCounts(review, "Added story.txt", "+1 −0");
  await expect(fileRow(review, "Added story.txt")).toHaveAccessibleDescription(
    "1 line added, 0 lines removed",
  );
  await expect(diff).toContainText("+story");
  await expect(diff).not.toContainText("+more");
  await expect(check(review)).not.toBeChecked();

  // On again: the whole snapshot, as read at opening.
  await check(review).check();
  await expect(whole).toBeVisible();
  await expectLineCounts(review, "Added story.txt", "+2 −0");
  await expect(diff).toContainText("+more");
  expect(requests()).toEqual([]);
});

test("the selected file stays selected while the committed files list it, and otherwise the first file is", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = storyWorktreeEditedAgain(origin);
  keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  await openStoryReview(page, card);
  const review = reviewRegion(page);
  const expectSelected = (name: string) => expectFileSelected(review, name);

  await fileRow(review, "Added story.txt").press("Enter");
  await check(review).uncheck();
  await expect(changedFilesList(review, "4 changed files")).toBeVisible();
  await expectSelected("Added story.txt");

  await check(review).check();
  await expectSelected("Added story.txt");
  await fileRow(review, "Modified staged.txt").press("Enter");
  await expectSelected("Modified staged.txt");
  await check(review).uncheck();
  await expectSelected("Deleted gone.txt");
  await expect(fileRow(review, "Modified staged.txt")).toHaveCount(0);
});

test("a worktree without uncommitted changes offers no check", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = nestedWorktree(origin);
  keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  const snapshot = await openStoryReview(page, card);
  const review = reviewRegion(page);
  await expect(changedFilesList(review, "6 changed files")).toBeVisible();
  await expect(review.getByRole("checkbox")).toHaveCount(0);
  expect(snapshot.committed).toBeUndefined();
});

test("with nothing committed, the check off says so, lists no files, and stays to turn back on", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = unchangedWorktree(origin);
  writeFileSync(path.join(workspace, "wip.txt"), "work in progress\n");
  keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  await openStoryReview(page, card);
  const review = reviewRegion(page);
  const whole = changedFilesList(review, "1 changed file");
  await expect(whole).toBeVisible();
  await expect(check(review)).toBeChecked();

  await check(review).uncheck();
  await expect(reviewBody(review)).toHaveText(
    "Nothing is committed yet: every change in this worktree is uncommitted.",
  );
  await expect(review.getByRole("list")).toHaveCount(0);
  await expect(review.getByRole("button", { name: "Hide files" })).toHaveCount(
    0,
  );
  await expect(check(review)).not.toBeChecked();

  await check(review).check();
  await expect(whole).toBeVisible();
});
