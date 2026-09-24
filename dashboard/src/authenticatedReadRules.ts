// The read rules the browser and the local server side share for the local
// authenticated read boundary (`../server/authenticatedRead.ts`): its one
// path, what names a commit, how long one read may wait, and how a failure
// words what was being read. Kept in its own module, with no Node import, so
// the browser bundle can reference the exact same rules without pulling in
// server-only code: `../server/authenticatedRead.ts` itself imports Node's
// `child_process` at runtime (through `../server/ghRead.ts`), so nothing
// under `./` may import that module directly.
import type { PublishedSource } from "./publishedSource";

export const authenticatedReadEndpoint = "/__authenticated-read";

// The longest wait, in whole seconds, the boundary ever passes on from a
// GitHub rate limit's direction (`../server/rateLimitDirection.ts`): GitHub's
// own primary rate-limit window. A header naming a later time is either wrong
// or will be repeated by the next refused answer, and a page left open must
// still check again. The browser reader refuses anything longer as malformed.
export const longestDirectedWaitSeconds = 60 * 60;

// A full commit id as GitHub names one; anything else is not a revision.
export const commitShaPattern = /^[0-9a-f]{40}$/;

// How long one read may wait for GitHub: the browser's whole read
// (`./publishedWork.ts`) and each boundary request's owned `gh` subprocesses
// (`../server/ghRead.ts`) are both given up after this.
export const readWaitLimitMs = 30_000;

// What was being read, as a read failure names it: the source's ref while
// it is still to be resolved, or one repository path at a resolved revision.
export function readingRefOf(
  source: Pick<PublishedSource, "ref" | "repository">,
): string {
  return `${source.ref} of ${source.repository}`;
}

export function readingPathAt(path: string, revision: string): string {
  return `${path} at ${revision}`;
}
