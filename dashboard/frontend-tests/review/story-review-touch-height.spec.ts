// On a short touch landscape, revealed details and status share one height
// budget above the diff so the work area keeps a usable code pane.
import { expect, test } from "../../test-support/support/frontendApp.ts";
import {
  frontendFileDiff,
  frontendReviewIds,
  frontendReviewSnapshot,
} from "../../test-support/support/frontendStoryReview.ts";
import { openFrontendStoryReviewAsOpened } from "../../test-support/support/frontendStoryReviewOpen.ts";

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
  const { reviewChanges: review } = await openFrontendStoryReviewAsOpened(
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
  const { details, code, status } = review;
  const file = `Added ${path}`;

  await status.expectFeedbackSays(keptStatus);
  await review.details.expectCollapsed();
  await code.expectShows(file, "+kept line");

  await details.reveal();
  await details.expectText(keptStatus, false);
  await status.expectFeedbackSays(keptStatus);

  const measured = await details.measureAboveBody();
  expect(measured.visible).toBeLessThanOrEqual(measured.budget + 1);
  expect(measured.aboveHeight).toBeLessThanOrEqual(measured.budget + 1);
  // Two separate 30% caps at this viewport used ~176 px; one shared cap ~117.
  expect(measured.visible).toBeLessThan(150);

  await details.reachFeedback();

  expect(await code.height(file)).toBeGreaterThanOrEqual(44);
  await code.expectLineInView(file, "+kept line");

  await review.details.hide();
  await status.expectFeedbackSays(keptStatus);
  expect((await details.measureAboveBody()).visible).toBeLessThanOrEqual(
    measured.budget + 1,
  );
});
