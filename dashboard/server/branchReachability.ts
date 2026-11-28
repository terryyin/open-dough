// What may be read on a story branch, for the local authenticated read
// boundary (`./authenticatedRead.ts`), decided only from the pinned
// revision's records (`./reachablePaths.ts`, `./recordsBesideBacklog.ts`).
// A story branch is reachable only as the branch a Taken entry's Story Branch
// Mode profile, listed beside the backlog, records at the pinned revision,
// and on it only that entry's recorded plan: nothing a branch says widens
// what may be read.

import { isSafeBranchName } from "../src/authenticatedReadRules.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import {
  parseAgentProfile,
  parseAgentProfileFile,
} from "../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { takenHeading } from "../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-document.mjs";
import {
  canonicalEntriesFromBacklog,
  plannedPlanPath,
  type CanonicalEntry,
  type PinnedLister,
  type PinnedReader,
} from "./reachablePaths.ts";
import { listedAgentProfiles } from "./recordsBesideBacklog.ts";

// Recorded branches of Taken entries, from the backlog and profiles at the
// same revision. An unusable name does not become a Git or provider target.
export async function takenEntriesByBranch(
  source: PublishedSource,
  revision: string,
  readPinned: PinnedReader,
  listPinned: PinnedLister,
  { currentWatches = false }: { readonly currentWatches?: boolean } = {},
): Promise<ReadonlyMap<string, readonly CanonicalEntry[]>> {
  const identitiesByBranch = new Map<string, Set<string>>();
  const claims = new Map<string, number>();
  for (const { path } of await listedAgentProfiles(source, listPinned)) {
    const text = await readPinned(path);
    // Current watches follow the Board's assignment rules. Pinned REST reads
    // retain their established profile admission until those reads move.
    const read = (
      currentWatches
        ? parseAgentProfileFile(path.split("/").at(-1) ?? path, text)
        : parseAgentProfile(text)
    ) as {
      ok: boolean;
      profile?: {
        identity: string;
        activity: string;
        mode?: string;
        branch?: string;
      };
    };
    const profile = read.profile;
    if (!read.ok || profile?.activity !== "execution") continue;
    claims.set(profile.identity, (claims.get(profile.identity) ?? 0) + 1);
    if (
      profile.mode !== "story-branch" ||
      profile.branch === undefined ||
      !isSafeBranchName(profile.branch)
    )
      continue;
    const identities =
      identitiesByBranch.get(profile.branch) ?? new Set<string>();
    identities.add(profile.identity);
    identitiesByBranch.set(profile.branch, identities);
  }
  if (identitiesByBranch.size === 0) return new Map();
  const taken = canonicalEntriesFromBacklog(
    await readPinned(source.backlogPath),
    source,
    revision,
  ).filter(({ list }) => list === takenHeading);
  const result = new Map<string, readonly CanonicalEntry[]>();
  for (const [branch, identities] of identitiesByBranch) {
    const entries = taken.filter(
      ({ identity }) =>
        identities.has(identity) &&
        (!currentWatches || claims.get(identity) === 1),
    );
    if (entries.length > 0) result.set(branch, entries);
  }
  return result;
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
    await takenEntriesByBranch(source, revision, readPinned, listPinned)
  ).has(branch);
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
  const branches = await takenEntriesByBranch(
    source,
    revision,
    readPinned,
    listPinned,
  );
  const entries = branches.get(branch) ?? [];
  for (const { href, path } of entries) {
    if (plannedPlanPath(await readPinned(path), href, path) === requestedPath) {
      return true;
    }
  }
  return false;
}
