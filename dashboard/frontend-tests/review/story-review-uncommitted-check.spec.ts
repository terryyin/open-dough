import type { Page } from "@playwright/test";
import {
  storyReviewEndpoint,
  storyReviewRangeEndpoint,
} from "../../src/storyReviewContract.ts";
import { expect, test } from "../../test-support/support/frontendApp.ts";
import {
  frontendFileDiff,
  frontendReviewIds,
  frontendReviewSnapshot,
} from "../../test-support/support/frontendStoryReview.ts";
import { openFrontendStoryReviewAsOpened } from "../../test-support/support/frontendStoryReviewOpen.ts";

function reviewRequests(page: Page) {
  const made: string[] = [];
  page.on("request", (request) => {
    const { pathname } = new URL(request.url());
    if ([storyReviewEndpoint, storyReviewRangeEndpoint].includes(pathname))
      made.push(pathname);
  });
  return () => made;
}

test("the check leaves uncommitted changes out of all changes and back without reading the snapshot again", async ({
  page,
  frontendServices,
}) => {
  const wholeFiles = [
    {
      kind: "added" as const,
      path: "story.txt",
      lines: { added: 2, removed: 0 },
    },
    {
      kind: "modified" as const,
      path: "staged.txt",
      lines: { added: 1, removed: 0 },
    },
  ];
  const committedFiles = [
    {
      kind: "added" as const,
      path: "story.txt",
      lines: { added: 1, removed: 0 },
    },
  ];
  const snapshot = frontendReviewSnapshot({
    files: wholeFiles,
    uncommitted: {
      kind: "uncommitted",
      tree: frontendReviewIds.tree,
      baseline: frontendReviewIds.baseline,
      fromTree: frontendReviewIds.baseline,
      fromBaseline: frontendReviewIds.baseline,
    },
    committed: {
      from: frontendReviewIds.baseline,
      tree: frontendReviewIds.head,
      files: committedFiles,
    },
  });
  const { answers, reviewChanges: review } =
    await openFrontendStoryReviewAsOpened(
      page,
      frontendServices,
      snapshot,
      (initial) => {
        initial.answerFile(
          frontendFileDiff("story.txt", ["+story", "+more"]),
          "story.txt",
        );
      },
    );
  const { files, diffs } = review;
  const file = "Added story.txt";
  await files.expectListed("2 changed files");
  await review.comparison.expectUncommittedIncluded(true);
  await files.chooseShown(file, "keyboard");
  await files.expectLineCounts(file, "+2 −0");
  await diffs.expectShows(file, "+more");
  const requests = reviewRequests(page);
  answers.answerFile(frontendFileDiff("story.txt", ["+story"]), "story.txt");
  await review.comparison.includeUncommitted(false);
  await files.expectRows("1 changed file", ["story.txt"]);
  await files.expectLineCounts(file, "+1 −0");
  await diffs.expectShows(file, "+story");
  await diffs.expectLacks(file, "+more");
  await review.comparison.expectUncommittedIncluded(false);
  answers.answerFile(
    frontendFileDiff("story.txt", ["+story", "+more"]),
    "story.txt",
  );
  await review.comparison.includeUncommitted(true);
  await files.expectListed("2 changed files");
  await diffs.expectShows(file, "+more");
  expect(requests()).toEqual([]);
});
