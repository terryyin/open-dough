// Mark reviewed marks Story A's shown snapshot (../support/storyReviewWorktree.ts)
// with a time; later work stays unmarked. Its ref survives Git housekeeping and
// restart, when reopening compares with it; worktree index/status stay unchanged.
// Opening/closing/refreshing/replacing marks nothing. Marking again replaces the
// story's mark/ref. Mark requests naming paths, malformed objects, or missing
// objects are in ../../backend-tests/review/story-review-mark-admission.spec.ts.

import { writeFileSync } from "node:fs";
import path from "node:path";
import { parts } from "../dashboardPage.ts";
import {
  sharedDashboardBuild,
  startDashboardServer,
} from "../support/dashboardServer.ts";
import { expect, test } from "../support/preparationPage.ts";
import { openBacklog } from "../support/sessionDialog.ts";
import { queuedIdentity } from "../support/startOrigin.ts";
import {
  storyBLaunchRecord,
  storyBWorktree,
} from "../support/sidePanelContents.ts";
import {
  expectSinceTheReview,
  keptReviewMarks,
  keptStoryAMark,
  markReviewed,
  nextSnapshot,
  openStoryReview,
  reviewedRefs,
  reviewRegion,
} from "../support/storyReviewMark.ts";
import { keepLaunchRecords } from "../support/launchStore.ts";
import {
  keepLaunchRecord,
  storyALaunchRecord,
} from "../support/storyLaunchRecord.ts";
import {
  git,
  observed,
  storyWorktree,
} from "../support/storyReviewWorktree.ts";

const reviewedRef = `refs/open-dough/reviewed/${queuedIdentity}`;

test("Mark reviewed marks the snapshot shown, which outlives Git's housekeeping, and leaves the worktree's index and status alone", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = storyWorktree(origin);
  keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  const shown = await openStoryReview(page, card);
  const review = reviewRegion(page);
  await expect(
    review.getByRole("list", { name: "7 changed files" }),
  ).toBeVisible();
  await expect(review.locator("time")).toHaveCount(0);

  // The agent writes after the snapshot; nothing refreshes it.
  writeFileSync(path.join(workspace, "after-snapshot.txt"), "later\n");
  const before = observed(workspace);
  await markReviewed(review);

  const mark = keptStoryAMark(dashboard);
  expect(mark).toMatchObject({ tree: shown.tree, baseline: shown.baseline });
  await expect(review).toContainText("This snapshot is marked reviewed,");
  await expect(review.locator("time")).toHaveAttribute(
    "datetime",
    mark?.markedAt ?? "",
  );
  expect(observed(workspace)).toEqual(before);

  git(origin.project, "gc", "--quiet", "--prune=now");
  expect(git(origin.project, "cat-file", "-t", shown.tree)).toBe("tree");
  expect(reviewedRefs(origin.project)).toBe(`${reviewedRef} ${shown.tree}`);
  const marked = git(
    origin.project,
    "ls-tree",
    "-r",
    "--name-only",
    shown.tree,
  );
  expect(marked.split("\n")).toContain("story.txt");
  expect(marked.split("\n")).not.toContain("after-snapshot.txt");
});

test("the review still compares with the mark, saying when it was made, after the dashboard restarts", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = storyWorktree(origin);
  keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  await openStoryReview(page, card);
  const review = reviewRegion(page);
  await markReviewed(review);
  const mark = keptStoryAMark(dashboard);

  const port = Number(new URL(dashboard.baseURL).port);
  await dashboard.close();
  const restarted = await startDashboardServer({
    mode: "preview",
    prebuilt: sharedDashboardBuild,
    machine: origin.machine,
    github: dashboard.github,
    projectFolders: ["open-dough"],
    port,
  });
  try {
    await page.reload();
    const reopened = await openStoryReview(
      page,
      parts(page).backlog.getByRole("article", { name: "Story A" }),
    );
    expect(reopened.mark).toEqual(mark);
    await expect(review).toContainText("Nothing changed since the review.");
    await expectSinceTheReview(review, mark);
  } finally {
    await restarted.close();
  }
});

test("opening, closing, refreshing, and replacing a review marks nothing", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = storyWorktree(origin);
  keepLaunchRecords(dashboard, [
    storyALaunchRecord(workspace),
    storyBLaunchRecord(storyBWorktree(origin.project)),
  ]);
  const cardA = await openBacklog(page, origin);
  const cardB = parts(page).backlog.getByRole("article", { name: "Story B" });
  const review = reviewRegion(page);
  const unmarked = async () => {
    await expect(review.getByRole("list").first()).toBeVisible();
    await expect(review.locator("time")).toHaveCount(0);
    await expect(review).not.toContainText("marked reviewed");
    expect(keptReviewMarks(dashboard)).toBeUndefined();
    expect(reviewedRefs(origin.project)).toBe("");
  };

  await openStoryReview(page, cardA);
  await unmarked();
  await review.getByRole("button", { name: "Close", exact: true }).click();
  await expect(review).toHaveCount(0);
  await openStoryReview(page, cardA);
  await unmarked();
  await review.getByRole("button", { name: "Refresh" }).click();
  await expect(review.getByRole("status").first()).toHaveText(
    /^Review refreshed:/,
  );
  await unmarked();
  await openStoryReview(page, cardB);
  await expect(review.getByRole("heading", { name: "Story B" })).toBeVisible();
  await unmarked();
  await openStoryReview(page, cardA);
  await expect(review.getByRole("heading", { name: "Story A" })).toBeVisible();
  await unmarked();
});

test("marking again replaces the story's one mark and its ref", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = storyWorktree(origin);
  keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  const first = await openStoryReview(page, card);
  const review = reviewRegion(page);
  await markReviewed(review);

  writeFileSync(path.join(workspace, "later.txt"), "later\n");
  const refreshed = nextSnapshot(page);
  await review.getByRole("button", { name: "Refresh" }).click();
  const second = await refreshed;
  expect(second.tree).not.toBe(first.tree);
  // The refreshed review compares with the first mark.
  await expect(
    review.getByRole("list", { name: "1 changed file" }),
  ).toBeVisible();
  await expect(review).toContainText("From the snapshot marked reviewed");

  await markReviewed(review);
  const statement = review.getByText("This snapshot is marked reviewed,");
  await expect(statement).toBeVisible();
  const marks = keptReviewMarks(dashboard);
  expect(Object.keys(marks?.["open-dough"] ?? {})).toEqual([queuedIdentity]);
  const mark = marks?.["open-dough"]?.[queuedIdentity];
  expect(mark).toMatchObject({ tree: second.tree, baseline: second.baseline });
  await expect(statement.locator("time")).toHaveAttribute(
    "datetime",
    mark?.markedAt ?? "",
  );
  expect(reviewedRefs(origin.project)).toBe(`${reviewedRef} ${second.tree}`);
});
