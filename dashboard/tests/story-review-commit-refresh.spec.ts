// Anchored range identities survive new heads and refreshed virtual points;
// vanished endpoints reset permanently to the latest default.
import { expect, test } from "./support/preparationPage.ts";
import { chooseCommit } from "./support/storyReviewCommitChoice.ts";
import { openBacklog } from "./support/sessionDialog.ts";
import { keepLaunchRecord } from "./support/storyLaunchRecord.ts";
import {
  nextSnapshot,
  openReview,
  reviewRegion,
} from "./support/storyReviewMark.ts";
import {
  commitAll,
  git,
  storyWorktree,
  unchangedWorktree,
  writeAt,
} from "./support/storyReviewWorktree.ts";
import { treeRows } from "./support/reviewTreeRows.ts";
import { holdNextReviewResponse } from "./support/holdReviewResponse.ts";
import { storyReviewFileEndpoint } from "../src/storyReview.ts";

test("the first Commits default uses the current snapshot, then new commits and switching keep its anchored ends", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = unchangedWorktree(origin);
  writeAt(workspace, "first.txt", "first\n");
  commitAll(workspace, "first story commit");
  await keepLaunchRecord(dashboard, workspace);
  await openReview(page, await openBacklog(page, origin));
  const review = reviewRegion(page);
  const feedback = review.locator(".story-review-top").getByRole("status");
  writeAt(workspace, "second.txt", "second\n");
  commitAll(workspace, "second story commit");
  let refreshed = nextSnapshot(page);
  await review.getByRole("button", { name: "Refresh", exact: true }).click();
  const second = await refreshed;
  const rows = review
    .getByRole("list", { name: "Story commits", exact: true })
    .getByRole("button");
  await expect(review.locator(".story-review-diff [role=status]")).toBeEmpty();
  const held = await holdNextReviewResponse(
    page,
    dashboard.origin,
    storyReviewFileEndpoint,
  );
  try {
    await review.getByRole("radio", { name: "Commits", exact: true }).check();
    await expect(rows.first()).toHaveAttribute("aria-pressed", "true");
    await expect(rows.first()).toContainText("second story commit");
    await expect(
      review
        .getByRole("list", { name: "1 changed file", exact: true })
        .getByRole("button", { name: "Added second.txt" }),
    ).toBeVisible();
    expect(await (await held.ready).json()).toMatchObject({ kind: "diff" });
    writeAt(workspace, "third.txt", "third\n");
    commitAll(workspace, "third story commit");
    refreshed = nextSnapshot(page);
    await review.getByRole("button", { name: "Refresh", exact: true }).click();
    await refreshed;
    await expect(rows.first()).toHaveAttribute("aria-pressed", "false");
    await expect(rows.nth(1)).toHaveAttribute("aria-pressed", "true");
    await expect(review.getByRole("status")).toHaveCount(2);
    await expect(
      review.locator(".story-review-diff").getByRole("status"),
    ).toHaveText("Reading the file's diff…");
    await expect(feedback).toHaveText(
      "Review refreshed: 1 changed file in the chosen range.",
    );
  } finally {
    held.release();
    await held.delivery;
  }
  await chooseCommit(review, rows.last());
  await expect(
    review.getByRole("heading", { name: "Changes in 2 commits" }),
  ).toBeVisible();
  writeAt(workspace, "fourth.txt", "fourth\n");
  commitAll(workspace, "fourth story commit");
  refreshed = nextSnapshot(page);
  await review.getByRole("button", { name: "Refresh", exact: true }).click();
  await refreshed;
  await expect(feedback).toHaveText(
    "Review refreshed: 2 changed files in the chosen range.",
  );
  await expect(rows.nth(2)).toHaveAttribute("aria-pressed", "true");
  await expect(rows.last()).toHaveAttribute("aria-pressed", "true");
  await review.getByRole("radio", { name: "All changes", exact: true }).check();
  await review.getByRole("radio", { name: "Commits", exact: true }).check();
  await expect(
    review.getByRole("heading", { name: "Changes in 2 commits" }),
  ).toBeVisible();
  // Once both chosen ends reach trunk, the latest item becomes the default.
  git(workspace, "push", "--quiet", "origin", `${second.head}:main`);
  refreshed = nextSnapshot(page);
  await review.getByRole("button", { name: "Refresh", exact: true }).click();
  const landed = await refreshed;
  expect(landed.commits.map(({ subject }) => subject)).toEqual([
    "fourth story commit",
    "third story commit",
  ]);
  await expect(rows.first()).toHaveAttribute("aria-pressed", "true");
  await expect(rows.last()).toHaveAttribute("aria-pressed", "false");
  await expect(review.locator(".story-review-since")).toContainText(
    "fourth story commit to",
  );
  await expect(feedback).toHaveText(
    "Review refreshed: 1 changed file in the chosen range.",
  );
});

test("Refresh updates virtual points, resets a vanished virtual end, and does not resurrect it when uncommitted changes return", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = storyWorktree(origin);
  await keepLaunchRecord(dashboard, workspace);
  const snapshot = await openReview(page, await openBacklog(page, origin));
  const review = reviewRegion(page);
  const feedback = review.locator(".story-review-top").getByRole("status");
  await review.getByRole("radio", { name: "Commits", exact: true }).check();
  const rows = review
    .getByRole("list", { name: "Story commits", exact: true })
    .getByRole("button");
  await expect(
    review.getByRole("list", { name: "3 changed files", exact: true }),
  ).toBeVisible();
  writeAt(workspace, "later.txt", "later virtual point\n");
  await expect(review.locator(".story-review-diff [role=status]")).toBeEmpty();
  const held = await holdNextReviewResponse(
    page,
    dashboard.origin,
    storyReviewFileEndpoint,
  );
  let refreshed = nextSnapshot(page);
  try {
    await review.getByRole("button", { name: "Refresh", exact: true }).click();
    const changed = await refreshed;
    expect(await (await held.ready).json()).toMatchObject({ kind: "diff" });
    expect(changed.uncommitted?.tree).not.toBe(snapshot.uncommitted?.tree);
    await expect(rows.first()).toHaveAttribute("aria-pressed", "true");
    await expect
      .poll(() =>
        treeRows(
          review.getByRole("list", { name: "4 changed files", exact: true }),
        ),
      )
      .toEqual([
        "fresh",
        "  new.txt",
        "later.txt",
        "staged.txt",
        "unstaged.txt",
      ]);
    await expect(review.getByRole("status")).toHaveCount(2);
    await expect(
      review.locator(".story-review-diff").getByRole("status"),
    ).toHaveText("Reading the file's diff…");
    await expect(feedback).toHaveText(
      "Review refreshed: 4 changed files in the chosen range.",
    );
  } finally {
    held.release();
    await held.delivery;
  }
  await chooseCommit(review, rows.last());
  await expect(
    review.getByRole("heading", {
      name: "Changes in 4 commits and Uncommitted changes",
    }),
  ).toBeVisible();
  commitAll(workspace, "commit worktree changes");
  refreshed = nextSnapshot(page);
  await review.getByRole("button", { name: "Refresh", exact: true }).click();
  const committed = await refreshed;
  expect(committed.uncommitted).toBeUndefined();
  await expect(rows.first()).toContainText("commit worktree changes");
  await expect(rows.first()).toHaveAttribute("aria-pressed", "true");
  await expect(rows.last()).toHaveAttribute("aria-pressed", "false");
  await expect(
    review.getByRole("heading", { name: "Changes in 1 commit" }),
  ).toBeVisible();
  await expect(feedback).toHaveText(
    "Review refreshed: 4 changed files in the chosen range.",
  );
  writeAt(workspace, "again.txt", "new uncommitted changes\n");
  refreshed = nextSnapshot(page);
  await review.getByRole("button", { name: "Refresh", exact: true }).click();
  expect((await refreshed).uncommitted?.kind).toBe("uncommitted");
  await expect(rows.first()).toHaveText("Uncommitted changes");
  await expect(rows.first()).toHaveAttribute("aria-pressed", "false");
  await expect(rows.nth(1)).toHaveAttribute("aria-pressed", "true");
  await expect(rows.last()).toHaveAttribute("aria-pressed", "false");
  await expect(
    review.getByRole("heading", { name: "Changes in 1 commit" }),
  ).toBeVisible();
  await expect(
    review.getByRole("list", { name: "4 changed files", exact: true }),
  ).not.toContainText("again.txt");
});
