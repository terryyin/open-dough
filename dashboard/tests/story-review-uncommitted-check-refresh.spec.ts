// The check that leaves uncommitted changes out of all changes
// (./story-review-uncommitted-check.spec.ts) keeps its state, of Story A's
// worktree (./support/storyReviewWorktree.ts). Off, Refresh after the agent
// commits one file and edits another lists the new committed files, still
// off, and announces their count; once everything is committed Refresh
// offers no check over the whole snapshot, and uncommitted changes appearing
// later are offered included. Since the review and Commits offer no check,
// and returning to All changes finds it as it was left. Off, Previous file
// and Next file move through the committed files alone and a binary file's
// diff is read to the head's tree; Close and Review changes starts with the
// check on.

import { writeFileSync } from "node:fs";
import path from "node:path";
import type { Locator, Page } from "@playwright/test";
import { storyReviewFileEndpoint } from "../src/storyReview.ts";
import { expect, test } from "./support/preparationPage.ts";
import { reviewFeedback } from "./support/reviewContextLine.ts";
import {
  expectFileSelected,
  fileRow,
  treeRows,
} from "./support/reviewTreeRows.ts";
import { openBacklog } from "./support/sessionDialog.ts";
import { keepLaunchRecord } from "./support/storyLaunchRecord.ts";
import {
  comparison,
  markReviewed,
  nextSnapshot,
  openReview,
  reopenReview,
  reviewRegion,
  uncommittedCheck as check,
  uncommittedLeftOut as leftOut,
} from "./support/storyReviewMark.ts";
import {
  commitAll,
  git,
  storyWorktree,
  writeAt,
} from "./support/storyReviewWorktree.ts";

const committedFiles = ["gone.txt", "image.png", "new.txt", "story.txt"];

// Refresh, answering the snapshot the review then shows.
async function refresh(page: Page, review: Locator) {
  const snapshot = nextSnapshot(page);
  await review.getByRole("button", { name: "Refresh", exact: true }).click();
  return snapshot;
}

const refreshed = (files: number) =>
  new RegExp(
    `^Review refreshed: ${String(files)} changed files against baseline [0-9a-f]{7}\\.$`,
  );

test("Refresh keeps the check off while uncommitted changes remain, drops it when none do, and offers it on when they return", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = storyWorktree(origin);
  await keepLaunchRecord(dashboard, workspace);
  await openReview(page, await openBacklog(page, origin));
  const review = reviewRegion(page);
  const list = (files: number) =>
    review.getByRole("list", { name: `${String(files)} changed files` });
  await check(review).uncheck();
  await expect.poll(() => treeRows(list(4))).toEqual(committedFiles);

  // The agent commits the staged file and keeps editing another.
  git(workspace, "commit", "--quiet", "-m", "staged edit");
  writeFileSync(path.join(workspace, "unstaged.txt"), "on\n", { flag: "a" });
  const partly = await refresh(page, review);
  expect(partly.files).toHaveLength(7);
  await expect
    .poll(() => treeRows(list(5)))
    .toEqual(["gone.txt", "image.png", "new.txt", "staged.txt", "story.txt"]);
  await expect(check(review)).not.toBeChecked();
  await expect(review.getByText(leftOut)).toBeVisible();
  await expect(reviewFeedback(review)).toHaveText(refreshed(5));

  // The agent commits everything: no check, the whole snapshot.
  commitAll(workspace, "the rest");
  expect((await refresh(page, review)).committed).toBeUndefined();
  await expect
    .poll(() => treeRows(list(7)))
    .toEqual([
      "fresh",
      "  new.txt",
      "gone.txt",
      "image.png",
      "new.txt",
      "staged.txt",
      "story.txt",
      "unstaged.txt",
    ]);
  await expect(review.getByRole("checkbox")).toHaveCount(0);
  await expect(review.getByText(leftOut)).toHaveCount(0);
  await expect(reviewFeedback(review)).toHaveText(refreshed(7));

  // Uncommitted work again: the check is back, on.
  writeAt(workspace, "again.txt", "again\n");
  expect((await refresh(page, review)).committed?.files).toHaveLength(7);
  await expect(list(8)).toBeVisible();
  await expect(check(review)).toBeChecked();
  await expect(review.getByText(leftOut)).toHaveCount(0);
  await expect(reviewFeedback(review)).toHaveText(refreshed(8));
});

test("Since the review and Commits offer no check, and All changes finds it as it was left", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = storyWorktree(origin);
  await keepLaunchRecord(dashboard, workspace);
  await openReview(page, await openBacklog(page, origin));
  const review = reviewRegion(page);
  const choose = (name: string) =>
    comparison(review).getByRole("radio", { name, exact: true }).check();
  const since = review.getByRole("heading", {
    name: "Changes since the review",
  });
  const committed = review.getByRole("list", { name: "4 changed files" });

  // Marked, then changed: Refresh shows the changes since the review.
  await markReviewed(review);
  writeAt(workspace, "later.txt", "later\n");
  await refresh(page, review);
  await expect(since).toBeVisible();
  await expect(review.getByRole("checkbox")).toHaveCount(0);

  await choose("All changes");
  await expect(check(review)).toBeChecked();
  await check(review).uncheck();
  await expect.poll(() => treeRows(committed)).toEqual(committedFiles);

  await choose("Commits");
  await expect(
    review.getByRole("list", { name: "Story commits", exact: true }),
  ).toBeVisible();
  await expect(review.getByRole("checkbox")).toHaveCount(0);
  await expect(review.getByText(leftOut)).toHaveCount(0);

  await choose("Since the review");
  await expect(since).toBeVisible();
  await expect(review.getByRole("checkbox")).toHaveCount(0);
  await expect(review.getByText(leftOut)).toHaveCount(0);

  await choose("All changes");
  await expect(check(review)).not.toBeChecked();
  await expect(review.getByText(leftOut)).toBeVisible();
  await expect.poll(() => treeRows(committed)).toEqual(committedFiles);
});

test("with the check off the file moves stay within the committed files and a binary file reads to the head's tree; reopening starts with the check on", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = storyWorktree(origin);
  await keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  const shown = await openReview(page, card);
  const review = reviewRegion(page);
  const binary = review.getByRole("region", { name: "Modified image.png" });
  const noDiff = "This file has no textual diff: Git reads it as binary.";
  await fileRow(review, "Modified image.png").press("Enter");
  await expect(binary).toContainText(noDiff);

  // Off: the same answer for the committed image, read to the head's tree.
  const read = page.waitForRequest((request) => {
    const { pathname, searchParams } = new URL(request.url());
    return (
      pathname === storyReviewFileEndpoint &&
      searchParams.get("path") === "image.png"
    );
  });
  await check(review).uncheck();
  const asked = new URL((await read).url()).searchParams;
  expect(shown.committed?.tree).not.toBe(shown.tree);
  expect(asked.get("tree")).toBe(shown.committed?.tree);
  expect(asked.get("baseline")).toBe(shown.baseline);
  await expectFileSelected(review, "Modified image.png");
  await expect(binary).toContainText(noDiff);
  await expect(binary.getByRole("listitem")).toHaveCount(0);

  // The moves end at the first and last committed file.
  const previous = review.getByRole("button", { name: "Previous file" });
  const next = review.getByRole("button", { name: "Next file" });
  await previous.click();
  await expectFileSelected(review, "Deleted gone.txt");
  await expect(previous).toHaveAttribute("aria-disabled", "true");
  for (const name of [
    "Modified image.png",
    "Renamed old.txt → new.txt",
    "Added story.txt",
  ]) {
    await next.click();
    await expectFileSelected(review, name);
  }
  await expect(next).toHaveAttribute("aria-disabled", "true");

  await reopenReview(page, card);
  await expect(check(review)).toBeChecked();
  await expect(review.getByText(leftOut)).toHaveCount(0);
  await expect(
    review.getByRole("list", { name: "7 changed files" }),
  ).toBeVisible();
});
