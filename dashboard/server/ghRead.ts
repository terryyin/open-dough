// The `gh`-invocation concern for the local authenticated read boundary
// (`./authenticatedRead.ts`): running one `gh api` call with GitHub's status
// line and headers included, read once (`./ghAnswer.ts`) -- a rate limit and
// the wait GitHub directed, whichever read met it -- one call shared by every
// request asking it while it is outstanding, admitted once for all of them
// (`./readAdmission.ts`) and taking one of its turns at GitHub.
// Which commit a ref or published branch names is asked in `./ghRevision.ts`;
// content pinned to a resolved commit is read in `./ghContents.ts`; when one
// path was last committed, in `./ghCommitTime.ts`. Each call
// has a fixed argument array -- never a shell string, and never a
// caller-supplied repository. Kept apart from
// `./localOrigin.ts`'s request-refusal concern: everything here already
// trusts that the request was allowed to reach this point.
// Failure kinds and JSON helpers: `./ghFailure.ts`.

import { execFile } from "node:child_process";
import { readWaitLimitMs } from "../src/authenticatedReadRules.ts";
import { readAnswer, type GhAnswer } from "./ghAnswer.ts";
import { OutstandingReads, ReadBoundReached } from "./outstandingReads.ts";
import { ReadAdmission } from "./readAdmission.ts";
import { recordFailedRead } from "./readDiagnostics.ts";
import { GhFailure, type GhFailureReason } from "./ghFailure.ts";

export {
  GhFailure,
  isNotFound,
  parsedJson,
  rateLimitStop,
  type GhFailureReason,
  type RateLimitStop,
} from "./ghFailure.ts";

// A duration a test may shorten through the environment, to observe it
// without waiting out the production value, which stays whenever the
// environment says nothing usable.
function configuredMs(variable: string, productionMs: number): number {
  const configured = Number(process.env[variable]);
  return Number.isFinite(configured) && configured > 0
    ? configured
    : productionMs;
}

// How long one boundary request may wait for its `gh` answers before its
// wait is given up (`./trackedGh.ts`), and how long one `gh` call may run
// from its start however many requests wait on it: the shared read wait bound
// (`../src/authenticatedReadRules.ts`'s `readWaitLimitMs`).
export function readTimeoutMs(): number {
  return configuredMs("DOUGH_READ_TIMEOUT_MS", readWaitLimitMs);
}

// How long this process first waits after a rate limit that directs no
// wait (`./readAdmission.ts`), doubling while the limit continues: GitHub's
// own guidance of at least one minute.
function limitBackoffBaseMs(): number {
  return configuredMs("DOUGH_LIMIT_BACKOFF_MS", 60_000);
}

// Every call asks for GitHub's status line and headers (`--include`), right
// after `api`, so a refusal's status and direction are read here whatever
// was asked.
function includedArgs(args: readonly string[]): readonly string[] {
  return args[0] === "api" ? ["api", "--include", ...args.slice(1)] : args;
}

// Every `gh` call still outstanding in this server process, keyed by its
// argument array: the question asked of GitHub, any conditional hint
// included. Requests asking it while it is outstanding wait on that one
// call, which ends once none of them waits, at its own bound, or -- by
// ending every request waiting on it -- when the boundary closes. No settled
// answer is kept here.
const outstandingGh = new OutstandingReads<GhAnswer>(readTimeoutMs());

// Whether this process may ask GitHub now, and its turns at GitHub. Every
// call `outstandingGh` starts is admitted here once, for all the requests
// waiting on it, and takes one turn however many wait on it.
const admission = new ReadAdmission(limitBackoffBaseMs());

// One call `outstandingGh` started: refused while a rate limit holds reads
// back, otherwise run once it has a turn -- unless a limit met while it
// waited holds it back then. Its bound runs from before its turn, so waiting
// counts toward it; a call that ends while waiting never reaches GitHub.
// A failed call is recorded once here for local diagnostics
// (`./readDiagnostics.ts`), including a bound that ends it; held-back and
// ordinary waiter departures are not.
async function spawnedGh(
  args: readonly string[],
  signal: AbortSignal,
): Promise<GhAnswer> {
  const startedAtMs = Date.now();
  const refused = admission.heldBack(Date.now());
  if (refused !== undefined) {
    return unasked(refused);
  }
  let turnEnds: () => void;
  try {
    turnEnds = await admission.turn(signal);
  } catch {
    if (endedAtReadBound(signal)) {
      recordFailedRead({ cause: "timed-out", startedAtMs });
      throw new GhFailure({ kind: "timed-out" });
    }
    return unasked({ kind: "failed" });
  }
  // A turn can pass to this call while every request is being ended, as
  // when the boundary closes: a call already ended is never run.
  if (signal.aborted) {
    turnEnds();
    return unasked({ kind: "failed" });
  }
  const heldBack = admission.heldBack(Date.now());
  if (heldBack !== undefined) {
    turnEnds();
    return unasked(heldBack);
  }
  const askedAt = new Date().toISOString();
  return new Promise((resolve, reject) => {
    execFile(
      "gh",
      [...args],
      {
        signal,
        maxBuffer: 1024 * 1024,
        encoding: "utf8",
        env: { ...process.env, GH_PROMPT_DISABLED: "1" },
      },
      (error, stdout, stderr) => {
        if (endedAtReadBound(signal)) {
          // Admission learns of the bound before the turn passes on, so a
          // limit this ending starts holds back the read that takes it next.
          admission.timedOut(askedAt);
          turnEnds();
          recordFailedRead({ cause: "timed-out", startedAtMs, askedAt });
          reject(new GhFailure({ kind: "timed-out" }));
          return;
        }
        // Ordinary departure or shutdown ended the call: not a retained
        // retryable failure, and not classified as an upstream answer.
        if (signal.aborted) {
          turnEnds();
          resolve(unasked({ kind: "failed" }, askedAt));
          return;
        }
        // Learned before the turn passes on, so a limit this answer starts
        // holds back the read that takes the turn next.
        const answer = admission.answered(
          readAnswer(error, stdout, stderr, askedAt),
          Date.now(),
        );
        if (answer.failure !== undefined) {
          recordFailedRead({
            cause: answer.failure.kind,
            startedAtMs,
            askedAt,
            answer,
          });
        }
        turnEnds();
        resolve(answer);
      },
    );
  });
}

// An answer that never came from GitHub: held back, or -- `failed` -- for a
// call that ended while waiting its turn, which no request waits on any more.
function unasked(
  failure: GhFailureReason,
  askedAt = new Date().toISOString(),
): GhAnswer {
  return { status: undefined, headers: new Map(), body: "", failure, askedAt };
}

// The shared call's own bound (`ReadBoundReached`) or a waiter's owned read
// bound (`./trackedGh.ts`) ended it — not ordinary departure or shutdown.
function endedAtReadBound(signal: AbortSignal): boolean {
  return (
    signal.reason instanceof ReadBoundReached ||
    (signal.reason instanceof GhFailure &&
      signal.reason.reason.kind === "timed-out")
  );
}

// One `gh api` answer, settled whatever its exit: `--include` makes `gh`
// print GitHub's status line on stdout even when it exits non-zero, so a
// caller can decide from that status before treating the exit as a failure.
// `signal` ends only this request's wait, which then rejects with its reason
// and gets no answer; a call that reached its own bound is a timed-out
// failure for every request waiting on it.
export function execGh(
  args: readonly string[],
  signal: AbortSignal,
): Promise<GhAnswer> {
  const asked = includedArgs(args);
  return outstandingGh.waitFor(JSON.stringify(asked), signal, (shared) =>
    spawnedGh(asked, shared),
  );
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
