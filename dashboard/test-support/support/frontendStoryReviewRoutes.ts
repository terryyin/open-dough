// Route install helpers for ./frontendStoryReview.ts.

import type { Page } from "@playwright/test";
import {
  reviewedFileDiffSchema,
  reviewedFileTextSchema,
  reviewRangeSchema,
  storyReviewSchema,
} from "../../src/storyReviewContract.ts";
import type { ReviewBuckets } from "./frontendStoryReviewAnswers.ts";
import {
  answerStoryReview,
  storyReviewPaths,
} from "./frontendStoryReviewRule.ts";
import { answerHeld, fulfillJson } from "./frontendSubstituteAnswers.ts";

export {
  reviewedFileDiffSchema,
  reviewedFileTextSchema,
  reviewRangeSchema,
  storyReviewSchema,
};

export async function installReviewRoutes(page: Page, state: ReviewBuckets) {
  await page.route(
    (url) => storyReviewPaths.has(url.pathname),
    async (route) => {
      const url = new URL(route.request().url());
      const answer = answerStoryReview(state, url.pathname, url.searchParams);
      if (!answer) return route.fallback();
      await answerHeld(answer.hold, async () => {
        await fulfillJson(route, answer.body());
      });
    },
  );
}
