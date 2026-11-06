// Derived facts from a published story's claim history: recorded execution
// mode and, for Story Branch Mode, the landing from the story's own history —
// newest trunk-first owning merge with its story-side parent, else the newest
// own revision (fast-forward tip). Shared by `./storyPublishedEndpoints.ts`.
import {
  agentIdentity,
  agentNameOf,
  parseAgentProfileFile,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { runGit, type GitCall } from "./gitRunner.ts";
import type { ReviewedStory } from "./storyPublishedEvidence.ts";

export type StoryExecutionMode = "trunk" | "story-branch";

export type PublishedLanding = {
  // Landed C: trunk-first owning merge, or the fast-forward tip when there is
  // no such merge. Branch B uses `branchSide` (story-side parent, or the tip).
  readonly merge: string;
  readonly branchSide: string;
};

export async function recordedMode(
  story: ReviewedStory,
  claim: string,
  agent: string,
  call: GitCall,
): Promise<StoryExecutionMode | undefined> {
  const name = agentNameOf(agent);
  if (name === undefined) return undefined;
  const fileName = agentIdentity(name).path.split("/").at(-1);
  if (fileName === undefined) return undefined;
  const profilePath = `${story.profileDirectory}/${fileName}`;
  let text: string;
  try {
    text = (await runGit(["show", `${claim}:${profilePath}`], call)).stdout;
  } catch {
    return undefined;
  }
  const { profile } = parseAgentProfileFile(fileName, text) as {
    readonly profile?: { readonly mode?: unknown };
  };
  const mode = profile?.mode;
  return mode === "trunk" || mode === "story-branch" ? mode : undefined;
}

async function isAncestor(
  ancestor: string,
  descendant: string,
  call: GitCall,
): Promise<boolean> {
  try {
    await runGit(["merge-base", "--is-ancestor", ancestor, descendant], call);
    return true;
  } catch {
    return false;
  }
}

// The parent that holds story single-parent commits the other parent lacks.
async function storySideOf(
  first: string,
  second: string,
  storyCommits: readonly string[],
  call: GitCall,
): Promise<"first" | "second" | undefined> {
  let firstExclusive = false;
  let secondExclusive = false;
  for (const commit of storyCommits) {
    const inFirst = await isAncestor(commit, first, call);
    const inSecond = await isAncestor(commit, second, call);
    if (inFirst && !inSecond) firstExclusive = true;
    if (inSecond && !inFirst) secondExclusive = true;
    if (firstExclusive && secondExclusive) return undefined;
  }
  if (secondExclusive && !firstExclusive) return "second";
  if (firstExclusive && !secondExclusive) return "first";
  return undefined;
}

// Newest own revision reachable from the completion: story single-parent
// commits and owning merges (including a story-first tip), in rev-list order.
async function newestOwnRevision(
  completion: string,
  storyCommits: readonly string[],
  owningMerges: ReadonlySet<string>,
  call: GitCall,
): Promise<string | undefined> {
  const own = new Set([...storyCommits, ...owningMerges]);
  if (own.size === 0) return undefined;
  const ordered = (
    await runGit(["rev-list", "--topo-order", completion], call)
  ).stdout
    .trim()
    .split("\n")
    .filter(Boolean);
  for (const revision of ordered) {
    if (own.has(revision)) return revision;
  }
  return undefined;
}

// Landing from the story's own history, not parent position or trunk's current
// first-parent line. Newest trunk-first owning merge (second parent = story
// side) is C with that story side as B. A story-first merge (first parent =
// story side) is never the landing and its trunk-side parent is never B. With
// no trunk-first landing, B and C are the newest own revision (fast-forward
// tip trunk accepted). Absent when that tip cannot be identified.
export async function landingOf(
  completion: string,
  storyStart: string,
  owningMerges: ReadonlySet<string>,
  storyCommits: readonly string[],
  call: GitCall,
): Promise<PublishedLanding | undefined> {
  const lines = (
    await runGit(
      ["rev-list", "--merges", "--parents", completion, `^${storyStart}`],
      call,
    )
  ).stdout
    .trim()
    .split("\n")
    .filter(Boolean);
  for (const line of lines) {
    const [merge = "", first, second] = line.split(" ");
    if (first === undefined || second === undefined) continue;
    if (!owningMerges.has(merge)) continue;
    const side = await storySideOf(first, second, storyCommits, call);
    if (side !== "second") continue;
    return { merge, branchSide: second };
  }
  const tip = await newestOwnRevision(
    completion,
    storyCommits,
    owningMerges,
    call,
  );
  if (tip === undefined) return undefined;
  return { merge: tip, branchSide: tip };
}
