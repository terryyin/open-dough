// Live agent-profile claims for a Taken story's comparison endpoints
// (`./takenStoryEndpoints.ts`): which profiles on the configured trunk name
// the identity, with each claim's recorded mode and branch.
import {
  agentIdentity,
  parseAgentProfileFile,
  profileAgentName,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { runGit, gitProblem, type GitCall } from "./gitRunner.ts";
import type { StoryExecutionMode } from "./storyPublishedEndpointDerived.ts";
import type { ReviewedStory } from "./storyPublishedEvidence.ts";

export type LiveClaim = {
  readonly agent: string;
  readonly mode: StoryExecutionMode;
  readonly branch: string | undefined;
};

export async function liveClaimsAt(
  story: ReviewedStory,
  trunk: string,
  call: GitCall,
): Promise<LiveClaim[] | { explanation: string }> {
  let listed: string;
  try {
    // Trailing slash lists the directory's files; without it Git names the
    // tree entry itself and no profile file is found.
    listed = (
      await runGit(
        ["ls-tree", "--name-only", trunk, "--", `${story.profileDirectory}/`],
        call,
      )
    ).stdout.trim();
  } catch (error) {
    return {
      explanation: `Published agent profiles could not be listed: ${gitProblem(error)}`,
    };
  }
  const claims: LiveClaim[] = [];
  for (const file of listed.split("\n").filter(Boolean)) {
    const fileName = file.split("/").at(-1) ?? "";
    const name = profileAgentName(fileName);
    if (name === undefined) continue;
    let text: string;
    try {
      text = (await runGit(["show", `${trunk}:${file}`], call)).stdout;
    } catch (error) {
      return {
        explanation: `Published agent profile ${fileName} could not be read: ${gitProblem(error)}`,
      };
    }
    const { profile } = parseAgentProfileFile(fileName, text) as {
      readonly profile?: {
        readonly identity?: unknown;
        readonly mode?: unknown;
        readonly branch?: unknown;
        readonly agent?: unknown;
      };
    };
    if (profile?.identity !== story.identity) continue;
    const mode = profile.mode;
    if (mode !== "trunk" && mode !== "story-branch") continue;
    const agent =
      typeof profile.agent === "string" && profile.agent !== ""
        ? profile.agent
        : agentIdentity(name).agent;
    const branch =
      typeof profile.branch === "string" && profile.branch !== ""
        ? profile.branch
        : undefined;
    claims.push({ agent, mode, branch });
  }
  return claims;
}
