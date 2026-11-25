// One field-based rule for a story's historical review file: a Published
// completion, or the retained pair and literal file list of a landed run.
// URL adapters and follow-up admission share this check; callers name source,
// story identity and a completion or a reference — never a repository path.
// A done session's kept result follows the same pair rule in
// `./storyReviewSessionFileAdmission.ts`.
import type { FollowUpComparison } from "../src/followUpRequest.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import type { ReviewedPairFile } from "../src/reviewedFileRead.ts";
import type { ReviewedStorySubject } from "../src/reviewedWorkSubject.ts";
import type { StoryReview } from "../src/storyReviewContract.ts";
import type { ReviewedFile } from "../src/storyReviewFiles.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { reviewRepositoryPath } from "./reviewRepository.ts";
import {
  admissionBound,
  throwIfRequestAborted,
} from "./storyReviewAdmissionBound.ts";
import type { LandingReviewSource } from "./storyReviewLanded.ts";
import {
  notOnCapturedRun,
  readNamedLandedReview,
  readRetainedLandedReview,
  requireLandedPair,
} from "./storyReviewLandedAdmission.ts";
import { publishedStoryReview } from "./storyReviewPublished.ts";

export {
  admissionBound,
  throwIfRequestAborted,
} from "./storyReviewAdmissionBound.ts";
export { notOnCapturedRun } from "./storyReviewLandedAdmission.ts";

export type HistoricalReviewedFileFields = ReviewedPairFile;

// One admitted comparison identity for printed diff or revision file text,
// covering historical and kept-session file reads.
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

async function requirePublishedCompletion(
  source: PublishedSource,
  identity: string,
  completion: string,
  signal?: AbortSignal,
) {
  const review = await publishedStoryReview(
    source,
    identity,
    admissionBound(signal),
    { completion },
  );
  throwIfRequestAborted(signal);
  if (review?.kind !== "published")
    throw new RefusedRequest(
      409,
      review?.kind === "unavailable"
        ? review.explanation
        : "Published comparison unavailable.",
    );
  // The named review has already verified the completion identity.
  return review;
}

export async function admitStoryComparison(
  source: PublishedSource,
  identity: string,
  comparison: FollowUpComparison,
): Promise<void> {
  if ("reference" in comparison) {
    const review = await readNamedLandedReview(
      source,
      identity,
      comparison.reference,
    );
    requireLandedPair(review, comparison);
    return;
  }
  const { completion, baseline, tree } = comparison;
  const review = await requirePublishedCompletion(source, identity, completion);
  if (
    tree !== review.tree ||
    (baseline !== review.baseline && baseline !== review.withMerged?.from)
  )
    throw new RefusedRequest(
      409,
      "The comparison does not belong to this published completion.",
    );
}

async function admitPublishedCompletion(
  source: PublishedSource,
  identity: string,
  completion: string,
  file: HistoricalReviewedFileFields,
  signal?: AbortSignal,
): Promise<AdmittedReviewedFile> {
  const review = await requirePublishedCompletion(
    source,
    identity,
    completion,
    signal,
  );
  if (!belongsOnPublishedStory(review, file))
    throw new RefusedRequest(
      409,
      "The file or comparison does not belong to this published completion.",
    );
  return { repository: reviewRepositoryPath(source), ...file };
}

function requireLandingFile(
  review: Extract<StoryReview, { kind: "landed" }>,
  file: HistoricalReviewedFileFields,
): void {
  requireLandedPair(review, file);
  if (!belongsOnRetainedPair(review.files, file)) throw notOnCapturedRun();
}

// Admit a file against a landed run's exact retained pair and file list.
export async function admitLandedRun(
  run: LandingReviewSource,
  file: HistoricalReviewedFileFields,
  signal: AbortSignal | undefined,
  source: PublishedSource,
): Promise<AdmittedReviewedFile> {
  const review = await readRetainedLandedReview(source, run, signal);
  requireLandingFile(review, file);
  return {
    repository: reviewRepositoryPath(source),
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
  const review = await readNamedLandedReview(
    source,
    named.identity,
    named.reference,
    signal,
  );
  requireLandingFile(review, file);
  return { repository: reviewRepositoryPath(source), ...file };
}
