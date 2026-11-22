// @ts-check
// The story review's builders: its answers (./storyReviewTestData.mjs), a
// file's printed diff (./reviewedFileDiffTestData.mjs) and a captured run
// (./storyReviewRunTestData.mjs). Node-free, so makeMe.mjs and pageMakeMe.mjs
// expose them from these definitions.
import { ReviewedFileDiffBuilder } from "./reviewedFileDiffTestData.mjs";
import { ReviewRunBuilder } from "./storyReviewRunTestData.mjs";
import { StoryReviewBuilder } from "./storyReviewTestData.mjs";

/**
 * @typedef {object} StoryReviewMakeMe
 * @property {StoryReviewBuilder} aStoryReview
 * @property {ReviewedFileDiffBuilder} aReviewedFileDiff
 * @property {ReviewRunBuilder} aReviewRun
 */

/** @returns {PropertyDescriptorMap} */
export function storyReviewMakeMeProperties() {
  return {
    aStoryReview: {
      enumerable: true,
      get() {
        return new StoryReviewBuilder();
      },
    },
    aReviewedFileDiff: {
      enumerable: true,
      get() {
        return new ReviewedFileDiffBuilder();
      },
    },
    aReviewRun: {
      enumerable: true,
      get() {
        return new ReviewRunBuilder();
      },
    },
  };
}
