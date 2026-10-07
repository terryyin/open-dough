// GitHub's comparison of a head commit with a base commit, as the fake GitHub
// answers it (./support/fakeGitHub.ts): a raw answer of its status, or that
// answer told from an isolated repository's own history
// (`git merge-base --is-ancestor`), never hand-constructed.

import { execFileSync } from "node:child_process";
import {
  notFoundAnswer,
  type OriginAnswer,
  type RawAnswer,
} from "./originAnswers.ts";

// How the head relates to the base: identical, ahead of it (the head contains
// the base), behind it, or diverged from it.
export type CompareStatus = "identical" | "ahead" | "behind" | "diverged";

export function compareAnswer(status: CompareStatus): RawAnswer {
  return {
    status: 200,
    contentType: "application/json; charset=utf-8",
    body: JSON.stringify({ status, ahead_by: 0, behind_by: 0, commits: [] }),
  };
}

// The head is ahead of the base by `commits`, oldest first: GitHub counts
// them all in `total_commits` and lists at most `perPage` of them.
export function aheadByAnswer(
  commits: readonly string[],
  perPage?: number,
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
    }),
  };
}

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
