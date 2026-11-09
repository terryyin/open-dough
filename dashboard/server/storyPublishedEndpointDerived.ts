// Derived facts from a published story's claim history: the completion tied to
// the story's own delivery, recorded execution mode and, for Story Branch
// Mode, the landing from the story's own history — newest trunk-first owning
// merge with its story-side parent, else the newest own revision (fast-forward
// tip). Shared by `./storyPublishedEndpoints.ts`.
import {
  agentIdentity,
  agentNameOf,
  parseAgentProfileFile,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { runGit, type GitCall } from "./gitRunner.ts";
import type { PublishedStoryHistory } from "./publishedStoryHistory.ts";
import {
  publishedStoryAgents,
  publishedStoryEvidence,
  type ReviewedStory,
} from "./storyPublishedEvidence.ts";

export type StoryExecutionMode = "trunk" | "story-branch";

export type PublishedLanding = {
  // Landed C: trunk-first owning merge, or the fast-forward tip when there is
  // no such merge. Branch B uses `branchSide` (story-side parent, or the tip).
  readonly merge: string;
  readonly branchSide: string;
};

export async function recordedExecution(
  story: ReviewedStory,
  claim: string,
  agent: string,
  call: GitCall,
): Promise<
  { readonly mode: StoryExecutionMode; readonly branch?: string } | undefined
> {
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
    readonly profile?: { readonly mode?: unknown; readonly branch?: unknown };
  };
  const mode = profile?.mode;
  if (mode !== "trunk" && mode !== "story-branch") return undefined;
  const branch = profile?.branch;
  return {
    mode,
    ...(mode === "story-branch" && typeof branch === "string" && branch !== ""
      ? { branch }
      : {}),
  };
}

// The parent that holds story single-parent commits the other parent lacks;
// undefined when neither or both do.
export async function storySideOf(
  first: string,
  second: string,
  storyCommits: readonly string[],
  history: PublishedStoryHistory,
): Promise<"first" | "second" | undefined> {
  let firstExclusive = false;
  let secondExclusive = false;
  for (const commit of storyCommits) {
    const inFirst = await history.isAncestor(commit, first);
    const inSecond = await history.isAncestor(commit, second);
    if (inFirst && !inSecond) firstExclusive = true;
    if (inSecond && !inFirst) secondExclusive = true;
    if (firstExclusive && secondExclusive) return undefined;
  }
  if (secondExclusive && !firstExclusive) return "second";
  if (firstExclusive && !secondExclusive) return "first";
  return undefined;
}

// Owning merges over the rev-list `range`, newest first, whose second parent
// is the story side: the story's own trunk-first merges.
async function* trunkFirstOwningMerges(
  head: string,
  excluded: string,
  owningMerges: ReadonlySet<string>,
  storyCommits: readonly string[],
  history: PublishedStoryHistory,
  topological = false,
): AsyncGenerator<{ merge: string; first: string; second: string }> {
  if (owningMerges.size === 0) return;
  const merges = await history.mergesBetween(head, excluded, topological);
  for (const {
    commit: merge,
    parents: [first, second],
  } of merges) {
    if (first === undefined || second === undefined) continue;
    if (!owningMerges.has(merge)) continue;
    if ((await storySideOf(first, second, storyCommits, history)) !== "second")
      continue;
    yield { merge, first, second };
  }
}

// Newest own revision reachable from the completion: story single-parent
// commits and owning merges (including a story-first tip), in rev-list order.
async function newestOwnRevision(
  completion: string,
  storyCommits: readonly string[],
  owningMerges: ReadonlySet<string>,
  history: PublishedStoryHistory,
): Promise<string | undefined> {
  const own = new Set([...storyCommits, ...owningMerges]);
  if (own.size === 0) return undefined;
  const ordered = await history.orderedAt(completion);
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
  history: PublishedStoryHistory,
): Promise<PublishedLanding | undefined> {
  for await (const { merge, second } of trunkFirstOwningMerges(
    completion,
    storyStart,
    owningMerges,
    storyCommits,
    history,
  ))
    return { merge, branchSide: second };
  const tip = await newestOwnRevision(
    completion,
    storyCommits,
    owningMerges,
    history,
  );
  if (tip === undefined) return undefined;
  return { merge: tip, branchSide: tip };
}

// The story's own completion for a done record added at `doneRecordAdded`,
// read from published history up to `published`: the newest trunk-first owning
// merge that integrates that addition (trunk-side first parent lacks it,
// story-side second parent holds it), else the addition itself — Trunk Mode, a
// fast-forward landing, or a completion committed on trunk after an earlier
// merge. A later story's merge that carries the existing done record onto a new
// first-parent path is not owning, so it never replaces this completion.
export async function deliveredCompletion(
  story: ReviewedStory,
  doneRecordAdded: string,
  published: string,
  history: PublishedStoryHistory,
): Promise<string> {
  const storyCommits: string[] = [];
  const owningMerges = new Set<string>();
  for (const agent of await publishedStoryAgents(story, published, history)) {
    const evidence = await publishedStoryEvidence(
      story,
      published,
      history,
      agent,
    );
    storyCommits.push(...evidence.commits.map(({ commit }) => commit));
    for (const merge of evidence.merges) owningMerges.add(merge);
  }
  for await (const { merge, first, second } of trunkFirstOwningMerges(
    published,
    doneRecordAdded,
    owningMerges,
    storyCommits,
    history,
    true,
  ))
    if (
      (await history.isAncestor(doneRecordAdded, second)) &&
      !(await history.isAncestor(doneRecordAdded, first))
    )
      return merge;
  return doneRecordAdded;
}
