// Opens Review changes on the Taken story with a kept story-branch launch and
// controllable story-review answers for frontend-only journeys.

import type { Locator, Page } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { takenStory } from "../launchJourney.ts";
import { parts } from "../dashboardPage.ts";
import { reviewChanges } from "../storyCardControls.ts";
import { openFrontendTakenBacklog } from "./frontendApp.ts";
import {
  frontendStoryLaunch,
  putFrontendMachine,
  type FrontendServiceState,
} from "./frontendServiceState.ts";
import {
  installFrontendStoryReview,
  type FrontendStoryReview,
} from "./frontendStoryReview.ts";
import type { StoryReview } from "../../src/storyReviewContract.ts";
import { reviewRegion } from "./storyReviewMark.ts";

export async function openFrontendStoryReview(
  page: Page,
  frontendServices: FrontendServiceState,
  reviewAnswer?: StoryReview,
): Promise<{
  readonly card: Locator;
  readonly review: Locator;
  readonly answers: FrontendStoryReview;
}> {
  putFrontendMachine(
    frontendServices,
    makeMe.aMachineAnswer
      .observing(
        makeMe.anObservedLaunch
          .of(
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
          .withSessionState(makeMe.aSessionState.loaded("working").please())
          .please(),
      )
      .please(),
  );
  const answers = await installFrontendStoryReview(page, reviewAnswer);
  await openFrontendTakenBacklog(page);
  const card = parts(page).taken.getByRole("article", {
    name: takenStory,
    exact: true,
  });
  await reviewChanges(card).click();
  const review = reviewRegion(page);
  return { card, review, answers };
}
