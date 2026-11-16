// One field-based rule for a historical review file: a Published completion
// or a landed run's captured pair and literal file list. URL adapters and
// follow-up admission share this check; callers name source, a reviewed-work
// subject (story identity or session) and either completion or reference —
// never a repository path.
import { z } from "zod";
import type { PublishedSource } from "../src/publishedSource.ts";
import { establishedPlace } from "../src/establishedPlace.ts";
import type {
  ReviewedSessionSubject,
  ReviewedStorySubject,
} from "../src/reviewedWorkSubject.ts";
import type { ReviewedFile } from "../src/storyReviewFiles.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { namedKeptSession } from "./sessionAdmission.ts";
import { projectFolder } from "./projectFolders.ts";
import {
  reviewedLandedRunByReference,
  reviewedLandedRuns,
} from "./storyReviewRunAdmission.ts";
import { landedStoryReview } from "./storyReviewLanded.ts";
import { publishedStoryReview } from "./storyReviewPublished.ts";
import type { ReviewLandedRun } from "../src/storyReviewLandedRun.ts";

export interface HistoricalReviewedFileFields {
  readonly baseline: string;
  readonly tree: string;
  readonly path: string;
  readonly oldPath?: string;
}

export interface AdmittedHistoricalReviewedFile extends HistoricalReviewedFileFields {
  readonly repository: string;
}

type PublishedReviewedSubject<T extends { source: string }> = Omit<
  T,
  "source"
> & {
  readonly source: PublishedSource;
};

// Reviewed-work subject with a resolved project source for historical file reads.
export type HistoricalReviewedFileSubject =
  | PublishedReviewedSubject<ReviewedStorySubject>
  | PublishedReviewedSubject<ReviewedSessionSubject>;

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

function belongsOnLanded(
  files: readonly ReviewedFile[],
  fields: HistoricalReviewedFileFields,
): boolean {
  return files.some((file) => matchesHistoricalPath(file, fields));
}

const notOnCapturedRun = () =>
  new RefusedRequest(
    409,
    "The file or comparison does not belong to this captured run.",
  );

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

async function landedRunForSubject(
  subject: HistoricalReviewedFileSubject,
  reference: string,
): Promise<ReviewLandedRun> {
  if (!("session" in subject)) {
    const { runs } = await reviewedLandedRuns(subject.source, subject.identity);
    return reviewedLandedRunByReference(runs, reference);
  }
  if (!z.uuid().safeParse(reference).success)
    throw new RefusedRequest(400, "The review launch reference is malformed.");
  const record = await namedKeptSession(subject.source, {
    host: subject.host,
    sessionId: subject.session,
  });
  const established = establishedPlace(record);
  if (established === undefined)
    throw new RefusedRequest(
      404,
      "This session has no launch workspace to review.",
    );
  const owned =
    record.request.reporting?.reference === reference ||
    record.landing?.reference === reference;
  if (!owned) throw notOnCapturedRun();
  return { record, established };
}

async function admitLandedRun(
  subject: HistoricalReviewedFileSubject,
  reference: string,
  file: HistoricalReviewedFileFields,
): Promise<AdmittedHistoricalReviewedFile> {
  const run = await landedRunForSubject(subject, reference);
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
    throw notOnCapturedRun();
  return {
    repository: run.record.landing?.repository ?? run.established.workspace,
    ...file,
  };
}

// Admit a historical file against a Published completion or landed run.
export async function admitHistoricalReviewedFile(
  named: NamedHistoricalReviewedFile,
): Promise<AdmittedHistoricalReviewedFile> {
  const { source, baseline, tree, path, oldPath } = named;
  const file: HistoricalReviewedFileFields = {
    baseline,
    tree,
    path,
    ...(oldPath === undefined ? {} : { oldPath }),
  };
  if (named.completion !== undefined) {
    if ("session" in named)
      throw new RefusedRequest(
        400,
        "The published comparison identity is malformed.",
      );
    return admitPublishedCompletion(
      source,
      named.identity,
      named.completion,
      file,
    );
  }
  return admitLandedRun(named, named.reference, file);
}
