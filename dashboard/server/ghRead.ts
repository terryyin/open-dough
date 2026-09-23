// The `gh`-invocation concern for the local authenticated read boundary
// (`./authenticatedRead.ts`): the two read-only `gh api` calls a backlog or
// reachability-checked record read needs (resolve ref, then read content
// pinned to that resolved commit), each with a fixed argument array -- never
// a shell string, and never a caller-supplied repository. Kept apart from
// `./localOrigin.ts`'s request-refusal concern: everything here already
// trusts that the request was allowed to reach this point.

import { execFile } from "node:child_process";

// How long one boundary request -- all of its owned `gh` subprocesses -- may
// run before the boundary (`./authenticatedRead.ts`) aborts it, mirroring the
// browser's own overall read deadline (`../src/publishedWork.ts`'s
// `readWaitLimitMs`). A test may shorten this through the environment to
// observe termination without waiting out the production bound, which stays
// 30 seconds whenever the environment says nothing.
export function readTimeoutMs(): number {
  const configured = Number(process.env["DOUGH_READ_TIMEOUT_MS"]);
  return Number.isFinite(configured) && configured > 0 ? configured : 30_000;
}

// Why a `gh` call did not answer, as far as this boundary can say without
// repeating anything `gh` printed. Only these fixed categories -- and, for an
// HTTP answer, its three-digit status -- ever leave this module; raw stderr
// may name local paths or echo configuration and is never forwarded.
export type GhFailureReason =
  | { readonly kind: "not-logged-in" }
  | { readonly kind: "http"; readonly status: number }
  | { readonly kind: "rate-limited"; readonly status: number }
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

function runGh(args: readonly string[], signal: AbortSignal): Promise<string> {
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
        if (error) {
          reject(new GhFailure(classify(error, stderr)));
          return;
        }
        resolve(stdout);
      },
    );
  });
}

export const commitShaPattern = /^[0-9a-f]{40}$/;

export async function resolveRevisionViaGh(
  repository: string,
  ref: string,
  signal: AbortSignal,
): Promise<string> {
  const stdout = await runGh(
    ["api", `repos/${repository}/commits/${ref}`, "--jq", ".sha"],
    signal,
  );
  const sha = stdout.trim();
  if (!commitShaPattern.test(sha)) {
    throw new GhFailure({ kind: "no-commit" });
  }
  return sha;
}

// One pinned file at a known repository path. Callers that need the catalog
// backlog use the source's own `backlogPath`; extra canonical/plan reads use
// paths already checked against that revision's records
// (`./reachablePaths.ts`). Each path segment is URL-encoded so no path
// character can reshape the request.
export async function readRepositoryFileViaGh(
  repository: string,
  path: string,
  revision: string,
  signal: AbortSignal,
): Promise<string> {
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return runGh(
    [
      "api",
      "-H",
      "Accept: application/vnd.github.raw+json",
      `repos/${repository}/contents/${encoded}?ref=${revision}`,
    ],
    signal,
  );
}
