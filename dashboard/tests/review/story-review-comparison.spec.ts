// A marked story's review switches between the changes since the review and
// all changes against trunk within one snapshot of Story A's twelve-file
// worktree (../support/storyReviewMark.ts), reading nothing anew: a named
// switch says which comparison is shown. Refresh keeps the comparison shown,
// of a new snapshot; each opening starts on the changes since the review.
// Each comparison's files are in ../../../e2e/review/story-review-comparison-files.spec.ts. With no later change the review says nothing
// changed since the review, without Hide files, and offers the same switch;
// an unmarked story's review opens on all its changes and offers Commits.

import { changedFilesList } from "../support/reviewTreeRows.ts";
import { writeFileSync } from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";
import { storyReviewEndpoint } from "../../src/storyReviewContract.ts";
import { expect, test } from "../support/preparationPage.ts";
import { openBacklog } from "../support/sessionDialog.ts";
import {
  expectShown,
  expectSinceTheReview,
  keptStoryAMark,
  markedThenChanged,
  markReviewed,
  refreshReview,
  openStoryReview,
  reopenStoryReview,
  reviewRegion,
  twelveFileWorktree,
  comparisonChoice,
} from "../support/storyReviewMark.ts";
import { keepLaunchRecord } from "../support/storyLaunchRecord.ts";

// How many snapshot reads the page has asked for so far.
function snapshotReads(page: Page) {
  let reads = 0;
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === storyReviewEndpoint) reads += 1;
  });
  return () => reads;
}

test("the switch shows the same snapshot against trunk and back without reading it again", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace, review } = await markedThenChanged(
    page,
    dashboard,
    origin,
  );
  await expectShown(review, "Since the review");
  const reads = snapshotReads(page);

  // The worktree changes meanwhile; the snapshot shown does not.
  writeFileSync(path.join(workspace, "meanwhile.txt"), "meanwhile\n");
  await comparisonChoice(review, "Since the review").press("ArrowDown");
  await expectShown(review, "All changes");
  await expect(changedFilesList(review, "13 changed files")).toBeVisible();
  await expect(
    review.getByRole("heading", { name: "Changes since the review" }),
  ).toHaveCount(0);
  await expect(review).toContainText("An earlier snapshot is marked reviewed,");

  await comparisonChoice(review, "Since the review").check();
  await expectShown(review, "Since the review");
  await expectSinceTheReview(review, keptStoryAMark(dashboard));
  await expect(changedFilesList(review, "3 changed files")).toBeVisible();
  expect(reads()).toBe(0);
});

test("Refresh keeps all changes shown, of a new snapshot", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace, review } = await markedThenChanged(
    page,
    dashboard,
    origin,
  );
  await comparisonChoice(review, "All changes").check();
  writeFileSync(path.join(workspace, "meanwhile.txt"), "meanwhile\n");

  const refreshed = await refreshReview(review);
  expect(refreshed.files).toHaveLength(14);
  await expectShown(review, "All changes");
  await expect(changedFilesList(review, "14 changed files")).toBeVisible();
  await expect(review.getByRole("status").first()).toHaveText(
    /^Review refreshed: 14 changed files against baseline [0-9a-f]{7}\.$/,
  );
});

test("each opening starts on the changes since the review", async ({
  page,
  dashboard,
  origin,
}) => {
  const { card, review } = await markedThenChanged(page, dashboard, origin);
  await comparisonChoice(review, "All changes").check();
  await expect(changedFilesList(review, "13 changed files")).toBeVisible();

  await reopenStoryReview(page, card);
  await expectShown(review, "Since the review");
  await expectSinceTheReview(review, keptStoryAMark(dashboard));
  await expect(changedFilesList(review, "3 changed files")).toBeVisible();
});

test("a marked story with no later change says nothing changed since the review and offers all changes", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = twelveFileWorktree(origin);
  keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  await openStoryReview(page, card);
  const review = reviewRegion(page);
  await markReviewed(review);

  const since = await reopenStoryReview(page, card);
  expect(since.since?.files).toEqual([]);
  await expectSinceTheReview(review, keptStoryAMark(dashboard));
  await expect(review).toContainText("Nothing changed since the review.");
  await expect(changedFilesList(review, /changed file/)).toHaveCount(0);
  await expect(review.getByRole("button", { name: "Hide files" })).toHaveCount(
    0,
  );
  await expectShown(review, "Since the review");
  await comparisonChoice(review, "All changes").check();
  await expect(changedFilesList(review, "12 changed files")).toBeVisible();
  await expect(
    review.getByRole("button", { name: "Hide files" }),
  ).toBeVisible();
  await expect(review).toContainText("This snapshot is marked reviewed,");
});

test("an unmarked story's review opens on all its changes and offers Commits", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = twelveFileWorktree(origin);
  keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  const shown = await openStoryReview(page, card);
  const review = reviewRegion(page);
  expect(shown.since).toBeUndefined();
  await expect(changedFilesList(review, "12 changed files")).toBeVisible();
  await expect(review).not.toContainText("since the review");
  await expect(review.locator("time")).toHaveCount(0);
  await expectShown(review, "All changes");
  await expect(
    comparisonChoice(review, "Commits", { exact: true }),
  ).toBeVisible();
  await expect(comparisonChoice(review, "Since the review")).toHaveCount(0);
});
