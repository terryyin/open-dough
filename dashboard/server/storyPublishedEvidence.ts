// Attribution by an agent's published execution profile: one shared history
// walk for a live workspace's author and a completion's recorded owners.
import {
  agentIdentity,
  agentNameOf,
  agentProfileDirectory,
  parseAgentProfileFile,
  profileAgentName,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { runGit, type GitCall } from "./gitRunner.ts";

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
  call: GitCall,
): Promise<string[]> {
  const escaped = story.identity.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const files = (
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
  ).stdout.split("\n");
  const agents = files.flatMap((file) => {
    const name = profileAgentName(file.split("/").at(-1) ?? "");
    return name === undefined ? [] : [agentIdentity(name).agent];
  });
  return [...new Set(agents)];
}

// A published story commit and the first parent it is taken out against.
export interface PublishedCommit {
  readonly commit: string;
  readonly parent: string;
}

// The agent the worktree's own config names as author: its Git email and its
// profile's file name, or undefined when the worktree names none.
async function worktreeAgent(call: GitCall) {
  const read = async (key: string) => {
    try {
      return (
        await runGit(["config", "--worktree", "--get", key], call)
      ).stdout.trim();
    } catch (error) {
      if (call.signal?.aborted === true) throw error;
      return "";
    }
  };
  const name = agentNameOf(await read("author.name"));
  if (name === undefined) return undefined;
  const { email, path } = agentIdentity(name);
  if ((await read("author.email")) !== email) return undefined;
  return { email, fileName: path.slice(agentProfileDirectory.length + 1) };
}

// The blobs `git cat-file --batch` printed, by object ID: each a header line
// naming the object, its type and its size in bytes, then that many bytes
// and a newline.
function printedBlobs(printed: string): ReadonlyMap<string, string> {
  const bytes = Buffer.from(printed, "utf8");
  const blobs = new Map<string, string>();
  let at = 0;
  while (at < bytes.length) {
    const headerEnd = bytes.indexOf("\n", at);
    if (headerEnd === -1) break;
    const [object = "", type, size] = bytes
      .toString("utf8", at, headerEnd)
      .split(" ");
    if (type !== "blob") break;
    const end = headerEnd + 1 + Number(size);
    blobs.set(object, bytes.toString("utf8", headerEnd + 1, end));
    at = end + 1;
  }
  return blobs;
}

// Historical readers supply the recorded agent explicitly. The same walk also
// exposes claim and merge gaps that a completed review must not silently omit.
export async function publishedStoryEvidence(
  story: ReviewedStory,
  trunk: string,
  call: GitCall,
  historicalAgent?: string,
) {
  const name =
    historicalAgent === undefined ? undefined : agentNameOf(historicalAgent);
  const identity = name === undefined ? undefined : agentIdentity(name);
  const agent =
    historicalAgent === undefined
      ? await worktreeAgent(call)
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
  const authored = (
    await runGit(
      [
        "rev-list",
        "--topo-order",
        "--parents",
        "--fixed-strings",
        `--author=<${agent.email}>`,
        trunk,
      ],
      call,
    )
  ).stdout
    .split("\n")
    .filter((line) => line !== "")
    .map((line) => {
      const [commit = "", ...parents] = line.split(" ");
      return { commit, parents };
    });
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
  const checked = (
    await runGit(["cat-file", "--batch-check"], {
      ...call,
      input: revisions.map((revision) => `${revision}:${profile}\n`).join(""),
    })
  ).stdout.split("\n");
  const profileAt = new Map<string, string>();
  for (const [index, revision] of revisions.entries()) {
    const [object = "", type] = (checked[index] ?? "").split(" ");
    if (type === "blob") profileAt.set(revision, object);
  }
  const distinct = [...new Set(profileAt.values())];
  const blobs =
    distinct.length === 0
      ? new Map<string, string>()
      : printedBlobs(
          (
            await runGit(["cat-file", "--batch"], {
              ...call,
              input: distinct.map((object) => `${object}\n`).join(""),
            })
          ).stdout,
        );
  const claiming = new Set(
    distinct.filter((object) =>
      namesExecutionClaim(
        agent.fileName,
        blobs.get(object) ?? "",
        story.identity,
      ),
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
