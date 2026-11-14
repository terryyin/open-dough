// One common literal file diff serves workspace and fixed historical comparisons.
// The same admission also answers revision-consistent file text at those trees.
import type { ServerResponse } from "node:http";
import {
  storyReviewWaitMs,
  type ReviewedFileDiff,
  type ReviewedFileText,
} from "../src/storyReviewContract.ts";
import type { AdmittedReviewedFile } from "./storyReviewAdmission.ts";
import type { AgentLaunchAnswer } from "./agentLaunchResponse.ts";
import { gitProblem, runGit } from "./gitRunner.ts";
import { withResponseSignal } from "./responseSignal.ts";
import { textAtTree } from "./storyReviewFileText.ts";

const outputLimit = 64 * 1024 * 1024;

// The admitted file's diff within its snapshot, bounded and abandoned like
// the snapshot itself.
export async function storyReviewFileResponse(
  { repository, baseline, tree, path: file, oldPath }: AdmittedReviewedFile,
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
              cwd: repository,
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
      storyReviewWaitMs,
    ),
  };
}

// File text at the same baseline/tree (and rename oldPath) the printed diff uses.
export async function storyReviewFileTextResponse(
  { repository, baseline, tree, path: file, oldPath }: AdmittedReviewedFile,
  res: ServerResponse,
): Promise<AgentLaunchAnswer> {
  return {
    status: 200,
    body: await withResponseSignal(
      res,
      async (signal): Promise<ReviewedFileText> => {
        const atBaseline = await textAtTree(
          repository,
          baseline,
          oldPath ?? file,
          signal,
        );
        const atTree = await textAtTree(repository, tree, file, signal);
        if (atBaseline.kind === "unavailable")
          return { kind: "unavailable", explanation: atBaseline.explanation };
        if (atTree.kind === "unavailable")
          return { kind: "unavailable", explanation: atTree.explanation };
        return {
          kind: "text",
          baseline: atBaseline.kind === "text" ? atBaseline.text : null,
          tree: atTree.kind === "text" ? atTree.text : null,
        };
      },
      storyReviewWaitMs,
    ),
  };
}
