// Which read a request to the local authenticated read boundary
// (`./authenticatedRead.ts`) asks for, once its catalog source is known:
// the ref resolved afresh with its backlog; only whether the ref still names
// the revision already shown (`since`), and which heads the story branches
// recorded at that revision name now (`watch`); the backlog at an already
// resolved revision; one repository path at a pinned revision; when one repository
// path was last committed at a pinned revision (`committed=last`); which
// commit added one agent profile's current allocation, when, and who
// committed it, at a pinned revision (`committed=added`); the records
// published beside the backlog at a pinned revision
// (`./listedRecordsRead.ts`); which commit a story branch recorded at a pinned revision names now (`branch`);
// or one path, or its last commit, at a head of that branch (`branch` and
// `head`); or whether a pinned revision contains an accepted one
// (`contains`, `./containmentRead.ts`). Malformed or mixed parameters are
// refused here (`./refusedParameters.ts`), before any `gh` call.

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
import { profileAgentName } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";

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
  | {
      readonly kind: "addition-at";
      readonly revision: string;
      readonly path: string;
    }
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

// At most this many story branches are watched by one check: far more than
// a project's Taken entries.
const watchedBranchLimit = 100;

function parseWatchedBranches(
  watched: readonly string[],
): readonly string[] | RefusedParameters {
  if (watched.length > watchedBranchLimit) {
    return refused("A revision check watches too many branches.");
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

// Which commit added an agent profile, asked only on trunk at a pinned
// revision and only for a path the shared profile module names as a profile;
// whether that profile is listed at the revision is the performed read's to
// decide. An avatar read (`./avatarRead.ts`) names its profile the same way.
export function parseAdditionRead(
  revision: string | null,
  path: string | null,
):
  Extract<RequestedRead, { readonly kind: "addition-at" }> | RefusedParameters {
  if (!isPinnedRevision(revision)) {
    return unpinnedRevision;
  }
  const repositoryPath = parseSafeRepositoryPath(path);
  const file = repositoryPath?.split("/").pop();
  if (
    repositoryPath === undefined ||
    file === undefined ||
    profileAgentName(file) === undefined
  ) {
    return refused("An addition read names only an agent profile path.");
  }
  return { kind: "addition-at", revision, path: repositoryPath };
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
    const watched = parseWatchedBranches(watch);
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
