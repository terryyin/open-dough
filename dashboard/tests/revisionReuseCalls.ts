// What the specs of the local authenticated read boundary's reuse
// (./revisionReuseBoundary.ts, ./retainedAnswersJourney.ts) observe of the
// `gh` calls GitHub received from what it publishes (./revisionReuseOrigin.ts).

import type { GhCall } from "./support/fakeGitHub.ts";

// Each `gh` call as `<kind> <path>@<revision pair>`, `compare <base
// pair>...<head pair>`, or `commit <pair>`.
export function described({ request }: GhCall): string {
  const pair = (sha: string) => sha.slice(0, 2);
  switch (request.kind) {
    case "content":
    case "listing":
    case "commit-list":
      return `${request.kind} ${request.path}@${pair(request.revision)}`;
    case "compare":
      return `compare ${pair(request.base)}...${pair(request.head)}`;
    case "commit":
      return `commit ${pair(request.sha)}`;
    case "branch":
      return `branch ${request.branch}`;
    default:
      return request.kind;
  }
}
