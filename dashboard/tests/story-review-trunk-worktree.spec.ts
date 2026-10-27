// A Trunk Mode story taken in a terminal keeps no launch record on this
// machine, and its card still offers Review changes: the project's checkout
// lists the linked worktree the real start left (./support/startOrigin.ts
// `takenInTrunkMode`), authored by the story's agent with the claim at its
// head. The review is the launched story's review of that worktree: its
// unpublished commit and untracked file under All changes, Commits with
// Uncommitted changes above the one commit, and the worktree's branch and
// folder in the context line. Once the agent publishes the commit the head
// equals trunk, and Refresh still lists its file beside the untracked one,
// taken out of trunk as the story's own, while Commits offers Uncommitted
// changes and no commit. Mark reviewed marks that worktree's snapshot, and
// after Refresh a later edit is what Since the review lists.

import { existsSync, writeFileSync } from "node:fs";
import path from "node:path";
import { storyReviewMarkEndpoint } from "../src/storyReviewContract.ts";
import { parts } from "./dashboardPage.ts";
import { expect, test } from "./support/preparationPage.ts";
import { contextValues, contextWords } from "./support/reviewContextLine.ts";
import { treeRows } from "./support/reviewTreeRows.ts";
import { openBacklog } from "./support/sessionDialog.ts";
import {
  comparison,
  expectSinceTheReview,
  keptStoryAMark,
  markReviewed,
  nextSnapshot,
  openStoryReview,
  reviewRegion,
} from "./support/storyReviewMark.ts";
import { commitAll, git } from "./support/storyReviewWorktree.ts";

test("a Trunk Mode story started outside the dashboard offers its worktree's review without a launch record", async ({
  page,
  dashboard,
  origin,
}) => {
  test.setTimeout(120_000);
  const { agent, workspace, branch } = await origin.takenInTrunkMode("trunk-a");
  expect(agent).not.toBe("undefined");
  const claim = git(workspace, "rev-parse", "HEAD");
  expect((await origin.originGit("rev-parse", "main")).trim()).toBe(claim);
  writeFileSync(path.join(workspace, "slice.txt"), "slice\n");
  commitAll(workspace, "first slice");
  writeFileSync(path.join(workspace, "notes.md"), "notes\n");
  // This machine kept no launch record for the story.
  expect(
    existsSync(
      path.join(dashboard.home, ".open-dough/dashboard/agent-launches.json"),
    ),
  ).toBe(false);

  await openBacklog(page, origin);
  const card = parts(page).taken.getByRole("article", { name: "Story A" });
  await expect(
    card.getByRole("button", { name: "Review changes" }),
  ).toBeVisible();
  const opened = await openStoryReview(page, card);
  const review = reviewRegion(page);
  const commits = review
    .getByRole("list", { name: "Story commits", exact: true })
    .getByRole("button");

  await test.step("the review reads the worktree: its unpublished commit, its untracked file, and its branch and folder", async () => {
    expect(opened.baseline).toBe(claim);
    expect(opened.commits.map(({ subject }) => subject)).toEqual([
      "first slice",
    ]);
    await expect(contextValues(review)).toHaveAccessibleName(
      contextWords({
        branch,
        baseline: claim,
        workspace: "~/git/open-dough/.worktrees/trunk-a",
      }),
    );
    await expect
      .poll(() =>
        treeRows(review.getByRole("list", { name: "2 changed files" })),
      )
      .toEqual(["notes.md", "slice.txt"]);
    await review.getByRole("radio", { name: "Commits", exact: true }).check();
    await expect(commits).toHaveCount(2);
    await expect(commits.first()).toHaveText("Uncommitted changes");
    await expect(commits.nth(1)).toContainText(
      `${opened.commits[0]?.shortRevision} first slice`,
    );
    await review
      .getByRole("radio", { name: "All changes", exact: true })
      .check();
  });

  await test.step("once the commit is published, Refresh still lists its file as the story's own and Commits offers Uncommitted changes with no commit", async () => {
    git(workspace, "push", "--quiet", "origin", "HEAD:main");
    const refreshed = nextSnapshot(page);
    await review.getByRole("button", { name: "Refresh" }).click();
    const published = await refreshed;
    expect(published.published).toEqual({
      trunk: published.head,
      commits: 1,
    });
    expect(published.baseline).not.toBe(published.head);
    expect(published.commits).toEqual([]);
    expect(published.uncommitted).toBeDefined();
    await expect
      .poll(() =>
        treeRows(review.getByRole("list", { name: "2 changed files" })),
      )
      .toEqual(["notes.md", "slice.txt"]);
    await review.getByRole("radio", { name: "Commits", exact: true }).check();
    await expect(commits).toHaveText(["Uncommitted changes"]);
    await review
      .getByRole("radio", { name: "All changes", exact: true })
      .check();
  });

  await test.step("Mark reviewed marks the worktree's snapshot, and after Refresh a later edit is what Since the review lists", async () => {
    const marked = page.waitForResponse(
      (answered) =>
        new URL(answered.url()).pathname === storyReviewMarkEndpoint,
    );
    await markReviewed(review);
    expect((await marked).status()).toBe(200);
    writeFileSync(path.join(workspace, "a.ts"), "export const a = 1;\n");
    const refreshed = nextSnapshot(page);
    await review.getByRole("button", { name: "Refresh" }).click();
    const since = await refreshed;
    expect(since.since?.files.map((file) => file.path)).toEqual(["a.ts"]);
    await comparison(review)
      .getByRole("radio", { name: "Since the review" })
      .check();
    await expectSinceTheReview(review, keptStoryAMark(dashboard));
    await expect
      .poll(() =>
        treeRows(review.getByRole("list", { name: "1 changed file" })),
      )
      .toEqual(["a.ts"]);
  });
});
