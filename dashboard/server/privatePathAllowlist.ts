// Server-side reachability for authenticated record reads: a repository path
// is allowed only when the pinned revision's backlog (and, for plans, the
// story-state recorded beside a backlog entry) names it. Never trusts a
// client-supplied path list as an open proxy. Uses the same path resolution
// and story-state peek rules as the browser enrichment path.

import type { PublishedSource } from "../src/publishedSource";
import { resolveBesideFile } from "../src/repositoryPath";
import { resolveSourceLink, snapshotRepositoryPath } from "../src/sourceLink";
import { peekRecordedApproach } from "../src/storyPreparation";
import { parseBacklog } from "../../src/skills/dough-product-backlog/scripts/product-backlog-document.mjs";
import { readRepositoryFileViaGh } from "./ghRead";

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

export async function pathReachableFromRevision(
  source: PublishedSource,
  revision: string,
  requestedPath: string,
  signal: AbortSignal,
): Promise<boolean> {
  if (!isSafeRepositoryPath(requestedPath)) {
    return false;
  }
  const backlogMarkdown = await readRepositoryFileViaGh(
    source.repository,
    source.backlogPath,
    revision,
    signal,
  );
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
      text = await readRepositoryFileViaGh(
        source.repository,
        canonicalPath,
        revision,
        signal,
      );
      canonicalTextCache.set(canonicalPath, text);
    }
    const planPath = plannedPlanPath(text, href, canonicalPath);
    if (planPath === requestedPath) {
      return true;
    }
  }
  return false;
}
