// Story-review exact GET paths admitted on the launch boundary.
import {
  storyReviewEndpoint,
  storyReviewFileEndpoint,
  storyReviewFileTextEndpoint,
} from "../src/storyReviewContract.ts";
import {
  fileDiffRequest,
  fileTextRequest,
  type AdmittedReviewedFileRead,
} from "./storyReviewFileRequest.ts";
import {
  storyReviewRequest,
  type AdmittedStoryReview,
} from "./storyReviewRequest.ts";

export type StoryReviewExactRead =
  AdmittedStoryReview | AdmittedReviewedFileRead;

export const storyReviewExactReads: ReadonlyArray<
  readonly [
    string,
    (url: URL) => StoryReviewExactRead | Promise<StoryReviewExactRead>,
  ]
> = [
  [storyReviewEndpoint, storyReviewRequest],
  [storyReviewFileEndpoint, fileDiffRequest],
  [storyReviewFileTextEndpoint, fileTextRequest],
];
