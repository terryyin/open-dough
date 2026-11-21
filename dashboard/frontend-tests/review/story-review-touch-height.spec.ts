// On a short touch landscape, revealed details and status share one height
// budget above the diff so the work area keeps a usable code pane.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { emulateMedia } from "./browser-session.ts";
import {
  doneStory,
  mountReviewChanges,
  reviewSourceAnswering,
} from "./story-review-panel-page.ts";

const keptStatus =
  "This machine's Git cannot take the story's 2 published commits out of trunk";
const file = "Added story.txt";

test("revealed details and status share one height budget above a usable code pane", async () => {
  // Motion is reduced, as the phone's reader asked.
  await emulateMedia([{ name: "prefers-reduced-motion", value: "reduce" }]);
  const review = await mountReviewChanges(
    reviewSourceAnswering({
      review: () =>
        Promise.resolve(
          makeMe.aStoryReview
            .adding("story.txt")
            .keepingPublishedCommits(2)
            .please(),
        ),
      fileDiff: () =>
        Promise.resolve(
          makeMe.aReviewedFileDiff.adding("story.txt", "kept line").please(),
        ),
    }),
    doneStory,
    { viewport: { width: 780, height: 390 } },
  );

  await review.expectFeedbackSays(keptStatus);
  await review.expectDetailsCollapsed();
  await review.expectDiffShows(file, "+kept line");

  await review.revealDetails();
  await review.expectDetailsLack(keptStatus);
  await review.expectFeedbackSays(keptStatus);

  // The short touch layout caps the room above the work area once it applies.
  await expect.poll(() => review.measureAboveBody().budget).toBeGreaterThan(0);
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
