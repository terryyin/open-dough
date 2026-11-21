// One common literal file diff serves workspace and fixed historical comparisons.
// The same admission also answers revision-consistent file text at those trees.
// The handlers admit a typed read and answer under the caller's signal; the
// response adapters read a session's kept state and bound that signal.
import type { ServerResponse } from "node:http";
import {
  storyReviewWaitMs,
  type ReviewedFileDiff,
  type ReviewedFileText,
} from "../src/storyReviewContract.ts";
import { admitReviewedFile } from "./storyReviewAdmission.ts";
import type { AdmittedReviewedFileRead } from "./storyReviewFileRequest.ts";
import type { AgentLaunchAnswer } from "./agentLaunchResponse.ts";
import { gitProblem, runGit } from "./gitRunner.ts";
import { withResponseSignal } from "./responseSignal.ts";
import { reviewInput, type ReviewedFileInput } from "./storyReviewInput.ts";
import { textAtTree } from "./storyReviewFileText.ts";

const outputLimit = 64 * 1024 * 1024;

export async function storyReviewFileResponse(
  { read }: AdmittedReviewedFileRead,
  res: ServerResponse,
): Promise<AgentLaunchAnswer> {
  const body = await withResponseSignal(
    res,
    async (signal) => reviewedFileDiff(await reviewInput(read, signal), signal),
    storyReviewWaitMs,
  );
  return { status: 200, body };
}

export async function storyReviewFileTextResponse(
  { read }: AdmittedReviewedFileRead,
  res: ServerResponse,
): Promise<AgentLaunchAnswer> {
  const body = await withResponseSignal(
    res,
    async (signal) => reviewedFileText(await reviewInput(read, signal), signal),
    storyReviewWaitMs,
  );
  return { status: 200, body };
}

// The admitted file's diff within its comparison. A refusal the kept state
// or repository decides is thrown as `RefusedRequest` with its status.
export async function reviewedFileDiff(
  input: ReviewedFileInput,
  signal: AbortSignal,
): Promise<ReviewedFileDiff> {
  const {
    repository,
    baseline,
    tree,
    path: file,
    oldPath,
  } = await admitReviewedFile(input, signal);
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
      { cwd: repository, signal, maxBuffer: outputLimit },
    );
    return { kind: "diff", printed: stdout };
  } catch (error) {
    return {
      kind: "unavailable",
      explanation: `The file's diff could not be read: ${gitProblem(error)}`,
    };
  }
}

// File text at the same baseline/tree (and rename oldPath) the printed diff uses.
export async function reviewedFileText(
  input: ReviewedFileInput,
  signal: AbortSignal,
): Promise<ReviewedFileText> {
  const {
    repository,
    baseline,
    tree,
    path: file,
    oldPath,
  } = await admitReviewedFile(input, signal);
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
}
