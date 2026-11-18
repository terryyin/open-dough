// A direct story destination asked for again while its card is already the
// selected story, in view, inspected, and shown in the Side panel's review:
// each way the page asks for that same destination again, Back from Intent and
// Back to dashboard from System settings, shows the destination cue again,
// while the Highlight, open detail, and the review stay as they were.

import {
  expect,
  takenStoryCard,
  test,
} from "../../tests/support/frontendApp.ts";
import { keepTakenReviewLaunch } from "../../tests/support/frontendStoryReviewOpen.ts";
import { installFrontendStoryReview } from "../../tests/support/frontendStoryReview.ts";
import { reviewRegion } from "../../tests/support/reviewControls.ts";
import { pausePageClock } from "../../tests/autoRefreshJourney.ts";
import { expectRoute } from "../../tests/agentRosterRecords.ts";
import { storyUrl } from "../../tests/notificationStoryJourney.ts";
import {
  inspectionToggle,
  reviewChanges,
} from "../../tests/storyCardControls.ts";
import { parts } from "../../tests/dashboardParts.ts";
import { back, settings } from "../../tests/support/systemSettingsPage.ts";
import {
  expectInspected,
  expectSelected,
} from "../../tests/storyCardSelection.ts";
import {
  expectCueEnds,
  expectDestinationCue,
} from "../../tests/destinationCue.ts";
import { takenIdentity, takenStory } from "../../tests/launchJourney.ts";

test("asking again for the selected, inspected and reviewed destination cues it again and keeps its Highlight, detail and review", async ({
  page,
  frontendServices,
}) => {
  // Wide enough that the open review leaves the Taken card uncovered.
  await page.setViewportSize({ width: 1920, height: 900 });
  keepTakenReviewLaunch(frontendServices);
  await installFrontendStoryReview(page);
  await pausePageClock(page);
  await page.goto(storyUrl("open-dough", takenIdentity));
  const card = takenStoryCard(page);
  await expect(card).toBeFocused();
  await expectDestinationCue(page, card, { motion: true });
  await expectCueEnds(page, card);
  await reviewChanges(card).click();
  const review = reviewRegion(page);
  await expect(review.getByRole("heading", { level: 2 })).toHaveText(
    takenStory,
  );
  await inspectionToggle(card).click();
  await expectSelected(card, true);
  await expectInspected(card, true);
  await expect(card).toBeInViewport();

  const askedAgain = [
    async () => {
      await parts(page).intentChoice.check();
      await expect(card).toHaveCount(0);
      await page.goBack();
    },
    async () => {
      await settings(page).click();
      await back(page).click();
    },
  ];
  for (const askAgain of askedAgain) {
    await askAgain();
    expectRoute(page, { story: takenIdentity });
    await expect(card).toBeFocused();
    await expectDestinationCue(page, card, { motion: true });
    await expectSelected(card, true);
    await expectInspected(card, true);
    await expect(review.getByRole("heading", { level: 2 })).toHaveText(
      takenStory,
    );
    await expectCueEnds(page, card);
    await expectSelected(card, true);
  }
});
