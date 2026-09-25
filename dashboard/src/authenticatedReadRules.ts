// The read rules the browser and the local server side share for the local
// authenticated read boundary (`../server/authenticatedRead.ts`): its one
// path, what names a commit or a usable branch, how long one read may wait,
// and how a failure words what was being read. Kept in its own module, with
// no Node import, so the browser bundle can reference the exact same rules
// without pulling in server-only code: `../server/authenticatedRead.ts`
// itself imports Node's `child_process` at runtime (through
// `../server/ghRead.ts`), so nothing under `./` may import that module
// directly.
import type { PublishedSource } from "./publishedSource.ts";

export const authenticatedReadEndpoint = "/__authenticated-read";

// The longest wait, in whole seconds, the boundary ever passes on from a
// GitHub rate limit's direction (`../server/rateLimitDirection.ts`): GitHub's
// own primary rate-limit window. A header naming a later time is either wrong
// or will be repeated by the next refused answer, and a page left open must
// still check again. The browser reader refuses anything longer as malformed.
export const longestDirectedWaitSeconds = 60 * 60;

// A full commit id as GitHub names one; anything else is not a revision.
export const commitShaPattern = /^[0-9a-f]{40}$/;

// A branch name as Git allows it for a published head, narrowed to plain
// segments of letters, digits, `.`, `_`, and `-`, so it can never reshape the
// GitHub endpoint it is put into. The boundary refuses any other name, never
// escaping it; the page never asks it to read or watch one.
const branchSegment = /^[A-Za-z0-9_-][A-Za-z0-9._-]*$/;

export function isSafeBranchName(branch: string): boolean {
  return (
    branch.length <= 255 &&
    !branch.includes("..") &&
    !branch.endsWith(".lock") &&
    branch.split("/").every((segment) => branchSegment.test(segment))
  );
}

// How long one read may wait for GitHub: the browser's whole read
// (`./publishedWork.ts`) and each boundary request's owned `gh` subprocesses
// (`../server/ghRead.ts`) are both given up after this.
export const readWaitLimitMs = 30_000;

// What was being read, as a read failure names it: the source's ref while
// it is still to be resolved, a recorded story branch while its head is
// resolved, one repository path at a resolved revision, or when that path was
// last committed as of a resolved revision.
export function readingRefOf(
  source: Pick<PublishedSource, "ref" | "repository">,
): string {
  return `${source.ref} of ${source.repository}`;
}

export function readingBranchHeadOf(
  branch: string,
  repository: string,
): string {
  return `branch ${branch} of ${repository}`;
}

export function readingPathAt(path: string, revision: string): string {
  return `${path} at ${revision}`;
}

export function readingLastCommitAt(path: string, revision: string): string {
  return `the last commit of ${path} at ${revision}`;
}
