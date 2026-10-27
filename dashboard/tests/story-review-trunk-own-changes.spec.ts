// A Trunk Mode story's review shows the story's own changes
// (./support/storyReviewTrunkMode.ts): the commits its agent already
// published on trunk are taken out of the baseline, so All changes lists the
// published, unpublished and uncommitted changes together and leaves out
// every other commit on trunk, even one that changed another part of a file
// the story changed. The claim, another agent's commit, an earlier story the
// same agent closed, and a merge she authored stay trunk's. The context line
// names the trunk revision less the story's published commits. Commits stays
// the worktree's own. With nothing published since the claim the review is
// the one every worktree has: the merge-base as baseline.
// ./story-review-trunk-own-flagged.spec.ts covers a file trunk rewrote where
// the story changed it, and the context line's one published commit.

import { expect, test } from "./support/preparationPage.ts";
import {
  contextLine,
  contextValues,
  contextWords,
} from "./support/reviewContextLine.ts";
import { treeRows } from "./support/reviewTreeRows.ts";
import { keepLaunchRecord } from "./support/storyLaunchRecord.ts";
import {
  openStoryReview,
  reopenStoryReview,
  reviewRegion,
  uncommittedCheck,
} from "./support/storyReviewMark.ts";
import {
  commitUnpublished,
  openTaken,
  shownWorkspace,
  trunkModeStory,
} from "./support/storyReviewTrunkMode.ts";
import { branch, git } from "./support/storyReviewWorktree.ts";

test("all changes lists a Trunk Mode story's published changes beside its unpublished ones and leaves trunk's out", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace, trunk } = trunkModeStory(origin, { published: 2 });
  expect(git(workspace, "rev-parse", "HEAD")).toBe(trunk);
  await keepLaunchRecord(dashboard, workspace);
  const card = await openTaken(page, origin);
  const snapshot = await openStoryReview(page, card);
  const review = reviewRegion(page);

  await test.step("the published and uncommitted files are listed, and no other commit's", async () => {
    // Not `src/b.ts`, `prep.md`, `merged.md`, `old.md`, or the claim's files.
    expect(snapshot.files.map(({ path: file }) => file)).toEqual([
      "d.md",
      "notes.md",
      "src/a.ts",
    ]);
    expect(snapshot.published).toEqual({ trunk, commits: 2 });
    expect(snapshot.baseline).not.toBe(trunk);
    const files = review.getByRole("list", { name: "3 changed files" });
    await expect
      .poll(() => treeRows(files))
      .toEqual(["src", "  a.ts", "d.md", "notes.md"]);
    // The file trunk also changed shows the story's line alone.
    await files
      .getByRole("button", { name: "Modified src/a.ts" })
      .press("Enter");
    const diff = review.getByRole("region", { name: "Modified src/a.ts" });
    await expect(diff.locator(".story-review-removed")).toHaveText(["-a 0"]);
    await expect(diff.locator(".story-review-added")).toHaveText(["+a one"]);
  });

  await test.step("the context line names trunk less the story's published commits", async () => {
    const words = contextWords({
      branch,
      baseline: trunk,
      published: 2,
      workspace: shownWorkspace,
    });
    const values = contextValues(review);
    const baseline = contextLine(review).locator(
      ".story-review-context-baseline",
    );
    await expect(values).toHaveAccessibleName(words);
    await expect(baseline.locator("code[aria-hidden]")).toHaveText(
      trunk.slice(0, 7),
    );
    await expect(baseline).toContainText("origin/main less 2 story commits");
    await values.press("Enter");
    await expect(values).toHaveAttribute("aria-expanded", "true");
    await expect(baseline).toHaveText(
      `Baseline ${trunk} where ${branch} meets origin/main, less the story's 2 published commits`,
    );
    await expect(values).toHaveAccessibleName(words);
    await values.press("Enter");
  });

  await test.step("an unpublished commit is listed with the rest, and Commits stays the worktree's", async () => {
    commitUnpublished(workspace);
    const later = await reopenStoryReview(page, card);
    expect(later.published).toEqual({ trunk, commits: 2 });
    expect(later.files.map(({ path: file }) => file)).toEqual([
      "d.md",
      "notes.md",
      "src/a.ts",
      "src/g.ts",
    ]);
    expect(later.commits.map(({ subject }) => subject)).toEqual(["u1"]);
    await expect
      .poll(() =>
        treeRows(review.getByRole("list", { name: "4 changed files" })),
      )
      .toEqual(["src", "  a.ts", "  g.ts", "d.md", "notes.md"]);

    await review.getByRole("radio", { name: "Commits", exact: true }).check();
    const commits = review
      .getByRole("list", { name: "Story commits", exact: true })
      .getByRole("button");
    await expect(commits).toHaveCount(2);
    await expect(commits.first()).toHaveText("Uncommitted changes");
    await expect(commits.nth(1)).toContainText("u1");

    await review
      .getByRole("radio", { name: "All changes", exact: true })
      .check();
    await uncommittedCheck(review).uncheck();
    await expect
      .poll(() =>
        treeRows(review.getByRole("list", { name: "3 changed files" })),
      )
      .toEqual(["src", "  a.ts", "  g.ts", "d.md"]);
  });
});

test("a Trunk Mode story with nothing published since its claim is reviewed against the merge-base", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace, trunk } = trunkModeStory(origin, { published: 0 });
  commitUnpublished(workspace);
  await keepLaunchRecord(dashboard, workspace);
  const card = await openTaken(page, origin);
  const snapshot = await openStoryReview(page, card);
  const review = reviewRegion(page);

  expect(snapshot.published).toBeUndefined();
  expect(snapshot.baseline).toBe(trunk);
  expect(snapshot.baseline).toBe(
    git(workspace, "merge-base", "HEAD", "origin/main"),
  );
  expect(snapshot.files.map(({ path: file }) => file)).toEqual([
    "notes.md",
    "src/g.ts",
  ]);
  await expect(contextValues(review)).toHaveAccessibleName(
    contextWords({ branch, baseline: trunk, workspace: shownWorkspace }),
  );
  await expect(
    contextLine(review).locator(".story-review-context-baseline"),
  ).not.toContainText("less");
});
