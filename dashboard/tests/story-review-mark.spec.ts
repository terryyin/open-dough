// Mark reviewed marks the snapshot a story's review shows, of Story A's
// worktree (./support/storyReviewWorktree.ts): the review then says the
// snapshot is marked and when. What the worktree gained after the snapshot
// stays unmarked, the marked tree survives Git's housekeeping through its
// ref, and the worktree's index and status stay as they were. The mark
// outlives a dashboard restart. Opening, closing, refreshing, or replacing a
// review marks nothing; marking again replaces the story's one mark and its
// ref. A mark request naming a path, a malformed object, or an object the
// repository lacks keeps no mark.

import { writeFileSync } from "node:fs";
import path from "node:path";
import { storyReviewMarkEndpoint } from "../src/storyReview.ts";
import { parts } from "./dashboardPage.ts";
import {
  builtDashboardDir,
  startDashboardServer,
} from "./support/dashboardServer.ts";
import { expect, test } from "./support/preparationPage.ts";
import { openBacklog } from "./support/sessionDialog.ts";
import { queuedIdentity } from "./support/startOrigin.ts";
import { storyBLaunchRecord, storyBWorktree } from "./support/storyPanels.ts";
import {
  keptReviewMarks,
  markReviewed,
  nextSnapshot,
  openReview,
  reviewedRefs,
  reviewRegion,
} from "./support/storyReviewMark.ts";
import {
  git,
  keepLaunchRecord,
  keepLaunchRecords,
  observed,
  storyALaunchRecord,
  storyWorktree,
} from "./support/storyReviewWorktree.ts";

const reviewedRef = `refs/open-dough/reviewed/${queuedIdentity}`;

test("Mark reviewed marks the snapshot shown, which outlives Git's housekeeping, and leaves the worktree's index and status alone", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = storyWorktree(origin);
  await keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  const shown = await openReview(page, card);
  const review = reviewRegion(page);
  await expect(
    review.getByRole("list", { name: "7 changed files" }),
  ).toBeVisible();
  await expect(review.locator("time")).toHaveCount(0);

  // The agent writes after the snapshot; nothing refreshes it.
  writeFileSync(path.join(workspace, "after-snapshot.txt"), "later\n");
  const before = observed(workspace);
  await markReviewed(review);

  const mark = keptReviewMarks(dashboard)?.["open-dough"]?.[queuedIdentity];
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

test("the review still says when it was marked after the dashboard restarts", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = storyWorktree(origin);
  await keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  await openReview(page, card);
  const review = reviewRegion(page);
  await markReviewed(review);
  const mark = keptReviewMarks(dashboard)?.["open-dough"]?.[queuedIdentity];

  const port = Number(new URL(dashboard.baseURL).port);
  await dashboard.close();
  const restarted = await startDashboardServer({
    mode: "preview",
    prebuilt: builtDashboardDir,
    machine: origin.machine,
    github: dashboard.github,
    projectFolders: ["open-dough"],
    port,
  });
  try {
    await page.reload();
    const reopened = await openReview(
      page,
      parts(page).backlog.getByRole("article", { name: "Story A" }),
    );
    expect(reopened.mark).toEqual(mark);
    await expect(review).toContainText("This snapshot is marked reviewed,");
    await expect(review.locator("time")).toHaveAttribute(
      "datetime",
      mark?.markedAt ?? "",
    );
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
  await keepLaunchRecords(dashboard, [
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

  await openReview(page, cardA);
  await unmarked();
  await review.getByRole("button", { name: "Close", exact: true }).click();
  await expect(review).toHaveCount(0);
  await openReview(page, cardA);
  await unmarked();
  await review.getByRole("button", { name: "Refresh" }).click();
  await expect(review.getByRole("status").first()).toHaveText(
    /^Review refreshed:/,
  );
  await unmarked();
  await openReview(page, cardB);
  await expect(review.getByRole("heading", { name: "Story B" })).toBeVisible();
  await unmarked();
  await openReview(page, cardA);
  await expect(review.getByRole("heading", { name: "Story A" })).toBeVisible();
  await unmarked();
});

test("marking again replaces the story's one mark and its ref", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = storyWorktree(origin);
  await keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  const first = await openReview(page, card);
  const review = reviewRegion(page);
  await markReviewed(review);

  writeFileSync(path.join(workspace, "later.txt"), "later\n");
  const refreshed = nextSnapshot(page);
  await review.getByRole("button", { name: "Refresh" }).click();
  const second = await refreshed;
  expect(second.tree).not.toBe(first.tree);
  await expect(
    review.getByRole("list", { name: "8 changed files" }),
  ).toBeVisible();
  await expect(review).toContainText("An earlier snapshot is marked reviewed,");

  await markReviewed(review);
  await expect(review).toContainText("This snapshot is marked reviewed,");
  const marks = keptReviewMarks(dashboard);
  expect(Object.keys(marks?.["open-dough"] ?? {})).toEqual([queuedIdentity]);
  const mark = marks?.["open-dough"]?.[queuedIdentity];
  expect(mark).toMatchObject({ tree: second.tree, baseline: second.baseline });
  await expect(review.locator("time")).toHaveAttribute(
    "datetime",
    mark?.markedAt ?? "",
  );
  expect(reviewedRefs(origin.project)).toBe(`${reviewedRef} ${second.tree}`);
});

test("a mark request naming a path, a malformed object, or an absent tree keeps no mark", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace, merged } = storyWorktree(origin);
  await keepLaunchRecord(dashboard, workspace);
  const tree = git(workspace, "rev-parse", "HEAD^{tree}");
  const named = {
    source: "open-dough",
    identity: queuedIdentity,
    tree,
    baseline: merged,
  };
  const malformed = { error: "The review mark request is malformed." };
  for (const [body, status, answer] of [
    [{ ...named, workspace }, 400, malformed],
    [{ ...named, tree: "HEAD" }, 400, malformed],
    [{ ...named, baseline: `--output=${workspace}` }, 400, malformed],
    [
      { ...named, source: "elsewhere" },
      404,
      { error: "Unknown catalog source." },
    ],
    [
      { ...named, tree: "0".repeat(40) },
      200,
      {
        kind: "unavailable",
        explanation: expect.stringMatching(
          /^The snapshot could not be marked reviewed: /,
        ),
      },
    ],
  ] as const) {
    const response = await page.request.post(
      `${dashboard.baseURL}${storyReviewMarkEndpoint}`,
      { headers: { Origin: dashboard.origin }, data: body },
    );
    expect(response.status(), JSON.stringify(body)).toBe(status);
    expect(await response.json()).toEqual(answer);
  }
  const read = await page.request.get(
    `${dashboard.baseURL}${storyReviewMarkEndpoint}`,
    { headers: { Origin: dashboard.origin } },
  );
  expect(read.status()).toBe(405);
  expect(keptReviewMarks(dashboard)).toBeUndefined();
  expect(reviewedRefs(origin.project)).toBe("");
});
