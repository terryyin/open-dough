// What an origin standing in for GitHub (./publishedOrigin.ts,
// ./committedOrigin.ts) observes of the `gh` calls it answers.
//
// Every origin answers the page's revision checks but leaves their branch-head
// listings out of what it observes (`isHeadsCheck`): checks arrive on their own
// schedule, so a count of reads stays exact however long a journey runs. Specs
// that follow the checks themselves read them from every `gh` call
// (./autoRefreshJourney.ts's `headsChecks`).

import type { GhCall } from "./support/fakeGitHub.ts";

// One `gh` invocation that asked an origin for its ref or a file.
export type ObservedRequest = GhCall;

// A revision check's listing of every published branch head at once, as
// opposed to a read that resolves `main`.
export function isHeadsCheck({ request }: GhCall): boolean {
  return request.kind === "matching-refs";
}

// What GitHub was asked besides the checks, as `<kind> <path>@<revision>` or
// `branch <name>`.
export function readsBesideChecks(calls: readonly GhCall[]): string[] {
  return calls
    .filter((call) => !isHeadsCheck(call))
    .map(({ request }) => {
      switch (request.kind) {
        case "content":
        case "listing":
        case "commit-list":
          return `${request.kind} ${request.path}@${request.revision}`;
        case "branch":
          return `branch ${request.branch}`;
        case "ref":
          return `ref ${request.ref}`;
        default:
          return request.kind;
      }
    });
}

// Notes a call among what an origin was asked, unless it is a revision check.
export function observe(observed: ObservedRequest[], call: GhCall): void {
  if (!isHeadsCheck(call)) {
    observed.push(call);
  }
}

// What origin was asked for, in order: the ref, or the file at a revision.
// Revision checks are not among them (see `isHeadsCheck`).
export function pathsRead(origin: {
  readonly requests: readonly ObservedRequest[];
}): string[] {
  return origin.requests.map(({ request }) => {
    if (request.kind === "ref") {
      return request.ref;
    }
    if (request.kind === "content") {
      return contentPathRead(request.path, request.revision);
    }
    return "unknown";
  });
}

// Content paths among every `gh` call except the backlog membership read,
// named as `pathsRead` names them. Use when membership left detail unobserved.
export function detailContentPaths(
  calls: readonly GhCall[],
  backlogPath = ".planning/PRODUCT-BACKLOG.md",
): string[] {
  return calls.flatMap(({ request }) =>
    request.kind === "content" && request.path !== backlogPath
      ? [contentPathRead(request.path, request.revision)]
      : [],
  );
}

function contentPathRead(path: string, revision: string): string {
  return `${path.split("/").pop() ?? ""}?ref=${revision}`;
}
