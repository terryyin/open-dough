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
import {
  publishedAnswer,
  trunkLess,
  type ReviewedStory,
} from "./storyPublishedCommits.ts";
import { realpath } from "node:fs/promises";
import type {
  ReviewComparison,
  StoryReview,
} from "../src/storyReviewContract.ts";
import type { ReviewedWorkspace } from "../src/storyReviewWorkspace.ts";
import { reviewIntegrations } from "../src/storyReviewPoints.ts";
import { gitProblem, runGit, type GitCall } from "./gitRunner.ts";
import { fetchGitTarget } from "./gitTargetFetch.ts";
import { directoryState } from "./sessionWorkspace.ts";
import { storyCommits } from "./storyReviewCommits.ts";
import {
  compareOriginalTrees,
  compareReviewPoints,
  listedFrom,
} from "./storyReviewComparison.ts";
import { publishedStoryHistory } from "./publishedStoryHistory.ts";
import { publishedStoryEvidence } from "./storyPublishedEvidence.ts";
import { storyReviewBranchStart } from "./storyReviewBranchStart.ts";
import { writeWorkingTree } from "./workingTreeSnapshot.ts";

const outputLimit = 64 * 1024 * 1024;

export async function storyReviewSnapshot(
  reviewed: ReviewedWorkspace,
  story: ReviewedStory,
  // The workspace as the page shows it.
  shown: string,
  signal: AbortSignal,
): Promise<StoryReview> {
  const { workspace, branch, remote, target } = reviewed;
  const call: GitCall = { cwd: workspace, signal, maxBuffer: outputLimit };
  const git = async (args: readonly string[]) =>
    (await runGit(args, call)).stdout.trim();
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
    await fetchGitTarget(remote, target, { ...call, signal });
  } catch (error) {
    return unavailable(
      `Trunk could not be fetched (target ${target} from remote ${remote}), so there is no baseline to compare with: ${gitProblem(error)}`,
    );
  }
  try {
    const head = await git(["rev-parse", "--verify", "HEAD"]);
    const trunk = await git(["merge-base", head, `${remote}/${target}`]);
    // Trunk less the story's published commits, when it has some and this
    // machine's Git can take them out; else they stay in the baseline.
    const history = publishedStoryHistory(call);
    const evidence = await publishedStoryEvidence(story, trunk, history);
    const published = evidence.commits;
    const less =
      published.length === 0
        ? undefined
        : await trunkLess(published, trunk, call);
    const storyStart = await storyReviewBranchStart({
      reviewed,
      story,
      head,
      trunk,
      evidence,
      history,
      call,
    });
    const attributionUnavailable = () =>
      unavailable(
        "This machine's Git cannot separate the story branch's changes from the trunk changes integrated into it.",
      );
    if (storyStart !== undefined && published.length > 0 && less === undefined)
      return attributionUnavailable();
    const tree = await writeWorkingTree(head, call);
    // The worktree's own commits and uncommitted changes keep trunk's
    // revision as their points.
    const commits = await storyCommits(
      trunk,
      head,
      `${remote}/${target}`,
      call,
    );
    const headTree = await git(["rev-parse", `${head}^{tree}`]);
    const integrations = reviewIntegrations(commits);
    const compare = async (to: string) => {
      let branch: ReviewComparison | undefined;
      if (storyStart !== undefined) {
        const attributed = await compareReviewPoints(
          { tree: storyStart, baseline: storyStart },
          { tree: to, baseline: trunk },
          call,
          integrations,
        );
        if (attributed.kind === "uncomparable") return undefined;
        branch = attributed.comparison;
      }
      const from = less?.tree ?? branch?.from ?? trunk;
      const mixed = new Map(less?.inseparable);
      for (const file of branch?.files ?? []) {
        if (file.includesTrunkFrom !== undefined)
          mixed.set(file.path, file.includesTrunkFrom);
      }
      return {
        from,
        tree: to,
        files:
          branch !== undefined && less === undefined
            ? branch.files
            : await listedFrom(from, to, mixed, trunk, call),
        ...(storyStart === undefined
          ? {}
          : {
              withMerged: await compareOriginalTrees(storyStart, to, call),
            }),
      };
    };
    const current = await compare(tree);
    const committed = tree === headTree ? undefined : await compare(headTree);
    if (current === undefined || (tree !== headTree && committed === undefined))
      return attributionUnavailable();
    const { from: baseline, files, withMerged } = current;
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
      ...(withMerged !== undefined
        ? { withMerged }
        : reviewed.mode === "story-branch" &&
            reviewed.publishedSha !== undefined
          ? {
              mergedChangesUnavailable:
                "The story branch's recorded start could not be recovered.",
            }
          : {}),
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
    };
  } catch (error) {
    return unavailable(
      `The workspace's changes could not be read: ${gitProblem(error)}`,
    );
  }
}
