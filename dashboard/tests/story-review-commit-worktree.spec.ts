// The virtual newest item accounts for the whole snapshot without pretending
// to be a commit, and Mark reviewed always marks that whole snapshot.
import { expect, test } from "./support/preparationPage.ts";
import { chooseCommit } from "./support/storyReviewCommitChoice.ts";
import { storyReviewRangeEndpoint } from "../src/storyReview.ts";
import { openBacklog } from "./support/sessionDialog.ts";
import { keepLaunchRecord } from "./support/storyLaunchRecord.ts";
import {
  keptStoryAMark,
  markReviewed,
  openReview,
  reopenReview,
  reviewRegion,
} from "./support/storyReviewMark.ts";
import { markStoryReview } from "./support/storyReviewTrunk.ts";
import {
  observed,
  storyWorktree,
  unchangedWorktree,
  writeAt,
} from "./support/storyReviewWorktree.ts";
import { treeRows } from "./support/reviewTreeRows.ts";

test("Uncommitted changes alone reads staged, unstaged and untracked files; through the oldest commit it equals All changes", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = storyWorktree(origin);
  const before = observed(workspace);
  await keepLaunchRecord(dashboard, workspace);
  const snapshot = await openReview(page, await openBacklog(page, origin));
  const review = reviewRegion(page);
  expect(snapshot.uncommitted).toMatchObject({
    kind: "uncommitted",
    tree: snapshot.tree,
    baseline: snapshot.baseline,
  });
  expect(snapshot.uncommitted).not.toHaveProperty("revision");
  expect(snapshot.uncommitted).not.toHaveProperty("committedAt");
  await review.getByRole("radio", { name: "Commits", exact: true }).check();
  const rows = review
    .getByRole("list", { name: "Story commits", exact: true })
    .getByRole("button");
  await expect(rows.first()).toHaveText("Uncommitted changes");
  await expect(rows.first().locator("time")).toHaveCount(0);
  await expect(rows.first()).toHaveAttribute("aria-pressed", "true");
  await expect(
    review.getByRole("heading", { name: "Uncommitted changes", exact: true }),
  ).toBeVisible();
  const files = review.getByRole("list", {
    name: "3 changed files",
    exact: true,
  });
  await expect
    .poll(() => treeRows(files))
    .toEqual(["fresh", "  new.txt", "staged.txt", "unstaged.txt"]);
  await files
    .getByRole("button", { name: "Modified staged.txt", exact: true })
    .click();
  await expect(review.locator(".story-review-added")).toHaveText(["+more"]);
  await files
    .getByRole("button", { name: "Modified unstaged.txt", exact: true })
    .click();
  await expect(review.locator(".story-review-removed")).toHaveText([
    "-unstaged 5",
  ]);
  await files
    .getByRole("button", { name: "Added fresh/new.txt", exact: true })
    .click();
  await expect(review.locator(".story-review-added")).toHaveText([
    "+untracked",
  ]);
  await expect(files).not.toContainText("ignored.log");
  const rangeRead = page.waitForResponse(
    (response) => new URL(response.url()).pathname === storyReviewRangeEndpoint,
  );
  await chooseCommit(review, rows.last());
  expect(await (await rangeRead).json()).toMatchObject({
    kind: "comparison",
    files: snapshot.files,
    tree: snapshot.tree,
  });
  await expect(
    review.getByRole("heading", {
      name: "Changes in 4 commits and Uncommitted changes",
    }),
  ).toBeVisible();
  await expect(review.locator(".story-review-since")).toContainText(
    "to Uncommitted changes.",
  );
  await expect(
    review.getByRole("list", { name: "7 changed files", exact: true }),
  ).toBeVisible();
  expect(observed(workspace)).toEqual(before);
});

test("an uncommitted-only snapshot offers Commits without inventing a commit", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = unchangedWorktree(origin);
  writeAt(workspace, "only.txt", "only uncommitted\n");
  await keepLaunchRecord(dashboard, workspace);
  const snapshot = await openReview(page, await openBacklog(page, origin));
  const review = reviewRegion(page);
  expect(snapshot.commits).toEqual([]);
  await review.getByRole("radio", { name: "Commits", exact: true }).check();
  await expect(
    review
      .getByRole("list", { name: "Story commits", exact: true })
      .getByRole("button"),
  ).toHaveText("Uncommitted changes");
  await expect(
    review
      .getByRole("list", { name: "1 changed file", exact: true })
      .getByRole("button", { name: "Added only.txt" }),
  ).toBeVisible();
  await expect(review.locator(".story-review-added")).toHaveText([
    "+only uncommitted",
  ]);
});

test("a marked review opens on Since the review and marking from Commits marks the whole snapshot", async ({
  page,
  dashboard,
  origin,
}) => {
  const { story, card, review } = await markStoryReview(
    page,
    dashboard,
    origin,
  );
  writeAt(story.workspace, "src/b.ts", "uncommitted b\n");
  const snapshot = await reopenReview(page, card);
  await expect(
    review.getByRole("radio", { name: "Since the review" }),
  ).toBeChecked();
  await review.getByRole("radio", { name: "Commits", exact: true }).check();
  // Choose a committed item alone, excluding the new uncommitted file from
  // the displayed range; marking must nevertheless keep the full snapshot.
  const rows = review
    .getByRole("list", { name: "Story commits", exact: true })
    .getByRole("button");
  await chooseCommit(review, rows.nth(1));
  await chooseCommit(review, rows.nth(1));
  await expect(
    review.getByRole("heading", { name: "Changes in 1 commit" }),
  ).toBeVisible();
  await expect(
    review
      .getByRole("list", { name: "1 changed file", exact: true })
      .getByRole("button", { name: "Modified src/c.ts" }),
  ).toBeVisible();
  await markReviewed(review);
  expect(keptStoryAMark(dashboard)).toMatchObject({
    tree: snapshot.tree,
    baseline: snapshot.baseline,
  });
  const again = await reopenReview(page, card);
  expect(again.since?.files).toEqual([]);
  await expect(
    review.getByRole("radio", { name: "Since the review" }),
  ).toBeChecked();
  await expect(review).toContainText("Nothing changed since the review.");
});
