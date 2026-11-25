// Story-review exact GET paths admitted on the launch boundary.
import {
  storyReviewEndpoint,
  storyReviewFileEndpoint,
  storyReviewFileTextEndpoint,
} from "../src/storyReviewContract.ts";
import { storyReviewResultEndpoint } from "../src/storyReviewResult.ts";
import {
  fileDiffRequest,
  fileTextRequest,
  type AdmittedReviewedFileRead,
} from "./storyReviewFileRequest.ts";
import {
  storyReviewRequest,
  type AdmittedStoryReview,
} from "./storyReviewRequest.ts";
import {
  storyReviewResultRequest,
  type AdmittedStoryReviewResult,
} from "./storyReviewResultRequest.ts";

export type StoryReviewExactRead =
  AdmittedStoryReview | AdmittedReviewedFileRead | AdmittedStoryReviewResult;

export const storyReviewExactReads: ReadonlyArray<
  readonly [
    string,
    (url: URL) => StoryReviewExactRead | Promise<StoryReviewExactRead>,
  ]
> = [
  [storyReviewEndpoint, storyReviewRequest],
  [storyReviewFileEndpoint, fileDiffRequest],
  [storyReviewFileTextEndpoint, fileTextRequest],
  [storyReviewResultEndpoint, storyReviewResultRequest],
];
