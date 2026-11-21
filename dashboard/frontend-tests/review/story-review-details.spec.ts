// Review changes opens on the diff: the comparison choices, the context of
// the comparison shown and the uncommitted check wait behind the toolbar's
// eye, while the reading place and Commits' own work stay in view.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { ReviewedWorkSubject } from "../../src/reviewedWorkSubject.ts";
import {
  doneStory,
  mountReviewChanges,
  reviewSourceAnswering,
} from "./story-review-panel-page.ts";

const threeFiles = makeMe.aStoryReview
  .adding("first.txt")
  .adding("second.txt")
  .adding("third.txt");
// A workspace snapshot whose committed part can be told from its
// uncommitted changes, so the uncommitted check is offered.
const workspace = threeFiles.committedAs(threeFiles).please();
const linesOf: Record<string, string[]> = {
  "first.txt": ["alpha"],
  "second.txt": Array.from({ length: 300 }, (...[, at]) => `second ${at}`),
  "third.txt": ["gamma"],
};
const workspaceSource = reviewSourceAnswering({
  review: () => Promise.resolve(workspace),
  range: () => Promise.resolve(threeFiles.pleaseRange()),
  fileDiff: ({ path = "" }) =>
    Promise.resolve(
      makeMe.aReviewedFileDiff.adding(path, ...(linesOf[path] ?? [])).please(),
    ),
});
const otherStory: ReviewedWorkSubject = {
  ...doneStory,
  identity: "SEED-2#other-story",
};
const [first, second, third] = [
  "Added first.txt",
  "Added second.txt",
  "Added third.txt",
];

test("a workspace review opens on the diff and keeps its place while the eye reveals and hides its details", async () => {
  const review = await mountReviewChanges(workspaceSource, doneStory);
  // Compact opening: toggle, name, eye; files and the first diff readable.
  await review.expectListed("3 changed files");
  await review.expectDiffShows(first, "+alpha");
  await review.expectDetailsCollapsed();
  await review.expectFilesToggleLeads("All changes");
  await review.expectEyeBesideComparison();

  // The second file, its diff scrolled.
  await review.chooseFile(second);
  await review.expectDiffShows(second, "+second 0");
  const readingAt = review.scrollCodeTo(second, 120);
  expect(readingAt).toBeGreaterThan(0);

  await review.revealDetails();
  await review.expectEyeBesideComparison("Hide review details");
  await review.expectComparisonChosen("All changes");
  await review.expectDetailsSay("claude/taken");
  await review.expectUncommittedIncluded(true);
  await review.expectSelected(second);
  expect(review.codeScrollTop(second)).toBe(readingAt);

  await review.hideDetails();
  await review.expectComparisonNamed("All changes");
  await review.expectSelected(second);
  expect(review.codeScrollTop(second)).toBe(readingAt);

  // The sidebar toggle works with the details revealed too.
  await review.revealDetails();
  await review.hideFiles();
  await review.expectFilesShown(false);
  await review.expectDetailsRevealed();
  await review.showFiles();
  await review.expectSelected(second);

  // Leaving uncommitted changes out keeps the details revealed.
  await review.includeUncommitted(false);
  await review.expectUncommittedIncluded(false);
  await review.expectDetailsRevealed();
});

test("choosing Commits in the details renames the toolbar, and the range and commit list stay when the details hide", async () => {
  const review = await mountReviewChanges(workspaceSource, doneStory);
  await review.revealDetails();
  await review.chooseComparison("Commits");
  await review.expectComparisonNamed("Commits");
  await review.expectComparisonChosen("Commits");
  await review.expectDetailsRevealed();
  await review.expectCommitsAndRangeShown();

  // The revealed state lasts across Refresh.
  await review.refresh();
  await review.expectFeedbackSays("Review refreshed");
  await review.expectDetailsRevealed();
  await review.expectComparisonNamed("Commits");

  await review.escapeFromComparison("Commits");
  await review.expectCommitsAndRangeShown();
  await review.expectComparisonNamed("Commits");
});

test("another story's review opens collapsed with the files shown, whatever the last one left", async () => {
  const review = await mountReviewChanges(workspaceSource, doneStory);
  // Details collapsed, third file selected: the sidebar toggle works.
  await review.chooseFile(third);
  await review.expectSelected(third);
  await review.expectDetailsCollapsed();
  await review.hideFiles();
  await review.expectFilesShown(false);
  await review.expectDiffShows(third, "+gamma");
  await review.showFiles();
  await review.expectSelected(third);

  // Left with the details revealed and the files hidden.
  await review.revealDetails();
  await review.hideFiles();
  await review.expectFilesShown(false);

  const next = review.openAnother(otherStory);
  await next.expectListed("3 changed files");
  await next.expectDetailsCollapsed();
  await next.expectFilesShown(true);
  await next.expectFilesToggleNamed("Hide files");
  await next.expectDiffShows(first, "+alpha");
});
