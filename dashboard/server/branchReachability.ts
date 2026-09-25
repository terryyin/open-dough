// What may be read on a story branch, for the local authenticated read
// boundary (`./authenticatedRead.ts`), decided only from the pinned
// revision's records (`./reachablePaths.ts`). A story branch is reachable
// only as the branch a Taken entry's Story Branch Mode profile, listed beside
// the backlog, records at the pinned revision, and on it only that entry's
// recorded plan: nothing a branch says widens what may be read.

import type { PublishedSource } from "../src/publishedSource.ts";
import { parseAgentProfile } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { takenHeading } from "../../src/skills/dough-product-backlog/scripts/product-backlog-document.mjs";
import {
  canonicalEntriesFromBacklog,
  listedAgentProfilePaths,
  plannedPlanPath,
  type CanonicalEntry,
  type PinnedLister,
  type PinnedReader,
} from "./reachablePaths.ts";

// The Taken entries whose agent profile, listed beside the backlog at the
// pinned revision, records Story Branch Mode on `branch`. What a profile says
// is the shared profile reader's; an unreadable profile records no branch.
async function takenEntriesOnBranch(
  source: PublishedSource,
  revision: string,
  branch: string,
  readPinned: PinnedReader,
  listPinned: PinnedLister,
): Promise<CanonicalEntry[]> {
  const identities = new Set<string>();
  for (const path of await listedAgentProfilePaths(source, listPinned)) {
    const read = parseAgentProfile(await readPinned(path)) as {
      ok: boolean;
      profile?: { identity: string; mode: string; branch: string };
    };
    if (
      read.ok &&
      read.profile?.mode === "story-branch" &&
      read.profile.branch === branch
    ) {
      identities.add(read.profile.identity);
    }
  }
  if (identities.size === 0) {
    return [];
  }
  return canonicalEntriesFromBacklog(
    await readPinned(source.backlogPath),
    source,
    revision,
  ).filter(
    ({ identity, list }) => list === takenHeading && identities.has(identity),
  );
}

// Whether a Taken entry's profile at the pinned revision records `branch`.
export async function branchRecordedAtRevision(
  source: PublishedSource,
  revision: string,
  branch: string,
  readPinned: PinnedReader,
  listPinned: PinnedLister,
): Promise<boolean> {
  return (
    (
      await takenEntriesOnBranch(
        source,
        revision,
        branch,
        readPinned,
        listPinned,
      )
    ).length > 0
  );
}

// Whether `requestedPath` is the plan the pinned revision records for a
// Taken entry whose profile records `branch`: the one path read on a branch.
export async function branchPlanReachableFromRevision(
  source: PublishedSource,
  revision: string,
  branch: string,
  requestedPath: string,
  readPinned: PinnedReader,
  listPinned: PinnedLister,
): Promise<boolean> {
  const entries = await takenEntriesOnBranch(
    source,
    revision,
    branch,
    readPinned,
    listPinned,
  );
  for (const { href, path } of entries) {
    if (plannedPlanPath(await readPinned(path), href, path) === requestedPath) {
      return true;
    }
  }
  return false;
}
