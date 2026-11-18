// GitHub's commit and path-history answers from an isolated repository's
// real commits, used by journeys that need the original allocation credit.

import { execFileSync } from "node:child_process";
import type { RawAnswer } from "./originAnswers.ts";

export function committedHistoryAnswers(repoDir: string) {
  const git = (...args: string[]) =>
    execFileSync("git", ["-C", repoDir, ...args], { encoding: "utf8" }).trim();
  const historyCommit = (sha: string) => {
    const [name, date] = git("show", "-s", "--format=%cn%n%cI", sha).split(
      "\n",
    );
    return {
      sha,
      commit: { committer: { name, date } },
      committer: null,
      files: git(
        "diff-tree",
        "--root",
        "--no-commit-id",
        "--name-status",
        "-r",
        sha,
      )
        .split("\n")
        .filter(Boolean)
        .map((line) => {
          const [status, filename] = line.split("\t");
          return {
            filename,
            status:
              status === "A"
                ? "added"
                : status === "D"
                  ? "removed"
                  : "modified",
          };
        }),
    };
  };
  const json = (body: unknown): RawAnswer => ({
    status: 200,
    contentType: "application/json; charset=utf-8",
    body: JSON.stringify(body),
  });
  return {
    commit(sha: string): RawAnswer {
      return json(historyCommit(sha));
    },
    list(revision: string, path: string, perPage?: number): RawAnswer {
      const commits = git("log", "--format=%H", revision, "--", path)
        .split("\n")
        .filter(Boolean)
        .slice(0, perPage);
      return json(commits.map(historyCommit));
    },
  };
}
