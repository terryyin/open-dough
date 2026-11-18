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

// Revisions whose runs (`head_sha=`) were listed more than once.
export function runsListedAgain(calls: readonly GhCall[]): string[] {
  const listed = calls.flatMap(({ request }) =>
    request.kind === "actions-runs" && request.headSha !== ""
      ? [request.headSha]
      : [],
  );
  return [...new Set(listed)].filter(
    (sha) => listed.indexOf(sha) !== listed.lastIndexOf(sha),
  );
}
