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

import type { PublishedSource } from "../src/publishedSource";
import { resolveBesideFile } from "../src/repositoryPath";
import { resolveSourceLink, snapshotRepositoryPath } from "../src/sourceLink";
import { peekRecordedApproach } from "../src/storyPreparation";
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

type CanonicalEntry = {
  readonly href: string;
  readonly path: string;
};

function canonicalEntriesFromBacklog(
  backlogMarkdown: string,
  source: PublishedSource,
  revision: string,
): CanonicalEntry[] {
  const entries: CanonicalEntry[] = [];
  let document: { entries: ReadonlyArray<{ href: string }> };
  try {
    document = parseBacklog(backlogMarkdown);
  } catch {
    return entries;
  }
  for (const entry of document.entries) {
    try {
      const link = resolveSourceLink(entry.href, source, revision);
      const path = snapshotRepositoryPath(link, source.backlogPath);
      if (path !== undefined) {
        entries.push({ href: entry.href, path });
      }
    } catch {
      // Unusable links never authorize a path.
    }
  }
  return entries;
}

function plannedPlanPath(
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
  listPinned: (directory: string) => Promise<readonly string[]>,
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
  listPinned: (directory: string) => Promise<readonly string[]>,
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
