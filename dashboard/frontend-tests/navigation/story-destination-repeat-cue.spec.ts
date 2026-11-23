// A direct story destination asked for again while its card is already the
// selected story, in view and inspected after a visit to its Changes:
// each way the page asks for that same destination again, Back from Intent and
// Back to dashboard from System settings, shows the destination cue again,
// while the Highlight and open detail stay as they were.

import {
  expect,
  takenStoryCard,
  test,
} from "../../test-support/support/frontendApp.ts";
import { keepTakenReviewLaunch } from "../../test-support/support/frontendStoryReviewOpen.ts";
import { installFrontendStoryReview } from "../../test-support/support/frontendStoryReview.ts";
import { expectStoryTab } from "../../test-support/intentModePage.ts";
import { pausePageClock } from "../../test-support/autoRefreshJourney.ts";
import { expectRoute } from "../../test-support/agentRosterRecords.ts";
import { storyUrl } from "../../test-support/notificationStoryJourney.ts";
import {
  inspectionToggle,
  reviewChanges,
} from "../../test-support/storyCardControls.ts";
import { parts } from "../../test-support/dashboardParts.ts";
import {
  back,
  settings,
} from "../../test-support/support/systemSettingsPage.ts";
import {
  expectInspected,
  expectSelected,
} from "../../test-support/storyCardSelection.ts";
import {
  expectCueEnds,
  expectDestinationCue,
} from "../../test-support/destinationCue.ts";
import { takenIdentity } from "../../test-support/launchJourney.ts";

test("asking again for the selected and inspected destination cues it again and keeps its Highlight and detail", async ({
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
  await expectStoryTab(parts(page).intent, "Changes");
  await page.goBack();
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
    await expectCueEnds(page, card);
    await expectSelected(card, true);
  }
});
