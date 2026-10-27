// Takes a story review's snapshot (`../src/storyReviewContract.ts`) of one workspace
// the launch boundary resolved from its kept records or local Git: fetches
// its trunk target, takes the review baseline as the merge-base of the
// workspace's head and the fetched `<remote>/<target>`, or, for a Trunk
// Mode story whose agent already published commits there, as that revision's
// tree with those commits taken out (`./storyPublishedCommits.ts`), writes the
// workspace's files -- commits, staged, unstaged, and untracked, never
// ignored -- into a tree object through a temporary index, and lists what
// changed from the baseline to that tree with each file's line counts
// (`./storyReviewFiles.ts`), a file Git could not separate from trunk's
// changes from its own tree instead. The workspace's own index and
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
// A snapshot holding uncommitted changes also answers its committed work
// alone: the files from the baseline to the head's tree.
// A file diff of the snapshot is Git's unified diff of that file from its
// *from* tree in the comparison shown -- the baseline, the restated, or the
// marked tree -- to the snapshot's tree, detecting a rename against its old
// path.

import {
  publishedAnswer,
  publishedStoryCommits,
  trunkLess,
  type ReviewedStory,
} from "./storyPublishedCommits.ts";
import { mkdtemp, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { ReviewMark, StoryReview } from "../src/storyReviewContract.ts";
import type { ReviewedWorkspace } from "../src/storyReviewWorkspace.ts";
import { gitProblem, runGit, type GitCall } from "./gitRunner.ts";
import { directoryState } from "./sessionWorkspace.ts";
import { storyCommits } from "./storyReviewCommits.ts";
import { compareReviewPoints, listedFrom } from "./storyReviewComparison.ts";

const outputLimit = 64 * 1024 * 1024;

export async function storyReviewSnapshot(
  reviewed: ReviewedWorkspace,
  story: ReviewedStory,
  // The workspace as the page shows it.
  shown: string,
  mark: ReviewMark | undefined,
  signal: AbortSignal,
): Promise<StoryReview> {
  const { workspace, branch, remote, target } = reviewed;
  const call: GitCall = { cwd: workspace, signal, maxBuffer: outputLimit };
  const git = async (
    args: readonly string[],
    env?: Readonly<Record<string, string>>,
  ) =>
    (
      await runGit(args, env === undefined ? call : { ...call, env })
    ).stdout.trim();
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
    const trunk = await git(["merge-base", "HEAD", `${remote}/${target}`]);
    // Trunk less the story's published commits, when it has some and this
    // machine's Git can take them out; else they stay in the baseline.
    const published = await publishedStoryCommits(story, trunk, call);
    const less =
      published.length === 0
        ? undefined
        : await trunkLess(published, trunk, call);
    const baseline = less?.tree ?? trunk;
    // The files from the baseline; one Git cannot separate from trunk's
    // changes is listed from where the story first changed it.
    const changed = (to: string) =>
      listedFrom(baseline, to, less?.inseparable ?? new Map(), trunk, call);
    const temporaryIndex = { GIT_INDEX_FILE: path.join(index, "index") };
    await git(["read-tree", "HEAD"], temporaryIndex);
    await git(["add", "--all"], temporaryIndex);
    const tree = await git(["write-tree"], temporaryIndex);
    // The worktree's own commits and uncommitted changes keep trunk's
    // revision as their points.
    const commits = await storyCommits(
      trunk,
      head,
      `${remote}/${target}`,
      call,
    );
    const headTree = await git(["rev-parse", `${head}^{tree}`]);
    const files = await changed(tree);
    // The committed work alone, when the snapshot holds more than it.
    const committed =
      tree === headTree
        ? undefined
        : { from: baseline, tree: headTree, files: await changed(headTree) };
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
      ...publishedAnswer(published, trunk, less),
      head,
      tree,
      files,
      commits,
      ...(committed === undefined
        ? {}
        : {
            committed,
            uncommitted: {
              kind: "uncommitted",
              tree,
              baseline: trunk,
              fromTree: headTree,
              fromBaseline: trunk,
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
