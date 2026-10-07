// The `gh`-invocation concern for the local authenticated read boundary
// (`./authenticatedRead.ts`): running one `gh api` call with GitHub's status
// line and headers included, read once (`./ghAnswer.ts`) -- a rate limit and
// the wait GitHub directed, whichever read met it -- one call shared by every
// request asking it while it is outstanding, admitted once for all of them
// (`./readAdmission.ts`), and when one path was last committed as of a
// resolved commit.
// Which commit a ref or published branch names is asked in `./ghRevision.ts`;
// content pinned to a resolved commit is read in `./ghContents.ts`. Each call
// has a fixed argument array -- never a shell string, and never a
// caller-supplied repository. Kept apart from
// `./localOrigin.ts`'s request-refusal concern: everything here already
// trusts that the request was allowed to reach this point.

import { execFile } from "node:child_process";
import { readWaitLimitMs } from "../src/authenticatedReadRules.ts";
import { readAnswer, type GhAnswer } from "./ghAnswer.ts";
import { OutstandingReads, ReadBoundReached } from "./outstandingReads.ts";
import { ReadAdmission } from "./readAdmission.ts";

// A duration a test may shorten through the environment, to observe it
// without waiting out the production value, which stays whenever the
// environment says nothing usable.
function configuredMs(variable: string, productionMs: number): number {
  const configured = Number(process.env[variable]);
  return Number.isFinite(configured) && configured > 0
    ? configured
    : productionMs;
}

// How long one boundary request may wait for its `gh` answers before it is
// given up (`./trackedGh.ts`), and how long one `gh` call may run from its
// start however many requests wait on it: the shared read wait bound
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

// Whether this process may ask GitHub now. Every call `outstandingGh` starts
// is admitted here once, for all the requests waiting on it.
const admission = new ReadAdmission(limitBackoffBaseMs());

function spawnedGh(
  args: readonly string[],
  signal: AbortSignal,
): Promise<GhAnswer> {
  const askedAt = new Date().toISOString();
  const heldBack = admission.heldBack(Date.now());
  if (heldBack !== undefined) {
    return Promise.resolve(unasked(heldBack, askedAt));
  }
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
        if (signal.reason instanceof ReadBoundReached) {
          reject(new GhFailure({ kind: "timed-out" }));
          return;
        }
        resolve(
          admission.answered(
            readAnswer(error, stdout, stderr, askedAt),
            Date.now(),
          ),
        );
      },
    );
  });
}

// An answer that never came from GitHub: held back, or -- `failed`, as
// `execFile` answers a call aborted by its signal -- for a request that
// stopped waiting.
function unasked(failure: GhFailureReason, askedAt: string): GhAnswer {
  return { status: undefined, headers: new Map(), body: "", failure, askedAt };
}

// One `gh api` answer, settled whatever its exit: `--include` makes `gh`
// print GitHub's status line on stdout even when it exits non-zero, so a
// caller can decide from that status before treating the exit as a failure.
// `signal` ends this request's wait, not a call another request still waits
// for; a call that reached its own bound is a timed-out failure.
export async function execGh(
  args: readonly string[],
  signal: AbortSignal,
): Promise<GhAnswer> {
  const asked = includedArgs(args);
  try {
    return await outstandingGh.waitFor(
      JSON.stringify(asked),
      signal,
      (shared) => spawnedGh(asked, shared),
    );
  } catch (error) {
    if (signal.aborted) {
      return unasked({ kind: "failed" }, new Date().toISOString());
    }
    throw error;
  }
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

// Whether a `gh` call failed only because GitHub has no such thing (`404`).
export function isNotFound(error: unknown): boolean {
  return (
    error instanceof GhFailure &&
    error.reason.kind === "http" &&
    error.reason.status === 404
  );
}

// A committer date as GitHub spells one: an ISO 8601 instant.
const committerDatePattern =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

// When `path` was last committed in the history of `revision`: the
// committer date of the newest commit GitHub's commit list names for that
// path from that commit. A list naming no commit, or no usable date, is not
// a commit time.
export async function lastCommitTimeViaGh(
  repository: string,
  path: string,
  revision: string,
  signal: AbortSignal,
): Promise<string> {
  const committed = (
    await runGh(
      [
        "api",
        `repos/${repository}/commits?sha=${revision}&path=${encodeURIComponent(path)}&per_page=1`,
        "--jq",
        ".[0].commit.committer.date",
      ],
      signal,
    )
  ).trim();
  const at = usableCommitterDate(committed);
  if (at === null) {
    throw new GhFailure({ kind: "no-commit" });
  }
  return at;
}

// A committer date GitHub named, as an ISO instant; null when it named none
// in its own spelling.
export function usableCommitterDate(date: unknown): string | null {
  return typeof date === "string" && committerDatePattern.test(date)
    ? new Date(date).toISOString()
    : null;
}
