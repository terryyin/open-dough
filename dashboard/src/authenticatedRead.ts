// The browser's one reader of published Git state: an ordinary same-origin
// `fetch` to the local authenticated read boundary
// (`../server/authenticatedRead.ts`) at `/__authenticated-read?source=<id>`,
// for any catalog source (`./publishedSource.ts`). Optional `revision` and
// `path` request one further file already reachable from that revision's
// records. No extra header or credential is sent; the page is served by the
// same Vite process that answers this endpoint, so the request is same-origin
// by construction, and the endpoint's own Origin/Host check
// (`../server/localOrigin.ts`) does the rest. There is no direct browser path
// to GitHub.
//
// The local server resolves the ref and reads the backlog (or a
// reachability-checked record) through the launching person's own `gh`
// authentication; what it hands back still crossed a process/HTTP boundary,
// so it is checked here as external input, never trusted by assertion.

import { z } from "zod";
import { authenticatedReadEndpoint } from "./authenticatedReadPath";
import type { PublishedSource } from "./publishedSource";
import { ReadProblem } from "./readProblem";

const okSnapshot = z.object({
  revision: z.string().regex(/^[0-9a-f]{40}$/),
  backlog: z.string(),
});
const okFile = z.object({
  revision: z.string().regex(/^[0-9a-f]{40}$/),
  path: z.string().min(1),
  text: z.string(),
});
const errorAnswer = z.object({ error: z.string().min(1) });

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
    throw new ReadProblem(
      reported.success
        ? reported.data.error
        : `The local authenticated read answered HTTP ${response.status} while reading ${reading}.`,
    );
  }
  return body;
}

// Resolves the source's ref to one commit and reads its backlog at that
// commit, both on the local server.
export async function readPublishedSnapshot(
  source: PublishedSource,
  signal: AbortSignal,
): Promise<PublishedSnapshot> {
  const reading = `${source.ref} of ${source.repository}`;
  const body = await authenticatedGet(
    `source=${encodeURIComponent(source.id)}`,
    reading,
    signal,
  );
  const parsed = okSnapshot.safeParse(body);
  if (!parsed.success) {
    throw new ReadProblem(
      `The local authenticated read answered in a shape this dashboard does not understand while reading ${reading}.`,
    );
  }
  return parsed.data;
}

export async function readRepositoryFileAt(
  source: PublishedSource,
  repositoryPath: string,
  revision: string,
  signal: AbortSignal,
): Promise<string> {
  const reading = `${repositoryPath} at ${revision}`;
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
