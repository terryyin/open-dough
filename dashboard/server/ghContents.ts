// Pinned repository content through `gh` for the local authenticated read
// boundary (`./authenticatedRead.ts`): one file's raw text, or one
// directory's listed file names, at an already resolved commit. Both ask
// GitHub's one contents endpoint; how `gh` runs and fails is `./ghRead.ts`.

import { GhFailure, runGh } from "./ghRead";

// Each path segment is URL-encoded so no path character can reshape the
// request.
function contentsEndpoint(
  repository: string,
  path: string,
  revision: string,
): string {
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return `repos/${repository}/contents/${encoded}?ref=${revision}`;
}

// One pinned file at a known repository path. Callers that need the catalog
// backlog use the source's own `backlogPath`; extra canonical/plan reads use
// paths already checked against that revision's records
// (`./reachablePaths.ts`).
export async function readRepositoryFileViaGh(
  repository: string,
  path: string,
  revision: string,
  signal: AbortSignal,
): Promise<string> {
  return runGh(
    [
      "api",
      "-H",
      "Accept: application/vnd.github.raw+json",
      contentsEndpoint(repository, path, revision),
    ],
    signal,
  );
}

// The file names one pinned repository directory lists, from the contents
// endpoint's JSON listing rather than raw bytes. A directory the revision
// does not have (GitHub's `404`) lists nothing: older projects simply have
// none. Anything but a listing is not read as one.
export async function listRepositoryDirectoryViaGh(
  repository: string,
  path: string,
  revision: string,
  signal: AbortSignal,
): Promise<readonly string[]> {
  let listing: string;
  try {
    listing = await runGh(
      [
        "api",
        "-H",
        "Accept: application/vnd.github+json",
        contentsEndpoint(repository, path, revision),
      ],
      signal,
    );
  } catch (error) {
    if (
      error instanceof GhFailure &&
      error.reason.kind === "http" &&
      error.reason.status === 404
    ) {
      return [];
    }
    throw error;
  }
  let entries: unknown;
  try {
    entries = JSON.parse(listing);
  } catch {
    throw new GhFailure({ kind: "failed" });
  }
  if (!Array.isArray(entries)) {
    throw new GhFailure({ kind: "failed" });
  }
  return entries.flatMap((entry: unknown) => {
    const { name, type } = (entry ?? {}) as { name?: unknown; type?: unknown };
    return type === "file" && typeof name === "string" ? [name] : [];
  });
}
