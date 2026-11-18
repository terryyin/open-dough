// A contiguous range uses its oldest parent and newest tree, while trunk
// the comparison restates the starting tree across trunk integrations.
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import {
  commitRangeHeading,
  chooseCommit,
} from "../../dashboard/test-support/support/storyReviewCommitChoice.ts";
import { openBacklog } from "../../dashboard/test-support/support/sessionDialog.ts";
import { keepLaunchRecord } from "../../dashboard/test-support/support/storyLaunchRecord.ts";
import { openStoryReview } from "../../dashboard/test-support/support/reviewRead.ts";
import {
  reviewRegion,
  comparisonChoice,
} from "../../dashboard/test-support/support/reviewControls.ts";
import { olderGit } from "../../dashboard/test-support/support/storyReviewOlderGit.ts";
import { storyARepository } from "../../dashboard/test-support/support/storyAReviewRepository.ts";
import {
  observed,
  storyWorktree,
} from "../../dashboard/test-support/support/storyReviewWorktree.ts";
import {
  expectTreeRows,
  changedFilesList,
  listedFile,
} from "../../dashboard/test-support/support/reviewTreeRows.ts";

// Both test objects here start from Story A's declared history.
test.use({ originRepository: storyARepository });

test("two ends select three commits in either direction, reset to one, and survive switching comparisons", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = storyWorktree(origin);
  const before = observed(workspace);
  keepLaunchRecord(dashboard, workspace);
  const snapshot = await openStoryReview(page, await openBacklog(page, origin));
  const review = reviewRegion(page);
  await comparisonChoice(review, "Commits", { exact: true }).check();
  const rows = review
    .getByRole("list", { name: "Story commits", exact: true })
    .getByRole("button");
  await chooseCommit(review, rows.last());
  await chooseCommit(review, rows.last());
  await rows.nth(2).press("Enter");
  await expect(
    review.getByRole("heading", { name: "Changes in 3 commits" }),
  ).toBeVisible();
  await expect(commitRangeHeading(review)).toContainText(
    `From ${snapshot.commits[3]?.shortRevision} rename with a small edit to ${snapshot.commits[1]?.shortRevision} delete a file and redraw the image.`,
  );
  for (const at of [2, 3, 4]) {
    await expect(rows.nth(at)).toHaveAttribute("aria-pressed", "true");
  }
  await expect(rows.first()).toHaveAttribute("aria-pressed", "false");
  const files = changedFilesList(review, "4 changed files", { exact: true });
  await expectTreeRows(files, [
    "gone.txt",
    "image.png",
    "new.txt",
    "story.txt",
  ]);
  await listedFile(files, "Renamed old.txt → new.txt", { exact: true }).click();
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
  await expectTreeRows(files, [
    "gone.txt",
    "image.png",
    "new.txt",
    "story.txt",
  ]);
  await comparisonChoice(review, "All changes", { exact: true }).check();
  await expect(
    review.getByRole("heading", { name: "Changes in 3 commits" }),
  ).toHaveCount(0);
  await comparisonChoice(review, "Commits", { exact: true }).check();
  await expect(
    review.getByRole("heading", { name: "Changes in 3 commits" }),
  ).toBeVisible();
  await expectTreeRows(files, [
    "gone.txt",
    "image.png",
    "new.txt",
    "story.txt",
  ]);
  expect(observed(workspace)).toEqual(before);
});

olderGit(
  "older Git explains a range across integration with no files, while one below it works",
  async ({ page, dashboard, origin }) => {
    const { workspace } = storyWorktree(origin);
    keepLaunchRecord(dashboard, workspace);
    await openStoryReview(page, await openBacklog(page, origin));
    const review = reviewRegion(page);
    await comparisonChoice(review, "Commits", { exact: true }).check();
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
    await expect(changedFilesList(review, /changed file/)).toHaveCount(0);
    await chooseCommit(review, rows.last());
    await chooseCommit(review, rows.nth(2));
    await expect(
      review.getByRole("heading", { name: "Changes in 3 commits" }),
    ).toBeVisible();
    const files = changedFilesList(review, "4 changed files", { exact: true });
    await expectTreeRows(files, [
      "gone.txt",
      "image.png",
      "new.txt",
      "story.txt",
    ]);
    await expect(
      review.locator(".story-review-top").getByRole("status"),
    ).not.toContainText("cannot be compared");
  },
);
