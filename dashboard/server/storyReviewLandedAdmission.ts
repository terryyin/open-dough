// Resolve a story's named landing from published evidence or its retained
// launches. Both whole comparisons and individual files require its exact pair.
import type { PublishedSource } from "../src/publishedSource.ts";
import type { StoryReview } from "../src/storyReviewContract.ts";
import { RefusedRequest } from "./localOrigin.ts";
import {
  admissionBound,
  throwIfRequestAborted,
} from "./storyReviewAdmissionBound.ts";
import {
  landedFileReview,
  type LandingReviewSource,
} from "./storyReviewLanded.ts";
import { recordedLandingFileReview } from "./storyReviewPublishedLanding.ts";
import {
  reviewedLandedRunByReference,
  reviewedLandedRuns,
} from "./storyReviewRunAdmission.ts";

type LandedReview = Extract<StoryReview, { kind: "landed" }>;
type ComparisonPair = Pick<LandedReview, "baseline" | "tree">;

export const notOnCapturedRun = () =>
  new RefusedRequest(
    409,
    "The file or comparison does not belong to this captured run.",
  );

function requireLandedReview(review: StoryReview): LandedReview {
  if (review.kind === "landed") return review;
  throw new RefusedRequest(
    409,
    review.kind === "landing-unavailable"
      ? review.explanation
      : "The captured comparison is unavailable.",
  );
}

export function requireLandedPair(
  review: LandedReview,
  pair: ComparisonPair,
): void {
  if (pair.baseline !== review.baseline || pair.tree !== review.tree)
    throw notOnCapturedRun();
}

export async function readRetainedLandedReview(
  source: PublishedSource,
  run: LandingReviewSource,
  signal?: AbortSignal,
): Promise<LandedReview> {
  const review = await landedFileReview(run, admissionBound(signal), source);
  throwIfRequestAborted(signal);
  return requireLandedReview(review);
}

export async function readNamedLandedReview(
  source: PublishedSource,
  identity: string,
  reference: string,
  signal?: AbortSignal,
): Promise<LandedReview> {
  const recorded = await recordedLandingFileReview(
    source,
    identity,
    reference,
    admissionBound(signal),
  );
  throwIfRequestAborted(signal);
  if (recorded !== undefined) return requireLandedReview(recorded);
  const { runs } = await reviewedLandedRuns(source, identity);
  return readRetainedLandedReview(
    source,
    reviewedLandedRunByReference(runs, reference),
    signal,
  );
}
