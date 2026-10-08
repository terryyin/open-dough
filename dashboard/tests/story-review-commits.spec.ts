// A snapshot's own first-parent commits, and one commit's comparison in the
// same file browser and diff as All changes. Trunk merges remain in the list;
// across-baseline comparisons are not offered until range restatement lands.
import { writeFileSync } from "node:fs";
import path from "node:path";
import { storyReviewRangeEndpoint } from "../src/storyReview.ts";
import { expect, test } from "./support/preparationPage.ts";
import { openBacklog } from "./support/sessionDialog.ts";
import { queuedIdentity } from "./support/startOrigin.ts";
import { keepLaunchRecord } from "./support/storyLaunchRecord.ts";
import { openReview, reviewRegion } from "./support/storyReviewMark.ts";
import {
  git,
  observed,
  storyWorktree,
  unchangedWorktree,
} from "./support/storyReviewWorktree.ts";

test("Commits lists the first-parent line and defaults to the newest commit's trees", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = storyWorktree(origin);
  // Leave the fixture's staged/unstaged/untracked files intact; a new plain
  // head lets this slice prove its default without the later restatement.
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
  await expect(rows).toHaveCount(5);
  for (const [at, commit] of snapshot.commits.entries()) {
    await expect(rows.nth(at)).toContainText(
      `${commit.shortRevision} ${commit.subject}`,
    );
    await expect(rows.nth(at).locator("time")).toHaveAttribute(
      "datetime",
      new Date(commit.committedAt).toISOString(),
    );
  }
  await expect(rows.nth(1)).toContainText("Integrated trunk");
  await expect(rows.nth(1)).toBeDisabled();
  await expect(rows.first()).toHaveAttribute("aria-pressed", "true");
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
  // Selecting an older plain commit compares its own trees, including a rename.
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

test("a newest merge stays the default but its cross-baseline comparison is unavailable for now", async ({
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
  await expect(rows.first()).toHaveAttribute("aria-pressed", "true");
  await expect(rows.first()).toBeDisabled();
  await expect(review.getByRole("status")).toContainText(
    "A commit range across a trunk integration is not available yet.",
  );
  await expect(review.getByRole("list", { name: /changed file/ })).toHaveCount(
    0,
  );
  await expect(review.getByRole("button", { name: "Hide files" })).toHaveCount(
    0,
  );
  await rows.nth(2).click();
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

test("a range admits only exact story and object IDs and confirms the repository holds them", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace, merged } = storyWorktree(origin);
  await keepLaunchRecord(dashboard, workspace);
  const tree = git(workspace, "rev-parse", "HEAD^{tree}");
  const query = {
    source: "open-dough",
    identity: queuedIdentity,
    fromTree: tree,
    fromBaseline: merged,
    tree,
    baseline: merged,
  };
  const before = observed(workspace);
  for (const invalid of [
    { ...query, fromTree: "HEAD" },
    { ...query, fromBaseline: "--output=/tmp/diff" },
    { ...query, workspace },
  ]) {
    const response = await page.request.get(
      `${dashboard.baseURL}${storyReviewRangeEndpoint}?${new URLSearchParams(invalid)}`,
      { headers: { Origin: dashboard.origin } },
    );
    expect(response.status()).toBe(400);
  }
  const response = await page.request.get(
    `${dashboard.baseURL}${storyReviewRangeEndpoint}?${new URLSearchParams({ ...query, tree: `${"0".repeat(39)}1` })}`,
    { headers: { Origin: dashboard.origin } },
  );
  expect(response.status()).toBe(200);
  expect(await response.json()).toMatchObject({ kind: "unavailable" });
  expect(git(workspace, "rev-parse", "origin/main")).toBe(merged);
  expect(observed(workspace)).toEqual(before);
});
