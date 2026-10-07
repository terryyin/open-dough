// What the local authenticated read boundary (`./authenticatedRead.ts`)
// reports for a failed read, from the failure category `./ghRead.ts`
// established: person-facing wording, any wait a rate limit directed, and
// whether the failure is safe for the page's transient recovery (not inferred
// from the boundary's HTTP wrapper or rendered prose).

import type { PublishedSource } from "../src/publishedSource.ts";
import {
  GhFailure,
  type GhFailureReason,
  rateLimitStop,
  readTimeoutMs,
} from "./ghRead.ts";

// Upstream HTTP statuses the page may recover from on its own. Validated here
// from GitHub's included status (`./ghAnswer.ts`), never from the boundary's
// generic 502 response status.
const transientHttpStatuses = new Set([408, 500, 502, 503, 504]);

export type ReportedFailure = {
  readonly message: string;
  // Whole seconds before this process asks GitHub again, when a rate limit
  // stopped the read: the wait it met, or what is left of it when the read
  // was held back.
  readonly retryAfterSeconds: number | undefined;
  // Safe for the page's project-local transient recovery schedule; absent
  // when the failure stays actionable (access, missing facts, unknown).
  readonly recovery: "transient" | undefined;
};

// Whether this classified failure may enter the page's transient recovery.
// Rate limits and held-back reads use rate-limit recovery instead.
function recoveryOf(reason: GhFailureReason): "transient" | undefined {
  switch (reason.kind) {
    case "unreachable":
    case "timed-out":
      return "transient";
    case "http":
      return transientHttpStatuses.has(reason.status) ? "transient" : undefined;
    default:
      return undefined;
  }
}

function failureReasonOf(error: unknown): GhFailureReason {
  return error instanceof GhFailure ? error.reason : { kind: "failed" };
}

export function reportedFailure(
  error: unknown,
  source: PublishedSource,
  reading: string,
): ReportedFailure {
  const reason = failureReasonOf(error);
  return {
    message: failureMessage(reason, source, reading),
    retryAfterSeconds: rateLimitStop(error)?.waitSeconds,
    recovery: recoveryOf(reason),
  };
}

// What the person is told when `gh` could not answer: which project and which
// read, the category `./ghRead.ts` could establish, and what to do next.
// Never anything `gh` itself printed.
function failureMessage(
  reason: GhFailureReason,
  source: PublishedSource,
  reading: string,
): string {
  const checkAccess = `Check that \`gh auth status\` succeeds and that this login can read ${source.repository}, then reload the page.`;
  switch (reason.kind) {
    case "not-logged-in":
      return `The local GitHub CLI is not logged in, so ${reading} could not be read. Run \`gh auth login\` (check with \`gh auth status\`), then reload the page.`;
    case "not-installed":
      return `The GitHub CLI (\`gh\`) could not be started, so ${reading} could not be read. Install \`gh\` and run \`gh auth login\`, then reload the page.`;
    case "unreachable":
      return `The local GitHub CLI could not reach GitHub while reading ${reading}.`;
    case "rate-limited": {
      const wait = reason.backoff
        ? `GitHub named no wait, so reading resumes in ${String(reason.waitSeconds)} seconds.`
        : `GitHub asked to wait ${String(reason.waitSeconds)} seconds before asking again.`;
      return `GitHub limited the rate of the local GitHub CLI's requests (HTTP ${String(reason.status)}) while reading ${reading}. ${wait}`;
    }
    case "held-back":
      return `GitHub limited the rate of the local GitHub CLI's requests, so ${reading} was not asked of GitHub. Reading resumes in ${String(reason.waitSeconds)} seconds.`;
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
