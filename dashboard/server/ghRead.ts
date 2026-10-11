// The `gh`-invocation concern for the local authenticated read boundary
// (`./authenticatedRead.ts`): this process's adapter of the one installed
// GitHub request source (`github-requests.mjs`), which asks this machine's
// request owner, shared with every other dashboard process and CI observer
// of this user, to run one `gh api` call with GitHub's status line and
// headers included, read once -- a rate limit and the wait GitHub directed,
// whichever read met it -- one call shared by every request asking it while
// it is outstanding, admitted once for all of them and taking one of the
// owner's turns at GitHub. This module owns only what is the boundary's: its bounds,
// its local diagnostics of a failed read (`./readDiagnostics.ts`), and each
// request's timing (`./readTiming.ts`).
// Which commit a ref or published branch names is asked in `./ghRevision.ts`;
// content pinned to a resolved commit is read in `./ghContents.ts`; when one
// path was last committed, in `./ghCommitTime.ts`. Each call
// has a fixed argument array -- never a shell string, and never a
// caller-supplied repository. Kept apart from
// `./localOrigin.ts`'s request-refusal concern: everything here already
// trusts that the request was allowed to reach this point.
// Failure kinds and JSON helpers: `./ghFailure.ts`.

import type { GhAnswer } from "../../src/skills/dough-execute-plan/scripts/github-request-answer.mjs";
import { GitHubRequests } from "../../src/skills/dough-execute-plan/scripts/github-requests.mjs";
import { readWaitLimitMs } from "../src/authenticatedReadRules.ts";
import { recordFailedRead } from "./readDiagnostics.ts";
import { timedGhWait } from "./readTiming.ts";
import { GhFailure } from "./ghFailure.ts";
import { configuredLimit } from "./configuredLimit.ts";

export {
  GhFailure,
  isNotFound,
  parsedJson,
  rateLimitStop,
  type GhFailureReason,
  type RateLimitStop,
} from "./ghFailure.ts";

// How long one boundary request may wait for its `gh` answers before its
// wait is given up (`./trackedGh.ts`), and how long one `gh` call may run
// from its start however many requests wait on it: the shared read wait bound
// (`../src/authenticatedReadRules.ts`'s `readWaitLimitMs`).
export function readTimeoutMs(): number {
  return configuredLimit("DOUGH_READ_TIMEOUT_MS", readWaitLimitMs);
}

// How long a request owner this process starts first waits after a rate
// limit that directs no wait, doubling while the limit continues: GitHub's
// own guidance of at least one minute.
function limitBackoffBaseMs(): number {
  return configuredLimit("DOUGH_LIMIT_BACKOFF_MS", 60_000);
}

// This server process's requests to GitHub, asked through the machine's
// request owner. A failed call this process waited on is recorded once for
// local diagnostics (`./readDiagnostics.ts`), including a bound that ends
// it; held-back and ordinary waiter departures are not.
const github = new GitHubRequests({
  boundMs: readTimeoutMs(),
  backoffBaseMs: limitBackoffBaseMs(),
  failed: recordFailedRead,
});

// One `gh api` answer, settled whatever its exit: `--include` makes `gh`
// print GitHub's status line on stdout even when it exits non-zero, so a
// caller can decide from that status before treating the exit as a failure.
// `signal` ends only this request's wait, which then rejects with its reason
// and gets no answer; a call that reached its own bound is a timed-out
// failure for every request waiting on it. The wait is counted in the
// request's `Server-Timing` (`./readTiming.ts`).
export function execGh(
  args: readonly string[],
  signal: AbortSignal,
): Promise<GhAnswer> {
  return timedGhWait(() => github.request(args, signal));
}

// One `gh` answer's body, and when it was asked of GitHub.
export async function askGh(
  args: readonly string[],
  signal: AbortSignal,
): Promise<{ readonly stdout: string; readonly askedAt: string }> {
  const { failure, body, askedAt } = await execGh(args, signal);
  if (failure) {
    throw new GhFailure(failure);
  }
  return { stdout: body, askedAt };
}

export async function runGh(
  args: readonly string[],
  signal: AbortSignal,
): Promise<string> {
  return (await askGh(args, signal)).stdout;
}
