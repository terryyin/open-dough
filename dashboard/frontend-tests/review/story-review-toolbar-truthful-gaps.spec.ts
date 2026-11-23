// Session commits, a selected landed evidence gap and a bare explanation each
// name the toolbar only when the review on screen supplies a comparison.
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import {
  deliveredChangesName,
  sessionBranchRun,
  sessionDeliveryRun,
} from "../../src/sessionReviewComparisons.ts";
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

test("session commits name the toolbar Session commits", async () => {
  const commits = makeMe.aStoryReview
    .sessionCommits()
    .modifying("committed.txt")
    .please();
  const review = await mountReviewChanges(sourceOf(commits), adHocSession);
  await review.expectComparisonNamed("Session commits");
  await review.expectDetailsCollapsed();
  await review.expectFilesToggleNamed("Hide files");
  await review.expectDiffShows("Modified committed.txt", "+commit");
});

test("an empty session comparison has no files toggle", async () => {
  const commits = makeMe.aStoryReview.sessionCommits().please();
  const review = await mountReviewChanges(sourceOf(commits), adHocSession);

  await review.expectComparisonNamed("Session commits");
  await expect
    .element(
      page.getByText("No changes: these session commits leave no difference."),
    )
    .toBeVisible();
  await review.expectNoFilesToggle();
});

test("a selected session delivery gap keeps its comparison and the eye", async () => {
  const explanation =
    "Accepted publication has a recoverable review evidence gap.";
  const gap = makeMe.aStoryReview.landingGap(explanation).please();
  const review = await mountReviewChanges(
    sourceOf({
      ...gap,
      selectedRun: sessionDeliveryRun,
      sessionComparisonKeys: [sessionDeliveryRun, sessionBranchRun],
    }),
    adHocSession,
  );
  await review.expectFeedback(explanation);
  await review.expectComparisonNamed(deliveredChangesName);
  await review.expectDetailsCollapsed();
  await review.expectNoFilesToggle();
  await review.revealDetails();
  await review.expectComparisonChosen(deliveredChangesName);
});

test("a bare landing gap names Landed runs without an eye", async () => {
  const explanation = "This session's changes were not captured.";
  const bare = makeMe.aStoryReview.landingGap(explanation).please();
  const review = await mountReviewChanges(sourceOf(bare), adHocSession);
  await review.expectFeedback(explanation);
  await review.expectComparisonNamed("Landed runs");
  await review.expectNoDetails();
});
