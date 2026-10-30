// Story-review exact GET paths admitted on the launch boundary.
import {
  storyReviewEndpoint,
  storyReviewFileEndpoint,
  storyReviewFileTextEndpoint,
  storyReviewRangeEndpoint,
} from "../src/storyReviewContract.ts";
import {
  fileDiffRequest,
  fileTextRequest,
  rangeRequest,
  type AdmittedReviewedFile,
  type AdmittedStoryReviewRange,
} from "./storyReviewAdmission.ts";
import {
  storyReviewRequest,
  type AdmittedStoryReview,
} from "./storyReviewRequest.ts";

type StoryReviewExactRead =
  AdmittedStoryReview | AdmittedReviewedFile | AdmittedStoryReviewRange;

export const storyReviewExactReads: ReadonlyArray<
  readonly [
    string,
    (url: URL) => StoryReviewExactRead | Promise<StoryReviewExactRead>,
  ]
> = [
  [storyReviewEndpoint, storyReviewRequest],
  [storyReviewFileEndpoint, fileDiffRequest],
  [storyReviewFileTextEndpoint, fileTextRequest],
  [storyReviewRangeEndpoint, rangeRequest],
];
