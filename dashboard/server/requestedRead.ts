// Which read a request to the local authenticated read boundary
// (`./authenticatedRead.ts`) asks for, once its catalog source is known:
// the ref resolved afresh with its backlog; a revision check (`since`,
// `watch`); the backlog or one path at a pinned revision; last commit or
// profile addition (`committed`, `./additionRead.ts`); listed records (`./listedRecordsRead.ts`);
// the done catalog (`./doneCatalogRead.ts`); Intent reads
// (`./intentRequestedRead.ts`); a story branch head or path on it (`branch`,
// `head`); or containment (`contains`, `./containmentRead.ts`). Malformed or
// mixed parameters are refused here (`./refusedParameters.ts`) before any `gh`
// call.

import {
  commitShaPattern,
  isSafeBranchName,
} from "../src/authenticatedReadRules.ts";
import { parseSafeRepositoryPath } from "./reachablePaths.ts";
import {
  isPinnedRevision,
  refused,
  unpinnedRevision,
  type RefusedParameters,
} from "./refusedParameters.ts";
import {
  parseContainmentRead,
  type ContainmentRead,
} from "./containmentRead.ts";
import {
  listedReadParameters,
  parseListedRecordsRead,
  type ListedRecordsRead,
} from "./listedRecordsRead.ts";
import {
  parseDoneCatalogRead,
  type DoneCatalogRead,
} from "./doneCatalogRead.ts";
import {
  parseIntentRequestedRead,
  type IntentRequestedRead,
} from "./intentRequestedRead.ts";
import { parseAdditionRead, type AdditionRead } from "./additionRead.ts";

// A story branch as a read names it: the branch, and the head commit this
// boundary already resolved it to.
export type OnBranch = { readonly branch: string; readonly head: string };

export type RequestedRead =
  | { readonly kind: "ref" }
  | ContainmentRead
  | {
      readonly kind: "revision-check";
      readonly since: string;
      // Story branches recorded at `since` whose heads the check also reports.
      readonly watched: readonly string[];
    }
  | { readonly kind: "backlog-at"; readonly revision: string }
  | ListedRecordsRead
  | DoneCatalogRead
  | IntentRequestedRead
  | AdditionRead
  | {
      readonly kind: "branch-head-at";
      readonly revision: string;
      readonly branch: string;
    }
  | {
      readonly kind: "file-at" | "commit-time-at";
      readonly revision: string;
      readonly path: string;
      // Read at a head of this branch rather than at `revision`, which still
      // decides whether the branch and path may be read at all.
      readonly onBranch?: OnBranch;
    };

// At most this many story branches are watched by one check or stream: far
// more than a project's Taken entries. Shared with
// `./requestedRevisionStream.ts`.
const watchedBranchLimit = 100;

export function parseWatchedBranches(
  watched: readonly string[],
  purpose: "revision check" | "revision stream",
): readonly string[] | RefusedParameters {
  if (watched.length > watchedBranchLimit) {
    return refused(`A ${purpose} watches too many branches.`);
  }
  if (!watched.every(isSafeBranchName)) {
    return refused("A watched branch name is not usable.");
  }
  return [...new Set(watched)];
}

// One repository path read at a revision the caller has validated: its bytes,
// or when it was last committed (`committed=last`). Trunk and branch reads
// share these refusals.
function parsePathRead(
  path: string | null,
  committed: string | null,
):
  | { readonly kind: "file-at" | "commit-time-at"; readonly path: string }
  | RefusedParameters {
  if (committed !== null && committed !== "last") {
    return refused(
      "A commit time read names only a pinned revision and repository path.",
    );
  }
  const repositoryPath = parseSafeRepositoryPath(path);
  return repositoryPath === undefined
    ? refused("The repository path is not usable.")
    : {
        kind: committed === null ? "file-at" : "commit-time-at",
        path: repositoryPath,
      };
}

function parseBranchRead(
  params: URLSearchParams,
  branch: string | null,
): RequestedRead | RefusedParameters {
  const revision = params.get("revision");
  const head = params.get("head");
  const path = params.get("path");
  const committed = params.get("committed");
  if (
    params.get("since") !== null ||
    listedReadParameters.some((name) => params.get(name) !== null) ||
    branch === null
  ) {
    return refused(
      "A branch read names only a pinned revision, a recorded branch, and for a file its resolved head and repository path.",
    );
  }
  if (!isSafeBranchName(branch)) {
    return refused("The branch name is not usable.");
  }
  if (!isPinnedRevision(revision)) {
    return unpinnedRevision;
  }
  if (head === null) {
    return path === null && committed === null
      ? { kind: "branch-head-at", revision, branch }
      : refused("A read on a branch names the branch head it resolved.");
  }
  if (!commitShaPattern.test(head)) {
    return refused("The branch head is not a commit sha.");
  }
  const read = parsePathRead(path, committed);
  return read.kind === "refused"
    ? read
    : { ...read, revision, onBranch: { branch, head } };
}

export function parseRequestedRead(
  params: URLSearchParams,
): RequestedRead | RefusedParameters {
  if (params.has("contains")) return parseContainmentRead(params);
  const revision = params.get("revision");
  const path = params.get("path");
  const since = params.get("since");
  const listed = listedReadParameters.map((name) => params.get(name));
  const committed = params.get("committed");
  const branch = params.get("branch");
  const watch = params.getAll("watch");
  const onlyRevisionCheck =
    since !== null &&
    [revision, path, ...listed, committed, branch, params.get("head")].every(
      (other) => other === null,
    );
  if (watch.length > 0 && !onlyRevisionCheck) {
    return refused("Watched branches are named only with a revision check.");
  }
  // An addition read is asked only on trunk, so a branch or head is refused
  // as part of it.
  if (committed === "added") {
    return [since, branch, params.get("head"), ...listed].every(
      (other) => other === null,
    )
      ? parseAdditionRead(revision, path)
      : refused(
          "An addition read names only a pinned revision and an agent profile path.",
        );
  }
  if (branch !== null || params.get("head") !== null) {
    return parseBranchRead(params, branch);
  }
  const catalogRead = parseDoneCatalogRead(params);
  if (catalogRead !== undefined) {
    return catalogRead;
  }
  const intentRead = parseIntentRequestedRead(params);
  if (intentRead !== undefined) {
    return intentRead;
  }
  const listedRead = parseListedRecordsRead(params);
  if (listedRead !== undefined) {
    return listedRead;
  }
  if (since !== null) {
    if (revision !== null || path !== null || committed !== null) {
      return refused("A revision check names only the revision already shown.");
    }
    if (!commitShaPattern.test(since)) {
      return refused("The revision already shown is not a commit sha.");
    }
    const watched = parseWatchedBranches(watch, "revision check");
    return "kind" in watched
      ? watched
      : { kind: "revision-check", since, watched };
  }
  if (revision === null) {
    return path === null && committed === null
      ? { kind: "ref" }
      : refused("A pinned revision and repository path are both required.");
  }
  if (!isPinnedRevision(revision)) {
    return unpinnedRevision;
  }
  if (path === null && committed === null) {
    // The backlog at a revision the caller already resolved, so a changed
    // ref found by a check is read at exactly that commit.
    return { kind: "backlog-at", revision };
  }
  const read = parsePathRead(path, committed);
  return read.kind === "refused" ? read : { ...read, revision };
}
