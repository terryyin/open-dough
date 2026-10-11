// The installed GitHub request source's reading of one `gh api --include`
// answer: GitHub's status and headers first, a rate limit's directed wait
// validated and bounded, and otherwise a fixed failure category from what
// `gh` printed -- never its raw text.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  directedWaitSeconds,
  GhFailure,
  readAnswer,
} from "./github-request-answer.mjs";
import { longestDirectedWaitSeconds } from "./github-request-rules.mjs";

const nowMs = Date.parse("2026-01-01T00:00:00Z");
const askedAt = "2026-01-01T00:00:00.000Z";
const exited = (code) => ({ code });

function included(status, headers, body = "") {
  return [
    `HTTP/2.0 ${status}`,
    ...Object.entries(headers).map(([name, value]) => `${name}: ${value}\r`),
    "\r",
    body,
  ].join("\n");
}

function failureOf(stdout, stderr, error = exited(1)) {
  return readAnswer(error, stdout, stderr, askedAt, nowMs).failure;
}

test("a successful answer gives GitHub's status, lower-cased headers and the body after the head", () => {
  const answer = readAnswer(
    null,
    included(
      200,
      { ETag: ' W/"abc" ', "X-GitHub-Request-Id": "1:2" },
      "a\n\nb",
    ),
    "",
    askedAt,
    nowMs,
  );
  assert.equal(answer.status, 200);
  assert.deepEqual(
    [...answer.headers],
    [
      ["etag", 'W/"abc"'],
      ["x-github-request-id", "1:2"],
    ],
  );
  assert.equal(answer.body, "a\n\nb");
  assert.equal(answer.failure, undefined);
  assert.equal(answer.askedAt, askedAt);
});

test("output without a status line is all body and names no status", () => {
  const answer = readAnswer(null, '{"sha":"1"}', "", askedAt, nowMs);
  assert.equal(answer.status, undefined);
  assert.equal(answer.headers.size, 0);
  assert.equal(answer.body, '{"sha":"1"}');
});

test("a 304 keeps its status beside the failed exit, for a conditional caller to decide first", () => {
  const answer = readAnswer(
    exited(1),
    included(304, {}),
    "gh: HTTP 304 (HTTP 304)",
    askedAt,
    nowMs,
  );
  assert.equal(answer.status, 304);
  assert.deepEqual(answer.failure, { kind: "http", status: 304 });
});

test("a refused answer that directs a wait is a rate limit whatever gh printed", () => {
  assert.deepEqual(
    failureOf(included(429, { "Retry-After": "17" }), "gh: boom (HTTP 429)"),
    { kind: "rate-limited", status: 429, waitSeconds: 17 },
  );
  assert.deepEqual(
    failureOf(
      included(403, {
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(nowMs / 1000 + 90),
      }),
      "",
    ),
    { kind: "rate-limited", status: 403, waitSeconds: 90 },
  );
});

test("a directed wait on any other status is not read as a rate limit", () => {
  assert.deepEqual(
    failureOf(included(503, { "Retry-After": "17" }), "gh: down (HTTP 503)"),
    { kind: "http", status: 503 },
  );
});

test("a rate limit gh names without a usable direction carries no wait", () => {
  assert.deepEqual(
    failureOf(
      included(403, { "X-RateLimit-Remaining": "12" }),
      "gh: API rate limit exceeded (HTTP 403)",
    ),
    { kind: "rate-limited", status: 403 },
  );
  assert.deepEqual(
    failureOf("", "gh: You have exceeded a secondary rate limit (HTTP 429)"),
    { kind: "rate-limited", status: 429 },
  );
});

test("failures without GitHub's direction fall into fixed categories", () => {
  assert.deepEqual(failureOf("", "", exited("ENOENT")), {
    kind: "not-installed",
  });
  assert.deepEqual(failureOf("", "anything", exited(4)), {
    kind: "not-logged-in",
  });
  assert.deepEqual(
    failureOf("", "To get started with GitHub CLI, please run:  gh auth login"),
    { kind: "not-logged-in" },
  );
  assert.deepEqual(failureOf("", "gh: Not Found (HTTP 404)"), {
    kind: "http",
    status: 404,
  });
  assert.deepEqual(
    failureOf("", "error connecting to api.github.com\ncheck your connection"),
    { kind: "unreachable" },
  );
  assert.deepEqual(failureOf("", "/Users/someone/private: unexpected"), {
    kind: "failed",
  });
});

test("a subprocess output bound names its cause and discards partial output", () => {
  const error = exited("ERR_CHILD_PROCESS_STDIO_MAXBUFFER");
  const answer = readAnswer(
    error,
    included(200, {}, "secret body"),
    "gh auth login: secret path (HTTP 404)",
    askedAt,
    nowMs,
  );
  assert.deepEqual(answer.failure, { kind: "output-bound" });
  assert.equal(answer.body, "");
  assert.equal(answer.status, 200);
  const directed = readAnswer(
    error,
    included(429, { "Retry-After": "17" }, "partial secret body"),
    "secret stderr",
    askedAt,
    nowMs,
  );
  assert.deepEqual(directed.failure, {
    kind: "rate-limited",
    status: 429,
    waitSeconds: 17,
  });
  assert.equal(directed.body, "");
});

test("a directed wait is whole seconds: Retry-After seconds or date, else the reset once nothing remains", () => {
  const wait = (headers) =>
    directedWaitSeconds(new Map(Object.entries(headers)), nowMs);
  assert.equal(wait({ "retry-after": "30" }), 30);
  assert.equal(
    wait({ "retry-after": new Date(nowMs + 4_200).toISOString() }),
    5,
  );
  assert.equal(
    wait({
      "x-ratelimit-remaining": "0",
      "x-ratelimit-reset": String(nowMs / 1000 + 61),
    }),
    61,
  );
  // Retry-After decides when both are present.
  assert.equal(
    wait({
      "retry-after": "3",
      "x-ratelimit-remaining": "0",
      "x-ratelimit-reset": String(nowMs / 1000 + 61),
    }),
    3,
  );
});

test("a direction is bounded to the longest wait and unusable ones direct nothing", () => {
  const wait = (headers) =>
    directedWaitSeconds(new Map(Object.entries(headers)), nowMs);
  assert.equal(longestDirectedWaitSeconds, 3600);
  assert.equal(wait({ "retry-after": "999999" }), longestDirectedWaitSeconds);
  for (const headers of [
    {},
    { "retry-after": "0" },
    { "retry-after": "soon" },
    { "retry-after": "-5" },
    { "retry-after": new Date(nowMs - 1_000).toUTCString() },
    { "x-ratelimit-reset": String(nowMs / 1000 + 61) },
    { "x-ratelimit-remaining": "3", "x-ratelimit-reset": "9999999999" },
    { "x-ratelimit-remaining": "0", "x-ratelimit-reset": "later" },
    { "x-ratelimit-remaining": "0", "x-ratelimit-reset": "1" },
  ]) {
    assert.equal(wait(headers), undefined, JSON.stringify(headers));
  }
});

test("a failure carries its reason and names only the category", () => {
  const failure = new GhFailure({ kind: "http", status: 502 });
  assert.ok(failure instanceof Error);
  assert.deepEqual(failure.reason, { kind: "http", status: 502 });
  assert.equal(failure.message, "gh did not answer: http");
});
