// Takes a story review's snapshot (`../src/storyReview.ts`) of one launch
// workspace the launch boundary resolved from its kept records: fetches the
// record's trunk target, takes the review baseline as the merge-base of the
// workspace's head and the fetched `<remote>/<target>`, writes the
// workspace's files -- commits, staged, unstaged, and untracked, never
// ignored -- into a tree object through a temporary index, and lists what
// changed from the baseline to that tree with each file's line counts
// (`./storyReviewFiles.ts`). The workspace's own index and
// status stay as they were; the tree is an ordinary unreachable object of
// its repository. A step Git cannot take answers why, never a partial list:
// a worktree no longer on disk is said to be missing before any Git runs,
// and a trunk that cannot be fetched names the remote and target, since
// there is no baseline without it.
// A file diff of the snapshot is Git's unified diff of that file from the
// baseline to the tree, detecting a rename against its old path.

import { mkdtemp, rm } from "node:fs/promises";
import type { ServerResponse } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import type { EstablishedContext } from "../src/launchRecord.ts";
import type { ReviewedFileDiff, StoryReview } from "../src/storyReview.ts";
import type { AgentLaunchAnswer } from "./agentLaunchResponse.ts";
import { GitFailure, runGit } from "./gitRunner.ts";
import { withResponseSignal } from "./responseSignal.ts";
import { directoryState } from "./sessionWorkspace.ts";
import { reviewedFiles } from "./storyReviewFiles.ts";
import type {
  AdmittedFileDiff,
  AdmittedReview,
} from "./storyReviewAdmission.ts";

const outputLimit = 64 * 1024 * 1024;

// How long a story review's snapshot, trunk's fetch included, may take.
const reviewWaitMs = 60_000;

// The last line Git printed about a failure, or its own message.
function gitProblem(error: unknown): string {
  const said =
    error instanceof GitFailure
      ? error.stderr.trim().split("\n").at(-1)
      : undefined;
  return said !== undefined && said !== ""
    ? said
    : error instanceof Error
      ? error.message
      : String(error);
}

// The admitted review's snapshot, abandoned when the caller leaves or its
// bounded wait expires.
export async function storyReviewResponse(
  { established, shown }: AdmittedReview,
  res: ServerResponse,
): Promise<AgentLaunchAnswer> {
  return {
    status: 200,
    body: await withResponseSignal(
      res,
      (signal) => storyReviewSnapshot(established, shown, signal),
      reviewWaitMs,
    ),
  };
}

async function storyReviewSnapshot(
  established: EstablishedContext,
  // The workspace as the page shows it.
  shown: string,
  signal: AbortSignal,
): Promise<StoryReview> {
  const { workspace, branch, remote, target } = established;
  // What Git printed, as printed.
  const printed = async (
    args: readonly string[],
    env?: Readonly<Record<string, string>>,
  ) =>
    (
      await runGit(args, {
        cwd: workspace,
        signal,
        maxBuffer: outputLimit,
        ...(env === undefined ? {} : { env }),
      })
    ).stdout;
  const git = async (
    args: readonly string[],
    env?: Readonly<Record<string, string>>,
  ) => (await printed(args, env)).trim();
  const unavailable = (explanation: string): StoryReview => ({
    kind: "unavailable",
    workspace: shown,
    explanation,
  });
  if (directoryState(workspace).kind === "missing")
    return unavailable("The worktree is missing. It was removed or retired.");
  try {
    await git(["fetch", "--quiet", remote, target], {
      GIT_TERMINAL_PROMPT: "0",
    });
  } catch (error) {
    return unavailable(
      `Trunk could not be fetched (target ${target} from remote ${remote}), so there is no baseline to compare with: ${gitProblem(error)}`,
    );
  }
  const index = await mkdtemp(path.join(tmpdir(), "dough-review-"));
  try {
    const head = await git(["rev-parse", "--verify", "HEAD"]);
    const baseline = await git(["merge-base", "HEAD", `${remote}/${target}`]);
    const temporaryIndex = { GIT_INDEX_FILE: path.join(index, "index") };
    await git(["read-tree", "HEAD"], temporaryIndex);
    await git(["add", "--all"], temporaryIndex);
    const tree = await git(["write-tree"], temporaryIndex);
    // What changed from the baseline to the tree, as Git prints it.
    const changes = (format: string) =>
      printed(["diff", format, "-M", "-z", baseline, tree, "--"]);
    const files = reviewedFiles(
      await changes("--name-status"),
      await changes("--numstat"),
    );
    return {
      kind: "snapshot",
      workspace: shown,
      branch,
      remote,
      target,
      baseline,
      head,
      tree,
      files,
    };
  } catch (error) {
    return unavailable(
      `The workspace's changes could not be read: ${gitProblem(error)}`,
    );
  } finally {
    await rm(index, { recursive: true, force: true });
  }
}

// The admitted file's diff within its snapshot, bounded and abandoned like
// the snapshot itself.
export async function storyReviewFileResponse(
  { established, baseline, tree, path: file, oldPath }: AdmittedFileDiff,
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
            { cwd: established.workspace, signal, maxBuffer: outputLimit },
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
