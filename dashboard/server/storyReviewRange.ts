// The comparison of two points the snapshot's commit list supplied. The
// workspace comes from the admitted story, never from a caller's path.
import type { ServerResponse } from "node:http";
import {
  storyReviewWaitMs,
  type ReviewRange,
} from "../src/storyReviewContract.ts";
import type { AgentLaunchAnswer } from "./agentLaunchResponse.ts";
import { gitProblem, runGit, type GitCall } from "./gitRunner.ts";
import { withResponseSignal } from "./responseSignal.ts";
import type { AdmittedStoryReviewRange } from "./storyReviewRangeRequest.ts";
import {
  compareOriginalTrees,
  compareReviewPoints,
} from "./storyReviewComparison.ts";
import { reviewPointObjects } from "./storyReviewPoints.ts";

export async function storyReviewRangeResponse(
  range: AdmittedStoryReviewRange,
  res: ServerResponse,
): Promise<AgentLaunchAnswer> {
  const body = await withResponseSignal(
    res,
    (signal) => storyReviewRange(range, signal),
    storyReviewWaitMs,
  );
  return { status: 200, body };
}

export async function storyReviewRange(
  {
    established,
    fromTree,
    fromBaseline,
    tree,
    baseline,
    integrations,
    withMerged,
  }: AdmittedStoryReviewRange,
  signal: AbortSignal,
): Promise<ReviewRange> {
  const call: GitCall = {
    cwd: established.workspace,
    signal,
    maxBuffer: 64 * 1024 * 1024,
  };
  try {
    for (const object of reviewPointObjects({ tree, baseline })) {
      await runGit(["rev-parse", "--verify", "--quiet", object], call);
    }
    const compared = await compareReviewPoints(
      { tree: fromTree, baseline: fromBaseline },
      { tree, baseline },
      call,
      integrations,
    );
    if (compared.kind === "uncomparable") {
      return {
        kind: "unavailable",
        explanation:
          compared.reason === "not-restated"
            ? "This machine's Git cannot leave out trunk's changes integrated within the chosen commits, so this range cannot be compared across them."
            : "The chosen commits can no longer be read, so this range cannot be compared.",
      };
    }
    return {
      kind: "comparison",
      ...compared.comparison,
      tree,
      // A range's points are commits, compared as the commits they are.
      trunkIntegrated: fromBaseline !== baseline,
      ...(withMerged === undefined
        ? {}
        : {
            withMerged: await compareOriginalTrees(fromTree, tree, call),
          }),
    };
  } catch (error) {
    return {
      kind: "unavailable",
      explanation: `The chosen commits could not be read: ${gitProblem(error)}`,
    };
  }
}
