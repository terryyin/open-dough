// GitHub's answers about a published path's history: the commits that
// changed it, newest first, as many as a commit list asks for, and each
// commit's own change to it. A published agent profile no history names was
// added once, by one commit of its own, so every journey's profiles credit a
// human without saying so. Composed with ./originAnswers.ts's answers by
// ./support/fakeGitHub.ts, ./publishedFiles.ts, and ./committedOrigin.ts.

import { createHash } from "node:crypto";
import { onAvatarHost } from "./avatarAnswers.ts";
import {
  commitListFor,
  fixtureCommit,
  type RawAnswer,
} from "./originAnswers.ts";

// One commit's change to a path as a history of that path records it: the
// commit, GitHub's file status for the path (null when the commit's file list
// does not name the path), and the Git committer, with the commit's committer
// date when it matters (null when GitHub names none), the GitHub account
// GitHub matched to that committer, if any, and the avatar address GitHub
// names for that account.
export type PathChange = {
  readonly sha: string;
  readonly status: "added" | "modified" | "changed" | "removed" | null;
  readonly committer: string;
  readonly committedAt?: Date | null;
  readonly login?: string;
  readonly avatarUrl?: string;
};

// Commit number `n`'s change to a path, by `committer`, matched to `account`
// when given.
export function pathChange(
  n: number,
  status: PathChange["status"],
  committer: string,
  account?: { readonly login: string; readonly avatarUrl?: string },
): PathChange {
  return {
    sha: n.toString(16).padStart(2, "0").repeat(20),
    status,
    committer,
    ...account,
  };
}

// Commit number `n` adding a path at `committedAt`, as when an agent profile
// records a Take then.
export function addedAt(n: number, committedAt: Date | null): PathChange {
  return { ...pathChange(n, "added", "Fixture Committer"), committedAt };
}

// Each published path's history, newest first; null when its history is not
// published, so its commit list fails.
export type PathHistories = Readonly<
  Record<string, readonly PathChange[] | null>
>;

// What a published revision tells about its paths' histories: its files,
// when each path was last committed, and each path's history.
type PublishedHistories = {
  readonly files?: Readonly<Record<string, string>>;
  readonly committed?: Readonly<Record<string, Date>>;
  readonly history?: PathHistories;
};

// When a history's commits were made, unless one says.
const committedByDefault = new Date("2026-09-20T08:00:00Z");

const agentProfile = /^\.planning\/agents\/[^/]+\.json$/;

// The history of `path` as `published` tells it: the one it lists, or, for a
// published agent profile nothing else dates, its addition by a commit of its
// own; undefined when neither applies.
function historyOf(
  published: PublishedHistories,
  path: string,
): readonly PathChange[] | null | undefined {
  const { files, committed, history } = published;
  if (history !== undefined && Object.hasOwn(history, path)) {
    return history[path];
  }
  if (
    files === undefined ||
    !Object.hasOwn(files, path) ||
    !agentProfile.test(path) ||
    (committed !== undefined && Object.hasOwn(committed, path))
  ) {
    return undefined;
  }
  const sha = createHash("sha1").update(path).digest("hex");
  return [{ sha, status: "added", committer: "Fixture Committer" }];
}

// A commit of a path's history as GitHub describes it, with the account
// GitHub matched to its committer.
function historyCommit(change: PathChange) {
  const described = fixtureCommit(
    change.sha,
    change.committer,
    change.committedAt ?? committedByDefault,
  );
  return {
    ...described,
    commit: {
      ...described.commit,
      committer: {
        ...described.commit.committer,
        ...(change.committedAt === null && { date: null }),
      },
    },
    committer:
      change.login === undefined
        ? null
        : {
            login: change.login,
            avatar_url: change.avatarUrl ?? onAvatarHost("/u/1"),
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

// The commit list for `path`, at most `perPage` commits of it: the commits
// its history lists, or else its time in `committed`; undefined when neither
// names it or its history is not published.
export function commitListIn(
  published: PublishedHistories,
  path: string,
  perPage?: number,
): RawAnswer | undefined {
  const history = historyOf(published, path);
  if (history === null) {
    return undefined;
  }
  return history === undefined
    ? commitListFor(published.committed, path)
    : jsonAnswer(history.slice(0, perPage).map(historyCommit));
}

// GitHub's answer for commit `sha` when a history of one of `publications`
// lists it, naming its change to each path whose history there lists it among
// the files it changed; undefined when none does.
export function commitAnswerIn(
  publications: readonly PublishedHistories[],
  sha: string,
): RawAnswer | undefined {
  for (const published of publications) {
    const paths = new Set([
      ...Object.keys(published.history ?? {}),
      ...Object.keys(published.files ?? {}),
    ]);
    const changes = [...paths].flatMap((path) => {
      const change = historyOf(published, path)?.find(
        (each) => each.sha === sha,
      );
      return change === undefined ? [] : [{ path, change }];
    });
    const [first] = changes;
    if (first !== undefined) {
      return jsonAnswer({
        ...historyCommit(first.change),
        files: [
          { filename: ".planning/PRODUCT-BACKLOG.md", status: "modified" },
          ...changes.flatMap(({ path, change: { status } }) =>
            status === null ? [] : [{ filename: path, status }],
          ),
        ],
      });
    }
  }
  return undefined;
}

// One file a commit changed as GitHub's answer for the commit names it: its
// path, status, and the path it was renamed or copied from, when it was.
export type ChangedFile = {
  readonly filename: string;
  readonly status: "added" | "modified" | "removed" | "renamed" | "copied";
  readonly previous_filename?: string;
};

// A commit a move of the configured ref was made by: its sha and committer,
// as a path's history names it, and every file it changed.
export type MadeCommit = Omit<PathChange, "status"> & {
  readonly files: readonly ChangedFile[];
};

// GitHub's answer for a commit a move was made by, naming every file it
// changed, as one answer names at most 300 of them.
export function madeCommitAnswer(made: MadeCommit): RawAnswer {
  return jsonAnswer({
    ...historyCommit({ ...made, status: null }),
    files: made.files.slice(0, 300),
  });
}
