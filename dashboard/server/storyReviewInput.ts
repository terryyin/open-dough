// Review adapts a story read or a named session of that story.
import type { PublishedSource } from "../src/publishedSource.ts";
import type {
  PublishedSessionFileRead,
  ReviewedFileRead,
} from "../src/reviewedFileRead.ts";
import { isReviewedPublishedSessionSubject } from "../src/reviewedWorkSubject.ts";
import type {
  PublishedSessionReviewRead,
  StoryReviewRead,
} from "../src/storyReviewRead.ts";
import type { ReviewSyncFailure } from "../src/storyReviewContract.ts";
import type { PublishedSessionSource } from "./publishedSessionReview.ts";
import {
  fetchedPublishedSessionSource,
  lastSyncedPublishedSessionSource,
} from "./publishedSessionSource.ts";
import { ReviewSyncDeadline, ReviewSyncFailed } from "./reviewRepository.ts";
import { knownSource } from "./sessionAdmission.ts";
import { admissionBound } from "./storyReviewHistoricalFileAdmission.ts";

interface PublishedSessionInput<R> {
  readonly read: R;
  readonly published: PublishedSessionSource;
  readonly now: Date;
}

export type StoryReviewInput =
  | { readonly read: StoryReviewRead }
  | PublishedSessionInput<PublishedSessionReviewRead>
  | {
      readonly read: PublishedSessionReviewRead;
      readonly syncFailed: ReviewSyncFailure;
    };

export type ReviewedFileInput =
  | { readonly read: ReviewedFileRead }
  | PublishedSessionInput<PublishedSessionFileRead>;

export const openSyncDeadline = (read: StoryReviewRead | ReviewedFileRead) =>
  isReviewedPublishedSessionSubject(read.subject)
    ? ReviewSyncDeadline.forSession()
    : new ReviewSyncDeadline();

export async function reviewInput(
  read: ReviewedFileRead,
  signal: AbortSignal,
): Promise<ReviewedFileInput>;
export async function reviewInput(
  read: StoryReviewRead,
  signal: AbortSignal,
  syncDeadline?: ReviewSyncDeadline,
): Promise<StoryReviewInput>;
export async function reviewInput(
  read: StoryReviewRead | ReviewedFileRead,
  signal: AbortSignal,
  syncDeadline = openSyncDeadline(read),
): Promise<StoryReviewInput | ReviewedFileInput> {
  const { subject } = read;
  if (!isReviewedPublishedSessionSubject(subject)) return { read };
  const source = knownSource(subject.source);
  const now = new Date();
  const admission = () => admissionBound(signal);
  if ("path" in read)
    return {
      read: { ...read, subject },
      published: await lastSyncedPublishedSessionSource(source, admission()),
      now,
    };
  try {
    return {
      read: { ...read, subject },
      published: await publishedSource(
        source,
        subject.published,
        signal,
        syncDeadline,
      ),
      now,
    };
  } catch (error) {
    if (!(error instanceof ReviewSyncFailed)) throw error;
    return { read: { ...read, subject }, syncFailed: error.failure };
  }
}

function publishedSource(
  source: PublishedSource,
  session: string,
  request: AbortSignal,
  syncDeadline: ReviewSyncDeadline,
) {
  return fetchedPublishedSessionSource(source, session, {
    admission: () => admissionBound(request),
    request,
    syncDeadline,
  });
}
