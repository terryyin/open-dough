// A story's review after one of its slices landed on trunk: the landed commit
// is the baseline, so its file drops out and only the story's later commit
// and uncommitted edit remain to review.

import { expect, test } from "./support/preparationPage.ts";
import { openBacklog } from "./support/sessionDialog.ts";
import {
  branch,
  keepLaunchRecord,
  landedWorktree,
} from "./support/storyReviewWorktree.ts";

test("a landed slice leaves the review and the unlanded changes remain", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace, landed } = landedWorktree(origin);
  await keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  await card.getByRole("button", { name: "Review changes" }).click();
  const review = page.getByRole("region", { name: "Review changes" });
  await expect(review.getByRole("definition")).toHaveText([
    "~/git/open-dough/.worktrees/story-a",
    branch,
    `${landed}, where ${branch} meets origin/main`,
  ]);
  const files = review.getByRole("list", { name: "2 changed files" });
  await expect(files.getByRole("listitem")).toHaveText([
    "Modified edited.txt",
    "Added later.txt",
  ]);
  await expect(review).not.toContainText("landed.txt");
});
