// The browser's one reader of published Git state: an ordinary same-origin
// `fetch` to the local authenticated read boundary
// (`../server/authenticatedRead.ts`) at `/__authenticated-read?source=<id>`,
// for any catalog source (`./publishedSource.ts`). An optional `revision`
// reads the backlog at a commit already resolved, and with `path` one further
// file already reachable from that revision's records; `since` instead asks
// only whether the ref still names the revision shown. No extra header or
// credential is sent; the page is served by the same Vite process that
// answers this endpoint, so the request is same-origin by construction, and the endpoint's own Origin/Host check
// (`../server/localOrigin.ts`) does the rest. There is no direct browser path
// to GitHub.
//
// The local server resolves the ref and reads the backlog (or a
// reachability-checked record) through the launching person's own `gh`
// authentication; what it hands back still crossed a process/HTTP boundary,
// so it is checked here as external input, never trusted by assertion.

import { z } from "zod";
import {
  authenticatedReadEndpoint,
  commitShaPattern,
  longestDirectedWaitSeconds,
  readingPathAt,
  readingRefOf,
} from "./authenticatedReadRules";
import type { PublishedSource } from "./publishedSource";
import { ReadProblem } from "./readProblem";

const commitSha = z.string().regex(commitShaPattern);
const okSnapshot = z.object({
  revision: commitSha,
  backlog: z.string(),
});
const okFile = z.object({
  revision: commitSha,
  path: z.string().min(1),
  text: z.string(),
});
const okCheck = z.object({
  revision: commitSha,
  changed: z.boolean(),
});
const errorAnswer = z.object({
  error: z.string().min(1),
  retryAfterSeconds: z
    .number()
    .int()
    .min(0)
    .max(longestDirectedWaitSeconds)
    .optional(),
});

export type PublishedSnapshot = {
  readonly revision: string;
  readonly backlog: string;
};

async function authenticatedGet(
  query: string,
  reading: string,
  signal: AbortSignal,
): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(`${authenticatedReadEndpoint}?${query}`, {
      signal,
    });
  } catch (error) {
    if (signal.aborted) {
      throw error;
    }
    throw new ReadProblem(
      `The local authenticated read could not be reached while reading ${reading}.`,
    );
  }
  const body: unknown = await response.json().catch(() => undefined);
  if (!response.ok) {
    const reported = errorAnswer.safeParse(body);
    throw reported.success
      ? new ReadProblem(reported.data.error, reported.data.retryAfterSeconds)
      : new ReadProblem(
          `The local authenticated read answered HTTP ${response.status} while reading ${reading}.`,
        );
  }
  return body;
}

// Resolves the source's ref to one commit and reads its backlog at that
// commit, both on the local server. Given a revision already resolved, reads
// the backlog at exactly that commit instead of resolving the ref again.
export async function readPublishedSnapshot(
  source: PublishedSource,
  signal: AbortSignal,
  revision?: string,
): Promise<PublishedSnapshot> {
  const reading =
    revision === undefined
      ? readingRefOf(source)
      : readingPathAt(source.backlogPath, revision);
  const pinnedTo =
    revision === undefined ? "" : `&revision=${encodeURIComponent(revision)}`;
  const body = await authenticatedGet(
    `source=${encodeURIComponent(source.id)}${pinnedTo}`,
    reading,
    signal,
  );
  const parsed = okSnapshot.safeParse(body);
  if (!parsed.success) {
    throw new ReadProblem(
      `The local authenticated read answered in a shape this dashboard does not understand while reading ${reading}.`,
    );
  }
  if (revision !== undefined && parsed.data.revision !== revision) {
    throw new ReadProblem(
      `The local authenticated read answered for a different revision while reading ${reading}.`,
    );
  }
  return parsed.data;
}

// Whether the source's ref still names the revision shown, or which commit it
// names now. Nothing of the backlog or its records is read.
export type RevisionCheck =
  | { readonly changed: false }
  | { readonly changed: true; readonly revision: string };

export async function checkPublishedRevision(
  source: PublishedSource,
  shown: string,
  signal: AbortSignal,
): Promise<RevisionCheck> {
  const reading = readingRefOf(source);
  const body = await authenticatedGet(
    `source=${encodeURIComponent(source.id)}&since=${encodeURIComponent(shown)}`,
    reading,
    signal,
  );
  const parsed = okCheck.safeParse(body);
  if (
    !parsed.success ||
    parsed.data.changed !== (parsed.data.revision !== shown)
  ) {
    throw new ReadProblem(
      `The local authenticated read answered in a shape this dashboard does not understand while checking ${reading}.`,
    );
  }
  return parsed.data.changed
    ? { changed: true, revision: parsed.data.revision }
    : { changed: false };
}

export async function readRepositoryFileAt(
  source: PublishedSource,
  repositoryPath: string,
  revision: string,
  signal: AbortSignal,
): Promise<string> {
  const reading = readingPathAt(repositoryPath, revision);
  const body = await authenticatedGet(
    `source=${encodeURIComponent(source.id)}&revision=${encodeURIComponent(revision)}&path=${encodeURIComponent(repositoryPath)}`,
    reading,
    signal,
  );
  const parsed = okFile.safeParse(body);
  if (!parsed.success) {
    throw new ReadProblem(
      `The local authenticated read answered in a shape this dashboard does not understand while reading ${reading}.`,
    );
  }
  if (
    parsed.data.path !== repositoryPath ||
    parsed.data.revision !== revision
  ) {
    throw new ReadProblem(
      `The local authenticated read answered for a different path or revision while reading ${reading}.`,
    );
  }
  return parsed.data.text;
}
