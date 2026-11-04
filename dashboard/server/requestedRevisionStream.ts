// Whether a request to the local authenticated read boundary
// (`./authenticatedRead.ts`) asks for a revision stream rather than one
// check: it names the revision already shown with `at` (not `since`, so
// check accounting stays on today's checks) and optional `watch` branches.
// Malformed or mixed parameters are refused here before any `gh` call.

import {
  commitShaPattern,
  revisionStreamAtParameter,
} from "../src/authenticatedReadRules.ts";
import { refused, type RefusedParameters } from "./refusedParameters.ts";
import { parseWatchedBranches } from "./requestedRead.ts";

// The revision and watched branches one open stream is answered for.
export type RevisionStreamAsk = {
  readonly at: string;
  readonly watched: readonly string[];
};

const streamAlone = [
  "since",
  "revision",
  "path",
  "committed",
  "branch",
  "head",
  "contains",
  "agents",
  "done",
  "intent",
] as const;

export function parseRequestedRevisionStream(
  params: URLSearchParams,
): RevisionStreamAsk | RefusedParameters | undefined {
  const at = params.get(revisionStreamAtParameter);
  if (at === null) return undefined;
  if (streamAlone.some((name) => params.get(name) !== null)) {
    return refused(
      "A revision stream names only the revision already shown and watched branches.",
    );
  }
  if (!commitShaPattern.test(at)) {
    return refused("The revision already shown is not a commit sha.");
  }
  const watched = parseWatchedBranches(
    params.getAll("watch"),
    "revision stream",
  );
  return "kind" in watched ? watched : { at, watched };
}
