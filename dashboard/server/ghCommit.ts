// One commit's whole record as GitHub answers `commits/<sha>`, for the local
// authenticated read boundary (`./authenticatedRead.ts`): who committed it
// and every file it changed. A commit never changes, so its record is
// remembered by commit in `./pinnedTexts.ts`; the profile addition walk
// (`./ghProfileAddition.ts`) derives one path's change from it. How `gh` runs
// and fails is `./ghRead.ts`.

import { GhFailure, parsedJson, runGh } from "./ghRead.ts";
import { usableCommitterDate } from "./ghCommitTime.ts";
import { usableAvatarSource } from "./avatarImages.ts";

// GitHub lists at most this many of a commit's files in one answer; a list
// this long may have been cut short.
const commitFilePageSize = 300;

// One file a commit changed: its path, GitHub's status for the change when it
// named one, and the path it was renamed or copied from when GitHub gave one.
export type CommitFile = {
  readonly filename: string;
  readonly status: string | null;
  readonly previousFilename: string | null;
};

// Who committed a commit: the Git committer's name when usable, and the
// committer date when usable; the GitHub account GitHub matched to that
// committer, when it matched one, with that account's avatar source when
// GitHub named a usable one (`./avatarImages.ts`).
export type Committer = {
  readonly committerName: string | null;
  readonly committedAt: string | null;
  readonly login: string | null;
  readonly avatar: string | null;
};

// A commit's record: its sha, its committer, and the files it changed, with
// whether that list is whole (fewer files than one answer can list).
export type CommitRecord = Committer & {
  readonly sha: string;
  readonly files: readonly CommitFile[];
  readonly whole: boolean;
};

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

function textOrNull(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

// `commit`'s record, from GitHub's answer for that commit. An answer for
// another commit, or not shaped like a commit, is not read.
export async function commitViaGh(
  repository: string,
  commit: string,
  signal: AbortSignal,
): Promise<CommitRecord> {
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
  const listed = answer.files as unknown[];
  const files = listed.flatMap((each): CommitFile[] => {
    const file = (each ?? {}) as {
      filename?: unknown;
      status?: unknown;
      previous_filename?: unknown;
    };
    return typeof file.filename === "string"
      ? [
          {
            filename: file.filename,
            status: textOrNull(file.status),
            previousFilename: textOrNull(file.previous_filename),
          },
        ]
      : [];
  });
  const login = answer.committer?.login;
  const matched = typeof login === "string" && loginPattern.test(login);
  return {
    sha: commit,
    committerName: usableName(answer.commit?.committer?.name),
    committedAt: usableCommitterDate(answer.commit?.committer?.date),
    login: matched ? login : null,
    avatar: matched ? usableAvatarSource(answer.committer?.avatar_url) : null,
    files,
    whole: listed.length < commitFilePageSize,
  };
}
