// Derived facts from a published story's claim history: recorded execution
// mode and, for Story Branch Mode, the newest trunk-first owning landing
// merge with its story-side parent. Shared by `./storyPublishedEndpoints.ts`.
import {
  agentIdentity,
  agentNameOf,
  parseAgentProfileFile,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { runGit, type GitCall } from "./gitRunner.ts";
import type { ReviewedStory } from "./storyPublishedEvidence.ts";

export type StoryExecutionMode = "trunk" | "story-branch";

export type PublishedLanding = {
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

// Newest trunk-first owning merge: second parent is the story side. A merge
// whose first parent is the story side merged trunk into the branch and is
// never the landing. Branch side is that story-side parent.
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
  return undefined;
}
