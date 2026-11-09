// Real touch comparisons retain the file and reading position as panes and controls change room.
import { test } from "../support/preparationPage.ts";
import {
  chooseComparisonAndReadByTouch,
  keepReviewContextThroughTouch,
} from "../support/storyReviewTouchJourney.ts";
import { launchTouchViewports } from "../touchLaunchPage.ts";

for (const { name, portrait, landscape } of launchTouchViewports) {
  test.describe(`${name} review by touch`, () => {
    test.use({ viewport: portrait, hasTouch: true, reducedMotion: "reduce" });
    test("chooses a comparison and file and reads within each pane", async ({
      page,
      dashboard,
      origin,
    }) => {
      // Up to about 31 native touch strokes, most of them reading the wide
      // line's end and back; see the pending optimization candidate
      // `story-review-touch-reading-strokes`.
      test.setTimeout(60_000);
      await chooseComparisonAndReadByTouch(page, dashboard, origin);
    });
    test("keeps the chosen file and reading places through rotation and panel controls", async ({
      page,
      dashboard,
      origin,
    }) => {
      await keepReviewContextThroughTouch(
        page,
        dashboard,
        origin,
        portrait,
        landscape,
      );
    });
  });
}
