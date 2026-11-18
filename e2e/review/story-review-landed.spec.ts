// A story's review after one of its slices landed on trunk: the landed commit
// is the baseline, so its file drops out and only the story's later commit
// and uncommitted edit remain to review.

import {
  reviewRegion,
  showReviewDetails,
} from "../../dashboard/test-support/support/reviewControls.ts";
import { reviewChanges } from "../../dashboard/test-support/storyCardControls.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import {
  contextValues,
  contextWords,
} from "../../dashboard/test-support/support/reviewContextLine.ts";
import {
  expectTreeRows,
  changedFilesList,
} from "../../dashboard/test-support/support/reviewTreeRows.ts";
import { openBacklog } from "../../dashboard/test-support/support/sessionDialog.ts";
import {
  branch,
  landedWorktree,
} from "../../dashboard/test-support/support/storyReviewWorktree.ts";
import { keepLaunchRecord } from "../../dashboard/test-support/support/storyLaunchRecord.ts";

test("a landed slice leaves the review and the unlanded changes remain", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace, landed } = landedWorktree(origin);
  keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  await reviewChanges(card).click();
  const review = await showReviewDetails(reviewRegion(page));
  const files = changedFilesList(review, "2 changed files");
  await expectTreeRows(files, ["edited.txt", "later.txt"]);
  await expect(contextValues(review)).toHaveAccessibleName(
    contextWords({
      branch,
      baseline: landed,
      workspace: "~/git/open-dough/.worktrees/story-a",
    }),
  );
  await expect(review).not.toContainText("landed.txt");
});
