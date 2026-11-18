// Frontend fixtures for Recently done board review-state journeys: three
// done stories completed elsewhere, optional nested Done sessions, and the
// controllable review-state substitute.

import type { Page } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { LaunchWithState } from "../../src/launchRecord.ts";
import { showColumn } from "../boardPage.ts";
import { parts } from "../dashboardParts.ts";
import {
  boardReviewDoneRecords,
  doneStories,
  storyA,
  storyB,
  storyC,
} from "../recentlyDoneReviewState.ts";
import { expect } from "./frontendApp.ts";
import {
  installFrontendDoneBodyReads,
  type FrontendDoneBodyReads,
} from "./frontendDoneBodyReads.ts";
import {
  putFrontendDoneRecords,
  type FrontendServiceState,
} from "./frontendServiceState.ts";
import {
  installFrontendStoryReviewState,
  type FrontendStoryReviewState,
} from "./frontendStoryReviewState.ts";

export { doneStories, storyA, storyB, storyC };

export type FrontendBoardReview = {
  readonly recent: ReturnType<typeof parts>["recentlyDone"];
  readonly review: FrontendStoryReviewState;
  readonly bodies: FrontendDoneBodyReads;
};

// Publishes the three done stories, installs review-state and done-body
// controls, runs `prepare` (hold/fail staging), then opens Recently done.
export async function openFrontendBoardReview(
  page: Page,
  services: FrontendServiceState,
  {
    now = Date.now(),
    reviewed = [],
    observed = [],
    prepare,
  }: {
    readonly now?: number;
    readonly reviewed?: readonly string[];
    readonly observed?: readonly LaunchWithState[];
    readonly prepare?: (bodies: FrontendDoneBodyReads) => void;
  } = {},
): Promise<FrontendBoardReview> {
  putFrontendDoneRecords(services, "open-dough", boardReviewDoneRecords(now));
  if (observed.length > 0) {
    services.answerMachine(
      makeMe.aMachineAnswer.observing(...observed).please(),
    );
  }
  const review = await installFrontendStoryReviewState(page, {
    "open-dough": reviewed,
  });
  const bodies = await installFrontendDoneBodyReads(page, services);
  prepare?.(bodies);
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: /Start session in/ }),
  ).toBeVisible();
  await showColumn(page, "Recently done");
  return { recent: parts(page).recentlyDone, review, bodies };
}
