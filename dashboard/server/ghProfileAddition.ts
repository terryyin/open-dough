// Which commit added an agent profile's current allocation, for the local
// authenticated read boundary (`./authenticatedRead.ts`): GitHub's commit
// list for the profile path as of a resolved commit, newest first, and each
// listed commit's own change to that path, from that commit's record
// (`./ghCommit.ts`), walked back from the resolved commit until the change
// that added it. Later changes to the path are modifications of the same
// allocation; a removal, rename, or any change this walk cannot classify ends
// it, so an older allocation of the same rotating name never supplies the
// addition. How `gh` runs and fails is `./ghRead.ts`;
// remembering answers per commit is `./pinnedTexts.ts`.

import { GhFailure, parsedJson, runGh } from "./ghRead.ts";
import type { CommitRecord, Committer } from "./ghCommit.ts";
import { commitShaPattern } from "../src/authenticatedReadRules.ts";

// At most this many commits of a profile's history are listed and walked: an
// allocation is added once and modified rarely, so its addition is among its
// latest few changes.
const additionWalkLimit = 10;

// One commit's change to one path: GitHub's file status for it, or undefined
// when the commit's file list does not name the path; and the committer as
// the commit's record names it (`./ghCommit.ts`), whose date, for the
// addition, is when the allocation was made (the Take of the work it records).
type CommitChange = Committer & { readonly status: string | undefined };

// The commit that added a profile's current allocation, with its committer;
// null when the walked history has no such commit.
export type ProfileAddition = (Committer & { readonly commit: string }) | null;

// The commits GitHub lists as changing `path` in the history of `revision`,
// newest first, at most `additionWalkLimit` of them.
export async function listPathCommitsViaGh(
  repository: string,
  path: string,
  revision: string,
  signal: AbortSignal,
): Promise<readonly string[]> {
  const listed = parsedJson(
    await runGh(
      [
        "api",
        `repos/${repository}/commits?sha=${revision}&path=${encodeURIComponent(path)}&per_page=${String(additionWalkLimit)}`,
      ],
      signal,
    ),
  );
  if (!Array.isArray(listed)) {
    throw new GhFailure({ kind: "failed" });
  }
  return listed.map((each: unknown) => {
    const { sha } = (each ?? {}) as { sha?: unknown };
    if (typeof sha !== "string" || !commitShaPattern.test(sha)) {
      throw new GhFailure({ kind: "no-commit" });
    }
    return sha;
  });
}

// What `commit` changed about `path`, derived from that commit's record:
// GitHub's status for the file it names as `path`, or undefined when its file
// list does not name the path, with the committer as the record names it.
export function commitChangeOf(
  { files, committerName, committedAt, login, avatar }: CommitRecord,
  path: string,
): CommitChange {
  const file = files.find((each) => each.filename === path);
  return {
    status: file?.status ?? undefined,
    committerName,
    committedAt,
    login,
    avatar,
  };
}

// Walks `commits` (newest first) back to the one that added `path`: a
// modification continues the walk, and anything else but an addition ends it
// without one.
export async function findAddition(
  commits: readonly string[],
  changeOf: (commit: string) => Promise<CommitChange>,
): Promise<ProfileAddition> {
  for (const commit of commits) {
    const { status, ...committed } = await changeOf(commit);
    if (status === "added") {
      return { commit, ...committed };
    }
    if (status !== "modified" && status !== "changed") {
      return null;
    }
  }
  return null;
}
