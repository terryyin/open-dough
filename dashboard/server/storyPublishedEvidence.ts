// Attribution by an agent's published execution profile: one shared history
// walk for a live workspace's author and a completion's recorded owners.
import {
  agentIdentity,
  agentNameOf,
  agentProfileDirectory,
  parseAgentProfileFile,
  profileAgentName,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import type { PublishedStoryHistory } from "./publishedStoryHistory.ts";

// Whether the profile published in the file named `fileName` names the story
// as an execution claim: it records a `mode`, which preparation does not.
export function namesExecutionClaim(
  fileName: string,
  text: string,
  identity: string,
): boolean {
  const { profile } = parseAgentProfileFile(fileName, text);
  return profile?.identity === identity && profile.mode !== undefined;
}

// The story reviewed: its work identity and where its project keeps agent
// profiles.
export interface ReviewedStory {
  readonly identity: string;
  readonly profileDirectory: string;
}

// Profiles whose published path history mentions this story, bounded at the
// completion. Their authored execution claims still need validation below.
export async function publishedStoryAgents(
  story: ReviewedStory,
  completion: string,
  history: PublishedStoryHistory,
): Promise<string[]> {
  const files = await history.matchingProfilePaths(
    completion,
    story.profileDirectory,
    story.identity,
  );
  const agents = files.flatMap((file) => {
    const name = profileAgentName(file.split("/").at(-1) ?? "");
    return name === undefined ? [] : [agentIdentity(name).agent];
  });
  return [...new Set(agents)];
}

// A published story change: its commit and the revision it is taken out
// against, the commit's first parent or, for a merge's own edits, the merge
// tree without them.
export interface PublishedCommit {
  readonly commit: string;
  readonly parent: string;
}

// The agent the worktree's own config names as author: its Git email and its
// profile's file name, or undefined when the worktree names none.
async function worktreeAgent(history: PublishedStoryHistory) {
  const name = agentNameOf(await history.worktreeConfig("author.name"));
  if (name === undefined) return undefined;
  const { email, path } = agentIdentity(name);
  if ((await history.worktreeConfig("author.email")) !== email)
    return undefined;
  return { email, fileName: path.slice(agentProfileDirectory.length + 1) };
}

// Historical readers supply the recorded agent explicitly. The same walk also
// exposes claim and merge gaps that a completed review must not silently omit.
export async function publishedStoryEvidence(
  story: ReviewedStory,
  trunk: string,
  history: PublishedStoryHistory,
  historicalAgent?: string,
) {
  const name =
    historicalAgent === undefined ? undefined : agentNameOf(historicalAgent);
  const identity = name === undefined ? undefined : agentIdentity(name);
  const agent =
    historicalAgent === undefined
      ? await worktreeAgent(history)
      : identity === undefined
        ? undefined
        : {
            email: identity.email,
            fileName: identity.path.slice(agentProfileDirectory.length + 1),
          };
  const empty = {
    commits: [] as PublishedCommit[],
    claims: [] as string[],
    merges: [] as string[],
  };
  if (agent === undefined) return empty;
  const authored = await history.authoredAt(trunk, agent.email);
  if (authored.length === 0) return empty;
  // The agent's profile at each authored commit and at its first parent.
  const profile = `${story.profileDirectory}/${agent.fileName}`;
  const revisions = [
    ...new Set(
      authored.flatMap(({ commit, parents }) => [
        commit,
        ...parents.slice(0, 1),
      ]),
    ),
  ];
  const profileAt = await history.profileTextsAt(profile, revisions);
  const claiming = new Set(
    [...new Set(profileAt.values())].filter((text) =>
      namesExecutionClaim(agent.fileName, text, story.identity),
    ),
  );
  const claims = (revision: string | undefined) =>
    revision !== undefined && claiming.has(profileAt.get(revision) ?? "");
  const published: PublishedCommit[] = [];
  const claimsFound: string[] = [];
  const merges: string[] = [];
  for (const { commit, parents } of authored) {
    const [parent] = parents;
    if (parent !== undefined && claims(parent)) {
      if (historicalAgent !== undefined || claimsFound.length === 0) {
        if (parents.length === 1) published.push({ commit, parent });
        else merges.push(commit);
      }
    } else if (
      claims(commit) &&
      (historicalAgent === undefined || parent !== undefined)
    ) {
      claimsFound.push(commit);
      if (historicalAgent === undefined) break;
    }
  }
  return { commits: published, claims: claimsFound, merges };
}
