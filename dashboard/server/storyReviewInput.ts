// Shared review-read adapter: turns a typed wire or page read into the
// handler's ReviewInput, admitting the named kept launch for a session read.
import { isSessionId } from "../../Distribution/src/skills/dough-execute-plan/scripts/session-record.mjs";
import type { PublishedSource } from "../src/publishedSource.ts";
import type { LaunchRecord } from "../src/agentLaunch.ts";
import type {
  PublishedSessionFileRead,
  ReviewedFileRead,
  SessionFileRead,
} from "../src/reviewedFileRead.ts";
import {
  isReviewedPublishedSessionSubject,
  isReviewedSessionSubject,
  isReviewedStorySubject,
  type ReviewedSessionSubject,
  type ReviewedStorySubject,
  type ReviewedWorkSubject,
} from "../src/reviewedWorkSubject.ts";
import type {
  PublishedSessionReviewRead,
  SessionReviewRead,
  StoryReviewRead,
} from "../src/storyReviewRead.ts";
import { launchSubject } from "../src/launchWorkflow.ts";
import { RefusedRequest } from "./localOrigin.ts";
import {
  publishedSessionRecord,
  type PublishedSessionSource,
} from "./publishedSessionReview.ts";
import { fetchedPublishedSessionSource } from "./publishedSessionSource.ts";
import { knownSource, namedKeptSession } from "./sessionAdmission.ts";
import { admissionBound } from "./storyReviewHistoricalFileAdmission.ts";

// The story path keeps its read. A session read carries the admitted record
// and the comparison or file fields its handler needs.
export type ReviewInput<
  StoryR extends { readonly subject: ReviewedStorySubject },
  SessionR extends { readonly subject: ReviewedSessionSubject },
> =
  | { readonly read: StoryR }
  | {
      readonly read: Omit<SessionR, "subject">;
      readonly record: LaunchRecord;
      readonly source: PublishedSource;
    };

// A published session read with the configured project source it reads from
// and the time its record's window is judged at.
export interface PublishedSessionInput<
  R extends PublishedSessionReviewRead | PublishedSessionFileRead,
> {
  readonly read: R;
  readonly published: PublishedSessionSource;
  readonly now: Date;
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

// Resolve the session once at the shared comparison and file boundary.
async function admitReviewSession(
  source: PublishedSource,
  subject: ReviewedSessionSubject,
): Promise<LaunchRecord> {
  const record = await namedKeptSession(source, {
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
// project source under the request's signal, on every request (fetching only
// when the last fetched trunk lacks the ref or UUID); an unknown source is
// refused here, before any record or Git is read. Session reads are narrowed
// to SessionReviewRead / SessionFileRead so story-only fields cannot reach the
// session handlers.
export async function reviewInput(
  read: ReviewedFileRead | SessionFileRead | PublishedSessionFileRead,
  signal: AbortSignal,
): Promise<ReviewedFileInput>;
export async function reviewInput(
  read: StoryReviewRead | SessionReviewRead | PublishedSessionReviewRead,
  signal: AbortSignal,
): Promise<StoryReviewInput>;
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
  const now = new Date();
  if (isPublishedRead(read)) {
    const source = knownSource(read.subject.source);
    return {
      read,
      published: await publishedSource(source, read.subject.published, signal),
      now,
    };
  }
  const { subject } = read;
  if (isReviewedSessionSubject(subject)) {
    const source = knownSource(subject.source);
    const record = await admitReviewSession(source, subject);
    const published = record.request.reporting?.reference;
    if (published !== undefined && isSessionId(published)) {
      try {
        const project = await publishedSource(source, published, signal);
        await publishedSessionRecord(project, published, now, signal);
        if ("reference" in read)
          throw new RefusedRequest(409, "Choose a recorded published range.");
        return {
          read: { ...read, subject: { source: subject.source, published } },
          published: project,
          now,
        };
      } catch (error) {
        signal.throwIfAborted();
        if (!(error instanceof RefusedRequest) || error.status !== 404)
          throw error;
      }
    }
    if ("baseline" in read) {
      return {
        read: {
          ...(read.reference === undefined
            ? {}
            : { reference: read.reference }),
          baseline: read.baseline,
          tree: read.tree,
          path: read.path,
          ...(read.oldPath === undefined ? {} : { oldPath: read.oldPath }),
        },
        record,
        source,
      };
    }
    return {
      read: {
        ...(read.run === undefined ? {} : { run: read.run }),
      },
      record,
      source,
    };
  }
  // Published and session subjects were answered above; only a story remains.
  if (!isReviewedStorySubject(subject))
    throw new RefusedRequest(400, "The review request is malformed.");
  return { read: { ...read, subject } };
}

const isPublishedRead = (read: {
  readonly subject: ReviewedWorkSubject;
}): read is PublishedSessionReviewRead | PublishedSessionFileRead =>
  isReviewedPublishedSessionSubject(read.subject);

function publishedSource(
  source: PublishedSource,
  session: string,
  signal: AbortSignal,
) {
  return fetchedPublishedSessionSource(source, session, {
    admission: () => admissionBound(signal),
    fetch: () => admissionBound(signal),
  });
}
