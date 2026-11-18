// Route install helpers for ./frontendStoryReview.ts.

import { frontendFileDiff } from "./frontendStoryReviewFixtures.ts";
import type { Page } from "@playwright/test";
import {
  reviewedFileDiffSchema,
  reviewedFileTextSchema,
  reviewRangeSchema,
  storyReviewEndpoint,
  storyReviewFileEndpoint,
  storyReviewFileTextEndpoint,
  storyReviewRangeEndpoint,
  storyReviewSchema,
} from "../../src/storyReviewContract.ts";

export {
  reviewedFileDiffSchema,
  reviewedFileTextSchema,
  reviewRangeSchema,
  storyReviewSchema,
};
import {
  answerBucket,
  type ReviewBuckets,
} from "./frontendStoryReviewAnswers.ts";

export async function installReviewRoutes(page: Page, state: ReviewBuckets) {
  await page.route(
    (url) => url.pathname === storyReviewEndpoint,
    (route) => {
      const params = new URL(route.request().url()).searchParams;
      const identity = params.get("identity") ?? "";
      return answerBucket(
        route,
        state.asked,
        storyReviewEndpoint,
        identity,
        state.snapshots,
        () =>
          params.get("historical") === "true"
            ? (state.historicalSnapshots.get(identity) ?? state.snapshot)
            : (state.runSnapshots.get(params.get("run") ?? "") ??
              state.snapshot),
      );
    },
  );
  await page.route(
    (url) => url.pathname === storyReviewRangeEndpoint,
    (route) =>
      answerBucket(
        route,
        state.asked,
        storyReviewRangeEndpoint,
        "*",
        state.ranges,
      ),
  );
  await page.route(
    (url) => url.pathname === storyReviewFileEndpoint,
    (route) => {
      const path =
        new URL(route.request().url()).searchParams.get("path") ?? "";
      return answerBucket(
        route,
        state.asked,
        storyReviewFileEndpoint,
        path,
        state.files,
        () =>
          state.fileByPath.get(path) ??
          state.fileByPath.get("*") ??
          frontendFileDiff(path || "story.txt", ["+story"]),
      );
    },
  );
  await page.route(
    (url) => url.pathname === storyReviewFileTextEndpoint,
    (route) => {
      const path =
        new URL(route.request().url()).searchParams.get("path") ?? "";
      return answerBucket(
        route,
        state.asked,
        storyReviewFileTextEndpoint,
        path,
        state.texts,
        () =>
          state.textByPath.get(path) ??
          state.textByPath.get("*") ??
          reviewedFileTextSchema.parse({
            kind: "text",
            baseline: null,
            tree: "story\n",
          }),
      );
    },
  );
}
