// Published story commits are attributed once by their execution profiles.
// Live workspaces use their configured author; completed stories use recorded
// owners. Both comparisons subtract those commits through the same restatement
// rule, retaining an explicit baseline for inseparable paths.
import type { TakenStoryReview } from "../src/storyReviewContract.ts";
import { runGit, type GitCall } from "./gitRunner.ts";
import { restatedPoint } from "./storyReviewComparison.ts";
import {
  publishedStoryEvidence,
  type PublishedCommit,
  type ReviewedStory,
} from "./storyPublishedEvidence.ts";
export {
  namesExecutionClaim,
  type PublishedCommit,
  type ReviewedStory,
} from "./storyPublishedEvidence.ts";
export { completedStoryCommits } from "./storyCompletedCommits.ts";

// The story's published commits among those `trunk` holds, newest first:
// none when the worktree names no agent or the agent published nothing since
// the story's claim.
export async function publishedStoryCommits(
  story: ReviewedStory,
  // Where the worktree's head meets the fetched trunk.
  trunk: string,
  call: GitCall,
): Promise<PublishedCommit[]> {
  return (await publishedStoryEvidence(story, trunk, call)).commits;
}

// Trunk less the story's published commits: its tree, and each path Git
// could not separate from trunk's changes with the tree it is compared from
// instead, trunk as it was before the story's first change to that path.
export interface TrunkLess {
  readonly tree: string;
  readonly inseparable: ReadonlyMap<string, string>;
}

// What a snapshot answers of the published commits: taken out of `trunk`,
// kept in it when this machine's Git could not take them out, or nothing
// when the story has none.
export function publishedAnswer(
  published: readonly PublishedCommit[],
  trunk: string,
  less: TrunkLess | undefined,
): Pick<TakenStoryReview, "published"> {
  if (published.length === 0) return {};
  const taken = { trunk, commits: published.length };
  return {
    published: less === undefined ? { ...taken, kept: "not-restated" } : taken,
  };
}

// The tree of `trunk` with the published commits, newest first, taken out;
// undefined when this machine's Git cannot restate a tree.
export async function trunkLess(
  published: readonly PublishedCommit[],
  trunk: string,
  call: GitCall,
): Promise<TrunkLess | undefined> {
  const git = async (...args: string[]) => (await runGit(args, call)).stdout;
  const treeOf = async (revision: string) =>
    (await git("rev-parse", "--verify", `${revision}^{tree}`)).trim();
  let tree = await treeOf(trunk);
  const inseparable = new Map<string, string>();
  const pending = new Set<string>();
  for (const { commit, parent } of published) {
    const restated = await restatedPoint(
      { tree, baseline: commit },
      parent,
      call,
    );
    if (restated === undefined) return undefined;
    ({ tree } = restated);
    for (const file of restated.inseparable) pending.add(file);
    if (pending.size === 0) continue;
    // An older story commit that also changed the path moves its origin
    // back to that commit's parent.
    const names = ["diff-tree", "--no-commit-id", "-r", "--name-only", "-z"];
    const changed = new Set((await git(...names, commit)).split("\0"));
    const before = await treeOf(parent);
    for (const file of pending) {
      if (changed.has(file) || !inseparable.has(file)) {
        inseparable.set(file, before);
      }
    }
  }
  return { tree, inseparable };
}
