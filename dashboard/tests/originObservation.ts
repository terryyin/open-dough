// What an origin standing in for GitHub (./publishedOrigin.ts,
// ./committedOrigin.ts) observes of the `gh` calls it answers.
//
// Every origin answers the page's revision checks of `main` but leaves them
// out of what it observes (`isRefCheck`): checks arrive on their own schedule,
// so a count of reads stays exact however long a journey runs. Specs that
// follow the checks themselves read them from every `gh` call
// (./autoRefreshJourney.ts's `refChecks`).

import type { GhCall } from "./support/fakeGitHub";

// One `gh` invocation that asked an origin for its ref or a file.
export type ObservedRequest = GhCall;

// A check of `main`, as opposed to a read that resolves it: a check asks with
// `--include` to see GitHub's status.
export function isRefCheck({ argv, request }: GhCall): boolean {
  return request.kind === "ref" && argv.includes("--include");
}

// Notes a call among what an origin was asked, unless it is a revision check.
export function observe(observed: ObservedRequest[], call: GhCall): void {
  if (!isRefCheck(call)) {
    observed.push(call);
  }
}

// What origin was asked for, in order: the ref, or the file at a revision.
// Revision checks are not among them (see `isRefCheck`).
export function pathsRead(origin: {
  readonly requests: readonly ObservedRequest[];
}): string[] {
  return origin.requests.map(({ request }) => {
    if (request.kind === "ref") {
      return request.ref;
    }
    if (request.kind === "content") {
      return `${request.path.split("/").pop() ?? ""}?ref=${request.revision}`;
    }
    return "unknown";
  });
}
