// The uncommitted check leaves uncommitted changes out of All changes and
// back from the snapshot already read.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import {
  doneStory,
  mountReviewChanges,
  reviewSourceAnswering,
} from "./story-review-panel-page.ts";

const snapshot = makeMe.aStoryReview
  .adding("story.txt", 2)
  .modifying("staged.txt")
  .committedAs(makeMe.aStoryReview.adding("story.txt"))
  .please();
const diffOf = (lines: string[]) =>
  makeMe.aReviewedFileDiff.adding("story.txt", ...lines).please();

test("the check leaves uncommitted changes out of all changes and back without reading the snapshot again", async () => {
  let snapshotReads = 0;
  let storyLines = ["story", "more"];
  const source = reviewSourceAnswering({
    review: () => {
      snapshotReads += 1;
      return Promise.resolve(snapshot);
    },
    fileDiff: () => Promise.resolve(diffOf(storyLines)),
  });
  const review = await mountReviewChanges(source, doneStory);
  const file = "Added story.txt";
  await review.expectListed("2 changed files");
  await review.revealDetails();
  await review.expectUncommittedIncluded(true);
  await review.chooseFileByKeyboard(file);
  await review.expectLineCounts(file, "+2 −0");
  await review.expectDiffShows(file, "+more");
  const readsBefore = snapshotReads;

  storyLines = ["story"];
  await review.includeUncommitted(false);
  await review.expectRows("1 changed file", ["story.txt"]);
  await review.expectLineCounts(file, "+1 −0");
  await review.expectDiffShows(file, "+story");
  await review.expectDiffLacks(file, "+more");
  await review.expectUncommittedIncluded(false);

  storyLines = ["story", "more"];
  await review.includeUncommitted(true);
  await review.expectListed("2 changed files");
  await review.expectDiffShows(file, "+more");
  expect(snapshotReads).toBe(readsBefore);
});
