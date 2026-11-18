// The virtual newest item accounts for the whole snapshot without pretending
// to be a commit.
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import {
  commitRangeHeading,
  chooseCommit,
} from "../../dashboard/test-support/support/storyReviewCommitChoice.ts";
import { storyReviewRangeEndpoint } from "../../dashboard/src/storyReviewContract.ts";
import { openBacklog } from "../../dashboard/test-support/support/sessionDialog.ts";
import { keepLaunchRecord } from "../../dashboard/test-support/support/storyLaunchRecord.ts";
import {
  reviewRegion,
  comparisonChoice,
} from "../../dashboard/test-support/support/reviewControls.ts";
import {
  observed,
  storyWorktree,
  unchangedWorktree,
  writeAt,
} from "../../dashboard/test-support/support/storyReviewWorktree.ts";
import {
  showCommits,
  openStoryReview,
} from "../../dashboard/test-support/support/reviewRead.ts";
import {
  expectTreeRows,
  changedFilesList,
  listedFile,
} from "../../dashboard/test-support/support/reviewTreeRows.ts";
import { storyARepository } from "../../dashboard/test-support/support/storyAReviewRepository.ts";

test.describe("from Story A's declared history", () => {
  test.use({ originRepository: storyARepository });

  test("Uncommitted changes alone reads staged, unstaged and untracked files; through the oldest commit it equals All changes", async ({
    page,
    dashboard,
    origin,
  }) => {
    const { workspace } = storyWorktree(origin);
    const before = observed(workspace);
    keepLaunchRecord(dashboard, workspace);
    const snapshot = await openStoryReview(
      page,
      await openBacklog(page, origin),
    );
    const review = reviewRegion(page);
    expect(snapshot.uncommitted).toMatchObject({
      kind: "uncommitted",
      tree: snapshot.tree,
      baseline: snapshot.baseline,
    });
    expect(snapshot.uncommitted).not.toHaveProperty("revision");
    expect(snapshot.uncommitted).not.toHaveProperty("committedAt");
    await comparisonChoice(review, "Commits", { exact: true }).check();
    const rows = review
      .getByRole("list", { name: "Story commits", exact: true })
      .getByRole("button");
    await expect(rows.first()).toHaveText("Uncommitted changes");
    await expect(rows.first().locator("time")).toHaveCount(0);
    await expect(rows.first()).toHaveAttribute("aria-pressed", "true");
    await expect(
      review.getByRole("heading", { name: "Uncommitted changes", exact: true }),
    ).toBeVisible();
    const files = changedFilesList(review, "3 changed files", { exact: true });
    await expectTreeRows(files, [
      "fresh",
      "  new.txt",
      "staged.txt",
      "unstaged.txt",
    ]);
    await listedFile(files, "Modified staged.txt", { exact: true }).click();
    await expect(review.locator(".story-review-added")).toHaveText(["+more"]);
    await listedFile(files, "Modified unstaged.txt", { exact: true }).click();
    await expect(review.locator(".story-review-removed")).toHaveText([
      "-unstaged 5",
    ]);
    await listedFile(files, "Added fresh/new.txt", { exact: true }).click();
    await expect(review.locator(".story-review-added")).toHaveText([
      "+untracked",
    ]);
    await expect(files).not.toContainText("ignored.log");
    const rangeRead = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === storyReviewRangeEndpoint,
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
    await expect(commitRangeHeading(review)).toContainText(
      "to Uncommitted changes.",
    );
    await expect(
      changedFilesList(review, "7 changed files", { exact: true }),
    ).toBeVisible();
    expect(observed(workspace)).toEqual(before);
  });
});

test("an uncommitted-only snapshot offers Commits without inventing a commit", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = unchangedWorktree(origin);
  writeAt(workspace, "only.txt", "only uncommitted\n");
  keepLaunchRecord(dashboard, workspace);
  const snapshot = await openStoryReview(page, await openBacklog(page, origin));
  const review = reviewRegion(page);
  expect(snapshot.commits).toEqual([]);
  await showCommits(review);
  await expect(
    review
      .getByRole("list", { name: "Story commits", exact: true })
      .getByRole("button"),
  ).toHaveText("Uncommitted changes");
  await expect(
    changedFilesList(review, "1 changed file", { exact: true }).getByRole(
      "button",
      { name: "Added only.txt" },
    ),
  ).toBeVisible();
  await expect(review.locator(".story-review-added")).toHaveText([
    "+only uncommitted",
  ]);
});
