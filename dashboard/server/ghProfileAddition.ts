// Which commit added an agent profile's current allocation, for the local
// authenticated read boundary (`./authenticatedRead.ts`): GitHub's commit
// list for the profile path as of a resolved commit, newest first, and each
// listed commit's own change to that path, walked back from the resolved
// commit until the change that added it. Later changes to the path are
// modifications of the same allocation; a removal, rename, or any change this
// walk cannot classify ends it, so an older allocation of the same rotating
// name never supplies the addition. How `gh` runs and fails is `./ghRead.ts`;
// remembering answers per commit is `./pinnedTexts.ts`.

import { GhFailure, runGh, usableCommitterDate } from "./ghRead.ts";
import { usableAvatarSource } from "./avatarImages.ts";
import { commitShaPattern } from "../src/authenticatedReadRules.ts";

// At most this many commits of a profile's history are listed and walked: an
// allocation is added once and modified rarely, so its addition is among its
// latest few changes.
const additionWalkLimit = 10;

// One commit's change to one path: GitHub's file status for it, or undefined
// when the commit's file list does not name the path; the Git committer's
// name when usable, and the committer date when usable, which for the
// addition is when the allocation was made (the Take of the work it records);
// and the GitHub account GitHub matched to that committer,
// when it matched one, with that account's avatar source when GitHub named a
// usable one (`./avatarImages.ts`).
type CommitChange = {
  readonly status: string | undefined;
  readonly committerName: string | null;
  readonly committedAt: string | null;
  readonly login: string | null;
  readonly avatar: string | null;
};

// The commit that added a profile's current allocation, with its committer as
// `CommitChange` names it; null when the walked history has no such commit.
export type ProfileAddition = {
  readonly commit: string;
  readonly committerName: string | null;
  readonly committedAt: string | null;
  readonly login: string | null;
  readonly avatar: string | null;
} | null;

function parsedJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    throw new GhFailure({ kind: "failed" });
  }
}

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

// A committer name worth showing as a person's name: trimmed, non-empty text
// of ordinary length.
function usableName(name: unknown): string | null {
  if (typeof name !== "string") {
    return null;
  }
  const trimmed = name.trim();
  return trimmed.length > 0 && trimmed.length <= 200 ? trimmed : null;
}

// A GitHub login as GitHub spells one.
const loginPattern = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})(?:\[bot\])?$/;

// What `commit` changed about `path`, from GitHub's answer for that commit.
// An answer for another commit, or not shaped like a commit, is not read.
export async function commitChangeViaGh(
  repository: string,
  commit: string,
  path: string,
  signal: AbortSignal,
): Promise<CommitChange> {
  const answer = parsedJson(
    await runGh(["api", `repos/${repository}/commits/${commit}`], signal),
  ) as {
    sha?: unknown;
    commit?: { committer?: { name?: unknown; date?: unknown } };
    committer?: { login?: unknown; avatar_url?: unknown } | null;
    files?: unknown;
  } | null;
  if (answer?.sha !== commit || !Array.isArray(answer.files)) {
    throw new GhFailure({ kind: "no-commit" });
  }
  const file = (answer.files as unknown[]).find(
    (each) => (each as { filename?: unknown } | null)?.filename === path,
  ) as { status?: unknown } | undefined;
  const login = answer.committer?.login;
  const matched = typeof login === "string" && loginPattern.test(login);
  return {
    status: typeof file?.status === "string" ? file.status : undefined,
    committerName: usableName(answer.commit?.committer?.name),
    committedAt: usableCommitterDate(answer.commit?.committer?.date),
    login: matched ? login : null,
    avatar: matched ? usableAvatarSource(answer.committer?.avatar_url) : null,
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
