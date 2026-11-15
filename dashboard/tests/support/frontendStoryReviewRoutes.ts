// Route install helpers for ./frontendStoryReview.ts.

import { frontendFileDiff } from "./frontendStoryReviewFixtures.ts";
import type { Page } from "@playwright/test";
import {
  markReviewedAnswerSchema,
  markReviewedRequestSchema,
  reviewedFileDiffSchema,
  reviewedFileTextSchema,
  reviewRangeSchema,
  storyReviewEndpoint,
  storyReviewFileEndpoint,
  storyReviewFileTextEndpoint,
  storyReviewMarkEndpoint,
  storyReviewRangeEndpoint,
  storyReviewSchema,
} from "../../src/storyReviewContract.ts";

export {
  markReviewedAnswerSchema,
  reviewedFileDiffSchema,
  reviewedFileTextSchema,
  reviewRangeSchema,
  storyReviewSchema,
};
import {
  answerBucket,
  takeQueued,
  type ReviewBuckets,
} from "./frontendStoryReviewAnswers.ts";
import { answerHeld, fulfillJson } from "./frontendSubstituteAnswers.ts";

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
            : state.snapshot,
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
  await page.route(
    (url) => url.pathname === storyReviewMarkEndpoint,
    async (route) => {
      state.asked.push(storyReviewMarkEndpoint);
      const planned = takeQueued(state.marks.next, "*");
      const hold = takeQueued(state.marks.holds, "*");
      await answerHeld(hold, async () => {
        const request = markReviewedRequestSchema.parse(
          route.request().postDataJSON(),
        );
        const body =
          planned ??
          state.markAnswer ??
          markReviewedAnswerSchema.parse({
            kind: "marked",
            mark: {
              tree: request.tree,
              baseline: request.baseline,
              markedAt: "2026-01-01T00:00:00.000Z",
            },
          });
        if (body.kind === "marked" && state.snapshot.kind === "snapshot") {
          // Object.assign keeps no-param-reassign clean on the accessor.
          Object.assign(state, {
            snapshot: { ...state.snapshot, mark: body.mark },
          });
        }
        await fulfillJson(route, body);
      });
    },
  );
}
