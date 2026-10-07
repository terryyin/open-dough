// When one path was last committed as of a resolved commit, for the local
// authenticated read boundary (`./authenticatedRead.ts`), and a committer
// date as GitHub spells one. How `gh` runs and fails is `./ghRead.ts`.

import { GhFailure, runGh } from "./ghRead.ts";

// A committer date as GitHub spells one: an ISO 8601 instant.
const committerDatePattern =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

// When `path` was last committed in the history of `revision`: the
// committer date of the newest commit GitHub's commit list names for that
// path from that commit. A list naming no commit, or no usable date, is not
// a commit time.
export async function lastCommitTimeViaGh(
  repository: string,
  path: string,
  revision: string,
  signal: AbortSignal,
): Promise<string> {
  const committed = (
    await runGh(
      [
        "api",
        `repos/${repository}/commits?sha=${revision}&path=${encodeURIComponent(path)}&per_page=1`,
        "--jq",
        ".[0].commit.committer.date",
      ],
      signal,
    )
  ).trim();
  const at = usableCommitterDate(committed);
  if (at === null) {
    throw new GhFailure({ kind: "no-commit" });
  }
  return at;
}

// A committer date GitHub named, as an ISO instant; null when it named none
// in its own spelling.
export function usableCommitterDate(date: unknown): string | null {
  return typeof date === "string" && committerDatePattern.test(date)
    ? new Date(date).toISOString()
    : null;
}
