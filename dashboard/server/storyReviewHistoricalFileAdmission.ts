// One field-based rule for a story's historical review file: a Published
// completion, or the retained pair and literal file list of a landed run.
// URL adapters and follow-up admission share this check; callers name source,
// story identity and a completion or a reference — never a repository path.
// A done session's kept result follows the same pair rule in
// `./storyReviewSessionFileAdmission.ts`.
import type { PublishedSource } from "../src/publishedSource.ts";
import type { ReviewedPairFile } from "../src/reviewedFileRead.ts";
import type { ReviewedStorySubject } from "../src/reviewedWorkSubject.ts";
import type { StoryReview } from "../src/storyReviewContract.ts";
import type { ReviewedFile } from "../src/storyReviewFiles.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { executionCheckout } from "./executionCheckout.ts";
import {
  reviewedLandedRunByReference,
  reviewedLandedRuns,
} from "./storyReviewRunAdmission.ts";
import {
  landedStoryReview,
  type LandingReviewSource,
} from "./storyReviewLanded.ts";
import { publishedStoryReview } from "./storyReviewPublished.ts";

export type HistoricalReviewedFileFields = ReviewedPairFile;

// One admitted comparison identity for printed diff or revision file text,
// covering workspace, historical, and kept-session file reads.
export interface AdmittedReviewedFile extends HistoricalReviewedFileFields {
  readonly repository: string;
}

// Story subject with a resolved project source for historical file reads.
export type HistoricalReviewedFileSubject = Omit<
  ReviewedStorySubject,
  "source"
> & {
  readonly source: PublishedSource;
};

export type NamedHistoricalReviewedFile = HistoricalReviewedFileSubject &
  HistoricalReviewedFileFields &
  (
    | { readonly completion: string; readonly reference?: undefined }
    | { readonly reference: string; readonly completion?: undefined }
  );

function matchesHistoricalPath(
  file: ReviewedFile,
  { path, oldPath }: Pick<HistoricalReviewedFileFields, "path" | "oldPath">,
): boolean {
  return (
    file.path === path &&
    (file.kind === "renamed" ? file.oldPath === oldPath : oldPath === undefined)
  );
}

function belongsOnPublished(
  files: readonly ReviewedFile[],
  reviewBaseline: string,
  fields: HistoricalReviewedFileFields,
): boolean {
  return files.some(
    (file) =>
      matchesHistoricalPath(file, fields) &&
      (file.includesTrunkFrom ?? reviewBaseline) === fields.baseline,
  );
}

export function belongsOnPublishedStory(
  review: Extract<StoryReview, { kind: "published" | "published-taken" }>,
  file: HistoricalReviewedFileFields,
): boolean {
  const { withMerged } = review;
  return (
    file.tree === review.tree &&
    (belongsOnPublished(review.files, review.baseline, file) ||
      (withMerged !== undefined &&
        file.baseline === withMerged.from &&
        belongsOnRetainedPair(withMerged.files, file)))
  );
}

export function belongsOnRetainedPair(
  files: readonly ReviewedFile[],
  fields: HistoricalReviewedFileFields,
): boolean {
  return files.some((file) => matchesHistoricalPath(file, fields));
}

export const notOnCapturedRun = () =>
  new RefusedRequest(
    409,
    "The file or comparison does not belong to this captured run.",
  );

// Combine an optional caller signal with the existing 30-second admission
// deadline. Follow-up callers omit the request and keep timeout alone.
export function admissionBound(request?: AbortSignal): AbortSignal {
  const deadline = AbortSignal.timeout(30_000);
  return request === undefined
    ? deadline
    : AbortSignal.any([request, deadline]);
}

// Prefer request cancellation over a deadline-shaped refusal.
export function throwIfRequestAborted(request?: AbortSignal): void {
  if (request?.aborted) throw request.reason;
}

async function admitPublishedCompletion(
  source: PublishedSource,
  identity: string,
  completion: string,
  file: HistoricalReviewedFileFields,
  signal?: AbortSignal,
): Promise<AdmittedReviewedFile> {
  const review = await publishedStoryReview(
    source,
    identity,
    admissionBound(signal),
    completion,
  );
  throwIfRequestAborted(signal);
  if (review?.kind !== "published")
    throw new RefusedRequest(
      409,
      review?.kind === "unavailable"
        ? review.explanation
        : "Published comparison unavailable.",
    );
  if (
    completion !== review.completion ||
    !belongsOnPublishedStory(review, file)
  )
    throw new RefusedRequest(
      409,
      "The file or comparison does not belong to this published completion.",
    );
  return { repository: executionCheckout(source).path, ...file };
}

// Admit a file against a landed run's exact retained pair and file list.
export async function admitLandedRun(
  run: LandingReviewSource,
  file: HistoricalReviewedFileFields,
  signal?: AbortSignal,
): Promise<AdmittedReviewedFile> {
  const review = await landedStoryReview(run, admissionBound(signal));
  throwIfRequestAborted(signal);
  const landing = run.record.landing;
  if (review.kind !== "landed" || landing === undefined)
    throw new RefusedRequest(
      409,
      review.kind === "landing-unavailable"
        ? review.explanation
        : "The captured comparison is unavailable.",
    );
  if (
    file.baseline !== review.baseline ||
    file.tree !== review.tree ||
    !belongsOnRetainedPair(review.files, file)
  )
    throw notOnCapturedRun();
  return {
    repository: landing.repository,
    ...file,
  };
}

// Admit a historical file against a Published completion or landed run.
export async function admitHistoricalReviewedFile(
  named: NamedHistoricalReviewedFile,
  signal?: AbortSignal,
): Promise<AdmittedReviewedFile> {
  const { source, baseline, tree, path, oldPath } = named;
  const file: HistoricalReviewedFileFields = {
    baseline,
    tree,
    path,
    ...(oldPath === undefined ? {} : { oldPath }),
  };
  if (named.completion !== undefined)
    return admitPublishedCompletion(
      source,
      named.identity,
      named.completion,
      file,
      signal,
    );
  const { runs } = await reviewedLandedRuns(source, named.identity);
  return admitLandedRun(
    reviewedLandedRunByReference(runs, named.reference),
    file,
    signal,
  );
}
