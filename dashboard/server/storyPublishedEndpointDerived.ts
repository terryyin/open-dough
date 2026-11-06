// Derived facts from a published story's claim history: recorded execution
// mode and, for Story Branch Mode, the newest owning landing merge with its
// branch-side parent. Shared by `./storyPublishedEndpoints.ts`.
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

export async function landingOf(
  completion: string,
  storyStart: string,
  owningMerges: ReadonlySet<string>,
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
    if (owningMerges.has(merge) || merge === completion)
      return { merge, branchSide: second };
  }
  return undefined;
}
