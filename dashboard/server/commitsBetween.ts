// What changed between two revisions of a source's configured ref, by
// GitHub's own account, for the local authenticated read boundary's memo
// (`./pinnedMemo.ts`) to answer a read at the later revision from what it
// holds at the earlier one: GitHub's comparison of the two
// (`./containmentRead.ts`) lists the commits between and names every file
// that differs, and each commit's own record (`./ghCommit.ts`) names every
// file it changed -- a merge's, against its first parent alone.
// Nothing else -- the ref's name, elapsed time, or identical text --
// establishes that a path is unchanged.

import { commitShaPattern } from "../src/authenticatedReadRules.ts";
import {
  comparisonViaGh,
  containing,
  notContaining,
} from "./containmentRead.ts";
import type { CommitRecord } from "./ghCommit.ts";
import { GhFailure } from "./ghRead.ts";

// At most this many commits between two revisions are read for their change
// lists; more establish nothing.
const commitsBetweenBound = 10;

// GitHub's comparison names at most this many files, so naming this many may
// not name every one.
const comparedFilesCap = 300;

// Every path touched from `base` to `head` -- each file the comparison or a
// commit between names, and the path it was renamed or copied from -- or
// null when GitHub's account establishes nothing: `head` does not descend
// from `base`, more commits lie between than the bound, or the comparison's
// or a commit's change list is not whole. A comparison GitHub does not
// answer as one is a failure, never a guess.
export async function touchedBetweenViaGh(
  repository: string,
  between: { readonly base: string; readonly head: string },
  recordOf: (commit: string) => Promise<CommitRecord>,
  signal: AbortSignal,
): Promise<readonly string[] | null> {
  const answer = await comparisonViaGh(
    repository,
    between,
    {
      perPage: commitsBetweenBound,
      jq: ".status, .total_commits, .commits[].sha, .files[].filename, .files[].previous_filename",
    },
    signal,
  );
  if (answer === undefined) {
    throw new GhFailure({ kind: "no-commit" });
  }
  // One line per value; a file renamed or copied from none prints its
  // previous filename as an empty line.
  const [status = "", total = "", ...listed] = answer
    .replace(/\n$/, "")
    .split("\n");
  if (notContaining.has(status)) {
    return null;
  }
  if (!containing.has(status) || !/^\d+$/.test(total)) {
    throw new GhFailure({ kind: "failed" });
  }
  const count = Number(total);
  if (count > commitsBetweenBound) {
    return null;
  }
  // With every commit between listed, the lines after them are the files'
  // names, then the names they came from, one each.
  const commits = listed.slice(0, count);
  const named = listed.slice(count);
  if (
    !commits.every((commit) => commitShaPattern.test(commit)) ||
    named.length % 2 !== 0
  ) {
    throw new GhFailure({ kind: "failed" });
  }
  if (named.length / 2 >= comparedFilesCap) {
    return null;
  }
  const records = await Promise.all(commits.map(recordOf));
  if (records.some(({ whole }) => !whole)) {
    return null;
  }
  return [
    ...new Set([
      ...named.filter((path) => path !== ""),
      ...records.flatMap(({ files }) =>
        files.flatMap(({ filename, previousFilename }) =>
          previousFilename === null ? [filename] : [filename, previousFilename],
        ),
      ),
    ]),
  ];
}

// Whether a touched path is the memo entry `entry` or lies under it: a
// listing's entry is its directory with a trailing `/`, and a file is touched
// too when a path under it is, as when it became a directory.
export function touchedAt(touched: readonly string[], entry: string): boolean {
  const under = entry.endsWith("/") ? entry : `${entry}/`;
  return touched.some((path) => path === entry || path.startsWith(under));
}

// What `learn` answers, or null -- establishing nothing, so the read proceeds
// as without it -- when it fails, unless GitHub limited it or the request is
// over.
export async function unlessFailed<T>(
  signal: AbortSignal,
  learn: () => Promise<T>,
): Promise<T | null> {
  try {
    return await learn();
  } catch (error) {
    if (
      signal.aborted ||
      (error instanceof GhFailure && error.reason.kind === "rate-limited")
    ) {
      throw error;
    }
    return null;
  }
}
