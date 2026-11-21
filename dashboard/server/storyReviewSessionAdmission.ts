// Standalone session review selects one retained result by its run key.
import {
  sessionBranchRun,
  sessionDeliveryRun,
  type SessionComparisonKey,
} from "../src/sessionReviewComparisons.ts";
import {
  branchResultAtDone,
  hasBranchReview,
} from "../src/sessionBranchResult.ts";
import type { ReviewedSessionSubject } from "../src/reviewedWorkSubject.ts";
import type { StoryReview } from "../src/storyReviewContract.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { branchResultReview } from "./storyReviewBranchResult.ts";
import { keptSessionOf, type KeptSessionState } from "./storyReviewInput.ts";
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
export function admittedSessionReview(
  subject: ReviewedSessionSubject,
  named: string | undefined,
  kept: KeptSessionState,
): AdmittedSessionReview {
  const record = keptSessionOf(kept, subject);

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
