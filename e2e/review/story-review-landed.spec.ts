// A story's review after one of its slices landed on trunk: the landed commit
// is the baseline, so its file drops out and only the story's later commit
// and uncommitted edit remain to review.

import { test } from "../../dashboard/test-support/support/preparationPage.ts";
import { contextWords } from "../../dashboard/test-support/support/reviewContextLine.ts";
import { openReviewChanges } from "../../dashboard/test-support/reviewChangesPage.ts";
import { openBacklog } from "../../dashboard/test-support/support/sessionDialog.ts";
import {
  branch,
  landedRepository,
  storyWorktree,
} from "../../dashboard/test-support/support/storyReviewWorktree.ts";
import { keepLaunchRecord } from "../../dashboard/test-support/support/storyLaunchRecord.ts";

test.use({ originRepository: landedRepository });

test("a landed slice leaves the review and the unlanded changes remain", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = storyWorktree(origin);
  keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  const review = await openReviewChanges(page, card);
  await review.files.expectRows("2 changed files", ["edited.txt", "later.txt"]);
  await review.context.expectWords(
    contextWords({
      branch,
      baseline: origin.revision("landed"),
      workspace: "~/git/open-dough/.worktrees/story-a",
    }),
  );
  await review.expectNoText("landed.txt");
});
