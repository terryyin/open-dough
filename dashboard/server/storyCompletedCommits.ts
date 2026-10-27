// A completion attributes every recorded owner and refuses merge-resolution
// gaps before returning the story's commits in published history order.
import {
  agentIdentity,
  agentNameOf,
  profileAgentName,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { objectIdSchema } from "../src/storyReviewContract.ts";
import { GitFailure, runGit, type GitCall } from "./gitRunner.ts";
import {
  publishedStoryEvidence,
  type PublishedCommit,
  type ReviewedStory,
} from "./storyPublishedEvidence.ts";

// Completion attribution uses the same author/profile rule as live review.
// Every historical owning agent uses that rule, including story takeovers.
// Merge resolutions need more evidence and remain explicit gaps.
export async function completedStoryCommits(
  story: ReviewedStory,
  completion: string,
  agent: string,
  call: GitCall,
): Promise<{ commits: PublishedCommit[] } | { explanation: string }> {
  const evidence = await publishedStoryEvidence(story, completion, call, agent);
  if (evidence.claims.length === 0 || evidence.commits.length === 0)
    return {
      explanation:
        "Published execution history does not establish a complete claim and its attributed commits for this completion.",
    };
  const escaped = story.identity.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const changedProfiles = (
    await runGit(
      [
        "log",
        "--full-history",
        "--format=",
        "--name-only",
        `-G${escaped}`,
        completion,
        "--",
        story.profileDirectory,
      ],
      call,
    )
  ).stdout
    .split("\n")
    .filter(Boolean);
  const expected = agentNameOf(agent);
  const commits = [...evidence.commits];
  const claims = [...evidence.claims];
  const owningMerges = new Set(evidence.merges);
  for (const file of new Set(changedProfiles)) {
    const name = profileAgentName(file.split("/").at(-1) ?? "");
    if (name === undefined || name === expected) continue;
    const other = await publishedStoryEvidence(
      story,
      completion,
      call,
      agentIdentity(name).agent,
    );
    if (other.commits.length > 0 && other.claims.length === 0)
      return {
        explanation:
          "Published execution history is missing an earlier agent's claim, so the complete story cannot be attributed safely.",
      };
    commits.push(...other.commits);
    claims.push(...other.claims);
    for (const merge of other.merges) owningMerges.add(merge);
  }
  // A merge resolution is not attributable by the single-parent author rule,
  // whoever authored the merge. Check merges after the execution claims,
  // including a completion integrated by a different publisher.
  const beforeClaims = await Promise.all(
    claims.map(async (claim) =>
      (await runGit(["rev-parse", `${claim}^`], call)).stdout.trim(),
    ),
  );
  const before =
    beforeClaims.length === 1
      ? (beforeClaims[0] ?? "")
      : (
          await runGit(["merge-base", "--octopus", ...beforeClaims], call)
        ).stdout.trim();
  const merges = (
    await runGit(
      ["rev-list", "--merges", "--parents", completion, `^${before}`],
      call,
    )
  ).stdout
    .trim()
    .split("\n")
    .filter(Boolean);
  let storyPaths: Set<string> | undefined;
  for (const line of merges) {
    const [merge = "", ...parents] = line.split(" ");
    if (parents.length !== 2)
      return {
        explanation:
          "Published execution history contains a merge whose story changes cannot be attributed safely.",
      };
    let automatic: string;
    try {
      automatic =
        (
          await runGit(["merge-tree", "--write-tree", ...parents], call)
        ).stdout.split("\n")[0] ?? "";
    } catch (error) {
      // A conflicted automatic merge still prints its tree first. That tree
      // identifies which paths the recorded resolution changed.
      automatic =
        error instanceof GitFailure ? (error.stdout.split("\n")[0] ?? "") : "";
    }
    if (!objectIdSchema.safeParse(automatic).success)
      return {
        explanation:
          "Published execution history contains a merge whose resolution evidence could not be read.",
      };
    const actual = (
      await runGit(["rev-parse", `${merge}^{tree}`], call)
    ).stdout.trim();
    if (automatic === actual) continue;
    if (owningMerges.has(merge) || merge === completion)
      return {
        explanation:
          "Published execution history contains merge resolutions whose story changes cannot be attributed safely.",
      };
    if (storyPaths === undefined) {
      const paths = await Promise.all(
        commits.map(async ({ parent, commit }) =>
          (
            await runGit(
              [
                "diff-tree",
                "--no-commit-id",
                "-r",
                "--name-only",
                "-z",
                parent,
                commit,
              ],
              call,
            )
          ).stdout
            .split("\0")
            .filter(Boolean),
        ),
      );
      storyPaths = new Set(paths.flat());
    }
    const resolved = (
      await runGit(["diff", "--name-only", "-z", automatic, actual], call)
    ).stdout.split("\0");
    const affectedPaths = storyPaths;
    if (resolved.some((file) => affectedPaths.has(file)))
      return {
        explanation:
          "Published execution history contains merge resolutions affecting this story's files whose changes cannot be attributed safely.",
      };
  }
  const byRevision = new Map(commits.map((commit) => [commit.commit, commit]));
  const ordered = (
    await runGit(["rev-list", "--topo-order", completion], call)
  ).stdout
    .trim()
    .split("\n");
  return {
    commits: ordered.flatMap((revision) => {
      const commit = byRevision.get(revision);
      return commit === undefined ? [] : [commit];
    }),
  };
}
