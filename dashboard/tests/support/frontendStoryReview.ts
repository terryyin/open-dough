import {
  controls,
  createReviewBuckets,
  keyFor,
} from "./frontendStoryReviewAnswers.ts";
// Controllable story-review answers for frontend-only journeys at the
// snapshot, range, file diff and file text boundaries. The default is a
// minimal snapshot; a case may hold or stage the next ask per endpoint.

import type { Page } from "@playwright/test";
import type {
  ReviewedFileDiff,
  ReviewedFileText,
  ReviewRange,
  StoryReview,
} from "../../src/storyReviewContract.ts";
import { frontendReviewSnapshot } from "./frontendStoryReviewFixtures.ts";
import {
  installReviewRoutes,
  reviewedFileDiffSchema,
  reviewedFileTextSchema,
  reviewRangeSchema,
  storyReviewSchema,
} from "./frontendStoryReviewRoutes.ts";

export {
  frontendFileDiff,
  frontendPublishedReview,
  frontendReviewIds,
  frontendReviewSnapshot,
  frontendSessionCommitsReview,
} from "./frontendStoryReviewFixtures.ts";

export type FrontendStoryReview = {
  readonly asked: () => readonly string[];
  // The query each ask of `endpoint` named, oldest first.
  readonly queriesAsked: (
    endpoint: string,
  ) => readonly Readonly<Record<string, string>>[];
  readonly snapshot: () => StoryReview;
  readonly answerSnapshot: (review: StoryReview) => void;
  readonly answerHistoricalSnapshot: (
    identity: string,
    review: StoryReview,
  ) => void;
  readonly answerNextSnapshot: (review: StoryReview) => void;
  readonly holdNextSnapshot: () => ReturnType<
    ReturnType<typeof controls>["holdNext"]
  >;
  readonly answerRange: (range: ReviewRange) => void;
  readonly answerNextRange: (range: ReviewRange) => void;
  readonly holdNextRange: () => ReturnType<
    ReturnType<typeof controls>["holdNext"]
  >;
  readonly answerFile: (diff: ReviewedFileDiff, path?: string) => void;
  readonly answerNextFile: (diff: ReviewedFileDiff, path?: string) => void;
  readonly holdNextFile: (
    path?: string,
  ) => ReturnType<ReturnType<typeof controls>["holdNext"]>;
  readonly answerFileText: (text: ReviewedFileText, path?: string) => void;
  readonly answerNextFileText: (text: ReviewedFileText, path?: string) => void;
  readonly holdNextFileText: (
    path?: string,
  ) => ReturnType<ReturnType<typeof controls>["holdNext"]>;
};

export async function installFrontendStoryReview(
  page: Page,
  initial: StoryReview = frontendReviewSnapshot(),
): Promise<FrontendStoryReview> {
  const state = createReviewBuckets(storyReviewSchema.parse(initial));
  await installReviewRoutes(page, state);
  const snapshotCtl = controls(page, state.snapshots);
  const rangeCtl = controls(page, state.ranges);
  const fileCtl = controls(page, state.files);
  const textCtl = controls(page, state.texts);
  return {
    asked: () => state.asked.map(({ endpoint }) => endpoint),
    queriesAsked: (endpoint) =>
      state.asked
        .filter((ask) => ask.endpoint === endpoint)
        .map(({ query }) => query),
    snapshot: () => state.snapshot,
    answerSnapshot: (review) => {
      Object.assign(state, { snapshot: storyReviewSchema.parse(review) });
    },
    answerHistoricalSnapshot: (identity, review) => {
      state.historicalSnapshots.set(identity, storyReviewSchema.parse(review));
    },
    answerNextSnapshot: (review) => {
      snapshotCtl.answerNext(storyReviewSchema.parse(review));
    },
    holdNextSnapshot: () => snapshotCtl.holdNext(),
    answerRange: (range) => {
      const parsed = reviewRangeSchema.parse(range);
      Object.assign(state.ranges, { settle: () => parsed });
    },
    answerNextRange: (range) => {
      rangeCtl.answerNext(reviewRangeSchema.parse(range));
    },
    holdNextRange: () => rangeCtl.holdNext(),
    answerFile: (diff, path) => {
      state.fileByPath.set(keyFor(path), reviewedFileDiffSchema.parse(diff));
    },
    answerNextFile: (diff, path) => {
      fileCtl.answerNext(reviewedFileDiffSchema.parse(diff), path);
    },
    holdNextFile: (path) => fileCtl.holdNext(path),
    answerFileText: (text, path) => {
      state.textByPath.set(keyFor(path), reviewedFileTextSchema.parse(text));
    },
    answerNextFileText: (text, path) => {
      textCtl.answerNext(reviewedFileTextSchema.parse(text), path);
    },
    holdNextFileText: (path) => textCtl.holdNext(path),
  };
}
