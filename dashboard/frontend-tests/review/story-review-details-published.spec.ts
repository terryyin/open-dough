// A published completion's facts wait behind the toolbar's eye like every
// other review's details.
import { test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import {
  doneStory,
  mountReviewChanges,
  reviewSourceAnswering,
} from "./story-review-panel-page.ts";

test("a published completion keeps its facts behind the eye", async () => {
  const published = makeMe.aStoryReview
    .published()
    .adding("first.txt")
    .please();
  if (published.kind !== "published") throw new Error("Not published.");
  const review = await mountReviewChanges(
    reviewSourceAnswering({
      review: () => Promise.resolve(published),
      fileDiff: () =>
        Promise.resolve(
          makeMe.aReviewedFileDiff.adding("first.txt", "alpha").please(),
        ),
    }),
    doneStory,
    { completed: true },
  );
  await review.expectDiffShows("Added first.txt", "+alpha");
  await review.expectFilesToggleLeads("Published completion");
  await review.expectEyeBesideComparison();
  await review.expectDetailsCollapsed();
  await review.expectNoTimeShown();
  await review.revealDetails();
  await review.expectDetailsHeading("Published completion");
  await review.expectDetailsTime(published.completedAt);
  await review.expectDetailsSay(`Completion ${published.completion}.`);
  await review.expectDetailsSay("origin/main");
});
