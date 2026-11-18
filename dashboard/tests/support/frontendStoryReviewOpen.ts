// Opens Review changes on the Taken story with a kept story-branch launch and
// controllable story-review answers for frontend-only journeys. Answers that
// must hold from the first read, such as the first file's diff that opening
// selects, are given through `prepare` before the review opens.

import type { Locator, Page } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { takenStory } from "../launchJourney.ts";
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
import { reviewRegion, showReviewDetails } from "./reviewControls.ts";
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

// The Taken story's review as the reader first meets it, before any step of
// theirs: its details wait behind the eye.
export async function openFrontendStoryReviewAsOpened(
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
  const card = takenStoryCard(page);
  // A card still reading grows and moves Review changes (same gate as
  // pressReviewChanges). The kept open session then lengthens the card
  // above that action once host facts arrive.
  await expect(card).not.toContainText(/Reading [^…]*…/);
  await expect(
    card.getByRole("button", { name: "Open terminal" }),
  ).toBeVisible();
  const action = reviewChanges(card);
  await action.scrollIntoViewIfNeeded();
  // Touch: tap the shown control once. Playwright's click waits for
  // multi-frame stability while late card facts can still move it on a
  // short landscape, which exhausts the default timeout with no panel.
  if ((await page.evaluate(() => navigator.maxTouchPoints)) > 0) {
    await tapWhereShown(action);
  } else {
    await action.click();
  }
  const review = reviewRegion(page);
  await expect(review).toBeVisible();
  return { card, review, answers };
}

// The same opening with the review's details readable.
export async function openFrontendStoryReview(
  ...opening: Parameters<typeof openFrontendStoryReviewAsOpened>
) {
  const opened = await openFrontendStoryReviewAsOpened(...opening);
  await showReviewDetails(opened.review);
  return opened;
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
  return { review: await showReviewDetails(reviewRegion(page)), answers };
}
