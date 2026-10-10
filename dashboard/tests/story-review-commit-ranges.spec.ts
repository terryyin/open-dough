// A contiguous range uses its oldest parent and newest tree, while trunk
// integrations are restated by the same comparison as Since the review.
import { expect, test } from "./support/preparationPage.ts";
import { chooseCommit } from "./support/storyReviewCommitChoice.ts";
import { openBacklog } from "./support/sessionDialog.ts";
import { keepLaunchRecord } from "./support/storyLaunchRecord.ts";
import { openReview, reviewRegion } from "./support/storyReviewMark.ts";
import { olderGit } from "./support/storyReviewOlderGit.ts";
import { observed, storyWorktree } from "./support/storyReviewWorktree.ts";
import { treeRows } from "./support/reviewTreeRows.ts";

test("two ends select three commits in either direction, reset to one, and survive switching comparisons", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = storyWorktree(origin);
  const before = observed(workspace);
  await keepLaunchRecord(dashboard, workspace);
  const snapshot = await openReview(page, await openBacklog(page, origin));
  const review = reviewRegion(page);
  await review.getByRole("radio", { name: "Commits", exact: true }).check();
  const rows = review
    .getByRole("list", { name: "Story commits", exact: true })
    .getByRole("button");
  await chooseCommit(review, rows.last());
  await chooseCommit(review, rows.last());
  await rows.nth(2).press("Enter");
  await expect(
    review.getByRole("heading", { name: "Changes in 3 commits" }),
  ).toBeVisible();
  await expect(review.locator(".story-review-since")).toContainText(
    `From ${snapshot.commits[3]?.shortRevision} rename with a small edit to ${snapshot.commits[1]?.shortRevision} delete a file and redraw the image.`,
  );
  for (const at of [2, 3, 4]) {
    await expect(rows.nth(at)).toHaveAttribute("aria-pressed", "true");
  }
  await expect(rows.first()).toHaveAttribute("aria-pressed", "false");
  const files = review.getByRole("list", {
    name: "4 changed files",
    exact: true,
  });
  await expect
    .poll(() => treeRows(files))
    .toEqual(["gone.txt", "image.png", "new.txt", "story.txt"]);
  await files
    .getByRole("button", { name: "Renamed old.txt → new.txt", exact: true })
    .click();
  await expect(review.locator(".story-review-added")).toHaveText(["+renamed"]);
  await expect(review).not.toContainText(
    "Trunk was integrated within the range",
  );

  // Starting from the newer end selects the same three commits.
  await chooseCommit(review, rows.nth(2));
  await expect(
    review.getByRole("heading", { name: "Changes in 1 commit" }),
  ).toBeVisible();
  await expect(rows.nth(3)).toHaveAttribute("aria-pressed", "false");
  await chooseCommit(review, rows.last());
  await expect(
    review.getByRole("heading", { name: "Changes in 3 commits" }),
  ).toBeVisible();
  await expect
    .poll(() => treeRows(files))
    .toEqual(["gone.txt", "image.png", "new.txt", "story.txt"]);
  await review.getByRole("radio", { name: "All changes", exact: true }).check();
  await expect(
    review.getByRole("heading", { name: "Changes in 3 commits" }),
  ).toHaveCount(0);
  await review.getByRole("radio", { name: "Commits", exact: true }).check();
  await expect(
    review.getByRole("heading", { name: "Changes in 3 commits" }),
  ).toBeVisible();
  await expect
    .poll(() => treeRows(files))
    .toEqual(["gone.txt", "image.png", "new.txt", "story.txt"]);
  expect(observed(workspace)).toEqual(before);
});

olderGit(
  "older Git explains a range across integration with no files, while one below it works",
  async ({ page, dashboard, origin }) => {
    const { workspace } = storyWorktree(origin);
    await keepLaunchRecord(dashboard, workspace);
    await openReview(page, await openBacklog(page, origin));
    const review = reviewRegion(page);
    await review.getByRole("radio", { name: "Commits", exact: true }).check();
    const rows = review
      .getByRole("list", { name: "Story commits", exact: true })
      .getByRole("button");
    await chooseCommit(review, rows.nth(1));
    await chooseCommit(review, rows.nth(1));
    await chooseCommit(review, rows.last());
    await expect(
      review.getByRole("heading", { name: "Changes in 4 commits" }),
    ).toBeVisible();
    await expect(review.getByRole("status")).toContainText(
      "This machine's Git cannot leave out trunk's changes integrated within the chosen commits, so this range cannot be compared across them.",
    );
    await expect(
      review.getByRole("list", { name: /changed file/ }),
    ).toHaveCount(0);
    await chooseCommit(review, rows.last());
    await chooseCommit(review, rows.nth(2));
    await expect(
      review.getByRole("heading", { name: "Changes in 3 commits" }),
    ).toBeVisible();
    const files = review.getByRole("list", {
      name: "4 changed files",
      exact: true,
    });
    await expect
      .poll(() => treeRows(files))
      .toEqual(["gone.txt", "image.png", "new.txt", "story.txt"]);
    await expect(
      review.locator(".story-review-top").getByRole("status"),
    ).not.toContainText("cannot be compared");
  },
);
