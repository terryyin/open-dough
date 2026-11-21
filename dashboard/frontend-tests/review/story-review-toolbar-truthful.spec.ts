// The toolbar names only a comparison the review can show, and offers the eye
// only when details hold something — including while a held Refresh keeps a
// prior answer, and not before the first answer or after a cleared failure.
import { test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { ReviewRead, ReviewSource } from "../../src/reviewSource.ts";
import type {
  ReviewedFileDiff,
  StoryReview,
} from "../../src/storyReviewContract.ts";
import {
  adHocSession,
  doneStory,
  mountReviewChanges,
} from "./story-review-panel-page.ts";

// A source whose review read is `review`, answering every file with `diff`.
function sourceOf(
  review: ReviewRead<StoryReview>,
  diff: ReviewedFileDiff,
): ReviewSource {
  return {
    review,
    range: () => new Promise(() => undefined),
    fileDiff: () => Promise.resolve(diff),
    fileText: () => new Promise(() => undefined),
  };
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

test("a Done card holds progress with no name or eye until a published answer arrives", async () => {
  const published = makeMe.aStoryReview.published().adding("done.txt").please();
  const held = heldRead();
  const source = sourceOf(
    held.read,
    makeMe.aReviewedFileDiff.adding("done.txt", "done").please(),
  );
  const review = await mountReviewChanges(source, doneStory, {
    completed: true,
  });
  await review.expectPending();
  held.answer(published);
  await review.expectComparisonNamed("Published completion");
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
  const review = await mountReviewChanges(source, adHocSession, {
    completed: true,
  });
  await review.expectPending();
  held.answer(landed);
  await review.expectComparisonNamed("Landed runs");
  await review.expectDetailsCollapsed();
  await review.expectDiffShows("Modified delivered.txt", "after");
});

test("a refused first read keeps the problem and Refresh; retry reveals the answer", async () => {
  const published = makeMe.aStoryReview
    .published()
    .adding("retry.txt")
    .please();
  let refuse = true;
  const source = sourceOf(() => {
    if (!refuse) return Promise.resolve(published);
    refuse = false;
    return Promise.reject(new Error("refused for proof"));
  }, makeMe.aReviewedFileDiff.adding("retry.txt", "retry").please());
  const review = await mountReviewChanges(source, doneStory, {
    completed: true,
  });
  await review.expectRefused();
  await review.expectFeedbackSays("refused for proof");
  await review.refresh();
  await review.expectComparisonNamed("Published completion");
  await review.expectEyeBesideComparison();
  await review.expectDiffShows("Added retry.txt", "+retry");
  await review.expectNoProblem("refused for proof");
});

test("Refresh of a readable comparison keeps its name, eye and diff while progress shows", async () => {
  const snapshot = makeMe.aStoryReview.adding("keep.txt").please();
  let read: () => Promise<StoryReview> = () => Promise.resolve(snapshot);
  const source = sourceOf(
    () => read(),
    makeMe.aReviewedFileDiff.adding("keep.txt", "keep").please(),
  );
  const review = await mountReviewChanges(source, doneStory);
  await review.expectComparisonNamed("All changes");
  await review.expectDetailsCollapsed();
  await review.expectDiffShows("Added keep.txt", "+keep");
  const held = heldRead();
  read = held.read;
  await review.refresh();
  await review.expectFeedbackSays("Refreshing the review…");
  await review.expectComparisonNamed("All changes");
  await review.expectDetailsCollapsed();
  await review.expectDiffShows("Added keep.txt", "+keep");
  held.answer(snapshot);
  await review.expectFeedbackSays("Review refreshed");
  read = () => Promise.reject(new Error("unreadable"));
  await review.refresh();
  await review.expectRefused();
});

test("the files toggle stays independent of whether details are offered", async () => {
  const source = sourceOf(
    () => Promise.resolve(makeMe.aStoryReview.adding("toggle.txt").please()),
    makeMe.aReviewedFileDiff.adding("toggle.txt", "toggle").please(),
  );
  const review = await mountReviewChanges(source, doneStory);
  await review.expectFilesToggleNamed("Hide files");
  await review.expectDetailsCollapsed();
  await review.hideFiles();
  await review.expectFilesToggleNamed("Show files");
  await review.expectDetailsCollapsed();
  await review.showFiles();
  await review.expectFilesToggleNamed("Hide files");
});
