// The comparison of two points the snapshot's commit list supplied. The
// workspace comes from the admitted story, never from a caller's path.
import type { ServerResponse } from "node:http";
import type { ReviewRange } from "../src/storyReview.ts";
import type { AgentLaunchAnswer } from "./agentLaunchResponse.ts";
import { gitProblem, runGit, type GitCall } from "./gitRunner.ts";
import { withResponseSignal } from "./responseSignal.ts";
import type { AdmittedReviewRange } from "./storyReviewAdmission.ts";
import { compareReviewPoints } from "./storyReviewComparison.ts";
import { reviewPointObjects } from "./storyReviewPoints.ts";

export async function storyReviewRangeResponse(
  {
    established,
    fromTree,
    fromBaseline,
    tree,
    baseline,
    integrations,
  }: AdmittedReviewRange,
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
          trunkIntegrated: fromBaseline !== baseline,
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
