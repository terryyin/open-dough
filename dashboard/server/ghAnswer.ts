// Reading one `gh api --include` answer for the local authenticated read
// boundary (`./ghRead.ts`, for every call): GitHub's status line and headers
// come first, so the boundary can decide from GitHub's own status and headers
// -- a `304`, or a rate limit's directed wait (`./rateLimitDirection.ts`) --
// before treating `gh`'s exit as a failure, and otherwise classifies the
// failure from what `gh` printed.

import type { ExecException } from "node:child_process";
import type { GhFailureReason } from "./ghRead.ts";
import { directedWaitSeconds } from "./rateLimitDirection.ts";

// How one `gh` call failed, as it printed: a rate limit names a wait only
// when GitHub directed one, until this process's admission
// (`./readAdmission.ts`) gives every rate limit its wait.
export type GhPrintedFailure =
  | Exclude<GhFailureReason, { readonly kind: "rate-limited" | "held-back" }>
  | {
      readonly kind: "rate-limited";
      readonly status: number;
      readonly waitSeconds?: number;
    };

// One `gh api --include` answer, read once for every request sharing it:
// as admitted, unless `Failure` says it is still as `gh` printed it.
export type GhAnswer<Failure = GhFailureReason> = {
  // GitHub's status and headers, when `gh` printed them; undefined when no
  // answer came from GitHub (no login, no connection, no `gh`).
  readonly status: number | undefined;
  readonly headers: ReadonlyMap<string, string>;
  // What `gh` printed after the head: the body, filtered by any `--jq`.
  readonly body: string;
  // How the call failed, when `gh` exited non-zero; a successful exit has
  // none. A conditional caller still decides from `status` first (a `304`
  // exits non-zero too).
  readonly failure: Failure | undefined;
  // When this answer was asked of GitHub, by this server's clock: the start
  // of the one `gh` call it shares.
  readonly askedAt: string;
};

// What `gh api --include` printed: GitHub's status line and headers, then the
// body after the first blank line.
type IncludedAnswer = {
  readonly status: number;
  readonly headers: ReadonlyMap<string, string>;
  readonly body: string;
};

function parseIncluded(stdout: string): IncludedAnswer | undefined {
  const lines = stdout.split("\n");
  const statusLine = /^HTTP\/\S+\s+(\d{3})\b/.exec(lines[0] ?? "");
  if (statusLine?.[1] === undefined) {
    return undefined;
  }
  const headers = new Map<string, string>();
  let at = 1;
  for (; at < lines.length; at += 1) {
    const line = (lines[at] ?? "").replace(/\r$/, "");
    if (line === "") {
      break;
    }
    const colon = line.indexOf(":");
    if (colon > 0) {
      headers.set(
        line.slice(0, colon).trim().toLowerCase(),
        line.slice(colon + 1).trim(),
      );
    }
  }
  return {
    status: Number(statusLine[1]),
    headers,
    body: lines.slice(at + 1).join("\n"),
  };
}

// A refused answer that says when to ask again is a rate limit, whatever
// else `gh` printed: GitHub directs a wait with `Retry-After`, or with
// `X-RateLimit-Reset` once `X-RateLimit-Remaining` reaches zero, on its `403`
// and `429` answers. Only the validated, bounded wait leaves this module.
function limitedAsDirected(
  answer: IncludedAnswer | undefined,
  nowMs: number,
): GhPrintedFailure | undefined {
  if (answer?.status !== 403 && answer?.status !== 429) {
    return undefined;
  }
  const waitSeconds = directedWaitSeconds(answer.headers, nowMs);
  return waitSeconds === undefined
    ? undefined
    : { kind: "rate-limited", status: answer.status, waitSeconds };
}

// What `gh` printed about a failure, when GitHub's answer directed no wait:
// `gh` exits 4 when it has no usable login, and says so by pointing at
// `gh auth login`; an HTTP error ends its stderr with "(HTTP <status>)", and a
// rate limit or a failed connection names itself.
// Timing out is never inferred from `gh`'s output: it is a request's own
// bound (`./trackedGh.ts`) or the shared call's (`./ghRead.ts`).
function classify(
  error: { readonly code?: string | number | undefined },
  stderr: string,
): GhPrintedFailure {
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

// What one `gh` call printed and how it exited, read as its answer.
export function readAnswer(
  error: ExecException | null,
  stdout: string,
  stderr: string,
  askedAt: string,
): GhAnswer<GhPrintedFailure> {
  const included = parseIncluded(stdout);
  return {
    status: included?.status,
    headers: included?.headers ?? new Map(),
    body: included?.body ?? stdout,
    failure: error
      ? (limitedAsDirected(included, Date.now()) ?? classify(error, stderr))
      : undefined,
    askedAt,
  };
}
