// Real touch comparisons retain the file and reading position as panes and controls change room.
import { queuedClaudePreviewTest as test } from "../support/preparationPage.ts";
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
