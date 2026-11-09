// Real touch comparisons retain the file and reading position as panes and controls change room.
import { test } from "../support/preparationPage.ts";
import { keepReviewContextThroughTouch } from "../support/storyReviewTouchContext.ts";
import { chooseComparisonAndReadByTouch } from "../support/storyReviewTouchJourney.ts";
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
      // line's end and back. Removing this allowance belongs to
      // SEED-287#fit-dashboard-journeys-in-default-timeout.
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
