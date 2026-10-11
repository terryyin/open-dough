import { runGit, type GitCall } from "./gitRunner.ts";

// A point the review compares or marks: its tree and the trunk baseline it
// was observed against, a commit on trunk or, for a Trunk Mode story with
// published commits, the tree of trunk less them
// (`./storyPublishedCommits.ts`). Marks and snapshot commit items supply
// these points.
export interface ReviewPoint {
  readonly tree: string;
  readonly baseline: string;
}

// The repository objects a point requires: a tree and a baseline commit, as
// every point of a commit range is, or, for a marked point, a baseline
// `tree`, which a baseline commit peels to.
export const reviewPointObjects = (
  { tree, baseline }: ReviewPoint,
  baselineType: "commit" | "tree" = "commit",
) => [`${tree}^{tree}`, `${baseline}^{${baselineType}}`];

// Whether trunk differs between two points: their baselines compared as
// trees, so a baseline tree equal to a baseline commit's is the same trunk.
export async function baselinesDiffer(
  from: ReviewPoint,
  to: ReviewPoint,
  call: GitCall,
) {
  const treeOf = async (baseline: string) =>
    (await runGit(["rev-parse", "--verify", `${baseline}^{tree}`], call))
      .stdout;
  return (
    from.baseline !== to.baseline &&
    (await treeOf(from.baseline)) !== (await treeOf(to.baseline))
  );
}
