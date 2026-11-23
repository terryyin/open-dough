// On a short touch landscape, revealed details and status share one height
// budget above the diff so the work area keeps a usable code pane.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { emulateMedia, emulateTouch } from "./browser-session.ts";
import {
  adHocSession,
  mountReviewChanges,
  reviewSourceAnswering,
} from "./story-review-panel-page.ts";

const keptStatus =
  "Review refreshed: 1 changed file in the kept session commits.";
const file = "Added story.txt";

test("revealed details and status share one height budget above a usable code pane", async () => {
  // A touch phone whose reader asked for reduced motion.
  await emulateTouch();
  await emulateMedia([{ name: "prefers-reduced-motion", value: "reduce" }]);
  const review = await mountReviewChanges(
    reviewSourceAnswering({
      review: () =>
        Promise.resolve(
          makeMe.aStoryReview.sessionCommits().adding("story.txt").please(),
        ),
      fileDiff: () =>
        Promise.resolve(
          makeMe.aReviewedFileDiff.adding("story.txt", "kept line").please(),
        ),
    }),
    adHocSession,
    { viewport: { width: 780, height: 390 } },
  );

  await review.expectDetailsCollapsed();
  await review.expectDiffShows(file, "+kept line");
  await review.refresh();
  await review.expectFeedbackSays(keptStatus);

  await review.revealDetails();
  await review.expectDetailsLack(keptStatus);
  await review.expectFeedbackSays(keptStatus);

  const measured = review.measureAboveBody();
  expect(measured.visible).toBeLessThanOrEqual(measured.budget + 1);
  expect(measured.aboveHeight).toBeLessThanOrEqual(measured.budget + 1);
  // Two separate 30% caps at this viewport used ~176 px; one shared cap ~117.
  expect(measured.visible).toBeLessThan(150);

  await review.reachFeedback();

  expect(review.codeHeight(file)).toBeGreaterThanOrEqual(44);
  await review.expectCodeLineInView(file, "+kept line");

  await review.hideDetails();
  await review.expectFeedbackSays(keptStatus);
  expect(review.measureAboveBody().visible).toBeLessThanOrEqual(
    measured.budget + 1,
  );
});
