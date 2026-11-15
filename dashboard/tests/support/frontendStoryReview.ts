// Controllable story-review answers for frontend-only journeys at the
// snapshot, range, file diff, file text and mark boundaries. Default settle
// is a minimal unmarked snapshot; a case may hold or stage the next ask per
// endpoint. Mark POSTs update the settled snapshot's mark.

import type { Page } from "@playwright/test";
import type {
  MarkReviewedAnswer,
  ReviewedFileDiff,
  ReviewedFileText,
  ReviewRange,
  StoryReview,
} from "../../src/storyReviewContract.ts";
import { frontendReviewSnapshot } from "./frontendStoryReviewFixtures.ts";
import {
  controls,
  createReviewBuckets,
  installReviewRoutes,
  keyFor,
  markReviewedAnswerSchema,
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
} from "./frontendStoryReviewFixtures.ts";

export type FrontendStoryReview = {
  readonly asked: () => readonly string[];
  readonly snapshot: () => StoryReview;
  readonly answerSnapshot: (review: StoryReview) => void;
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
  readonly answerMark: (answer: MarkReviewedAnswer) => void;
  readonly answerNextMark: (answer: MarkReviewedAnswer) => void;
  readonly holdNextMark: () => ReturnType<
    ReturnType<typeof controls>["holdNext"]
  >;
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
  const markCtl = controls(page, state.marks);
  return {
    asked: () => [...state.asked],
    snapshot: () => state.snapshot,
    answerSnapshot: (review) => {
      Object.assign(state, { snapshot: storyReviewSchema.parse(review) });
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
    answerMark: (answer) => {
      Object.assign(state, {
        markAnswer: markReviewedAnswerSchema.parse(answer),
      });
    },
    answerNextMark: (answer) => {
      markCtl.answerNext(markReviewedAnswerSchema.parse(answer));
    },
    holdNextMark: () => markCtl.holdNext(),
  };
}
