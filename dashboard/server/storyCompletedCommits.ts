// A completion attributes every recorded owner and its owning merges' own
// edits, returning the story's commits in published history order.
// Claim evidence (without merge decomposition) is shared with endpoint
// recovery so CI comparison can name builds independently of Review.
import { agentNameOf } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { gitExitedOne, isAncestor, runGit, type GitCall } from "./gitRunner.ts";
import { mergeTreeOutput } from "./mergeTreeOutput.ts";
import { owningMergeEdits } from "./storyCompletedMergeEdits.ts";
import {
  publishedStoryEvidence,
  publishedStoryAgents,
  type PublishedCommit,
  type ReviewedStory,
} from "./storyPublishedEvidence.ts";

// Claim history for a completion: every owning agent's claims and commits,
// the story-start bound, and owning landing merges. No merge-resolution
// attribution — that stays in `completedStoryAttribution`.
export type CompletedStoryClaimEvidence = {
  readonly commits: PublishedCommit[];
  readonly claims: readonly string[];
  // Octopus base of the claims' parents: the story-start bound for CI
  // comparison baseline and result ancestor walks.
  readonly storyStart: string;
  // Owning landing merges recovered from published claim history.
  readonly owningMerges: ReadonlySet<string>;
};

// Completion attribution uses the same author/profile rule as live review.
// Every historical owning agent uses that rule, including story takeovers.
// `commits` also holds each owning merge's own edits, taken out against the
// merge tree without them; `resolutions` names genuine conflict paths with
// the tree they are compared from.
export type CompletedStoryEvidence = CompletedStoryClaimEvidence & {
  readonly resolutions: ReadonlyMap<string, string>;
};

// When `doneRecordAdded` names the commit that added the story's done record,
// claims count only as its ancestors: a later claim cannot take over a
// finished story's recovery.
export async function completedStoryClaimEvidence(
  story: ReviewedStory,
  completion: string,
  agent: string,
  call: GitCall,
  doneRecordAdded?: string,
): Promise<CompletedStoryClaimEvidence | { explanation: string }> {
  const evidenceOf = async (owner: string) => {
    const found = await publishedStoryEvidence(story, completion, call, owner);
    if (doneRecordAdded === undefined) return found;
    const claims: string[] = [];
    for (const claim of found.claims)
      if (await isAncestor(claim, doneRecordAdded, call)) claims.push(claim);
    return { ...found, claims };
  };
  const evidence = await evidenceOf(agent);
  if (evidence.claims.length === 0 || evidence.commits.length === 0)
    return {
      explanation:
        "Published execution history does not establish a complete claim and its attributed commits for this completion.",
    };
  const expected = agentNameOf(agent);
  const commits = [...evidence.commits];
  const claims = [...evidence.claims];
  const owningMerges = new Set(evidence.merges);
  for (const otherAgent of await publishedStoryAgents(
    story,
    completion,
    call,
  )) {
    if (agentNameOf(otherAgent) === expected) continue;
    const other = await evidenceOf(otherAgent);
    if (other.commits.length > 0 && other.claims.length === 0)
      return {
        explanation:
          "Published execution history is missing an earlier agent's claim, so the complete story cannot be attributed safely.",
      };
    commits.push(...other.commits);
    claims.push(...other.claims);
    for (const merge of other.merges) owningMerges.add(merge);
  }
  const beforeClaims = await Promise.all(
    claims.map(async (claim) =>
      (await runGit(["rev-parse", `${claim}^`], call)).stdout.trim(),
    ),
  );
  const storyStart =
    beforeClaims.length === 1
      ? (beforeClaims[0] ?? "")
      : (
          await runGit(["merge-base", "--octopus", ...beforeClaims], call)
        ).stdout.trim();
  if (storyStart === "")
    return {
      explanation:
        "Published execution history does not establish a complete claim and its attributed commits for this completion.",
    };
  return { commits, claims, storyStart, owningMerges };
}

// Published-history commit order on top of claim evidence, with each owning
// or completion merge's own edits taken out like a story commit and its
// genuine conflicts kept as mixed work. Endpoint recovery reuses the claim
// walk; Review composes this without recovering claims again.
export async function completedStoryAttribution(
  evidence: CompletedStoryClaimEvidence,
  completion: string,
  call: GitCall,
): Promise<CompletedStoryEvidence | { explanation: string }> {
  const { commits, claims, storyStart, owningMerges } = evidence;
  // A merge resolution is not attributable by the single-parent author rule,
  // whoever authored the merge. Check merges after the execution claims,
  // including a completion integrated by a different publisher. Other
  // stories' merges stay trunk's: restating the story's commits through them
  // isolates its changes or marks the file as mixed.
  const merges = (
    await runGit(
      ["rev-list", "--merges", "--parents", completion, `^${storyStart}`],
      call,
    )
  ).stdout
    .trim()
    .split("\n")
    .filter(Boolean);
  const storyCommits = commits.map(({ commit }) => commit);
  const resolutions = new Map<string, string>();
  const edits = new Map<string, PublishedCommit>();
  for (const line of merges) {
    const [merge = "", ...parents] = line.split(" ");
    const [first = "", second = ""] = parents;
    if (parents.length !== 2)
      return {
        explanation:
          "Published execution history contains a merge whose story changes cannot be attributed safely.",
      };
    if (!owningMerges.has(merge) && merge !== completion) continue;
    let automatic: ReturnType<typeof mergeTreeOutput>;
    try {
      automatic = mergeTreeOutput(
        (
          await runGit(
            ["merge-tree", "--write-tree", "--name-only", "-z", first, second],
            call,
          )
        ).stdout,
      );
    } catch (error) {
      if (call.signal?.aborted === true) throw error;
      // A conflicted merge exits 1 with a tree, possibly after driver output.
      automatic = gitExitedOne(error)
        ? mergeTreeOutput(error.stdout)
        : undefined;
    }
    if (automatic === undefined)
      return {
        explanation:
          "Published execution history contains a merge whose resolution evidence could not be read.",
      };
    const actual = (
      await runGit(["rev-parse", `${merge}^{tree}`], call)
    ).stdout.trim();
    if (automatic.tree === actual) continue;
    const resolved = (
      await runGit(
        ["diff", "--name-only", "--no-renames", "-z", automatic.tree, actual],
        call,
      )
    ).stdout
      .split("\0")
      .filter(Boolean);
    const { conflicts, edit } = await owningMergeEdits(
      merge,
      [first, second],
      automatic,
      resolved,
      storyCommits,
      call,
    );
    // The pre-claim tree includes neither writer's later contribution. Show
    // the whole resolved file from there, explicitly marked as mixed work.
    for (const file of conflicts) resolutions.set(file, storyStart);
    if (edit !== undefined) edits.set(merge, edit);
  }
  const byRevision = new Map(commits.map((commit) => [commit.commit, commit]));
  const ordered = (
    await runGit(["rev-list", "--topo-order", completion], call)
  ).stdout
    .trim()
    .split("\n");
  return {
    resolutions,
    commits: ordered.flatMap((revision) =>
      [edits.get(revision), byRevision.get(revision)].filter(
        (commit) => commit !== undefined,
      ),
    ),
    claims,
    storyStart,
    owningMerges,
  };
}

export async function completedStoryCommits(
  story: ReviewedStory,
  completion: string,
  agent: string,
  call: GitCall,
): Promise<CompletedStoryEvidence | { explanation: string }> {
  const evidence = await completedStoryClaimEvidence(
    story,
    completion,
    agent,
    call,
  );
  if ("explanation" in evidence) return evidence;
  return completedStoryAttribution(evidence, completion, call);
}
