// The browser side of the local authenticated read boundary
// (`../server/privateRead.ts`): an ordinary same-origin `fetch` to
// `/__private-read?source=<id>`, for a catalog source whose `access` is
// "private" (`./publishedSource.ts`). Optional `revision` and `path` request
// one further file already reachable from that revision's records. No extra
// header or credential is sent; the page is served by the same Vite process
// that answers this endpoint, so the request is same-origin by construction,
// and the endpoint's own Origin/Host check (`../server/localOrigin.ts`) does
// the rest.
//
// The local server already resolved the ref and read the backlog (or a
// reachability-checked record) through the existing `gh` authentication; what
// it hands back still crossed a process/HTTP boundary, so it is checked here
// as external input, the same way `./githubSource.ts` checks GitHub's own
// public HTTP answers -- neither transport is trusted by assertion.

import { z } from "zod";
import { privateReadEndpoint } from "./privateReadPath";
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

export type PrivateSnapshot = {
  readonly revision: string;
  readonly backlog: string;
};

async function privateGet(
  query: string,
  reading: string,
  signal: AbortSignal,
): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(`${privateReadEndpoint}?${query}`, { signal });
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

export async function readPrivateSnapshot(
  source: PublishedSource,
  signal: AbortSignal,
): Promise<PrivateSnapshot> {
  const reading = `${source.ref} of ${source.repository}`;
  const body = await privateGet(
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

export async function readPrivateFileAt(
  source: PublishedSource,
  repositoryPath: string,
  revision: string,
  signal: AbortSignal,
): Promise<string> {
  const reading = `${repositoryPath} at ${revision}`;
  const body = await privateGet(
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
