// Shared review-read adapter: turns a typed wire or page read into the
// handler's ReviewInput, admitting the named kept launch for a session read.
import type { LaunchRecord } from "../src/agentLaunch.ts";
import type {
  ReviewedFileRead,
  SessionFileRead,
} from "../src/reviewedFileRead.ts";
import {
  isReviewedSessionSubject,
  type ReviewedSessionSubject,
  type ReviewedStorySubject,
} from "../src/reviewedWorkSubject.ts";
import type {
  SessionReviewRead,
  StoryReviewRead,
} from "../src/storyReviewRead.ts";
import { launchSubject } from "../src/launchWorkflow.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { knownSource, namedKeptSession } from "./sessionAdmission.ts";

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
    };

export type StoryReviewInput = ReviewInput<
  StoryReviewRead & { readonly subject: ReviewedStorySubject },
  SessionReviewRead
>;

export type ReviewedFileInput = ReviewInput<
  ReviewedFileRead & { readonly subject: ReviewedStorySubject },
  SessionFileRead
>;

// Resolve the session once at the shared comparison and file boundary.
async function admitReviewSession(
  subject: ReviewedSessionSubject,
): Promise<LaunchRecord> {
  const record = await namedKeptSession(knownSource(subject.source), {
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

export async function reviewInput(
  read: StoryReviewRead | SessionReviewRead,
): Promise<StoryReviewInput>;
export async function reviewInput(
  read: ReviewedFileRead | SessionFileRead,
): Promise<ReviewedFileInput>;
export async function reviewInput(
  read:
    StoryReviewRead | SessionReviewRead | ReviewedFileRead | SessionFileRead,
): Promise<StoryReviewInput | ReviewedFileInput> {
  const { subject } = read;
  if (isReviewedSessionSubject(subject)) {
    const record = await admitReviewSession(subject);
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
      };
    }
    return {
      read: {
        ...(read.run === undefined ? {} : { run: read.run }),
      },
      record,
    };
  }
  return { read: { ...read, subject } };
}
