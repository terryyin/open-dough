// On a short touch landscape, revealed details and status share one height
// budget above the diff so the work area keeps a usable code pane.
import { expect, test } from "../../tests/support/frontendApp.ts";
import {
  frontendFileDiff,
  frontendReviewIds,
  frontendReviewSnapshot,
} from "../../tests/support/frontendStoryReview.ts";
import { openFrontendStoryReviewAsOpened } from "../../tests/support/frontendStoryReviewOpen.ts";
import {
  aboveBodyTouchBudget,
  reviewFeedback,
} from "../../tests/support/reviewContextLine.ts";
import { codePane } from "../../tests/support/reviewPanes.ts";
import {
  expectDetailsCollapsed,
  hideDetails,
  revealDetails,
} from "../../tests/support/reviewDetails.ts";
import { box } from "../../tests/pageLayout.ts";
import { fileDiff } from "../../tests/support/reviewTreeRows.ts";
import { reachReviewControl } from "../../tests/support/reviewTouchReading.ts";

test.use({
  hasTouch: true,
  viewport: { width: 780, height: 390 },
  reducedMotion: "reduce",
});

const keptStatus =
  /This machine's Git cannot take the story's 2 published commits out of trunk/;

test("revealed details and status share one height budget above a usable code pane", async ({
  page,
  frontendServices,
}) => {
  const path = "story.txt";
  const { review } = await openFrontendStoryReviewAsOpened(
    page,
    frontendServices,
    frontendReviewSnapshot({
      published: {
        trunk: frontendReviewIds.baseline,
        commits: 2,
        kept: "not-restated",
      },
    }),
    (answers) => {
      answers.answerFile(frontendFileDiff(path, ["+kept line"]));
    },
  );

  await expect(reviewFeedback(review)).toContainText(keptStatus);
  await expectDetailsCollapsed(review);
  const code = codePane(fileDiff(review, `Added ${path}`));
  await expect(code).toContainText("+kept line");

  const details = await revealDetails(review);
  await expect(details).toBeVisible();
  await expect(details).not.toContainText(keptStatus);
  await expect(reviewFeedback(review)).toContainText(keptStatus);

  const measured = await aboveBodyTouchBudget(review);
  expect(measured.visible).toBeLessThanOrEqual(measured.budget + 1);
  expect(measured.aboveHeight).toBeLessThanOrEqual(measured.budget + 1);
  // Two separate 30% caps at this viewport used ~176 px; one shared cap ~117.
  expect(measured.visible).toBeLessThan(150);

  await reachReviewControl(review, reviewFeedback(review));
  await expect(reviewFeedback(review)).toBeInViewport();

  expect((await box(code)).height).toBeGreaterThanOrEqual(44);
  await expect(code.getByText("+kept line", { exact: true })).toBeInViewport();

  await hideDetails(review);
  await expect(reviewFeedback(review)).toContainText(keptStatus);
  expect((await aboveBodyTouchBudget(review)).visible).toBeLessThanOrEqual(
    measured.budget + 1,
  );
});
