// How the real `gh api` prints GitHub's answer for the fake GitHub
// (./fakeGitHub.ts): the control-character sanitizing of a JSON-typed body,
// `--jq` filtering, the status line and headers that `--include` adds, a
// `304 Not Modified` to an `If-None-Match` whose entity tag still matches,
// and the exit code and stderr of a failed answer.

import type { OriginAnswer } from "../originAnswers.ts";
import type { GhRequest } from "./ghRequest.ts";

export type GhReply = {
  readonly stdout: string;
  readonly stderr: string;
  readonly exitCode: number;
};

// A C0 or C1 control character's caret notation, as `gh` renders it; tab,
// line feed, vertical tab, and carriage return are left alone.
function caretNotation(code: number): string | undefined {
  const c0 = code < 0x20 && ![0x09, 0x0a, 0x0b, 0x0d].includes(code);
  const c1 = code >= 0x80 && code < 0xa0;
  if (!c0 && !c1) {
    return undefined;
  }
  const letter = String.fromCharCode(0x40 + (code & 0x1f));
  return `^${letter === "\\" ? "\\\\" : letter}`;
}

// `gh` sanitizes every body GitHub labels as JSON (`[/+]json`) before
// printing it (go-gh's `asciisanitizer` in JSON mode): control characters,
// and the six-character escapes (`\u0000`-`\u001f`, `\u0080`-`\u009f`)
// that a JSON reader would turn into them, become caret notation, keeping a
// preceding escaping backslash valid. It does so whether or not the body is
// JSON, so raw file text labeled `+json` is rewritten too.
function sanitizedAsJson(body: string): string {
  let printed = "";
  let escaping = false;
  for (let at = 0; at < body.length;) {
    const char = String.fromCodePoint(body.codePointAt(at) ?? 0);
    const control = caretNotation(char.codePointAt(0) ?? 0);
    if (control !== undefined) {
      printed += control;
      at += char.length;
      continue;
    }
    const escape = /^\\u00([0-9a-f]{2})/i.exec(body.slice(at, at + 6));
    const escaped =
      escape?.[1] === undefined
        ? undefined
        : caretNotation(Number.parseInt(escape[1], 16));
    if (escaped !== undefined) {
      printed += `${escaping ? "\\" : ""}${escaped}`;
      escaping = false;
      at += 6;
      continue;
    }
    printed += char;
    at += char.length;
    escaping = char === "\\" && !escaping;
  }
  return printed;
}

// `gh api --jq .field` prints one field of a JSON answer, and
// `--jq .[0].field` one field of its first element; a missing or null one
// prints an empty line, as the real `gh` prints a null.
// `.list[].field` prints that field of every element, and filters joined by
// `, ` print each one's values in turn, one per line.
function applyJq(argv: readonly string[], body: string): string {
  const at = argv.indexOf("--jq");
  const filter = at >= 0 ? argv[at + 1] : undefined;
  if (filter === undefined) {
    return body;
  }
  const answer: unknown = JSON.parse(body);
  return filter
    .split(",")
    .flatMap((path) => jqValues(answer, path.trim()))
    .map(
      (value) =>
        `${typeof value === "string" ? value : value === null || value === undefined ? "" : JSON.stringify(value)}\n`,
    )
    .join("");
}

// The values one `.a.b`, `.[0].b`, or `.a[].b` path picks from `answer`.
function jqValues(answer: unknown, path: string): unknown[] {
  let values: unknown[] = [answer];
  for (const step of path.split(".").filter(Boolean)) {
    const iterated = step.endsWith("[]");
    const field = iterated ? step.slice(0, -2) : step;
    const index = /^\[(\d+)\]$/.exec(field)?.[1];
    values = values.flatMap((value) => {
      const picked =
        value === null || value === undefined
          ? undefined
          : (value as Record<string, unknown>)[index ?? field];
      return iterated
        ? Array.isArray(picked)
          ? (picked as unknown[])
          : []
        : [picked];
    });
  }
  return values;
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
  const body = /[/+]json(;|$)/.test(answer.contentType)
    ? sanitizedAsJson(answer.body)
    : answer.body;
  if (answer.status < 300) {
    return {
      stdout: `${head}${applyJq(argv, body)}`,
      stderr: "",
      exitCode: 0,
    };
  }
  let message = "HTTP error";
  try {
    const parsed = JSON.parse(body) as { message?: unknown };
    if (typeof parsed.message === "string") {
      message = parsed.message;
    }
  } catch {
    // A non-JSON error body still ends with its status, as `gh` prints it.
  }
  return {
    stdout: `${head}${body}`,
    stderr: `gh: ${message} (HTTP ${String(answer.status)})\n`,
    exitCode: 1,
  };
}
