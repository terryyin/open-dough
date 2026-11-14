// A story's review after one of its slices landed on trunk: the landed commit
// is the baseline, so its file drops out and only the story's later commit
// and uncommitted edit remain to review.

import { reviewRegion } from "../../dashboard/tests/support/storyReviewMark.ts";
import { reviewChanges } from "../../dashboard/tests/storyCardControls.ts";
import { expect, test } from "../../dashboard/tests/support/preparationPage.ts";
import {
  contextValues,
  contextWords,
} from "../../dashboard/tests/support/reviewContextLine.ts";
import {
  expectTreeRows,
  changedFilesList,
} from "../../dashboard/tests/support/reviewTreeRows.ts";
import { openBacklog } from "../../dashboard/tests/support/sessionDialog.ts";
import {
  branch,
  landedWorktree,
} from "../../dashboard/tests/support/storyReviewWorktree.ts";
import { keepLaunchRecord } from "../../dashboard/tests/support/storyLaunchRecord.ts";

test("a landed slice leaves the review and the unlanded changes remain", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace, landed } = landedWorktree(origin);
  keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  await reviewChanges(card).click();
  const review = reviewRegion(page);
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
