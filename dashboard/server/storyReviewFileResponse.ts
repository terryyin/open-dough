// One common literal file diff serves workspace and fixed historical comparisons.
import type { ServerResponse } from "node:http";
import type { ReviewedFileDiff } from "../src/storyReview.ts";
import type { AdmittedFileDiff } from "./storyReviewAdmission.ts";
import type { AgentLaunchAnswer } from "./agentLaunchResponse.ts";
import { gitProblem, runGit } from "./gitRunner.ts";
import { withResponseSignal } from "./responseSignal.ts";
const outputLimit = 64 * 1024 * 1024;
const reviewWaitMs = 60_000;
// The admitted file's diff within its snapshot, bounded and abandoned like
// the snapshot itself.
export async function storyReviewFileResponse(
  {
    established,
    repository,
    baseline,
    tree,
    path: file,
    oldPath,
  }: AdmittedFileDiff,
  res: ServerResponse,
): Promise<AgentLaunchAnswer> {
  return {
    status: 200,
    body: await withResponseSignal(
      res,
      async (signal): Promise<ReviewedFileDiff> => {
        try {
          const { stdout } = await runGit(
            [
              "--literal-pathspecs",
              "diff",
              "--no-color",
              "--no-ext-diff",
              "--no-textconv",
              "-M",
              baseline,
              tree,
              "--",
              ...(oldPath === undefined ? [] : [oldPath]),
              file,
            ],
            {
              cwd: repository ?? established.workspace,
              signal,
              maxBuffer: outputLimit,
            },
          );
          return { kind: "diff", printed: stdout };
        } catch (error) {
          return {
            kind: "unavailable",
            explanation: `The file's diff could not be read: ${gitProblem(error)}`,
          };
        }
      },
      reviewWaitMs,
    ),
  };
}
