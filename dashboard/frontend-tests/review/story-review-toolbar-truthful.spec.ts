// The toolbar names only a comparison the review can show, and offers the eye
// only when details hold something — including while a held Refresh keeps a
// prior answer, and not before the first answer or after a cleared failure.
import { test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { ReviewRead } from "../../src/reviewSource.ts";
import type {
  ReviewedFileDiff,
  StoryReview,
} from "../../src/storyReviewContract.ts";
import {
  adHocSession,
  mountReviewChanges,
  reviewSourceAnswering,
} from "./story-review-panel-page.ts";

// A source whose review read is `review`, answering every file with `diff`.
function sourceOf(review: ReviewRead<StoryReview>, diff: ReviewedFileDiff) {
  return reviewSourceAnswering({
    review,
    fileDiff: () => Promise.resolve(diff),
  });
}

// A review read that waits until the case answers it.
function heldRead() {
  let answer: (review: StoryReview) => void = () => undefined;
  return {
    read: () =>
      new Promise<StoryReview>((resolve) => {
        answer = resolve;
      }),
    answer: (review: StoryReview) => {
      answer(review);
    },
  };
}

test("a Done session holds progress with no name or eye until its published changes arrive", async () => {
  const commits = makeMe.aStoryReview
    .publishedSession()
    .adding("done.txt")
    .please();
  const held = heldRead();
  const source = sourceOf(
    held.read,
    makeMe.aReviewedFileDiff.adding("done.txt", "done").please(),
  );
  const review = await mountReviewChanges(source, adHocSession);
  await review.expectPending();
  held.answer(commits);
  await review.expectComparisonNamed("Published changes");
  await review.expectEyeBesideComparison();
  await review.expectDiffShows("Added done.txt", "+done");
});

test("an ad hoc landing holds the same pending toolbar, then names Landed runs", async () => {
  const landed = makeMe.aStoryReview
    .landed()
    .modifying("delivered.txt")
    .please();
  const held = heldRead();
  const source = sourceOf(
    held.read,
    makeMe.aReviewedFileDiff.adding("delivered.txt", "after").please(),
  );
  const review = await mountReviewChanges(source, adHocSession);
  await review.expectPending();
  held.answer(landed);
  await review.expectComparisonNamed("Landed runs");
  await review.expectDetailsCollapsed();
  await review.expectDiffShows("Modified delivered.txt", "after");
});

test("a refused first read keeps the problem and Refresh; retry reveals the answer", async () => {
  const commits = makeMe.aStoryReview
    .publishedSession()
    .adding("retry.txt")
    .please();
  let refuse = true;
  const source = sourceOf(() => {
    if (!refuse) return Promise.resolve(commits);
    refuse = false;
    return Promise.reject(new Error("refused for proof"));
  }, makeMe.aReviewedFileDiff.adding("retry.txt", "retry").please());
  const review = await mountReviewChanges(source, adHocSession);
  await review.expectRefused();
  await review.expectFeedbackSays("refused for proof");
  await review.refresh();
  await review.expectComparisonNamed("Published changes");
  await review.expectEyeBesideComparison();
  await review.expectDiffShows("Added retry.txt", "+retry");
  await review.expectNoProblem("refused for proof");
});

test("Refresh of a readable comparison keeps its name, eye and diff while progress shows", async () => {
  const commits = makeMe.aStoryReview
    .publishedSession()
    .adding("keep.txt")
    .please();
  let read: () => Promise<StoryReview> = () => Promise.resolve(commits);
  const source = sourceOf(
    () => read(),
    makeMe.aReviewedFileDiff.adding("keep.txt", "keep").please(),
  );
  const review = await mountReviewChanges(source, adHocSession);
  await review.expectComparisonNamed("Published changes");
  await review.expectDetailsCollapsed();
  await review.expectDiffShows("Added keep.txt", "+keep");
  const held = heldRead();
  read = held.read;
  await review.refresh();
  await review.expectFeedbackSays("Refreshing the review…");
  await review.expectComparisonNamed("Published changes");
  await review.expectDetailsCollapsed();
  await review.expectDiffShows("Added keep.txt", "+keep");
  held.answer(commits);
  await review.expectFeedbackSays("Review refreshed");
  read = () => Promise.reject(new Error("unreadable"));
  await review.refresh();
  await review.expectRefused();
});

test("the files toggle stays independent of whether details are offered", async () => {
  const source = sourceOf(
    () =>
      Promise.resolve(
        makeMe.aStoryReview.publishedSession().adding("toggle.txt").please(),
      ),
    makeMe.aReviewedFileDiff.adding("toggle.txt", "toggle").please(),
  );
  const review = await mountReviewChanges(source, adHocSession);
  await review.expectFilesToggleNamed("Hide files");
  await review.expectDetailsCollapsed();
  await review.hideFiles();
  await review.expectFilesToggleNamed("Show files");
  await review.expectDetailsCollapsed();
  await review.showFiles();
  await review.expectFilesToggleNamed("Hide files");
});
