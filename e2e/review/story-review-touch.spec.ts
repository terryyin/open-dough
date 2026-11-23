// Real touch comparisons retain the file and reading position as panes and controls change room.
import { test } from "../../dashboard/test-support/support/preparationPage.ts";
import { keepReviewContextThroughTouch } from "../../dashboard/test-support/support/storyReviewTouchContext.ts";
import {
  chooseComparisonAndReadByTouch,
  readStoryComparisonsByTouch,
  touchReviewRepository,
} from "../../dashboard/test-support/support/storyReviewTouchJourney.ts";
import {
  launchTouchViewports,
  phoneLaunchTouchViewport,
} from "../../dashboard/test-support/touchLaunchPage.ts";

test.use({ originRepository: touchReviewRepository });

for (const { name, portrait, landscape } of launchTouchViewports) {
  test.describe(`${name} review by touch`, () => {
    test.use({ viewport: portrait, hasTouch: true, reducedMotion: "reduce" });
    test("reads a published session file within each pane", async ({
      page,
      origin,
    }) => {
      await chooseComparisonAndReadByTouch(page, origin);
    });
    test("keeps the chosen file and reading places through rotation and panel controls", async ({
      page,
      origin,
    }) => {
      await keepReviewContextThroughTouch(page, origin, portrait, landscape);
    });
  });
}

test.describe("phone story comparison by touch", () => {
  test.use({
    viewport: phoneLaunchTouchViewport.portrait,
    hasTouch: true,
    reducedMotion: "reduce",
  });
  test("the story's comparison and committed files respond to touch in Intent", async ({
    page,
    dashboard,
    origin,
  }) => {
    await readStoryComparisonsByTouch(page, dashboard, origin);
  });
});
