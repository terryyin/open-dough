// A review's Files divider resizes its file sidebar against the diff, within
// both panes' minimums, by drag and by Left and Right; hiding the files removes
// it. Its opening proves the 16rem default and that opening keeps nothing.
// The kept width across reviews is ./story-review-files-divider-kept.spec.ts.
import { expect, onTestFinished, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import {
  forgetFilesWidth,
  keptFilesWidth,
  rem,
} from "./story-review-files-divider-view.ts";
import {
  doneStory,
  mountReviewChanges,
  reviewSourceAnswering,
} from "./story-review-panel-page.ts";

const oneFile = reviewSourceAnswering({
  review: () =>
    Promise.resolve(makeMe.aStoryReview.adding("first.txt").please()),
  fileDiff: () =>
    Promise.resolve(
      makeMe.aReviewedFileDiff.adding("first.txt", "alpha").please(),
    ),
});

test("the Files divider resizes the file sidebar against the diff within both minimums", async () => {
  forgetFilesWidth();
  onTestFinished(forgetFilesWidth);
  const review = await mountReviewChanges(oneFile, doneStory, {
    viewport: { width: 1280, height: 720 },
  });
  await review.expectDiffShows("Added first.txt", "+alpha");
  const start = await review.filesWidths();
  expect(start.sideBySide).toBe(true);
  const maximum = Math.floor(start.room - 18 * rem);

  // It says the sidebar's 16rem width and bounds and how to use it.
  await review.expectSidebarWidth(16 * rem);
  await review.expectFilesDividerBounds(12 * rem, maximum);
  expect(keptFilesWidth()).toBeNull();

  // Dragging rightward widens the sidebar and narrows the diff by as much.
  await review.dragFilesDivider(48);
  await review.expectSidebarWidth(16 * rem + 48);
  expect((await review.filesWidths()).diff).toBeCloseTo(start.diff - 48, 0);

  // Right widens it one step and Left narrows it back.
  await review.pressOnFilesDivider("ArrowRight");
  await review.expectSidebarWidth(17 * rem + 48);
  await review.pressOnFilesDivider("ArrowLeft");
  await review.expectSidebarWidth(16 * rem + 48);

  // Neither pane goes below its minimum.
  await review.dragFilesDivider(4000);
  await review.expectSidebarWidth(maximum);
  expect((await review.filesWidths()).diff).toBeCloseTo(
    start.room - maximum,
    0,
  );
  await review.pressOnFilesDivider("ArrowRight");
  await review.expectSidebarWidth(maximum);
  await review.dragFilesDivider(-4000);
  await review.expectSidebarWidth(12 * rem);
  await review.pressOnFilesDivider("ArrowLeft");
  await review.expectSidebarWidth(12 * rem);

  // Hiding the files removes the divider; showing returns both at the
  // chosen width.
  await review.pressOnFilesDivider("ArrowRight", 2);
  await review.hideFiles();
  await review.expectNoFilesDivider();
  const hidden = await review.hiddenSidebarWidths();
  expect(hidden.diff).toBeCloseTo(hidden.workarea, 0);
  await review.showFiles();
  await review.expectSidebarWidth(14 * rem);
});
