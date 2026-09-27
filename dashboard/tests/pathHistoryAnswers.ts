// GitHub's answers about a published path's history: the commits that
// changed it, newest first, and each commit's own change to it. Composed with
// ./originAnswers.ts's answers by ./support/fakeGitHub.ts and
// ./publishedFiles.ts.

import {
  commitListFor,
  fixtureCommit,
  type RawAnswer,
} from "./originAnswers.ts";

// One commit's change to a path as a history of that path records it: the
// commit, GitHub's file status for the path, and the Git committer, with the
// GitHub account GitHub matched to that committer, if any.
export type PathChange = {
  readonly sha: string;
  readonly status: "added" | "modified" | "removed";
  readonly committer: string;
  readonly login?: string;
};

// Each published path's history, newest first.
export type PathHistories = Readonly<Record<string, readonly PathChange[]>>;

const committedAt = new Date("2026-09-20T08:00:00Z");

// A commit of a path's history as GitHub describes it, with the account
// GitHub matched to its committer.
function historyCommit(change: PathChange) {
  return {
    ...fixtureCommit(change.sha, change.committer, committedAt),
    committer:
      change.login === undefined
        ? null
        : {
            login: change.login,
            avatar_url: `https://avatars.githubusercontent.com/u/1?v=4`,
          },
  };
}

function jsonAnswer(body: unknown): RawAnswer {
  return {
    status: 200,
    contentType: "application/json; charset=utf-8",
    body: JSON.stringify(body),
  };
}

// The commit list for `path`: the commits `history` lists for it, or else
// its time in `committed`; undefined when neither names it.
export function commitListIn(
  published: {
    readonly history?: PathHistories;
    readonly committed?: Readonly<Record<string, Date>>;
  },
  path: string,
): RawAnswer | undefined {
  const history = published.history?.[path];
  return history === undefined
    ? commitListFor(published.committed, path)
    : jsonAnswer(history.map(historyCommit));
}

// GitHub's answer for commit `sha` when one of `histories` lists it, naming
// its change to that path among the files it changed; undefined when none
// does.
export function commitAnswerIn(
  histories: readonly (PathHistories | undefined)[],
  sha: string,
): RawAnswer | undefined {
  for (const history of histories) {
    for (const [path, changes] of Object.entries(history ?? {})) {
      const change = changes.find((each) => each.sha === sha);
      if (change !== undefined) {
        return jsonAnswer({
          ...historyCommit(change),
          files: [
            { filename: ".planning/PRODUCT-BACKLOG.md", status: "modified" },
            { filename: path, status: change.status },
          ],
        });
      }
    }
  }
  return undefined;
}
