// Takes a story review's snapshot (`../src/storyReview.ts`) of one launch
// workspace the launch boundary resolved from its kept records: fetches the
// record's trunk target, takes the review baseline as the merge-base of the
// workspace's head and the fetched `<remote>/<target>`, writes the
// workspace's files -- commits, staged, unstaged, and untracked, never
// ignored -- into a tree object through a temporary index, and lists what
// changed from the baseline to that tree. The workspace's own index and
// status stay as they were; the tree is an ordinary unreachable object of
// its repository. A step Git cannot take answers why, never a partial list:
// a worktree no longer on disk is said to be missing before any Git runs,
// and a trunk that cannot be fetched names the remote and target, since
// there is no baseline without it.
// A snapshot answers the story's mark (`./storyReviewMarks.ts`) with it,
// and the same snapshot compared with the marked tree restated on the
// baseline (`./storyReviewSince.ts`): the changes since the review,
// leaving out what came only from trunk.
// A mark whose snapshot the repository no longer holds cannot be compared:
// the answer says so beside all changes.
// A file diff of the snapshot is Git's unified diff of that file from its
// *from* tree in the comparison shown -- the baseline, the restated, or the
// marked tree -- to the snapshot's tree, detecting a rename against its old
// path.

import { mkdtemp, rm } from "node:fs/promises";
import type { ServerResponse } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import type { EstablishedContext } from "../src/launchRecord.ts";
import type {
  ReviewedFile,
  ReviewedFileDiff,
  ReviewMark,
  StoryReview,
} from "../src/storyReview.ts";
import type { AgentLaunchAnswer } from "./agentLaunchResponse.ts";
import { gitProblem, runGit, type GitCall } from "./gitRunner.ts";
import { withResponseSignal } from "./responseSignal.ts";
import { directoryState } from "./sessionWorkspace.ts";
import { reviewMark } from "./storyReviewMarks.ts";
import { changesSinceReview } from "./storyReviewSince.ts";
import type {
  AdmittedFileDiff,
  AdmittedReview,
} from "./storyReviewAdmission.ts";

const outputLimit = 64 * 1024 * 1024;

// How long a story review's snapshot, trunk's fetch included, may take.
const reviewWaitMs = 60_000;

// The changed files `git diff --name-status -M -z` printed: a status field,
// then the path, or for a rename the old path and then the new one.
function reviewedFiles(nameStatus: string): ReviewedFile[] {
  const fields = nameStatus.split("\0");
  const files: ReviewedFile[] = [];
  let index = 0;
  while (index + 1 < fields.length) {
    const status = fields[index] ?? "";
    const first = fields[index + 1] ?? "";
    if (status.startsWith("R")) {
      files.push({
        kind: "renamed",
        oldPath: first,
        path: fields[index + 2] ?? "",
      });
      index += 3;
      continue;
    }
    files.push({
      kind: status === "A" ? "added" : status === "D" ? "deleted" : "modified",
      path: first,
    });
    index += 2;
  }
  return files;
}

// The admitted review's snapshot, abandoned when the caller leaves or its
// bounded wait expires.
export async function storyReviewResponse(
  { sourceId, identity, established, shown }: AdmittedReview,
  res: ServerResponse,
): Promise<AgentLaunchAnswer> {
  const mark = await reviewMark(sourceId, identity);
  const body = await withResponseSignal(
    res,
    (signal) => storyReviewSnapshot(established, shown, mark, signal),
    reviewWaitMs,
  );
  return { status: 200, body };
}

async function storyReviewSnapshot(
  established: EstablishedContext,
  // The workspace as the page shows it.
  shown: string,
  mark: ReviewMark | undefined,
  signal: AbortSignal,
): Promise<StoryReview> {
  const { workspace, branch, remote, target } = established;
  const call: GitCall = { cwd: workspace, signal, maxBuffer: outputLimit };
  // What Git printed, as printed.
  const printed = async (
    args: readonly string[],
    env?: Readonly<Record<string, string>>,
  ) => (await runGit(args, env === undefined ? call : { ...call, env })).stdout;
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
    // The files changed from one tree to the snapshot's, of the paths given
    // or of all.
    const changedFrom = async (from: string, paths: readonly string[] = []) =>
      reviewedFiles(
        await printed([
          "--literal-pathspecs",
          "diff",
          "--name-status",
          "-M",
          "-z",
          from,
          tree,
          "--",
          ...paths,
        ]),
      );
    const files = await changedFrom(baseline);
    const since =
      mark === undefined
        ? undefined
        : await changesSinceReview(mark, baseline, changedFrom, call);
    const marked =
      mark === undefined
        ? {}
        : since === undefined
          ? { mark, markUnreadable: true as const }
          : { mark, since };
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
      ...marked,
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
