// Which read a request to the local authenticated read boundary
// (`./authenticatedRead.ts`) asks for, once its catalog source is known:
// the ref resolved afresh with its backlog; only whether the ref still names
// the revision already shown (`since`); the backlog at an already resolved
// revision; one repository path at a pinned revision; or the agent profiles
// published beside the backlog at a pinned revision. Malformed or mixed
// parameters are refused here, before any `gh` call.

import { commitShaPattern } from "../src/authenticatedReadRules";
import { parseSafeRepositoryPath } from "./reachablePaths";

export type RequestedRead =
  | { readonly kind: "ref" }
  | { readonly kind: "revision-check"; readonly since: string }
  | { readonly kind: "backlog-at"; readonly revision: string }
  | { readonly kind: "agent-profiles-at"; readonly revision: string }
  | {
      readonly kind: "file-at";
      readonly revision: string;
      readonly path: string;
    };

export type RefusedParameters = {
  readonly kind: "refused";
  readonly status: 400;
  readonly message: string;
};

function refused(message: string): RefusedParameters {
  return { kind: "refused", status: 400, message };
}

export function parseRequestedRead(
  params: URLSearchParams,
): RequestedRead | RefusedParameters {
  const revision = params.get("revision");
  const path = params.get("path");
  const since = params.get("since");
  const agents = params.get("agents");
  if (agents !== null) {
    if (agents !== "profiles" || path !== null || since !== null) {
      return refused("An agent profile read names only a pinned revision.");
    }
    if (revision === null || !commitShaPattern.test(revision)) {
      return refused("The pinned revision is not a commit sha.");
    }
    return { kind: "agent-profiles-at", revision };
  }
  if (since !== null) {
    if (revision !== null || path !== null) {
      return refused("A revision check names only the revision already shown.");
    }
    if (!commitShaPattern.test(since)) {
      return refused("The revision already shown is not a commit sha.");
    }
    return { kind: "revision-check", since };
  }
  if (revision === null) {
    return path === null
      ? { kind: "ref" }
      : refused("A pinned revision and repository path are both required.");
  }
  if (!commitShaPattern.test(revision)) {
    return refused("The pinned revision is not a commit sha.");
  }
  if (path === null) {
    // The backlog at a revision the caller already resolved, so a changed
    // ref found by a check is read at exactly that commit.
    return { kind: "backlog-at", revision };
  }
  const repositoryPath = parseSafeRepositoryPath(path);
  return repositoryPath === undefined
    ? refused("The repository path is not usable.")
    : { kind: "file-at", revision, path: repositoryPath };
}
