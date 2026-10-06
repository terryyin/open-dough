// The `gh`-invocation concern for the local authenticated read boundary
// (`./authenticatedRead.ts`): running one `gh` call and classifying how it
// failed, one call shared by every request asking it while it is
// outstanding, and when one path was last committed as of a resolved commit.
// Which commit a ref or published branch names is asked in `./ghRevision.ts`;
// content pinned to a resolved commit is read in `./ghContents.ts`. Each call
// has a fixed argument array -- never a shell string, and never a
// caller-supplied repository. Kept apart from
// `./localOrigin.ts`'s request-refusal concern: everything here already
// trusts that the request was allowed to reach this point.

import { execFile, type ExecException } from "node:child_process";
import { readWaitLimitMs } from "../src/authenticatedReadRules.ts";
import { OutstandingReads, ReadBoundReached } from "./outstandingReads.ts";

// How long one boundary request may wait for its `gh` answers before it is
// given up (`./trackedGh.ts`), and how long one `gh` call may run from its
// start however many requests wait on it: the shared read wait bound
// (`../src/authenticatedReadRules.ts`'s `readWaitLimitMs`). A test may
// shorten this through the environment to observe termination without
// waiting out the production bound, which stays the shared bound whenever
// the environment says nothing.
export function readTimeoutMs(): number {
  const configured = Number(process.env["DOUGH_READ_TIMEOUT_MS"]);
  return Number.isFinite(configured) && configured > 0
    ? configured
    : readWaitLimitMs;
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
      // How long GitHub asked this login to wait before asking again, when
      // its answer said so (`./rateLimitDirection.ts`); already validated and
      // bounded, never a header value as GitHub sent it.
      readonly waitSeconds?: number;
    }
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

// `gh` exits 4 when it has no usable login, and says so by pointing at
// `gh auth login`; an HTTP error ends its stderr with "(HTTP <status>)", and a
// rate limit or a failed connection names itself.
// Timing out is the request bound's own finding (`./authenticatedRead.ts`),
// never inferred here.
export function classify(
  error: { readonly code?: string | number | undefined },
  stderr: string,
): GhFailureReason {
  if (error.code === "ENOENT") {
    return { kind: "not-installed" };
  }
  if (Number(error.code) === 4 || /\bgh auth login\b/.test(stderr)) {
    return { kind: "not-logged-in" };
  }
  const http = /\(HTTP (\d{3})\)/.exec(stderr);
  if (http?.[1] !== undefined) {
    const status = Number(http[1]);
    return /rate limit/i.test(stderr)
      ? { kind: "rate-limited", status }
      : { kind: "http", status };
  }
  if (/\berror connecting to\b/.test(stderr)) {
    return { kind: "unreachable" };
  }
  return { kind: "failed" };
}

type GhRun = {
  readonly error: ExecException | null;
  readonly stdout: string;
  readonly stderr: string;
  // When this answer was asked of GitHub, by this server's clock: the start
  // of the one `gh` call it shares.
  readonly askedAt: string;
};

// Every `gh` call still outstanding in this server process, keyed by its
// argument array: the question asked of GitHub, any conditional hint
// included. Requests asking it while it is outstanding wait on that one
// call, which ends once none of them waits, at its own bound, or -- by
// ending every request waiting on it -- when the boundary closes. No settled
// answer is kept here.
const outstandingGh = new OutstandingReads<GhRun>(readTimeoutMs());

function spawnedGh(
  args: readonly string[],
  signal: AbortSignal,
): Promise<GhRun> {
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
        if (signal.reason instanceof ReadBoundReached) {
          reject(new GhFailure({ kind: "timed-out" }));
          return;
        }
        resolve({ error, stdout, stderr, askedAt });
      },
    );
  });
}

// What a request that stopped waiting is answered, as `execFile` answers a
// call aborted by its signal.
function abandoned(args: readonly string[]): GhRun {
  const error: ExecException = Object.assign(
    new Error("The operation was aborted"),
    { name: "AbortError", code: "ABORT_ERR", cmd: ["gh", ...args].join(" ") },
  );
  return { error, stdout: "", stderr: "", askedAt: new Date().toISOString() };
}

// One `gh` answer, settled whatever its exit: `gh api --include` prints
// GitHub's status line on stdout even when it exits non-zero, so a caller
// that asked for it decides from that status before classifying the exit.
// `signal` ends this request's wait, not a call another request still waits
// for; a call that reached its own bound is a timed-out failure.
export async function execGh(
  args: readonly string[],
  signal: AbortSignal,
): Promise<GhRun> {
  try {
    return await outstandingGh.waitFor(JSON.stringify(args), signal, (shared) =>
      spawnedGh(args, shared),
    );
  } catch (error) {
    if (signal.aborted) {
      return abandoned(args);
    }
    throw error;
  }
}

// One `gh` answer's output, and when it was asked of GitHub.
export async function askGh(
  args: readonly string[],
  signal: AbortSignal,
): Promise<{ readonly stdout: string; readonly askedAt: string }> {
  const { error, stdout, stderr, askedAt } = await execGh(args, signal);
  if (error) {
    throw new GhFailure(classify(error, stderr));
  }
  return { stdout, askedAt };
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
