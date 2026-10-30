// One common literal file diff serves workspace and fixed historical comparisons.
// The same admission also answers revision-consistent file text at those trees.
import type { ServerResponse } from "node:http";
import type {
  ReviewedFileDiff,
  ReviewedFileText,
} from "../src/storyReviewContract.ts";
import type { AdmittedReviewedFile } from "./storyReviewAdmission.ts";
import type { AgentLaunchAnswer } from "./agentLaunchResponse.ts";
import { gitProblem, runGit } from "./gitRunner.ts";
import { withResponseSignal } from "./responseSignal.ts";
const outputLimit = 64 * 1024 * 1024;
const reviewWaitMs = 60_000;

type SideRead =
  | { readonly kind: "absent" }
  | { readonly kind: "text"; readonly text: string }
  | { readonly kind: "unavailable"; readonly explanation: string };

// Text of one path at one tree object, or why that side cannot supply text.
async function textAtTree(
  repository: string,
  tree: string,
  filePath: string,
  signal: AbortSignal,
): Promise<SideRead> {
  try {
    const { stdout: listed } = await runGit(
      ["ls-tree", "-z", tree, "--", filePath],
      { cwd: repository, signal, maxBuffer: outputLimit },
    );
    if (listed === "") return { kind: "absent" };
    const entry = /^(\d+) (\S+) ([0-9a-f]+)\t/.exec(listed);
    if (entry === null)
      return {
        kind: "unavailable",
        explanation:
          "The file's text could not be read: unexpected tree entry.",
      };
    const type = entry[2];
    const object = entry[3];
    if (type === undefined || object === undefined)
      return {
        kind: "unavailable",
        explanation:
          "The file's text could not be read: unexpected tree entry.",
      };
    if (type !== "blob")
      return {
        kind: "unavailable",
        explanation: "The path is not a file at that revision.",
      };
    const { stdout } = await runGit(["cat-file", "blob", object], {
      cwd: repository,
      signal,
      maxBuffer: outputLimit,
    });
    if (stdout.includes("\0"))
      return {
        kind: "unavailable",
        explanation: "The file has no textual content at that revision.",
      };
    return { kind: "text", text: stdout };
  } catch (error) {
    return {
      kind: "unavailable",
      explanation: `The file's text could not be read: ${gitProblem(error)}`,
    };
  }
}

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
      reviewWaitMs,
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
      reviewWaitMs,
    ),
  };
}
