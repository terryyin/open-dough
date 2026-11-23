// Opens Review changes on the Taken story with a kept story-branch launch and
// controllable story-review answers for frontend-only journeys. A scenario can
// arrange the first read through `prepare` before opening.

import type { Locator, Page } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { takenStory } from "../launchJourney.ts";
import { parts } from "../dashboardParts.ts";
import { intentDiffReading } from "./intentStoryPage.ts";
import { expectStoryTab } from "../intentModePage.ts";
import { showColumn } from "../boardPage.ts";
import { reviewChanges } from "../storyCardControls.ts";
import { tapWhereShown } from "../pageLayout.ts";
import {
  expect,
  openFrontendTakenBacklog,
  takenStoryCard,
} from "./frontendApp.ts";
import {
  frontendStoryLaunch,
  type FrontendServiceState,
} from "./frontendServiceState.ts";
import {
  installFrontendStoryReview,
  type FrontendStoryReview,
} from "./frontendStoryReview.ts";
import type { StoryReview } from "../../src/storyReviewContract.ts";
import {
  openFrontendBoardReview,
  storyA,
} from "./frontendRecentlyDoneBoardReview.ts";
import { doneCard } from "../doneStoryReviewPage.ts";
// The Taken story's kept story-branch launch, which offers Review changes.
export function keepTakenReviewLaunch(services: FrontendServiceState): void {
  services.answerMachine(
    makeMe.aMachineAnswer
      .observingOpen(
        frontendStoryLaunch("executing", takenStory)
          .onStoryBranch({
            workspace: "/tmp/story-review-fe",
            branch: "claude/taken",
          })
          .inClaudeSession({
            sessionId: "story-review-fe",
            shortId: "revfe01",
          })
          .please(),
      )
      .please(),
  );
}

// The Taken story’s Changes opened by its card.
export async function openFrontendStoryReview(
  page: Page,
  frontendServices: FrontendServiceState,
  reviewAnswer?: StoryReview,
  prepare: (answers: FrontendStoryReview) => void = () => {},
): Promise<{
  readonly card: Locator;
  readonly review: Locator;
  readonly answers: FrontendStoryReview;
}> {
  keepTakenReviewLaunch(frontendServices);
  const answers = await installFrontendStoryReview(page, reviewAnswer);
  prepare(answers);
  await openFrontendTakenBacklog(page);
  // A short landscape can show one Board column; Taken then stays
  // height-clipped until paged into view.
  await showColumn(page, "Taken");
  const card = takenStoryCard(page);
  // A card still reading can move Review changes as its facts arrive.
  // The kept open session also adds controls above that action.
  await expect(card).not.toContainText(/Reading [^…]*…/);
  await expect(
    card.getByRole("button", { name: "Open terminal" }),
  ).toBeVisible();
  const action = reviewChanges(card);
  await action.scrollIntoViewIfNeeded();
  // Touch: tap the shown control once. Playwright's click waits for
  // multi-frame stability while late card facts can still move it on a
  // short landscape, which can exhaust the default timeout before navigation.
  if ((await page.evaluate(() => navigator.maxTouchPoints)) > 0) {
    await tapWhereShown(action);
  } else {
    await action.click();
  }
  const review = parts(page).intent;
  await expectStoryTab(review, "Changes");
  return { card, review, answers };
}

// Opens Review changes on a Recently done story (whose line numbers offer
// Follow up) with controllable story-review answers.
export async function openFrontendDoneStoryReview(
  page: Page,
  frontendServices: FrontendServiceState,
  reviewAnswer: StoryReview,
  prepare: (answers: FrontendStoryReview) => void = () => {},
) {
  const answers = await installFrontendStoryReview(page, reviewAnswer);
  prepare(answers);
  await openFrontendBoardReview(page, frontendServices);
  await reviewChanges(doneCard(page, storyA.title)).click();
  const review = parts(page).intent;
  await expectStoryTab(review, "Changes");
  return { review, answers };
}

// The current Intent reader for the file that the scenario just selected.
export async function selectedFrontendStoryDiff(intent: Locator, name: string) {
  const reading = intentDiffReading(intent);
  await expect(reading.name).toHaveText(name);
  return reading.container;
}
