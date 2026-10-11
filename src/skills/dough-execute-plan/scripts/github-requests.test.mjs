// The installed GitHub request source through its one entry, against a
// synthetic `gh` on PATH: every call asks for GitHub's head, requesters of one
// outstanding call share it, a rate limit holds back the requests that
// follow unasked, and each failed call is told once to the owner.
import assert from "node:assert/strict";
import {
  chmodSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";
import { test } from "node:test";
import { GhFailure } from "./github-request-answer.mjs";
import { GitHubRequests } from "./github-requests.mjs";

// A `gh` that logs its arguments, one call per line, waits for `release`
// while a `hold` file stands (removed with the fixture), then answers by the
// route asked.
function syntheticGh(t) {
  const directory = mkdtempSync(join(tmpdir(), "dough-github-requests-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const log = join(directory, "calls.log");
  writeFileSync(
    join(directory, "gh"),
    `#!/bin/sh
printf '%s\\n' "$*" >> "${log}"
while [ -e "${directory}/hold" ] && [ ! -e "${directory}/release" ]; do sleep 0.02; done
case "$*" in
  *limited-as-directed*)
    printf 'HTTP/2.0 429 Too Many Requests\\r\\nRetry-After: 40\\r\\n\\r\\n{}'
    echo 'gh: slow down (HTTP 429)' >&2; exit 1 ;;
  *limited-undirected*)
    printf 'HTTP/2.0 403 Forbidden\\r\\n\\r\\n{}'
    echo 'gh: API rate limit exceeded (HTTP 403)' >&2; exit 1 ;;
  *missing*)
    printf 'HTTP/2.0 404 Not Found\\r\\n\\r\\n{}'
    echo 'gh: Not Found (HTTP 404)' >&2; exit 1 ;;
  *) printf 'HTTP/2.0 200 OK\\r\\nETag: "one"\\r\\n\\r\\nbody of %s' "$3" ;;
esac
`,
  );
  chmodSync(join(directory, "gh"), 0o755);
  const path = process.env.PATH;
  process.env.PATH = `${directory}${delimiter}${path}`;
  t.after(() => {
    process.env.PATH = path;
  });
  return {
    calls: () =>
      existsSync(log) ? readFileSync(log, "utf8").trimEnd().split("\n") : [],
    hold: () => writeFileSync(join(directory, "hold"), ""),
    release: () => writeFileSync(join(directory, "release"), ""),
  };
}

function requests(overrides = {}) {
  const failed = [];
  return {
    failed,
    github: new GitHubRequests({
      boundMs: 10_000,
      backoffBaseMs: 60_000,
      failed: (request) => failed.push(request),
      ...overrides,
    }),
  };
}

const never = () => new AbortController().signal;

async function until(condition) {
  while (!condition()) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}

test("an api call asks for GitHub's head and settles with its status, headers and body", async (t) => {
  const gh = syntheticGh(t);
  const { github, failed } = requests();
  const answer = await github.request(["api", "repos/o/r"], never());
  assert.deepEqual(gh.calls(), ["api --include repos/o/r"]);
  assert.equal(answer.status, 200);
  assert.equal(answer.headers.get("etag"), '"one"');
  assert.equal(answer.body, "body of repos/o/r");
  assert.equal(answer.failure, undefined);
  assert.ok(Number.isFinite(Date.parse(answer.askedAt)));
  assert.deepEqual(failed, []);
});

test("requesters of one outstanding call share it, and a later requester asks again", async (t) => {
  const gh = syntheticGh(t);
  const { github } = requests();
  gh.hold();
  const first = github.request(["api", "repos/o/shared"], never());
  const second = github.request(["api", "repos/o/shared"], never());
  const other = github.request(["api", "repos/o/other"], never());
  await until(() => gh.calls().length === 2);
  gh.release();
  const [a, b] = await Promise.all([first, second, other]);
  assert.equal(a, b);
  assert.deepEqual(gh.calls().toSorted(), [
    "api --include repos/o/other",
    "api --include repos/o/shared",
  ]);
  await github.request(["api", "repos/o/shared"], never());
  assert.equal(gh.calls().length, 3);
});

test("a failed answer settles the request and is told once to the owner", async (t) => {
  const gh = syntheticGh(t);
  const { github, failed } = requests();
  const answer = await github.request(["api", "repos/o/missing"], never());
  assert.equal(answer.status, 404);
  assert.deepEqual(answer.failure, { kind: "http", status: 404 });
  assert.equal(gh.calls().length, 1);
  assert.equal(failed.length, 1);
  assert.equal(failed[0].cause, "http");
  assert.equal(failed[0].askedAt, answer.askedAt);
  assert.equal(failed[0].answer, answer);
  assert.ok(failed[0].startedAtMs <= Date.parse(answer.askedAt));
});

test("a directed rate limit holds back the next request unasked, for the wait left", async (t) => {
  const gh = syntheticGh(t);
  const { github, failed } = requests();
  const limited = await github.request(
    ["api", "repos/o/limited-as-directed"],
    never(),
  );
  assert.deepEqual(limited.failure, {
    kind: "rate-limited",
    status: 429,
    waitSeconds: 40,
  });
  const held = await github.request(["api", "repos/o/r"], never());
  assert.equal(held.status, undefined);
  assert.equal(held.failure.kind, "held-back");
  assert.ok(held.failure.waitSeconds > 38 && held.failure.waitSeconds <= 40);
  assert.deepEqual(gh.calls(), ["api --include repos/o/limited-as-directed"]);
  // Only the call GitHub refused is a failed call; a held-back one is not.
  assert.deepEqual(
    failed.map(({ cause }) => cause),
    ["rate-limited"],
  );
});

test("a rate limit that directs no wait is given this process's own backoff", async (t) => {
  syntheticGh(t);
  const { github } = requests({ backoffBaseMs: 7_000 });
  const limited = await github.request(
    ["api", "repos/o/limited-undirected"],
    never(),
  );
  assert.deepEqual(limited.failure, {
    kind: "rate-limited",
    status: 403,
    waitSeconds: 7,
    backoff: true,
  });
  const held = await github.request(["api", "repos/o/r"], never());
  assert.equal(held.failure.kind, "held-back");
});

test("a call that reaches its own bound is a timed-out failure, told to the owner", async (t) => {
  const gh = syntheticGh(t);
  const { github, failed } = requests({ boundMs: 300 });
  gh.hold();
  await assert.rejects(
    github.request(["api", "repos/o/slow"], never()),
    (error) => error instanceof GhFailure && error.reason.kind === "timed-out",
  );
  assert.deepEqual(
    failed.map(({ cause }) => cause),
    ["timed-out"],
  );
});

test("a requester that leaves gets its own reason, and the call ends when nobody waits", async (t) => {
  const gh = syntheticGh(t);
  const { github, failed } = requests();
  gh.hold();
  const staying = new AbortController();
  const leaving = new AbortController();
  const stays = github.request(["api", "repos/o/held"], staying.signal);
  const leaves = github.request(["api", "repos/o/held"], leaving.signal);
  await until(() => gh.calls().length === 1);
  const gone = new Error("gone");
  leaving.abort(gone);
  await assert.rejects(leaves, (error) => error === gone);
  staying.abort(gone);
  await assert.rejects(stays, (error) => error === gone);
  // An ordinary departure is no failed call.
  assert.deepEqual(failed, []);
  // The ended call is no longer outstanding: asking again starts a new one.
  gh.release();
  const again = await github.request(["api", "repos/o/held"], never());
  assert.equal(again.status, 200);
  assert.equal(gh.calls().length, 2);
});
