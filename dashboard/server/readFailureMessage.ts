// What the local authenticated read boundary (`./authenticatedRead.ts`)
// reports for a failed read, from the failure category `./ghRead.ts`
// established: person-facing wording, and any wait a rate limit directed.

import type { PublishedSource } from "../src/publishedSource.ts";
import { GhFailure, readTimeoutMs } from "./ghRead.ts";

export type ReportedFailure = {
  readonly message: string;
  // Whole seconds GitHub asked the local `gh` login to wait before asking
  // again, when a refused answer said so.
  readonly retryAfterSeconds: number | undefined;
};

export function reportedFailure(
  error: unknown,
  source: PublishedSource,
  reading: string,
): ReportedFailure {
  const reason = error instanceof GhFailure ? error.reason : undefined;
  return {
    message: failureMessage(error, source, reading),
    retryAfterSeconds:
      reason?.kind === "rate-limited" ? reason.waitSeconds : undefined,
  };
}

// What the person is told when `gh` could not answer: which project and which
// read, the category `./ghRead.ts` could establish, and what to do next.
// Never anything `gh` itself printed.
function failureMessage(
  error: unknown,
  source: PublishedSource,
  reading: string,
): string {
  const reason =
    error instanceof GhFailure ? error.reason : { kind: "failed" as const };
  const checkAccess = `Check that \`gh auth status\` succeeds and that this login can read ${source.repository}, then press Retry.`;
  switch (reason.kind) {
    case "not-logged-in":
      return `The local GitHub CLI is not logged in, so ${reading} could not be read. Run \`gh auth login\` (check with \`gh auth status\`), then press Retry.`;
    case "not-installed":
      return `The GitHub CLI (\`gh\`) could not be started, so ${reading} could not be read. Install \`gh\` and run \`gh auth login\`, then press Retry.`;
    case "unreachable":
      return `The local GitHub CLI could not reach GitHub while reading ${reading}.`;
    case "rate-limited": {
      const wait =
        reason.waitSeconds === undefined
          ? "Wait before pressing Retry."
          : `GitHub asked to wait ${String(reason.waitSeconds)} seconds before asking again.`;
      return `GitHub limited the rate of the local GitHub CLI's requests (HTTP ${String(reason.status)}) while reading ${reading}. ${wait}`;
    }
    case "no-commit":
      return `GitHub's answer for ${reading} did not name a commit.`;
    case "timed-out":
      return `The local GitHub CLI did not answer within ${String(readTimeoutMs() / 1000)} seconds while reading ${reading}.`;
    case "http": {
      const access =
        reason.status === 401 || reason.status === 403 || reason.status === 404
          ? ` ${checkAccess}`
          : "";
      return `GitHub answered HTTP ${String(reason.status)} to the local GitHub CLI while reading ${reading}.${access}`;
    }
    case "failed":
      return `The local authenticated read failed while reading ${reading}. ${checkAccess}`;
  }
}
