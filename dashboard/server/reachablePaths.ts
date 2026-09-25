// Server-side reachability for authenticated record reads: a repository path
// is allowed only when the pinned revision's backlog (and, for plans, the
// story-state recorded beside a backlog entry) names it. Never trusts a
// client-supplied path list as an open proxy. Uses the same path resolution
// and story-state peek rules as the browser enrichment path. The records it
// consults are read through the caller's own pinned reader
// (`./performedRead.ts`), so already-read text at the same revision is
// not fetched again. Agent profiles beside the backlog are reachable only as
// the profile files the pinned revision's directory listing names. When a
// path was last committed may be asked for a reachable record or a listed
// profile: a plan's last recorded update, or the Take that added a profile.
// What may be read on a story branch is decided from the same records in
// `./branchReachability.ts`.

import type { PublishedSource } from "../src/publishedSource.ts";
import { resolveBesideFile } from "../src/repositoryPath.ts";
import {
  resolveSourceLink,
  snapshotRepositoryPath,
} from "../src/sourceLink.ts";
import { peekRecordedApproach } from "../src/storyPreparation.ts";
import {
  agentProfileDirectory,
  profileAgentName,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { parseBacklog } from "../../src/skills/dough-product-backlog/scripts/product-backlog-document.mjs";

export function isSafeRepositoryPath(path: string): boolean {
  if (path.length === 0 || path.startsWith("/") || path.includes("\\")) {
    return false;
  }
  const segments = path.split("/");
  if (
    segments.some(
      (segment) => segment === "" || segment === "." || segment === "..",
    )
  ) {
    return false;
  }
  return true;
}

// Decode a query-string path, then apply the same segment rules the allowlist
// uses for already-decoded repository paths.
export function parseSafeRepositoryPath(
  raw: string | null,
): string | undefined {
  if (raw === null || raw.length === 0) {
    return undefined;
  }
  let decoded: string;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return undefined;
  }
  return isSafeRepositoryPath(decoded) ? decoded : undefined;
}

export type CanonicalEntry = {
  readonly identity: string;
  readonly list: string;
  readonly href: string;
  readonly path: string;
};

export function canonicalEntriesFromBacklog(
  backlogMarkdown: string,
  source: PublishedSource,
  revision: string,
): CanonicalEntry[] {
  const entries: CanonicalEntry[] = [];
  let document: {
    entries: ReadonlyArray<{ identity: string; list: string; href: string }>;
  };
  try {
    document = parseBacklog(backlogMarkdown);
  } catch {
    return entries;
  }
  for (const { identity, list, href } of document.entries) {
    try {
      const link = resolveSourceLink(href, source, revision);
      const path = snapshotRepositoryPath(link, source.backlogPath);
      if (path !== undefined) {
        entries.push({ identity, list, href, path });
      }
    } catch {
      // Unusable links never authorize a path.
    }
  }
  return entries;
}

export function plannedPlanPath(
  canonicalText: string,
  href: string,
  canonicalPath: string,
): string | undefined {
  const peek = peekRecordedApproach(canonicalText, href);
  if (peek.status !== "recorded" || peek.approach.kind !== "planned") {
    return undefined;
  }
  return resolveBesideFile(canonicalPath, peek.approach.plan);
}

// Reads one repository file of the source at the revision under check.
export type PinnedReader = (repositoryPath: string) => Promise<string>;

// Lists one directory's file names at the revision under check.
export type PinnedLister = (directory: string) => Promise<readonly string[]>;

export async function pathReachableFromRevision(
  source: PublishedSource,
  revision: string,
  requestedPath: string,
  readPinned: PinnedReader,
): Promise<boolean> {
  if (!isSafeRepositoryPath(requestedPath)) {
    return false;
  }
  const backlogMarkdown = await readPinned(source.backlogPath);
  const canonicals = canonicalEntriesFromBacklog(
    backlogMarkdown,
    source,
    revision,
  );
  for (const { path } of canonicals) {
    if (path === requestedPath) {
      return true;
    }
  }

  // One shared seed can hold several stories: peek each backlog href against
  // the same file text so a planned approach on any of them can authorize its
  // plan path.
  const canonicalTextCache = new Map<string, string>();
  for (const { href, path: canonicalPath } of canonicals) {
    let text = canonicalTextCache.get(canonicalPath);
    if (text === undefined) {
      text = await readPinned(canonicalPath);
      canonicalTextCache.set(canonicalPath, text);
    }
    const planPath = plannedPlanPath(text, href, canonicalPath);
    if (planPath === requestedPath) {
      return true;
    }
  }
  return false;
}

// Where agent profiles live for this source: beside its backlog.
export function agentProfileDirectoryOf(source: PublishedSource): string {
  const directory = resolveBesideFile(
    source.backlogPath,
    agentProfileDirectory,
  );
  if (directory === undefined) {
    throw new Error(`No agent profile directory beside ${source.backlogPath}`);
  }
  return directory;
}

// Which agent profiles may be read at a pinned revision: the listing of the
// directory beside the backlog at that revision decides which exist (a
// directory the revision lacks lists none), and only the files the shared
// profile module names as profiles are read. Anything else listed is not.
export async function listedAgentProfilePaths(
  source: PublishedSource,
  listPinned: PinnedLister,
): Promise<string[]> {
  const directory = agentProfileDirectoryOf(source);
  return (await listPinned(directory))
    .filter((name) => profileAgentName(name) !== undefined)
    .sort()
    .map((name) => `${directory}/${name}`);
}

// Whether the pinned revision's records allow asking when `requestedPath` was
// last committed: any path a file read may reach, or one of the agent profiles
// listed beside the backlog. The profile directory is listed only for a path
// inside it.
export async function commitTimeReachableFromRevision(
  source: PublishedSource,
  revision: string,
  requestedPath: string,
  readPinned: PinnedReader,
  listPinned: PinnedLister,
): Promise<boolean> {
  if (
    await pathReachableFromRevision(source, revision, requestedPath, readPinned)
  ) {
    return true;
  }
  if (!requestedPath.startsWith(`${agentProfileDirectoryOf(source)}/`)) {
    return false;
  }
  return (await listedAgentProfilePaths(source, listPinned)).includes(
    requestedPath,
  );
}
