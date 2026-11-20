// Standalone session review selects one retained result by its run key.
import { launchSubject } from "../src/launchWorkflow.ts";
import {
  sessionBranchRun,
  sessionDeliveryRun,
  type SessionComparisonKey,
} from "../src/sessionReviewComparisons.ts";
import { branchResultAtDone } from "../src/sessionBranchResult.ts";
import {
  isReviewedSessionSubject,
  type ReviewedSessionSubject,
  type ReviewedStorySubject,
} from "../src/reviewedWorkSubject.ts";
import type {
  ReviewedFileRead,
  SessionFileRead,
} from "../src/reviewedFileRead.ts";
import type {
  SessionReviewRead,
  StoryReviewRead,
} from "../src/storyReviewRead.ts";
import type { StoryReview } from "../src/storyReviewContract.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { knownSource, namedSessionRecord } from "./sessionAdmission.ts";
import { keptRecords } from "./launchRecordStore.ts";
import type { LaunchRecord } from "../src/agentLaunch.ts";
import { hasBranchReview } from "./sessionBranchCapture.ts";
import { branchResultReview } from "./storyReviewBranchResult.ts";
import { landedStoryReview } from "./storyReviewLanded.ts";
import {
  keptSessionRun,
  sessionCommitsReview,
  unavailableSessionChanges,
  unavailableSessionCommitsReview,
} from "./storyReviewSessionCommits.ts";

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

export type StoryReviewInput = ReviewInput<
  StoryReviewRead & { readonly subject: ReviewedStorySubject },
  SessionReviewRead
>;

export type ReviewedFileInput = ReviewInput<
  ReviewedFileRead & { readonly subject: ReviewedStorySubject },
  SessionFileRead
>;

// The adapters read a session's kept launch records on every request; an
// unknown source is refused here, before any record is read. Session reads are
// narrowed to SessionReviewRead / SessionFileRead so story-only fields cannot
// reach the session handlers.
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

export type AdmittedSessionReview = {
  readonly kind: "story-review";
  readonly runs: readonly [];
  readonly readSession: (signal: AbortSignal) => Promise<StoryReview>;
};

// The kept session record admits the session subject and its named run key.
export function admittedSessionReview(
  subject: ReviewedSessionSubject,
  named: string | undefined,
  kept: KeptSessionState,
): AdmittedSessionReview {
  const record = namedSessionRecord(kept.records, {
    host: subject.host,
    sessionId: subject.session,
  });
  if (launchSubject(record.request).identity !== undefined)
    throw new RefusedRequest(
      400,
      "This session belongs to a story launch and is reviewed by its story.",
    );

  const branch = branchResultAtDone(record);
  const firstRun = keptSessionRun(record);
  const choices: SessionComparisonKey[] = [];
  if (record.landing !== undefined) choices.push(sessionDeliveryRun);
  if (branch !== undefined) choices.push(sessionBranchRun);
  for (const key of firstRun?.runs.keys() ?? []) choices.push(String(key));
  const mixed =
    choices.length > 1 &&
    (branch !== undefined || record.landing !== undefined);
  const selected = named ?? choices[0];

  const read = async (signal: AbortSignal): Promise<StoryReview> => {
    if (selected === sessionDeliveryRun && record.landing !== undefined)
      return landedStoryReview({ record }, signal);
    if (selected === sessionBranchRun && branch !== undefined) {
      const review = await branchResultReview(branch, signal);
      return record.landing === undefined && branch.manualDeliveryChecked
        ? {
            ...review,
            deliveryGap:
              "Delivery to trunk is unverified. The recorded history does not establish a merge or exact fast-forward of this session's committed tip.",
          }
        : review;
    }
    const run =
      selected !== undefined &&
      selected !== sessionBranchRun &&
      selected !== sessionDeliveryRun
        ? keptSessionRun(record, Number(selected))
        : undefined;
    if (run !== undefined) return sessionCommitsReview(run, signal);
    if (named === sessionDeliveryRun || named === sessionBranchRun)
      throw new RefusedRequest(
        404,
        "This session kept no comparison at that key.",
      );
    if (hasBranchReview(record))
      return {
        kind: "unavailable",
        explanation: "This session's branch changes at Done were not captured.",
      };
    return unavailableSessionCommitsReview(unavailableSessionChanges(record));
  };

  return {
    kind: "story-review",
    runs: [],
    readSession: async (signal) => ({
      ...(await read(signal)),
      ...(mixed ? { sessionComparisonKeys: choices } : {}),
      ...(selected !== undefined && (mixed || named !== undefined)
        ? { selectedRun: selected }
        : {}),
    }),
  };
}
