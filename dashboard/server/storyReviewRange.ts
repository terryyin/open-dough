// The comparison of two points the snapshot's commit list supplied. The
// workspace comes from the admitted story, never from a caller's path.
import type { ServerResponse } from "node:http";
import type { ReviewRange } from "../src/storyReview.ts";
import type { AgentLaunchAnswer } from "./agentLaunchResponse.ts";
import { gitProblem, runGit, type GitCall } from "./gitRunner.ts";
import { withResponseSignal } from "./responseSignal.ts";
import type { AdmittedReviewRange } from "./storyReviewAdmission.ts";
import { changedFrom } from "./storyReviewFiles.ts";
import { reviewPointObjects } from "./storyReviewPoints.ts";

export async function storyReviewRangeResponse(
  { established, fromTree, fromBaseline, tree, baseline }: AdmittedReviewRange,
  res: ServerResponse,
): Promise<AgentLaunchAnswer> {
  const body = await withResponseSignal(
    res,
    async (signal): Promise<ReviewRange> => {
      const call: GitCall = {
        cwd: established.workspace,
        signal,
        maxBuffer: 64 * 1024 * 1024,
      };
      try {
        for (const object of [
          ...reviewPointObjects({ tree: fromTree, baseline: fromBaseline }),
          ...reviewPointObjects({ tree, baseline }),
        ])
          await runGit(["rev-parse", "--verify", "--quiet", object], call);
        if (fromBaseline !== baseline)
          return {
            kind: "unavailable",
            explanation:
              "A commit range across a trunk integration is not available yet. Choose a commit that did not integrate trunk.",
          };
        return {
          kind: "comparison",
          from: fromTree,
          tree,
          trunkIntegrated: false,
          files: await changedFrom(fromTree, tree, call),
        };
      } catch (error) {
        return {
          kind: "unavailable",
          explanation: `The chosen commits could not be read: ${gitProblem(error)}`,
        };
      }
    },
    60_000,
  );
  return { status: 200, body };
}
