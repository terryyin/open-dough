// Intent's Compare choice of all changes can leave a Taken story's
// uncommitted changes out, as Review changes can, and Refresh reads the
// worktree again keeping that choice. The case's snapshot answers own the Git
// judgment.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { StoryReview } from "../../src/storyReviewContract.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";
import { openStoryAComparison } from "./intent-story-compare-stories.ts";

const [first, second, third, fourth] = [
  makeMe.aReviewCommit.numbered(1, "first change").please(),
  makeMe.aReviewCommit.numbered(2, "second change").please(),
  makeMe.aReviewCommit.numbered(3, "third change").please(),
  makeMe.aReviewCommit.numbered(4, "landing committed").please(),
];
const modified = "Modified dashboard/tests/a.spec.ts";
const newFile = "Added dashboard/tests/c.spec.ts";
const landingEdit = "Modified dashboard/tests/landing.spec.ts";

// The story's committed changes: a.spec.ts, and c.spec.ts once added.
const committedChanges = (withNewFile: boolean) => {
  const changes = makeMe.aStoryReview.modifying("dashboard/tests/a.spec.ts");
  return withNewFile ? changes.adding("dashboard/tests/c.spec.ts") : changes;
};

// A worktree holding `commits`, newest first, their committed changes, and an
// uncommitted edit to landing.spec.ts.
const worktree = (
  commits: readonly (typeof first)[],
  withNewFile: boolean,
): StoryReview =>
  committedChanges(withNewFile)
    .modifying("dashboard/tests/landing.spec.ts")
    .onCommits(...commits)
    .committedAs(committedChanges(withNewFile))
    .please();

test("clearing Include uncommitted changes leaves out landing.spec.ts, and Refresh shows a new commit with the check still cleared", async () => {
  let snapshot = worktree([second, first], false);
  await openStoryAComparison({
    review: () => Promise.resolve(snapshot),
    range: () => Promise.resolve(committedChanges(true).pleaseRange()),
    fileDiff: () =>
      Promise.resolve(
        makeMe.aReviewedFileDiff
          .adding("dashboard/tests/a.spec.ts", "change")
          .please(),
      ),
  });
  const story = intentStoryCompare();
  await story.chooseTab("Changes");

  // All changes offers the check, on, with landing.spec.ts listed.
  await expect.element(story.includeUncommitted).toBeChecked();
  await expect.element(story.file(landingEdit)).toBeVisible();
  await expect.poll(story.revisions).toContain("uncommitted changes included");

  // Clearing the check removes landing.spec.ts and the header's uncommitted
  // words.
  await story.includeUncommitted.click();
  await expect.element(story.file(landingEdit)).not.toBeInTheDocument();
  await expect.element(story.file(modified)).toBeVisible();
  await expect.poll(story.revisions).not.toContain("uncommitted");

  // The check shows only with All changes.
  await story.choose("Commits");
  await expect.element(story.includeUncommitted).not.toBeInTheDocument();
  await story.choose("All changes");
  await expect.element(story.includeUncommitted).not.toBeChecked();

  // Refresh reads a worktree with a new commit: its file shows and the check
  // stays cleared.
  snapshot = worktree([third, second, first], true);
  await story.refresh();
  await expect.element(story.file(newFile)).toBeVisible();
  await expect.element(story.includeUncommitted).not.toBeChecked();
  await expect.element(story.file(landingEdit)).not.toBeInTheDocument();

  // Commits lists the new commit.
  await story.choose("Commits");
  await expect.element(story.commit("third change")).toBeVisible();
  await story.choose("All changes");

  // Refresh reads a worktree whose changes are all committed: all changes
  // lists the committed landing.spec.ts and offers no check.
  snapshot = committedChanges(true)
    .modifying("dashboard/tests/landing.spec.ts")
    .onCommits(fourth, third, second, first)
    .please();
  await story.refresh();
  await expect.element(story.file(landingEdit)).toBeVisible();
  await expect.element(story.choice("All changes")).toBeChecked();
  await expect.element(story.includeUncommitted).not.toBeInTheDocument();
});
