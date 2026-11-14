// A direct story destination asked for again while its card is already the
// selected story, in view, inspected, and shown in the Side panel's review:
// each way the page asks for that same destination again, Back from Intent and
// Back to dashboard from System settings, shows the destination cue again,
// while the Highlight, open detail, and the review stay as they were.

import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { pausePageClock } from "../autoRefreshJourney.ts";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { parts } from "../dashboardPage.ts";
import { expectCueEnds, expectDestinationCue } from "../destinationCue.ts";
import { expectInspected, expectSelected } from "../storyCardSelection.ts";
import { storyCard } from "../storyCardControls.ts";
import { expectRoute } from "../agentRosterRecords.ts";
import { expect, test } from "../support/preparationPage.ts";
import { originMain } from "../support/sessionDialog.ts";
import { queuedIdentity } from "../support/startOrigin.ts";
import { keepLaunchRecords } from "../support/launchStore.ts";
import { openStoryReview, reviewRegion } from "../support/storyReviewMark.ts";
import { branch, storyWorktree } from "../support/storyReviewWorktree.ts";

const storyUrl = `/?${new URLSearchParams({ project: "open-dough", story: queuedIdentity })}`;

test("asking again for the selected, inspected and reviewed destination cues it again and keeps its Highlight, detail and review", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = storyWorktree(origin);
  keepLaunchRecords(dashboard, [
    makeMe.aLaunchRecord
      .executing({ identity: queuedIdentity, title: "Story A" })
      .onStoryBranch({ workspace, branch })
      .please(),
  ]);
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: await originMain(origin),
    repository: "terryyin/open-dough",
  });
  await pausePageClock(page);
  await page.goto(storyUrl);
  const card = storyCard(parts(page).board, "Story A");
  await expect(card).toBeFocused();
  await expectDestinationCue(page, card, { motion: true });
  await expectCueEnds(page, card);
  await openStoryReview(page, card);
  const review = reviewRegion(page);
  await expect(review.getByRole("heading", { level: 2 })).toHaveText("Story A");
  await card.getByRole("button", { name: "Inspect story" }).click();
  await expectSelected(card, true);
  await expectInspected(card, true);
  await expect(card).toBeInViewport();

  const askedAgain = [
    async () => {
      await page.getByRole("radio", { name: "Intent", exact: true }).check();
      await expect(card).toHaveCount(0);
      await page.goBack();
    },
    async () => {
      await page
        .getByRole("button", { name: "System settings", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Back to dashboard", exact: true })
        .click();
    },
  ];
  for (const askAgain of askedAgain) {
    await askAgain();
    expectRoute(page, { story: queuedIdentity });
    await expect(card).toBeFocused();
    await expectDestinationCue(page, card, { motion: true });
    await expectSelected(card, true);
    await expectInspected(card, true);
    await expect(review.getByRole("heading", { level: 2 })).toHaveText(
      "Story A",
    );
    await expectCueEnds(page, card);
    await expectSelected(card, true);
  }
});
