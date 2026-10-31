// Nested repository tree listing through `gh` for the local authenticated
// read boundary (`./authenticatedRead.ts`): one recursive Git tree at an
// already resolved commit and repository path, as Intent lists feature files
// under a configured location (`./intentLocationsRead.ts`). How `gh` runs
// and fails is `./ghRead.ts`.

import { GhFailure, isNotFound, runGh } from "./ghRead.ts";

// One blob or tree a recursive Git tree lists, with its path relative to the
// requested location.
export type TreeEntry = {
  readonly path: string;
  readonly type: "blob" | "tree";
};

// Each path segment of the location, and the colon that joins the revision
// to it, is URL-encoded so no path character can reshape the request.
function treesEndpoint(
  repository: string,
  path: string,
  revision: string,
): string {
  const encoded = encodeURIComponent(`${revision}:${path}`);
  return `repos/${repository}/git/trees/${encoded}?recursive=1`;
}

// The nested files and folders one pinned repository path lists, from the
// Git trees endpoint. A path the revision does not have (GitHub's `404`)
// lists nothing: Intent distinguishes that empty answer later. Anything but
// a tree answer is not read as one.
export async function listRepositoryTreeViaGh(
  repository: string,
  path: string,
  revision: string,
  signal: AbortSignal,
): Promise<readonly TreeEntry[]> {
  let listing: string;
  try {
    listing = await runGh(
      [
        "api",
        "-H",
        "Accept: application/vnd.github+json",
        treesEndpoint(repository, path, revision),
      ],
      signal,
    );
  } catch (error) {
    if (isNotFound(error)) {
      return [];
    }
    throw error;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(listing);
  } catch {
    throw new GhFailure({ kind: "failed" });
  }
  const tree = (parsed as { tree?: unknown }).tree;
  if (!Array.isArray(tree)) {
    throw new GhFailure({ kind: "failed" });
  }
  return tree.flatMap((entry: unknown) => {
    const { path: entryPath, type } = (entry ?? {}) as {
      path?: unknown;
      type?: unknown;
    };
    if (typeof entryPath !== "string" || entryPath.length === 0) {
      return [];
    }
    if (type !== "blob" && type !== "tree") {
      return [];
    }
    return [{ path: entryPath, type }];
  });
}
