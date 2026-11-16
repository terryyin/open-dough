// Opens Review changes on the Taken story with a kept story-branch launch and
// controllable story-review answers for frontend-only journeys. Answers that
// must hold from the first read, such as the first file's diff that opening
// selects, are given through `prepare` before the review opens.

import type { Locator, Page } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { takenStory } from "../launchJourney.ts";
import { parts } from "../dashboardPage.ts";
import { reviewChanges } from "../storyCardControls.ts";
import { openFrontendTakenBacklog } from "./frontendApp.ts";
import {
  frontendStoryLaunch,
  type FrontendServiceState,
} from "./frontendServiceState.ts";
import {
  installFrontendStoryReview,
  type FrontendStoryReview,
} from "./frontendStoryReview.ts";
import type { StoryReview } from "../../src/storyReviewContract.ts";
import { reviewRegion } from "./storyReviewMark.ts";
import {
  openFrontendBoardReview,
  storyA,
} from "./frontendRecentlyDoneBoardReview.ts";
import { doneCard } from "../recentlyDoneReviewState.ts";

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
  frontendServices.answerMachine(
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
  const answers = await installFrontendStoryReview(page, reviewAnswer);
  prepare(answers);
  await openFrontendTakenBacklog(page);
  const card = parts(page).taken.getByRole("article", {
    name: takenStory,
    exact: true,
  });
  await reviewChanges(card).click();
  const review = reviewRegion(page);
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
  return { review: reviewRegion(page), answers };
}
