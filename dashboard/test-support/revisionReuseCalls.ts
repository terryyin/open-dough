// What the specs of the local authenticated read boundary's reuse
// (../backend-tests/observation/revisionReuseBoundary.ts, ./retainedAnswersJourney.ts) observe of the
// `gh` calls GitHub received from what it publishes (./revisionReuseOrigin.ts).

import type { GhCall } from "./support/fakeGitHub.ts";

// Each `gh` call as `<kind> <path>@<revision>`, `compare <base>...<head>`,
// or `commit <revision>`.
function describe({ request }: GhCall, pin: (sha: string) => string): string {
  switch (request.kind) {
    case "content":
    case "listing":
    case "commit-list":
      return `${request.kind} ${request.path}@${pin(request.revision)}`;
    case "compare":
      return `compare ${pin(request.base)}...${pin(request.head)}`;
    case "commit":
      return `commit ${pin(request.sha)}`;
    case "branch":
      return `branch ${request.branch}`;
    default:
      return request.kind;
  }
}

export const described = (call: GhCall): string =>
  describe(call, (sha) => sha.slice(0, 2));

export const describedExactly = (call: GhCall): string =>
  describe(call, (sha) => sha);
