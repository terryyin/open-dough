// A marked story's review switches between the changes since the review and
// all changes against trunk within one snapshot of Story A's twelve-file
// worktree (./support/storyReviewMark.ts), reading nothing anew: a named
// switch says which comparison is shown. Refresh keeps the comparison shown,
// of a new snapshot; each opening starts on the changes since the review.
// The nothing-changed review offers the same switch; an unmarked story's
// review offers none.

import { writeFileSync } from "node:fs";
import path from "node:path";
import type { Locator, Page } from "@playwright/test";
import { storyReviewEndpoint } from "../src/storyReview.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { expect, test } from "./support/preparationPage.ts";
import { openBacklog } from "./support/sessionDialog.ts";
import type { StartOrigin } from "./support/startOrigin.ts";
import {
  editLater,
  expectSinceTheReview,
  keptStoryAMark,
  markReviewed,
  nextSnapshot,
  openReview,
  reopenReview,
  reviewRegion,
  storyFile,
  twelveFileWorktree,
} from "./support/storyReviewMark.ts";
import { keepLaunchRecord } from "./support/storyReviewWorktree.ts";

const comparison = (review: Locator) =>
  review.getByRole("radiogroup", { name: "Comparison" });

// The comparison switch says the one comparison shown.
async function expectShown(review: Locator, shown: string) {
  const choices = comparison(review);
  await expect(choices.getByRole("radio", { name: shown })).toBeChecked();
  await expect(choices.getByRole("radio", { checked: true })).toHaveCount(1);
}

// How many snapshot reads the page has asked for so far.
function snapshotReads(page: Page) {
  let reads = 0;
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === storyReviewEndpoint) reads += 1;
  });
  return () => reads;
}

// Story A marked at its twelve files, then two of them changed and one
// added, and its review reopened on the three changes since the review.
async function markedThenChanged(
  page: Page,
  dashboard: DashboardServer,
  origin: StartOrigin,
) {
  const { workspace } = twelveFileWorktree(origin);
  await keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  await openReview(page, card);
  const review = reviewRegion(page);
  await markReviewed(review);
  editLater(workspace, 2);
  editLater(workspace, 9);
  writeFileSync(path.join(workspace, storyFile(13)), "added later\n");
  await reopenReview(page, card);
  await expect(
    review.getByRole("list", { name: "3 changed files" }),
  ).toBeVisible();
  return { workspace, card, review };
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
  await comparison(review)
    .getByRole("radio", { name: "Since the review" })
    .press("ArrowDown");
  await expectShown(review, "All changes");
  await expect(
    review.getByRole("list", { name: "13 changed files" }),
  ).toBeVisible();
  await expect(
    review.getByRole("heading", { name: "Changes since the review" }),
  ).toHaveCount(0);
  await expect(review).toContainText("An earlier snapshot is marked reviewed,");

  await comparison(review)
    .getByRole("radio", { name: "Since the review" })
    .check();
  await expectShown(review, "Since the review");
  await expectSinceTheReview(review, keptStoryAMark(dashboard));
  await expect(
    review.getByRole("list", { name: "3 changed files" }),
  ).toBeVisible();
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
  await comparison(review).getByRole("radio", { name: "All changes" }).check();
  writeFileSync(path.join(workspace, "meanwhile.txt"), "meanwhile\n");

  const refreshed = nextSnapshot(page);
  await review.getByRole("button", { name: "Refresh" }).click();
  expect((await refreshed).files).toHaveLength(14);
  await expectShown(review, "All changes");
  await expect(
    review.getByRole("list", { name: "14 changed files" }),
  ).toBeVisible();
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
  await comparison(review).getByRole("radio", { name: "All changes" }).check();
  await expect(
    review.getByRole("list", { name: "13 changed files" }),
  ).toBeVisible();

  await reopenReview(page, card);
  await expectShown(review, "Since the review");
  await expectSinceTheReview(review, keptStoryAMark(dashboard));
  await expect(
    review.getByRole("list", { name: "3 changed files" }),
  ).toBeVisible();
});

test("a review with nothing changed since the review offers all changes", async ({
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

  await reopenReview(page, card);
  await expect(review).toContainText("Nothing changed since the review.");
  await expectShown(review, "Since the review");
  await comparison(review).getByRole("radio", { name: "All changes" }).check();
  await expect(
    review.getByRole("list", { name: "12 changed files" }),
  ).toBeVisible();
  await expect(review).toContainText("This snapshot is marked reviewed,");
});

test("an unmarked story's review offers no comparison switch", async ({
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
  await expect(comparison(review)).toHaveCount(0);
  await expect(review.getByRole("radio")).toHaveCount(0);
});
