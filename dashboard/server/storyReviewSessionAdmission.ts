// Standalone session review selects one retained result by its run key.
import { launchSubject } from "../src/launchWorkflow.ts";
import {
  sessionBranchRun,
  sessionDeliveryRun,
  type SessionComparisonKey,
} from "../src/sessionReviewComparisons.ts";
import { branchResultAtDone } from "../src/sessionBranchResult.ts";
import type { ReviewedSessionSubject } from "../src/reviewedWorkSubject.ts";
import type { StoryReview } from "../src/storyReviewContract.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { knownSource, namedKeptSession } from "./sessionAdmission.ts";
import { hasBranchReview } from "./sessionBranchCapture.ts";
import { branchResultReview } from "./storyReviewBranchResult.ts";
import { landedStoryReview } from "./storyReviewLanded.ts";
import {
  keptSessionRun,
  sessionCommitsReview,
  unavailableSessionChanges,
  unavailableSessionCommitsReview,
} from "./storyReviewSessionCommits.ts";

export type AdmittedSessionReview = {
  readonly kind: "story-review";
  readonly runs: readonly [];
  readonly readSession: (signal: AbortSignal) => Promise<StoryReview>;
};

// The kept session record admits the session subject and its named run key.
export async function admittedSessionReview(
  subject: ReviewedSessionSubject,
  named: string | undefined,
): Promise<AdmittedSessionReview> {
  const source = knownSource(subject.source);
  const record = await namedKeptSession(source, {
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
