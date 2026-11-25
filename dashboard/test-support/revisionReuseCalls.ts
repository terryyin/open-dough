// What the specs of the local authenticated read boundary's reuse
// (../backend-tests/observation/revisionReuseBoundary.ts, ./retainedAnswersJourney.ts) observe of the
// `gh` calls GitHub received from what it publishes (./revisionReuseOrigin.ts).

import type { GhCall } from "./support/fakeGitHub.ts";

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
