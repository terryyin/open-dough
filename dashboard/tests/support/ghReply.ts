// How the real `gh api` prints GitHub's answer for the fake GitHub
// (./fakeGitHub.ts): `--jq` filtering, the status line and headers that
// `--include` adds, a `304 Not Modified` to an `If-None-Match` whose entity
// tag still matches, and the exit code and stderr of a failed answer.

import type { OriginAnswer } from "../originAnswers";
import type { GhRequest } from "./ghRequest";

export type GhReply = {
  readonly stdout: string;
  readonly stderr: string;
  readonly exitCode: number;
};

// `gh api --jq .field` prints one field of a JSON answer, and
// `--jq .[0].field` one field of its first element; a missing one is `null`.
function applyJq(argv: readonly string[], body: string): string {
  const at = argv.indexOf("--jq");
  const filter = at >= 0 ? argv[at + 1] : undefined;
  if (filter === undefined) {
    return body;
  }
  let value: unknown = JSON.parse(body);
  for (const field of filter.split(".").filter(Boolean)) {
    const index = /^\[(\d+)\]$/.exec(field)?.[1];
    value =
      value === null || value === undefined
        ? undefined
        : (value as Record<string, unknown>)[index ?? field];
  }
  return `${typeof value === "string" ? value : JSON.stringify(value ?? null)}\n`;
}

const reasonPhrases: Readonly<Record<number, string>> = {
  200: "OK",
  304: "Not Modified",
  403: "Forbidden",
  404: "Not Found",
  429: "Too Many Requests",
};

// What `gh api --include` prints before the body: GitHub's status line, its
// headers, and a blank line, with the line endings the real `gh` prints.
function includedHead(
  status: number,
  headers: Readonly<Record<string, string>>,
): string {
  const lines = Object.entries(headers).map(
    ([name, value]) => `${name}: ${value}\r\n`,
  );
  return `HTTP/2.0 ${String(status)} ${reasonPhrases[status] ?? "Status"}\n${lines.join("")}\r\n`;
}

// An entity tag without its weak marker: GitHub compares tags this way for
// `If-None-Match`, and repeats a matched tag this way on its `304`.
function opaque(tag: string): string {
  return tag.replace(/^W\//, "");
}

function sameEntity(sent: string | undefined, etag: string | undefined) {
  return (
    sent !== undefined && etag !== undefined && opaque(sent) === opaque(etag)
  );
}

// What `gh api` prints and exits with for GitHub's answer.
export function asGhReply(
  argv: readonly string[],
  request: GhRequest,
  answer: OriginAnswer,
): GhReply {
  if ("exitCode" in answer) {
    return { stdout: "", stderr: answer.stderr, exitCode: answer.exitCode };
  }
  if ("connection" in answer) {
    return {
      stdout: "",
      stderr:
        "error connecting to api.github.com\ncheck your internet connection or https://githubstatus.com\n",
      exitCode: 1,
    };
  }
  const included = argv.includes("--include");
  const headers = {
    "Content-Type": answer.contentType,
    ...(answer.etag !== undefined && { Etag: answer.etag }),
    ...answer.headers,
  };
  if (
    answer.status < 300 &&
    request.kind === "matching-refs" &&
    sameEntity(request.ifNoneMatch, answer.etag)
  ) {
    // Unchanged: GitHub answers `304` with no body, which `gh api` reports by
    // exiting 1 with its status on stderr, exactly as the real `gh` does.
    return {
      stdout: included
        ? includedHead(304, { Etag: opaque(answer.etag ?? "") })
        : "",
      stderr: "gh: HTTP 304\n",
      exitCode: 1,
    };
  }
  const head = included ? includedHead(answer.status, headers) : "";
  if (answer.status < 300) {
    return {
      stdout: `${head}${applyJq(argv, answer.body)}`,
      stderr: "",
      exitCode: 0,
    };
  }
  let message = "HTTP error";
  try {
    const parsed = JSON.parse(answer.body) as { message?: unknown };
    if (typeof parsed.message === "string") {
      message = parsed.message;
    }
  } catch {
    // A non-JSON error body still ends with its status, as `gh` prints it.
  }
  return {
    stdout: `${head}${answer.body}`,
    stderr: `gh: ${message} (HTTP ${String(answer.status)})\n`,
    exitCode: 1,
  };
}
