// A range read owns the chosen points; delivering an earlier real answer
// after a newer range has settled cannot change its heading, files or diff.
import {
  changedFilesList,
  listedFile,
} from "../../dashboard/test-support/support/reviewTreeRows.ts";
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
import { openStoryReview } from "../../dashboard/test-support/support/reviewRead.ts";
import {
  reviewRegion,
  comparisonChoice,
} from "../../dashboard/test-support/support/reviewControls.ts";
import { storyWorktree } from "../../dashboard/test-support/support/storyReviewWorktree.ts";
import { holdNextReviewResponse } from "../../dashboard/test-support/support/holdReviewResponse.ts";

test("an earlier pending range cannot answer the later chosen range", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = storyWorktree(origin);
  keepLaunchRecord(dashboard, workspace);
  await openStoryReview(page, await openBacklog(page, origin));
  const review = reviewRegion(page);
  const held = await holdNextReviewResponse(
    page,
    dashboard.origin,
    storyReviewRangeEndpoint,
  );
  try {
    await comparisonChoice(review, "Commits", { exact: true }).check();
    const response = await held.ready;
    expect(await response.json()).toMatchObject({
      kind: "comparison",
      files: [
        { kind: "added", path: "fresh/new.txt" },
        { kind: "modified", path: "staged.txt" },
        { kind: "modified", path: "unstaged.txt" },
      ],
    });
    const rows = review
      .getByRole("list", { name: "Story commits", exact: true })
      .getByRole("button");
    await rows.nth(3).click();
    await chooseCommit(review, rows.nth(3));
    const heading = review.getByRole("heading", {
      name: "Changes in 1 commit",
    });
    const files = changedFilesList(review, "1 changed file", { exact: true });
    await expect(heading).toBeVisible();
    await expect(commitRangeHeading(review)).toContainText("story file to");
    await listedFile(files, "Added story.txt", { exact: true }).click();
    await expect(review.locator(".story-review-added")).toHaveText(["+story"]);
    held.release();
    await held.delivery;
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              resolve();
            });
          });
        }),
    );
    await expect(heading).toBeVisible();
    await expect(commitRangeHeading(review)).toContainText("story file to");
    await expect(
      listedFile(files, "Added story.txt", { exact: true }),
    ).toBeVisible();
    await expect(review.locator(".story-review-added")).toHaveText(["+story"]);
    await expect(review).not.toContainText(
      "The chosen commits changed nothing.",
    );
  } finally {
    held.release();
    await held.delivery;
  }
});
