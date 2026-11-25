// Published changes, a selected landed evidence gap and a bare explanation each
// name the toolbar only when the review on screen supplies a comparison.
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { StoryReview } from "../../src/storyReviewContract.ts";
import {
  adHocSession,
  mountReviewChanges,
  reviewSourceAnswering,
} from "./story-review-panel-page.ts";

// A source answering `review`, with `committed.txt`'s diff.
const sourceOf = (review: StoryReview) =>
  reviewSourceAnswering({
    review: () => Promise.resolve(review),
    fileDiff: () =>
      Promise.resolve(
        makeMe.aReviewedFileDiff.adding("committed.txt", "commit").please(),
      ),
  });

test("a published session names the toolbar Published changes", async () => {
  const commits = makeMe.aStoryReview
    .publishedSession()
    .modifying("committed.txt")
    .please();
  const review = await mountReviewChanges(sourceOf(commits), adHocSession, {
    viewport: { width: 1024, height: 768 },
  });
  await review.expectComparisonNamed("Published changes");
  await review.expectDetailsCollapsed();
  await review.expectFilesToggleNamed("Hide files");
  await review.expectDiffShows("Modified committed.txt", "+commit");
});

test("an empty session comparison has no files toggle", async () => {
  const commits = makeMe.aStoryReview.publishedSession().please();
  const review = await mountReviewChanges(sourceOf(commits), adHocSession);

  await review.expectComparisonNamed("Published changes");
  await expect
    .element(page.getByText("No changes: this published comparison is empty."))
    .toBeVisible();
  await review.expectNoFilesToggle();
});

test("a bare landing gap names Landed runs without an eye", async () => {
  const explanation = "This session's changes were not captured.";
  const bare = makeMe.aStoryReview.landingGap(explanation).please();
  const review = await mountReviewChanges(sourceOf(bare), adHocSession);
  await review.expectFeedback(explanation);
  await review.expectComparisonNamed("Landed runs");
  await review.expectNoDetails();
});
