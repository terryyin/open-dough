// A Trunk Mode story's published commits, read from the project's own Git
// history: the agent publishes each increment onto trunk, where other
// people's commits interleave with it, so a story review
// (`./storyReviewSnapshot.ts`) takes them out of trunk to compare with the
// story's own changes alone. The agent is the one the reviewed worktree's
// own Git config names as author, as
// `../../src/skills/dough-execute-plan/scripts/workspace-agent-authorship.mjs`
// writes it; a worktree naming none has no published commit to take out. A
// commit on trunk is the story's when that agent authored it, it has one
// parent, and the agent's profile in that parent's tree names the story as
// an execution claim. The walk runs newest first from where the worktree
// meets trunk and stops at the claim, the commit whose own profile names the
// story while its parent's does not, so the claim, preparation commits,
// merges, and the agent's commits for another story stay trunk's.
// Trunk less those commits is a tree, built by reverse-applying each one,
// newest first, with the restatement of `./storyReviewComparison.ts`; it
// writes tree objects and touches no index, worktree, or ref.

import {
  agentIdentity,
  agentNameOf,
  agentProfileDirectory,
  parseAgentProfileFile,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { runGit, type GitCall } from "./gitRunner.ts";
import { restatedPoint } from "./storyReviewComparison.ts";

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

// The story's published commits among those `trunk` holds, newest first:
// none when the worktree names no agent or the agent published nothing since
// the story's claim.
export async function publishedStoryCommits(
  story: ReviewedStory,
  // Where the worktree's head meets the fetched trunk.
  trunk: string,
  call: GitCall,
): Promise<PublishedCommit[]> {
  const agent = await worktreeAgent(call);
  if (agent === undefined) return [];
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
  if (authored.length === 0) return [];
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
  for (const { commit, parents } of authored) {
    const [parent] = parents;
    if (parent !== undefined && claims(parent)) {
      if (parents.length === 1) published.push({ commit, parent });
    } else if (claims(commit)) {
      break;
    }
  }
  return published;
}

// The tree of `trunk` with the published commits, newest first, taken out;
// undefined when this machine's Git cannot restate a tree.
export async function trunkLess(
  published: readonly PublishedCommit[],
  trunk: string,
  call: GitCall,
): Promise<string | undefined> {
  let tree = (
    await runGit(["rev-parse", "--verify", `${trunk}^{tree}`], call)
  ).stdout.trim();
  for (const { commit, parent } of published) {
    const restated = await restatedPoint(
      { tree, baseline: commit },
      parent,
      call,
    );
    if (restated === undefined) return undefined;
    ({ tree } = restated);
  }
  return tree;
}
