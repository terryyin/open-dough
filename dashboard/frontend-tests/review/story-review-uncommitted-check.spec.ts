// All changes can leave uncommitted changes out without rereading the
// snapshot, range or mark; Mark reviewed with the check off marks the whole
// snapshot.

import type { Page } from "@playwright/test";
import {
  storyReviewEndpoint,
  storyReviewMarkEndpoint,
  storyReviewRangeEndpoint,
} from "../../src/storyReviewContract.ts";
import { expect, test } from "../../tests/support/frontendApp.ts";
import {
  frontendFileDiff,
  frontendReviewIds,
  frontendReviewSnapshot,
} from "../../tests/support/frontendStoryReview.ts";
import { openFrontendStoryReview } from "../../tests/support/frontendStoryReviewOpen.ts";
import {
  expectLineCounts,
  expectTreeRows,
  fileDiff,
  fileRow,
  changedFilesList,
} from "../../tests/support/reviewTreeRows.ts";
import {
  markReviewed,
  reviewRegion,
  uncommittedCheck as check,
  uncommittedLeftOut as leftOut,
} from "../../tests/support/storyReviewMark.ts";

function reviewRequests(page: Page) {
  const made: string[] = [];
  page.on("request", (request) => {
    const { pathname } = new URL(request.url());
    if (
      [
        storyReviewEndpoint,
        storyReviewRangeEndpoint,
        storyReviewMarkEndpoint,
      ].includes(pathname)
    )
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
  const { answers } = await openFrontendStoryReview(
    page,
    frontendServices,
    snapshot,
  );
  answers.answerFile(
    frontendFileDiff("story.txt", ["+story", "+more"]),
    "story.txt",
  );
  const review = reviewRegion(page);
  const whole = changedFilesList(review, "2 changed files");
  const diff = fileDiff(review, "Added story.txt");
  await expect(whole).toBeVisible();
  await expect(check(review)).toBeChecked();
  await fileRow(review, "Added story.txt").press("Enter");
  await expectLineCounts(review, "Added story.txt", "+2 −0");
  await expect(diff).toContainText("+more");
  const requests = reviewRequests(page);
  answers.answerFile(frontendFileDiff("story.txt", ["+story"]), "story.txt");
  await check(review).uncheck();
  const committed = changedFilesList(review, "1 changed file");
  await expectTreeRows(committed, ["story.txt"]);
  await expectLineCounts(review, "Added story.txt", "+1 −0");
  await expect(diff).toContainText("+story");
  await expect(diff).not.toContainText("+more");
  await expect(review.getByText(leftOut)).toBeVisible();
  await expect(check(review)).not.toBeChecked();
  await expect(check(review)).toHaveAccessibleDescription(leftOut);
  answers.answerFile(
    frontendFileDiff("story.txt", ["+story", "+more"]),
    "story.txt",
  );
  await check(review).check();
  await expect(whole).toBeVisible();
  await expect(diff).toContainText("+more");
  await expect(review.getByText(leftOut)).toHaveCount(0);
  expect(requests()).toEqual([]);
});

test("Mark reviewed with the check off marks the whole snapshot", async ({
  page,
  frontendServices,
}) => {
  const snapshot = frontendReviewSnapshot({
    files: [
      {
        kind: "added",
        path: "story.txt",
        lines: { added: 2, removed: 0 },
      },
    ],
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
      files: [
        {
          kind: "added",
          path: "story.txt",
          lines: { added: 1, removed: 0 },
        },
      ],
    },
  });
  await openFrontendStoryReview(page, frontendServices, snapshot);
  const review = reviewRegion(page);
  await check(review).uncheck();
  await expect(changedFilesList(review, "1 changed file")).toBeVisible();
  const marking = page.waitForRequest(
    (request) => new URL(request.url()).pathname === storyReviewMarkEndpoint,
  );
  await markReviewed(review);
  expect((await marking).postDataJSON()).toMatchObject({
    tree: snapshot.tree,
    baseline: snapshot.baseline,
  });
  await expect(review).toContainText("This snapshot is marked reviewed,");
  await expect(check(review)).not.toBeChecked();
});
