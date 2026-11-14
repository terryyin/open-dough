// One field-based rule for a historical review file: a Published completion
// or a landed run's captured pair and literal file list. URL adapters and
// follow-up admission share this check; callers name source, identity and
// either completion or reference — never a repository path.
import type { PublishedSource } from "../src/publishedSource.ts";
import type { ReviewedFile } from "../src/storyReviewFiles.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { projectFolder } from "./projectFolders.ts";
import {
  reviewedLandedRunByReference,
  reviewedLandedRuns,
} from "./storyReviewRunAdmission.ts";
import { landedStoryReview } from "./storyReviewLanded.ts";
import { publishedStoryReview } from "./storyReviewPublished.ts";

export interface HistoricalReviewedFileFields {
  readonly baseline: string;
  readonly tree: string;
  readonly path: string;
  readonly oldPath?: string;
}

export interface AdmittedHistoricalReviewedFile extends HistoricalReviewedFileFields {
  readonly repository: string;
}

export type HistoricalReviewedFileIdentity = {
  readonly source: PublishedSource;
  readonly identity: string;
} & HistoricalReviewedFileFields &
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

function belongsOnLanded(
  files: readonly ReviewedFile[],
  fields: HistoricalReviewedFileFields,
): boolean {
  return files.some((file) => matchesHistoricalPath(file, fields));
}

async function admitPublishedCompletion(
  source: PublishedSource,
  identity: string,
  completion: string,
  file: HistoricalReviewedFileFields,
): Promise<AdmittedHistoricalReviewedFile> {
  const review = await publishedStoryReview(
    source,
    identity,
    AbortSignal.timeout(30_000),
    completion,
  );
  if (review?.kind !== "published")
    throw new RefusedRequest(
      409,
      review?.kind === "unavailable"
        ? review.explanation
        : "Published comparison unavailable.",
    );
  if (
    completion !== review.completion ||
    file.tree !== review.tree ||
    !belongsOnPublished(review.files, review.baseline, file)
  )
    throw new RefusedRequest(
      409,
      "The file or comparison does not belong to this published completion.",
    );
  return { repository: projectFolder(source).path, ...file };
}

async function admitLandedRun(
  source: PublishedSource,
  identity: string,
  reference: string,
  file: HistoricalReviewedFileFields,
): Promise<AdmittedHistoricalReviewedFile> {
  const { runs } = await reviewedLandedRuns(source, identity);
  const run = reviewedLandedRunByReference(runs, reference);
  const review = await landedStoryReview(run, AbortSignal.timeout(30_000));
  if (review.kind !== "landed")
    throw new RefusedRequest(
      409,
      review.kind === "landing-unavailable"
        ? review.explanation
        : "The captured comparison is unavailable.",
    );
  if (
    file.baseline !== review.baseline ||
    file.tree !== review.tree ||
    !belongsOnLanded(review.files, file)
  )
    throw new RefusedRequest(
      409,
      "The file or comparison does not belong to this captured run.",
    );
  return {
    repository: run.record.landing?.repository ?? run.established.workspace,
    ...file,
  };
}

// Admit a historical file against a Published completion or landed run.
export async function admitHistoricalReviewedFile(
  named: HistoricalReviewedFileIdentity,
): Promise<AdmittedHistoricalReviewedFile> {
  const { source, identity, baseline, tree, path, oldPath } = named;
  const file: HistoricalReviewedFileFields = {
    baseline,
    tree,
    path,
    ...(oldPath === undefined ? {} : { oldPath }),
  };
  if (named.completion !== undefined)
    return admitPublishedCompletion(source, identity, named.completion, file);
  return admitLandedRun(source, identity, named.reference, file);
}
