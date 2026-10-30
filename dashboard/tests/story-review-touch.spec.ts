// Real touch comparisons retain the file and reading position as panes and controls change room.
import { test } from "./support/preparationPage.ts";
import { chooseComparisonAndKeepContextThroughTouch } from "./support/storyReviewTouchJourney.ts";
import { launchTouchViewports } from "./touchLaunchPage.ts";

test.setTimeout(120_000);

for (const { name, portrait, landscape } of launchTouchViewports) {
  test.describe(`${name} review by touch`, () => {
    test.use({ viewport: portrait, hasTouch: true, reducedMotion: "reduce" });
    test("chooses a comparison and file, reads within each pane, and keeps that context through rotation and panel controls", async ({
      page,
      dashboard,
      origin,
    }) => {
      await chooseComparisonAndKeepContextThroughTouch(
        page,
        dashboard,
        origin,
        portrait,
        landscape,
      );
    });
  });
}
