// Shared review-read adapter: turns a typed wire or page read into the
// handler's ReviewInput, reading kept launch records for a session subject.
// Only this module reaches keptRecords / knownSource for those session paths.
import type { LaunchRecord } from "../src/agentLaunch.ts";
import type {
  PublishedSessionFileRead,
  ReviewedFileRead,
  SessionFileRead,
} from "../src/reviewedFileRead.ts";
import {
  isReviewedSessionSubject,
  type ReviewedSessionSubject,
  type ReviewedStorySubject,
} from "../src/reviewedWorkSubject.ts";
import type {
  PublishedSessionReviewRead,
  SessionReviewRead,
  StoryReviewRead,
} from "../src/storyReviewRead.ts";
import { launchSubject } from "../src/launchWorkflow.ts";
import { keptRecords } from "./launchRecordStore.ts";
import { RefusedRequest } from "./localOrigin.ts";
import type { PublishedSessionSource } from "./publishedSessionReview.ts";
import { fetchedPublishedSessionSource } from "./publishedSessionSource.ts";
import { admissionBound } from "./storyReviewHistoricalFileAdmission.ts";
import { knownSource, namedSessionRecord } from "./sessionAdmission.ts";

// What a session review reads: the launch records kept for the subject's
// project. Only the adapter reads the store for them.
export interface KeptSessionState {
  readonly records: readonly LaunchRecord[];
}

// A review handler's typed input: a story read on today's admission path, or a
// session read whose shape holds only what that session read uses, with the
// kept session state the adapter read.
export type ReviewInput<
  StoryR extends { readonly subject: ReviewedStorySubject },
  SessionR extends { readonly subject: ReviewedSessionSubject },
> =
  | { readonly read: StoryR }
  | {
      readonly read: SessionR;
      readonly kept: KeptSessionState;
    };

// A published session read with the configured project source it reads from.
export interface PublishedSessionInput<
  R extends PublishedSessionReviewRead | PublishedSessionFileRead,
> {
  readonly read: R;
  readonly published: PublishedSessionSource;
}

export type KeptStoryReviewInput = ReviewInput<
  StoryReviewRead & { readonly subject: ReviewedStorySubject },
  SessionReviewRead
>;
export type StoryReviewInput =
  KeptStoryReviewInput | PublishedSessionInput<PublishedSessionReviewRead>;

export type ReviewedFileInput =
  | ReviewInput<
      ReviewedFileRead & { readonly subject: ReviewedStorySubject },
      SessionFileRead
    >
  | PublishedSessionInput<PublishedSessionFileRead>;

// The kept launch record for a session subject among already-read kept state.
// Story-launch sessions are refused here so session review and file admission
// share one refusal.
export function keptSessionOf(
  kept: KeptSessionState,
  subject: ReviewedSessionSubject,
): LaunchRecord {
  const record = namedSessionRecord(kept.records, {
    host: subject.host,
    sessionId: subject.session,
  });
  if (launchSubject(record.request).identity !== undefined)
    throw new RefusedRequest(
      400,
      "This session belongs to a story launch and is reviewed by its story.",
    );
  return record;
}

// The adapters read a session's kept launch records, or a published session's
// fetched project source under the request's signal, on every request; an
// unknown source is refused here, before any record or Git is read. Session
// reads are narrowed to SessionReviewRead / SessionFileRead so story-only
// fields cannot reach the session handlers.
export async function reviewInput(
  read: StoryReviewRead | SessionReviewRead | PublishedSessionReviewRead,
  signal: AbortSignal,
): Promise<StoryReviewInput>;
export async function reviewInput(
  read: ReviewedFileRead | SessionFileRead | PublishedSessionFileRead,
  signal: AbortSignal,
): Promise<ReviewedFileInput>;
export async function reviewInput(
  read:
    | StoryReviewRead
    | SessionReviewRead
    | PublishedSessionReviewRead
    | ReviewedFileRead
    | SessionFileRead
    | PublishedSessionFileRead,
  signal: AbortSignal,
): Promise<StoryReviewInput | ReviewedFileInput> {
  if (isPublishedRead(read))
    return {
      read,
      published: await fetchedPublishedSessionSource(
        knownSource(read.subject.source),
        admissionBound(signal),
      ),
    };
  const { subject } = read;
  if (isReviewedSessionSubject(subject)) {
    const kept = {
      records: await keptRecords(knownSource(subject.source).id),
    };
    if ("baseline" in read) {
      return {
        read: {
          subject,
          ...(read.reference === undefined
            ? {}
            : { reference: read.reference }),
          baseline: read.baseline,
          tree: read.tree,
          path: read.path,
          ...(read.oldPath === undefined ? {} : { oldPath: read.oldPath }),
        },
        kept,
      };
    }
    return {
      read: {
        subject,
        ...(read.run === undefined ? {} : { run: read.run }),
      },
      kept,
    };
  }
  return { read: { ...read, subject } };
}

const isPublishedRead = (read: {
  readonly subject: object;
}): read is PublishedSessionReviewRead | PublishedSessionFileRead =>
  "published" in read.subject;
