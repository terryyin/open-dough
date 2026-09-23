// The `gh`-invocation concern for the local authenticated read boundary
// (`./authenticatedRead.ts`): the read-only `gh api` calls a backlog or
// reachability-checked record read needs (resolve ref, then read content
// pinned to that resolved commit), and the conditional ref check that asks
// only whether the ref still names the same commit. Each has a fixed
// argument array -- never a shell string, and never a caller-supplied
// repository. Kept apart from
// `./localOrigin.ts`'s request-refusal concern: everything here already
// trusts that the request was allowed to reach this point.

import { execFile, type ExecException } from "node:child_process";

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

async function runGh(
  args: readonly string[],
  signal: AbortSignal,
): Promise<string> {
  const { error, stdout, stderr } = await execGh(args, signal);
  if (error) {
    throw new GhFailure(classify(error, stderr));
  }
  return stdout;
}

export const commitShaPattern = /^[0-9a-f]{40}$/;

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

// What `gh api --include` printed: GitHub's status line and headers, then the
// (here `--jq`-filtered) body after the first blank line.
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
    throw new GhFailure(error ? classify(error, stderr) : { kind: "failed" });
  }
  return {
    revision: commitNamedBy(answer.body),
    etag: answer.headers.get("etag"),
  };
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
