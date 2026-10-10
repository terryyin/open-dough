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
// A snapshot answers the story's mark (`./storyReviewMarks.ts`) with it,
// and the same snapshot compared with the marked tree restated on the
// baseline (`./storyReviewComparison.ts`): the changes since the review,
// leaving out what came only from trunk, each file's line counts read from
// the same *from* tree as its kind and diff.
// A mark whose snapshot the repository no longer holds, or that this
// machine's Git cannot restate on the baseline, cannot be compared: the
// answer says why beside all changes.
// A file diff of the snapshot is Git's unified diff of that file from its
// *from* tree in the comparison shown -- the baseline, the restated, or the
// marked tree -- to the snapshot's tree, detecting a rename against its old
// path.

import { landedStoryReview } from "./storyReviewLanded.ts";
import { mkdtemp, realpath, rm } from "node:fs/promises";
import type { ServerResponse } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import type { EstablishedContext } from "../src/launchRecord.ts";
import type {
  ReviewCommit,
  ReviewMark,
  StoryReview,
} from "../src/storyReview.ts";
import type { AgentLaunchAnswer } from "./agentLaunchResponse.ts";
import { gitProblem, runGit, type GitCall } from "./gitRunner.ts";
import { withResponseSignal } from "./responseSignal.ts";
import { directoryState } from "./sessionWorkspace.ts";
import { changedFrom } from "./storyReviewFiles.ts";
import { reviewMark } from "./storyReviewMarks.ts";
import { compareReviewPoints } from "./storyReviewComparison.ts";
import type { AdmittedReview } from "./storyReviewAdmission.ts";

const outputLimit = 64 * 1024 * 1024;

// How long a story review's snapshot, trunk's fetch included, may take.
const reviewWaitMs = 60_000;

// The admitted review's snapshot, abandoned when the caller leaves or its
// bounded wait expires.
export async function storyReviewResponse(
  request: AdmittedReview,
  res: ServerResponse,
): Promise<AgentLaunchAnswer> {
  if ("run" in request)
    return {
      status: 200,
      body: await withResponseSignal(
        res,
        (signal) => landedStoryReview(request.run, signal),
        reviewWaitMs,
      ),
    };
  const { sourceId, identity, established, shown } = request;
  const mark = await reviewMark(sourceId, identity);
  const body = await withResponseSignal(
    res,
    async (signal) => {
      const snapshot = await storyReviewSnapshot(
        established,
        shown,
        mark,
        signal,
      );
      return snapshot.kind === "unavailable" && request.fallback !== undefined
        ? landedStoryReview(request.fallback, signal)
        : snapshot;
    },
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
    if (
      (await realpath(await git(["rev-parse", "--show-toplevel"]))) !==
      (await realpath(workspace))
    )
      return unavailable(
        "The saved directory is no longer this launch's Git workspace.",
      );
  } catch (error) {
    return unavailable(
      `The workspace's changes could not be read: ${gitProblem(error)}`,
    );
  }
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
    // Excluding everything reachable from trunk keeps the story's own
    // first-parent line, including the commits before a trunk merge.
    const commitLog = await printed([
      "log",
      "--first-parent",
      "-z",
      "--format=%H%x00%h%x00%P%x00%cI%x00%s%x00%T",
      `${baseline}..${head}`,
    ]);
    const fields = commitLog.split("\0");
    const commits: ReviewCommit[] = [];
    for (let at = 0; at + 5 < fields.length; at += 6) {
      const [
        revision = "",
        shortRevision = "",
        parentList = "",
        committedAt = "",
        subject = "",
        commitTree = "",
      ] = fields.slice(at, at + 6);
      const parents = parentList.split(" ");
      const parent = parents[0] ?? "";
      const [commitBaseline, fromBaseline, fromTree] = await Promise.all([
        git(["merge-base", revision, `${remote}/${target}`]),
        git(["merge-base", parent, `${remote}/${target}`]),
        git(["rev-parse", `${parent}^{tree}`]),
      ]);
      commits.push({
        kind: "commit",
        revision,
        shortRevision,
        subject,
        committedAt,
        merge: parents.length > 1,
        tree: commitTree,
        baseline: commitBaseline,
        fromTree,
        fromBaseline,
      });
    }
    const headTree = await git(["rev-parse", `${head}^{tree}`]);
    const files = await changedFrom(baseline, tree, call);
    const comparison =
      mark === undefined
        ? undefined
        : await compareReviewPoints(mark, { tree, baseline }, call);
    const marked =
      mark === undefined || comparison === undefined
        ? {}
        : {
            mark,
            ...(comparison.kind === "comparison"
              ? { since: comparison.comparison }
              : { markUncomparable: comparison.reason }),
          };
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
      commits,
      ...(tree === headTree
        ? {}
        : {
            uncommitted: {
              kind: "uncommitted",
              tree,
              baseline,
              fromTree: headTree,
              fromBaseline: baseline,
            },
          }),
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

export { storyReviewFileResponse } from "./storyReviewFileResponse.ts";
