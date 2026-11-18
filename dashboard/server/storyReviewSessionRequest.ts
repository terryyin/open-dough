// Standalone session review selects one retained result by its run key.
import { launchSubject } from "../src/launchWorkflow.ts";
import {
  sessionBranchRun,
  sessionComparisonKeySchema,
  sessionDeliveryRun,
  type SessionComparisonKey,
} from "../src/sessionReviewComparisons.ts";
import { branchResultAtDone } from "../src/sessionBranchResult.ts";
import type { StoryReview } from "../src/storyReviewContract.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { queriedReviewedSessionSubject } from "./reviewedWorkSubjectAdmission.ts";
import { namedKeptSession, requireExactQuery } from "./sessionAdmission.ts";
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

export async function sessionReviewRequest(
  url: URL,
): Promise<AdmittedSessionReview> {
  const named = url.searchParams.get("run");
  requireExactQuery(
    url,
    ["source", "host", "session", ...(named === null ? [] : ["run"])],
    "review",
  );
  if (named !== null && !sessionComparisonKeySchema.safeParse(named).success)
    throw new RefusedRequest(400, "The review run is malformed.");

  const { source, host, session } = queriedReviewedSessionSubject(url);
  const record = await namedKeptSession(source, { host, sessionId: session });
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
      ...(selected !== undefined && (mixed || named !== null)
        ? { selectedRun: selected }
        : {}),
    }),
  };
}
