// A Trunk Mode story taken in a terminal keeps no launch record on this
// machine, and its card still offers Review changes: the project's checkout
// lists the linked worktree the real start left (../../dashboard/test-support/support/startOrigin.ts
// `takenInTrunkMode`), authored by the story's agent with the claim at its
// head. The review is the launched story's review of that worktree: its
// unpublished commit and untracked file under All changes, Commits with
// Uncommitted changes above the one commit, and the worktree's branch and
// folder in the context line. Once the agent publishes the commit the head
// equals trunk, and Refresh still lists its file beside the untracked one,
// taken out of trunk as the story's own, while Commits offers Uncommitted
// changes and no commit.

import { reviewChanges } from "../../dashboard/test-support/storyCardControls.ts";
import { existsSync, writeFileSync } from "node:fs";
import { launchStoreFile } from "../../dashboard/test-support/support/launchStore.ts";
import path from "node:path";
import { parts } from "../../dashboard/test-support/dashboardPage.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import { contextWords } from "../../dashboard/test-support/support/reviewContextLine.ts";
import { openBacklog } from "../../dashboard/test-support/support/sessionDialog.ts";
import { openReviewChanges } from "../../dashboard/test-support/reviewChangesPage.ts";
import {
  commitAll,
  git,
} from "../../dashboard/test-support/support/storyReviewWorktree.ts";

test("a Trunk Mode story started outside the dashboard offers its worktree's review without a launch record", async ({
  page,
  dashboard,
  origin,
}) => {
  const { agent, workspace, branch } = await origin.takenInTrunkMode("trunk-a");
  expect(agent).not.toBe("undefined");
  const claim = git(workspace, "rev-parse", "HEAD");
  expect((await origin.originGit("rev-parse", "main")).trim()).toBe(claim);
  writeFileSync(path.join(workspace, "slice.txt"), "slice\n");
  commitAll(workspace, "first slice");
  writeFileSync(path.join(workspace, "notes.md"), "notes\n");
  // This machine kept no launch record for the story.
  expect(existsSync(launchStoreFile(dashboard.home))).toBe(false);

  await openBacklog(page, origin);
  const card = parts(page).taken.getByRole("article", { name: "Story A" });
  await expect(reviewChanges(card)).toBeVisible();
  const review = await openReviewChanges(page, card);
  const opened = review.snapshot;
  const { commits, files } = review;

  await test.step("the review reads the worktree: its unpublished commit, its untracked file, and its branch and folder", async () => {
    expect(opened.baseline).toBe(claim);
    expect(opened.commits.map(({ subject }) => subject)).toEqual([
      "first slice",
    ]);
    await review.context.expectWords(
      contextWords({
        branch,
        baseline: claim,
        workspace: "~/git/open-dough/.worktrees/trunk-a",
      }),
    );
    await files.expectRows("2 changed files", ["notes.md", "slice.txt"]);
    await review.comparison.choose("Commits");
    await commits.expectRowCount(2);
    await commits.expectRowText(0, /^Uncommitted changes$/);
    await commits.expectRowText(
      1,
      `${opened.commits[0]?.shortRevision} first slice`,
    );
    await review.comparison.choose("All changes");
  });

  await test.step("once the commit is published, Refresh still lists its file as the story's own and Commits offers Uncommitted changes with no commit", async () => {
    git(workspace, "push", "--quiet", "origin", "HEAD:main");
    const published = (await review.refreshAndAnswer()).snapshot;
    expect(published.published).toEqual({
      trunk: published.head,
      commits: 1,
    });
    expect(published.baseline).not.toBe(published.head);
    expect(published.commits).toEqual([]);
    expect(published.uncommitted).toBeDefined();
    await files.expectRows("2 changed files", ["notes.md", "slice.txt"]);
    await review.comparison.choose("Commits");
    await commits.expectRows(["Uncommitted changes"]);
    await review.comparison.choose("All changes");
  });
});
