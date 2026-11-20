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
  type ReviewedWorkSubject,
} from "../src/reviewedWorkSubject.ts";
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

// A review handler's typed input: a story read, which today's admission path
// admits, or a session read with the kept session state the adapter read.
export type ReviewInput<R extends { readonly subject: ReviewedWorkSubject }> =
  | { readonly read: R & { readonly subject: ReviewedStorySubject } }
  | {
      readonly read: R & { readonly subject: ReviewedSessionSubject };
      readonly kept: KeptSessionState;
    };

// The adapters read a session's kept launch records on every request; an
// unknown source is refused here, before any record is read.
export async function reviewInput<
  R extends { readonly subject: ReviewedWorkSubject },
>(read: R): Promise<ReviewInput<R>> {
  const subject: ReviewedWorkSubject = read.subject;
  if (!isReviewedSessionSubject(subject)) return { read: { ...read, subject } };
  const source = knownSource(subject.source);
  return {
    read: { ...read, subject },
    kept: { records: await keptRecords(source.id) },
  };
}

export type AdmittedSessionReview = {
  readonly kind: "story-review";
  readonly runs: readonly [];
  readonly readSession: (signal: AbortSignal) => Promise<StoryReview>;
};

// The kept record a session review or file read addresses; a story launch's
// session is refused toward its story before any comparison is chosen.
export function reviewedSessionRecord(
  subject: ReviewedSessionSubject,
  kept: KeptSessionState,
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

// The kept session record admits the session subject and its named run key.
export function admittedSessionReview(
  subject: ReviewedSessionSubject,
  named: string | undefined,
  kept: KeptSessionState,
): AdmittedSessionReview {
  const record = reviewedSessionRecord(subject, kept);

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
