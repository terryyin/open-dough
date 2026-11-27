// What the specs of the local authenticated read boundary's reuse
// (../backend-tests/observation/revisionReuseBoundary.ts, ./retainedAnswersJourney.ts) observe of the
// `gh` calls GitHub received from what it publishes (./revisionReuseOrigin.ts).

import type { FakeGitHub, GhCall } from "./support/fakeGitHub.ts";

// The calls a membership read asked: the ref and the backlog it read. Call
// accounting leaves them out, so a count holds however membership is read.
const membershipCalls = new WeakSet<GhCall>();

// Runs `read`, a membership read, noting every call it asked of `github`.
export async function membershipRead<T>(
  github: Pick<FakeGitHub, "calls">,
  read: () => Promise<T>,
): Promise<T> {
  const before = github.calls.length;
  try {
    return await read();
  } finally {
    for (const call of github.calls.slice(before)) membershipCalls.add(call);
  }
}

// Each call besides membership reads, as `describedExactly` names it.
export function describedBesideMembership(calls: readonly GhCall[]): string[] {
  return calls
    .filter((call) => !membershipCalls.has(call))
    .map(describedExactly);
}

// Each `gh` call as `<kind> <path>@<revision>`, `compare <base>...<head>`,
// or `commit <revision>`.
export function describedExactly({ request }: GhCall): string {
  switch (request.kind) {
    case "content":
    case "listing":
    case "commit-list":
      return `${request.kind} ${request.path}@${request.revision}`;
    case "compare":
      return `compare ${request.base}...${request.head}`;
    case "commit":
      return `commit ${request.sha}`;
    case "branch":
      return `branch ${request.branch}`;
    default:
      return request.kind;
  }
}
