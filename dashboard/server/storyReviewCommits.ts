// A story review snapshot's commits (`./storyReviewSnapshot.ts`): the
// story's own first-parent line after its baseline, newest first, each with
// its tree and baseline and its first parent's, the points a commit range
// compares (`./storyReviewRange.ts`).

import type { ReviewCommit } from "../src/storyReview.ts";
import { runGit, type GitCall } from "./gitRunner.ts";

export async function storyCommits(
  baseline: string,
  head: string,
  // The fetched trunk, as `<remote>/<target>`.
  trunk: string,
  call: GitCall,
): Promise<ReviewCommit[]> {
  // What Git printed, as printed.
  const printed = async (args: readonly string[]) =>
    (await runGit(args, call)).stdout;
  const git = async (args: readonly string[]) => (await printed(args)).trim();
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
      git(["merge-base", revision, trunk]),
      git(["merge-base", parent, trunk]),
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
  return commits;
}
