// A snapshot's own first-parent commits, and one commit's comparison in the
// same file browser and diff as All changes. Trunk merges remain selectable.
import { writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "./support/preparationPage.ts";
import { openBacklog } from "./support/sessionDialog.ts";
import { keepLaunchRecord } from "./support/storyLaunchRecord.ts";
import { openReview, reviewRegion } from "./support/storyReviewMark.ts";
import {
  git,
  observed,
  storyWorktree,
  unchangedWorktree,
} from "./support/storyReviewWorktree.ts";

test("Commits lists the first-parent line below Uncommitted changes and shows a chosen commit's trees", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = storyWorktree(origin);
  // Leave the fixture's staged/unstaged/untracked files intact; a new plain
  // head gives the default one plain commit's changes.
  writeFileSync(path.join(workspace, "story.txt"), "story\nnewest story\n");
  git(
    workspace,
    "commit",
    "--quiet",
    "-m",
    "newest story edit",
    "--",
    "story.txt",
  );
  await keepLaunchRecord(dashboard, workspace);
  const before = observed(workspace);
  const card = await openBacklog(page, origin);
  const snapshot = await openReview(page, card);
  const review = reviewRegion(page);
  const expected = git(
    workspace,
    "log",
    "--first-parent",
    "--format=%H",
    `${snapshot.baseline}..HEAD`,
  ).split("\n");
  expect(snapshot.commits.map(({ revision }) => revision)).toEqual(expected);
  expect(snapshot.commits.map(({ subject }) => subject)).toEqual([
    "newest story edit",
    "merge trunk",
    "delete a file and redraw the image",
    "story file",
    "rename with a small edit",
  ]);
  await review.getByRole("radio", { name: "Commits", exact: true }).check();
  const rows = review
    .getByRole("list", { name: "Story commits", exact: true })
    .getByRole("button");
  await expect(rows).toHaveCount(6);
  for (const [at, commit] of snapshot.commits.entries()) {
    await expect(rows.nth(at + 1)).toContainText(
      `${commit.shortRevision} ${commit.subject}`,
    );
    await expect(rows.nth(at + 1).locator("time")).toHaveAttribute(
      "datetime",
      new Date(commit.committedAt).toISOString(),
    );
  }
  await expect(rows.nth(2)).toContainText("Integrated trunk");
  await expect(rows.nth(2)).toBeEnabled();
  await expect(rows.first()).toHaveText("Uncommitted changes");
  await expect(rows.first()).toHaveAttribute("aria-pressed", "true");
  await rows.nth(1).click();
  await rows.nth(1).click();
  await expect(
    review.getByRole("heading", { name: "Changes in 1 commit" }),
  ).toBeVisible();
  await expect(review.locator(".story-review-since")).toContainText(
    `From ${snapshot.commits[0]?.shortRevision} newest story edit to ${snapshot.commits[0]?.shortRevision} newest story edit.`,
  );
  const files = review.getByRole("list", {
    name: "1 changed file",
    exact: true,
  });
  await expect(
    files.getByRole("button", { name: "Modified story.txt", exact: true }),
  ).toBeVisible();
  await expect(review.locator(".story-review-diff")).toContainText(
    "newest story",
  );
  await expect(review.locator(".story-review-diff")).not.toContainText(
    "untracked",
  );
  // Extend to the older commit, then activate again to start its own range.
  await rows.last().click();
  await rows.last().click();
  await expect(rows.last()).toHaveAttribute("aria-pressed", "true");
  await expect(
    files.getByRole("button", {
      name: "Renamed old.txt → new.txt",
      exact: true,
    }),
  ).toBeVisible();
  await expect(review.locator(".story-review-diff")).toContainText("renamed");
  await expect(review.locator(".story-review-diff")).not.toContainText(
    "newest story",
  );
  await review.getByRole("button", { name: "Hide files", exact: true }).click();
  await expect(files).toBeHidden();
  await expect(review.locator(".story-review-diff")).toBeVisible();
  expect(observed(workspace)).toEqual(before);
});

test("a clean merge selected alone changed nothing by itself", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = storyWorktree(origin);
  await keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  await openReview(page, card);
  const review = reviewRegion(page);
  await review.getByRole("radio", { name: "Commits", exact: true }).check();
  const rows = review
    .getByRole("list", { name: "Story commits", exact: true })
    .getByRole("button");
  await rows.nth(1).click();
  await rows.nth(1).click();
  await expect(rows.nth(1)).toHaveAttribute("aria-pressed", "true");
  await expect(rows.first()).toBeEnabled();
  await expect(review).toContainText("The chosen commits changed nothing.");
  await expect(review.getByRole("list", { name: /changed file/ })).toHaveCount(
    0,
  );
  await expect(review.getByRole("button", { name: "Hide files" })).toHaveCount(
    0,
  );
  await rows.nth(3).click();
  await rows.nth(3).click();
  await expect(
    review
      .getByRole("list", { name: "1 changed file", exact: true })
      .getByRole("button", { name: "Added story.txt" }),
  ).toBeVisible();
});

test("no commits and no uncommitted changes offers no Commits", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = unchangedWorktree(origin);
  await keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  const snapshot = await openReview(page, card);
  const review = reviewRegion(page);
  expect(snapshot.commits).toEqual([]);
  await expect(review).toContainText(
    "No changes: the worktree matches baseline",
  );
  await expect(
    review.getByRole("radio", { name: "Commits", exact: true }),
  ).toHaveCount(0);
});

test("an empty plain commit names its range and lists no files", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = unchangedWorktree(origin);
  git(
    workspace,
    "commit",
    "--quiet",
    "--allow-empty",
    "-m",
    "empty story commit",
  );
  await keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  await openReview(page, card);
  const review = reviewRegion(page);
  await review.getByRole("radio", { name: "Commits", exact: true }).check();
  await expect(
    review.getByRole("heading", { name: "Changes in 1 commit" }),
  ).toBeVisible();
  await expect(review).toContainText("The chosen commits changed nothing.");
  await expect(review.getByRole("list", { name: /changed file/ })).toHaveCount(
    0,
  );
  await expect(review.getByRole("button", { name: "Hide files" })).toHaveCount(
    0,
  );
});
