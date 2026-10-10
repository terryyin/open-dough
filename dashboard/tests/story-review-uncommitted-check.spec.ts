// All changes of a story's review can leave its uncommitted changes out, of
// Story A's worktree (./support/storyReviewWorktree.ts) with a committed
// file edited again: the check “Include uncommitted changes” is on at
// opening over the whole snapshot. Off, the review lists the committed files
// alone with their committed lines and counts, and says in words, as the
// check's description, that uncommitted changes are left out; on again shows
// the whole snapshot, and neither reads a snapshot, a range, or a mark. The
// selected file stays selected while both list it, and otherwise the first
// file is. A worktree without uncommitted changes offers no check; one with
// nothing committed says so while the check is off and keeps the check. Mark
// reviewed with the check off marks the whole snapshot.

import { writeFileSync } from "node:fs";
import path from "node:path";
import type { Locator, Page } from "@playwright/test";
import {
  storyReviewEndpoint,
  storyReviewMarkEndpoint,
  storyReviewRangeEndpoint,
} from "../src/storyReview.ts";
import { expect, test } from "./support/preparationPage.ts";
import { reviewBody } from "./support/reviewContextLine.ts";
import {
  expectFileSelected,
  expectLineCounts,
  fileRow,
  treeRows,
} from "./support/reviewTreeRows.ts";
import { openBacklog } from "./support/sessionDialog.ts";
import type { StartOrigin } from "./support/startOrigin.ts";
import { keepLaunchRecord } from "./support/storyLaunchRecord.ts";
import {
  keptStoryAMark,
  markReviewed,
  openReview,
  reviewRegion,
} from "./support/storyReviewMark.ts";
import {
  nestedWorktree,
  storyWorktree,
  unchangedWorktree,
} from "./support/storyReviewWorktree.ts";

const leftOut =
  "Uncommitted changes are left out. Mark reviewed still marks the whole snapshot.";

const check = (review: Locator) =>
  review.getByRole("checkbox", { name: "Include uncommitted changes" });

// Story A's worktree with its committed story file edited again, uncommitted.
function storyWorktreeEditedAgain(origin: StartOrigin) {
  const { workspace } = storyWorktree(origin);
  writeFileSync(path.join(workspace, "story.txt"), "story\nmore\n");
  return { workspace };
}

// The snapshot, range, and mark requests the page has made so far.
function reviewRequests(page: Page) {
  const made: string[] = [];
  page.on("request", (request) => {
    const { pathname } = new URL(request.url());
    if (
      [
        storyReviewEndpoint,
        storyReviewRangeEndpoint,
        storyReviewMarkEndpoint,
      ].includes(pathname)
    )
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
  await keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  await openReview(page, card);
  const review = reviewRegion(page);
  const whole = review.getByRole("list", { name: "7 changed files" });
  const diff = review.getByRole("region", { name: "Added story.txt" });

  // On at opening: the whole snapshot.
  await expect(whole).toBeVisible();
  await expect(check(review)).toBeChecked();
  await expect(check(review)).not.toHaveAccessibleDescription(leftOut);
  await expect(review.getByText(leftOut)).toHaveCount(0);
  await fileRow(review, "Added story.txt").press("Enter");
  await expectLineCounts(review, "Added story.txt", "+2 −0");
  await expect(diff).toContainText("+story");
  await expect(diff).toContainText("+more");
  const requests = reviewRequests(page);

  // Off: the committed files, lines, and counts alone.
  await check(review).uncheck();
  const committed = review.getByRole("list", { name: "4 changed files" });
  await expect
    .poll(() => treeRows(committed))
    .toEqual(["gone.txt", "image.png", "new.txt", "story.txt"]);
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
  await expect(review.getByText(leftOut)).toBeVisible();
  await expect(check(review)).not.toBeChecked();
  await expect(check(review)).toHaveAccessibleDescription(leftOut);

  // On again: the whole snapshot, as read at opening.
  await check(review).check();
  await expect(whole).toBeVisible();
  await expectLineCounts(review, "Added story.txt", "+2 −0");
  await expect(diff).toContainText("+more");
  await expect(review.getByText(leftOut)).toHaveCount(0);
  expect(requests()).toEqual([]);
});

test("the selected file stays selected while the committed files list it, and otherwise the first file is", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = storyWorktreeEditedAgain(origin);
  await keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  await openReview(page, card);
  const review = reviewRegion(page);
  const expectSelected = (name: string) => expectFileSelected(review, name);

  await fileRow(review, "Added story.txt").press("Enter");
  await check(review).uncheck();
  await expect(
    review.getByRole("list", { name: "4 changed files" }),
  ).toBeVisible();
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
  await keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  const snapshot = await openReview(page, card);
  const review = reviewRegion(page);
  await expect(
    review.getByRole("list", { name: "6 changed files" }),
  ).toBeVisible();
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
  await keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  await openReview(page, card);
  const review = reviewRegion(page);
  const whole = review.getByRole("list", { name: "1 changed file" });
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
  await expect(review.getByText(leftOut)).toBeVisible();
  await expect(check(review)).not.toBeChecked();

  await check(review).check();
  await expect(whole).toBeVisible();
});

test("Mark reviewed with the check off marks the whole snapshot, and the review says so before and after", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = storyWorktreeEditedAgain(origin);
  await keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  const shown = await openReview(page, card);
  const review = reviewRegion(page);
  await check(review).uncheck();
  const committed = review.getByRole("list", { name: "4 changed files" });
  await expect(committed).toBeVisible();
  await expect(review.getByText(leftOut)).toBeVisible();
  expect(shown.committed?.tree).not.toBe(shown.tree);

  const marking = page.waitForRequest(
    (request) => new URL(request.url()).pathname === storyReviewMarkEndpoint,
  );
  await markReviewed(review);
  expect((await marking).postDataJSON()).toMatchObject({
    tree: shown.tree,
    baseline: shown.baseline,
  });
  expect(keptStoryAMark(dashboard)).toMatchObject({
    tree: shown.tree,
    baseline: shown.baseline,
  });
  await expect(review).toContainText("This snapshot is marked reviewed,");
  await expect(review.getByText(leftOut)).toBeVisible();
  await expect(check(review)).not.toBeChecked();
  await expect(committed).toBeVisible();
});
