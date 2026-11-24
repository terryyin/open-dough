// The GitHub requests a story CI comparison read asked
// (../intent/intent-ci-comparison*.spec.ts), from the fake GitHub's calls.

import type { GhCall } from "./fakeGitHub.ts";

export function listedAttemptJobPages(calls: readonly GhCall[]): string[] {
  return calls
    .flatMap(({ request }) =>
      request.kind === "actions-attempt-jobs"
        ? [
            `${String(request.runId)}/${String(request.attempt)}/${String(request.page)}`,
          ]
        : [],
    )
    .sort();
}
