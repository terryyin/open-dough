// GitHub's comparison of a head commit with a base commit, as the fake GitHub
// answers it (./support/fakeGitHub.ts): a raw answer of its status, or that
// answer told from an isolated repository's own history
// (`git merge-base --is-ancestor`), never hand-constructed.

import { execFileSync } from "node:child_process";
import {
  noConnection,
  notFoundAnswer,
  type OriginAnswer,
  type RawAnswer,
} from "./originAnswers.ts";
import type { ChangedFile, MadeCommit } from "./pathHistoryAnswers.ts";

// How the head relates to the base: identical, ahead of it (the head contains
// the base), behind it, or diverged from it.
export type CompareStatus = "identical" | "ahead" | "behind" | "diverged";

export function compareAnswer(status: CompareStatus): RawAnswer {
  return {
    status: 200,
    contentType: "application/json; charset=utf-8",
    body: JSON.stringify({
      status,
      ahead_by: 0,
      behind_by: 0,
      commits: [],
      files: [],
    }),
  };
}

// Every file that differs from `base` to `head`, as GitHub's comparison of
// two revisions names it: added, removed, or modified, whatever the commits
// between say of their own changes.
export function changedBetween(
  base: Readonly<Record<string, string>>,
  head: Readonly<Record<string, string>>,
): ChangedFile[] {
  return [...new Set([...Object.keys(base), ...Object.keys(head)])].flatMap(
    (filename): ChangedFile[] => {
      if (!Object.hasOwn(head, filename))
        return [{ filename, status: "removed" }];
      if (!Object.hasOwn(base, filename))
        return [{ filename, status: "added" }];
      return base[filename] === head[filename]
        ? []
        : [{ filename, status: "modified" }];
    },
  );
}

// The head is ahead of the base by `commits`, oldest first: GitHub counts
// them all in `total_commits` and lists at most `perPage` of them, and names
// the `files` that differ between the two.
export function aheadByAnswer(
  commits: readonly string[],
  perPage: number | undefined,
  files: readonly ChangedFile[],
): RawAnswer {
  return {
    status: 200,
    contentType: "application/json; charset=utf-8",
    body: JSON.stringify({
      status: commits.length === 0 ? "identical" : "ahead",
      ahead_by: commits.length,
      behind_by: 0,
      total_commits: commits.length,
      commits: commits.slice(0, perPage ?? 250).map((sha) => ({ sha })),
      files,
    }),
  };
}

// GitHub's answer to one comparison, given how many commits it lists and the
// files that differ between the two published revisions.
export type Comparison = (
  perPage: number | undefined,
  files: readonly ChangedFile[],
) => OriginAnswer;

// The head is ahead of the base by `commits`, naming whatever files differ
// between the two.
export const aheadBy =
  (commits: readonly string[]): Comparison =>
  (perPage, files) =>
    aheadByAnswer(commits, perPage, files);

// Whether `ancestor` is in the history of `commit`; undefined when either is
// not a commit there.
function isAncestor(repoDir: string, ancestor: string, commit: string) {
  try {
    execFileSync(
      "git",
      ["-C", repoDir, "merge-base", "--is-ancestor", ancestor, commit],
      { stdio: "ignore" },
    );
    return true;
  } catch (error) {
    return (error as { status?: number }).status === 1 ? false : undefined;
  }
}

// Whether `argv` asks GitHub's comparison only how the head relates to the
// base (`--jq .status`), as the containment read does, rather than the
// commits and files between.
export function asksContainment(argv: readonly string[]): boolean {
  const jq = argv.indexOf("--jq");
  return jq !== -1 && argv[jq + 1] === ".status";
}

// The comparison as the repository's history answers it; GitHub's 404 when
// either is not a commit there.
export function comparisonIn(
  repoDir: string,
  base: string,
  head: string,
): OriginAnswer {
  if (base === head) return compareAnswer("identical");
  const ahead = isAncestor(repoDir, base, head);
  const behind = isAncestor(repoDir, head, base);
  if (ahead === undefined || behind === undefined) return notFoundAnswer();
  return compareAnswer(ahead ? "ahead" : behind ? "behind" : "diverged");
}

// Comparisons told from a configured ref's moves, in order, each with the
// commits it was made by when it names them. Two revisions the ref named,
// joined by its moves from the base to the head, compare as ahead by those
// moves' commits, naming the files that differ between the two published
// revisions (`filesAt`); joined through a move that names none, as no
// connection. The reverse, from a later revision to an earlier one, is
// behind, and any other comparison diverged.
export function refMoveComparisons(
  filesAt: (revision: string) => Readonly<Record<string, string>> | undefined,
) {
  const moves: {
    readonly from: string;
    readonly to: string;
    readonly by: readonly MadeCommit[] | undefined;
  }[] = [];
  // The moves that took the ref from `base` to `head`, oldest first, or
  // undefined when it never moved from one to the other.
  const movesBetween = (base: string, head: string) => {
    for (let first = 0; first < moves.length; first += 1) {
      if (moves[first]?.from !== base) continue;
      const last = moves.findIndex(({ to }, at) => at >= first && to === head);
      if (last !== -1) return moves.slice(first, last + 1);
    }
    return undefined;
  };
  return {
    moved(from: string, to: string, by: readonly MadeCommit[] | undefined) {
      moves.push({ from, to, by });
    },
    // No connection, before the comparison is observed; undefined otherwise.
    unconnected(base: string, head: string) {
      return movesBetween(base, head)?.some(({ by }) => by === undefined) ===
        true
        ? noConnection
        : undefined;
    },
    answer(base: string, head: string, perPage: number | undefined) {
      const forward = movesBetween(base, head);
      if (forward === undefined) {
        return compareAnswer(
          movesBetween(head, base) === undefined ? "diverged" : "behind",
        );
      }
      return aheadByAnswer(
        forward.flatMap(({ by = [] }) => by.map(({ sha }) => sha)),
        perPage,
        changedBetween(filesAt(base) ?? {}, filesAt(head) ?? {}),
      );
    },
  };
}
