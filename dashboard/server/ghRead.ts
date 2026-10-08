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

import { execFile } from "node:child_process";
import { readWaitLimitMs } from "../src/authenticatedReadRules.ts";
import { readAnswer, type GhAnswer } from "./ghAnswer.ts";
import { OutstandingReads, ReadBoundReached } from "./outstandingReads.ts";
import { ReadAdmission } from "./readAdmission.ts";
import { configuredLimit } from "./configuredLimit.ts";

// How long one boundary request may wait for its `gh` answers before its
// wait is given up (`./trackedGh.ts`), and how long one `gh` call may run
// from its start however many requests wait on it: the shared read wait bound
// (`../src/authenticatedReadRules.ts`'s `readWaitLimitMs`).
export function readTimeoutMs(): number {
  return configuredLimit("DOUGH_READ_TIMEOUT_MS", readWaitLimitMs);
}

// How long this process first waits after a rate limit that directs no
// wait (`./readAdmission.ts`), doubling while the limit continues: GitHub's
// own guidance of at least one minute.
function limitBackoffBaseMs(): number {
  return configuredLimit("DOUGH_LIMIT_BACKOFF_MS", 60_000);
}

// Why a `gh` call did not answer, as far as this boundary can say without
// repeating anything `gh` printed. Only these fixed categories -- and, for an
// HTTP answer, its three-digit status -- ever leave this module; raw stderr
// may name local paths or echo configuration and is never forwarded.
export type GhFailureReason =
  | { readonly kind: "not-logged-in" }
  | { readonly kind: "http"; readonly status: number }
  | {
      readonly kind: "rate-limited";
      readonly status: number;
      // How long this process waits before asking GitHub again
      // (`./readAdmission.ts`): the wait GitHub directed
      // (`./rateLimitDirection.ts`), already validated and bounded, never a
      // header value as GitHub sent it; or, marked `backoff`, this process's
      // own when GitHub directed none.
      readonly waitSeconds: number;
      readonly backoff?: true;
    }
  // Not asked of GitHub at all: a rate limit GitHub met earlier still
  // holds back every read of this process (`./readAdmission.ts`) for these
  // whole seconds. Never GitHub's status, so never an absence either.
  | { readonly kind: "held-back"; readonly waitSeconds: number }
  | { readonly kind: "unreachable" }
  | { readonly kind: "no-commit" }
  | { readonly kind: "timed-out" }
  | { readonly kind: "not-installed" }
  | { readonly kind: "failed" };

export class GhFailure extends Error {
  readonly reason: GhFailureReason;
  constructor(reason: GhFailureReason) {
    super(`gh did not answer: ${reason.kind}`);
    this.reason = reason;
  }
}

// A read GitHub's rate limit stopped: GitHub refused it, or a rate limit met
// earlier held it back unasked. Either says nothing of what was asked, so it
// fails the read rather than standing for any answer.
export type RateLimitStop = Extract<
  GhFailureReason,
  { readonly kind: "rate-limited" | "held-back" }
>;

export function rateLimitStop(error: unknown): RateLimitStop | undefined {
  if (!(error instanceof GhFailure)) return undefined;
  const { reason } = error;
  return reason.kind === "rate-limited" || reason.kind === "held-back"
    ? reason
    : undefined;
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
async function spawnedGh(
  args: readonly string[],
  signal: AbortSignal,
): Promise<GhAnswer> {
  const refused = admission.heldBack(Date.now());
  if (refused !== undefined) {
    return unasked(refused);
  }
  let turnEnds: () => void;
  try {
    turnEnds = await admission.turn(signal);
  } catch {
    if (signal.reason instanceof ReadBoundReached) {
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
        // However the call ended, admission learns of it before the turn
        // passes on, so a limit this answer starts holds back the read that
        // takes the turn next, and an ending without one reopens the turns.
        if (signal.reason instanceof ReadBoundReached) {
          admission.timedOut(askedAt);
          turnEnds();
          reject(new GhFailure({ kind: "timed-out" }));
          return;
        }
        const answer = admission.answered(
          readAnswer(error, stdout, stderr, askedAt),
          Date.now(),
        );
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

// A `gh` answer read as JSON; an answer that is not JSON is a failed call.
export function parsedJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    throw new GhFailure({ kind: "failed" });
  }
}

// Whether a `gh` call failed only because GitHub has no such thing (`404`).
export function isNotFound(error: unknown): boolean {
  return (
    error instanceof GhFailure &&
    error.reason.kind === "http" &&
    error.reason.status === 404
  );
}
