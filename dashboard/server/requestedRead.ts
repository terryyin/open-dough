// Which read a request to the local authenticated read boundary
// (`./authenticatedRead.ts`) asks for, once its catalog source is known:
// the ref resolved afresh with its backlog; only whether the ref still names
// the revision already shown (`since`), and which heads the story branches
// recorded at that revision name now (`watch`); the backlog at an already
// resolved revision; one repository path at a pinned revision; when one repository
// path was last committed at a pinned revision (`committed=last`); the
// agent profiles published beside the backlog at a pinned revision; which
// commit a story branch recorded at a pinned revision names now (`branch`);
// or one path, or its last commit, at a head of that branch (`branch` and
// `head`). Malformed or mixed parameters are refused here, before any `gh`
// call.

import {
  commitShaPattern,
  isSafeBranchName,
} from "../src/authenticatedReadRules.ts";
import { parseSafeRepositoryPath } from "./reachablePaths.ts";

// A story branch as a read names it: the branch, and the head commit this
// boundary already resolved it to.
export type OnBranch = { readonly branch: string; readonly head: string };

export type RequestedRead =
  | { readonly kind: "ref" }
  | {
      readonly kind: "revision-check";
      readonly since: string;
      // Story branches recorded at `since` whose heads the check also reports.
      readonly watched: readonly string[];
    }
  | { readonly kind: "backlog-at"; readonly revision: string }
  | { readonly kind: "agent-profiles-at"; readonly revision: string }
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

export type RefusedParameters = {
  readonly kind: "refused";
  readonly status: 400;
  readonly message: string;
};

function refused(message: string): RefusedParameters {
  return { kind: "refused", status: 400, message };
}

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
    params.get("agents") !== null ||
    branch === null
  ) {
    return refused(
      "A branch read names only a pinned revision, a recorded branch, and for a file its resolved head and repository path.",
    );
  }
  if (!isSafeBranchName(branch)) {
    return refused("The branch name is not usable.");
  }
  if (revision === null || !commitShaPattern.test(revision)) {
    return refused("The pinned revision is not a commit sha.");
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
  const revision = params.get("revision");
  const path = params.get("path");
  const since = params.get("since");
  const agents = params.get("agents");
  const committed = params.get("committed");
  const branch = params.get("branch");
  const watch = params.getAll("watch");
  const onlyRevisionCheck =
    since !== null &&
    [revision, path, agents, committed, branch, params.get("head")].every(
      (other) => other === null,
    );
  if (watch.length > 0 && !onlyRevisionCheck) {
    return refused("Watched branches are named only with a revision check.");
  }
  if (branch !== null || params.get("head") !== null) {
    return parseBranchRead(params, branch);
  }
  if (agents !== null) {
    if (
      agents !== "profiles" ||
      path !== null ||
      since !== null ||
      committed !== null
    ) {
      return refused("An agent profile read names only a pinned revision.");
    }
    if (revision === null || !commitShaPattern.test(revision)) {
      return refused("The pinned revision is not a commit sha.");
    }
    return { kind: "agent-profiles-at", revision };
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
  if (!commitShaPattern.test(revision)) {
    return refused("The pinned revision is not a commit sha.");
  }
  if (path === null && committed === null) {
    // The backlog at a revision the caller already resolved, so a changed
    // ref found by a check is read at exactly that commit.
    return { kind: "backlog-at", revision };
  }
  const read = parsePathRead(path, committed);
  return read.kind === "refused" ? read : { ...read, revision };
}
