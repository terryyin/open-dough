// The browser side of the local authenticated read boundary
// (`../server/privateRead.ts`): an ordinary same-origin `fetch` to
// `/__private-read?source=<id>`, for a catalog source whose `access` is
// "private" (`./publishedSource.ts`). No extra header or credential is sent;
// the page is served by the same Vite process that answers this endpoint, so
// the request is same-origin by construction, and the endpoint's own
// Origin/Host check (`../server/localOrigin.ts`) does the rest.
//
// The local server already resolved the ref and read the backlog pinned to
// that revision through the existing `gh` authentication; what it hands back
// still crossed a process/HTTP boundary, so it is checked here as external
// input, the same way `./githubSource.ts` checks GitHub's own public HTTP
// answers -- neither transport is trusted by assertion.

import { z } from "zod";
import { privateReadEndpoint } from "./privateReadPath";
import type { PublishedSource } from "./publishedSource";
import { ReadProblem } from "./readProblem";

const okAnswer = z.object({
  revision: z.string().regex(/^[0-9a-f]{40}$/),
  backlog: z.string(),
});
const errorAnswer = z.object({ error: z.string().min(1) });

export type PrivateSnapshot = {
  readonly revision: string;
  readonly backlog: string;
};

export async function readPrivateSnapshot(
  source: PublishedSource,
  signal: AbortSignal,
): Promise<PrivateSnapshot> {
  const reading = `${source.ref} of ${source.repository}`;
  let response: Response;
  try {
    response = await fetch(
      `${privateReadEndpoint}?source=${encodeURIComponent(source.id)}`,
      { signal },
    );
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
  const parsed = okAnswer.safeParse(body);
  if (!parsed.success) {
    throw new ReadProblem(
      `The local authenticated read answered in a shape this dashboard does not understand while reading ${reading}.`,
    );
  }
  return parsed.data;
}
