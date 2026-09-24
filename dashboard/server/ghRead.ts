// The `gh`-invocation concern for the local authenticated read boundary
// (`./authenticatedRead.ts`): running one `gh` call and classifying how it
// failed, resolving which commit a ref names, the conditional ref check
// that asks only whether the ref still names the same commit, and when one
// path was last committed as of a resolved commit. Content pinned
// to a resolved commit is read in `./ghContents.ts`. Each call has a fixed
// argument array -- never a shell string, and never a caller-supplied
// repository. Kept apart from
// `./localOrigin.ts`'s request-refusal concern: everything here already
// trusts that the request was allowed to reach this point.

import { execFile, type ExecException } from "node:child_process";
import { parseIncluded, type IncludedAnswer } from "./includedAnswer";
import { directedWaitSeconds } from "./rateLimitDirection";
import {
  commitShaPattern,
  readWaitLimitMs,
} from "../src/authenticatedReadRules";

// How long one boundary request -- all of its owned `gh` subprocesses -- may
// run before it is aborted (`./trackedGh.ts`): the shared read wait bound
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
function classify(
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
};

// One `gh` invocation, settled whatever its exit: `gh api --include` prints
// GitHub's status line on stdout even when it exits non-zero, so a caller
// that asked for it decides from that status before classifying the exit.
function execGh(args: readonly string[], signal: AbortSignal): Promise<GhRun> {
  return new Promise((resolve) => {
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
        resolve({ error, stdout, stderr });
      },
    );
  });
}

export async function runGh(
  args: readonly string[],
  signal: AbortSignal,
): Promise<string> {
  const { error, stdout, stderr } = await execGh(args, signal);
  if (error) {
    throw new GhFailure(classify(error, stderr));
  }
  return stdout;
}

// The one GitHub endpoint that says which commit a ref names; both the
// resolving read and the conditional check ask it for `.sha` alone.
function refEndpoint(repository: string, ref: string): string {
  return `repos/${repository}/commits/${ref}`;
}

function commitNamedBy(sha: string): string {
  const revision = sha.trim();
  if (!commitShaPattern.test(revision)) {
    throw new GhFailure({ kind: "no-commit" });
  }
  return revision;
}

export async function resolveRevisionViaGh(
  repository: string,
  ref: string,
  signal: AbortSignal,
): Promise<string> {
  return commitNamedBy(
    await runGh(["api", refEndpoint(repository, ref), "--jq", ".sha"], signal),
  );
}

// A refused answer that says when to ask again is a rate limit, whatever
// else `gh` printed: GitHub directs a wait with `Retry-After`, or with
// `X-RateLimit-Reset` once `X-RateLimit-Remaining` reaches zero, on its `403`
// and `429` answers. Only the validated wait leaves this module.
function limitedAsDirected(
  answer: IncludedAnswer | undefined,
): GhFailureReason | undefined {
  if (answer?.status !== 403 && answer?.status !== 429) {
    return undefined;
  }
  const waitSeconds = directedWaitSeconds(answer.headers, Date.now());
  return waitSeconds === undefined
    ? undefined
    : { kind: "rate-limited", status: answer.status, waitSeconds };
}

// A commit a ref named, and the entity tag GitHub gave that answer.
export type RevisionAnswer = {
  readonly revision: string;
  readonly etag: string | undefined;
};

// Asks GitHub which commit `ref` names now, conditionally on an earlier
// answer. GitHub answers `304 Not Modified` when that answer still holds,
// which `gh api` reports by exiting 1; that status is recognized from the
// included status line before the exit is ever treated as a failure, and
// every other non-success is classified as any read failure is.
export async function checkRevisionViaGh(
  repository: string,
  ref: string,
  earlier: RevisionAnswer | undefined,
  signal: AbortSignal,
): Promise<RevisionAnswer> {
  const conditional =
    earlier?.etag === undefined ? [] : ["-H", `If-None-Match: ${earlier.etag}`];
  const { error, stdout, stderr } = await execGh(
    [
      "api",
      "--include",
      ...conditional,
      refEndpoint(repository, ref),
      "--jq",
      ".sha",
    ],
    signal,
  );
  const answer = signal.aborted ? undefined : parseIncluded(stdout);
  if (answer?.status === 304 && earlier?.etag !== undefined) {
    return earlier;
  }
  if (error || answer?.status !== 200) {
    throw new GhFailure(
      limitedAsDirected(answer) ??
        (error ? classify(error, stderr) : { kind: "failed" }),
    );
  }
  return {
    revision: commitNamedBy(answer.body),
    etag: answer.headers.get("etag"),
  };
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
  if (!committerDatePattern.test(committed)) {
    throw new GhFailure({ kind: "no-commit" });
  }
  return new Date(committed).toISOString();
}
