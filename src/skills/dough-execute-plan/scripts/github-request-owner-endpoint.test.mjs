// The request owner's private endpoint, spoken to directly over its socket
// and through a consumer whose endpoint is not private: only this user's
// directory holds it, only a caller with the owner's token is heard, and
// only the one fixed read, asked under the owner's own login, is asked of
// `gh`.
import assert from "node:assert/strict";
import { chmodSync, existsSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { test } from "node:test";
import { instrumentedGithubFixture } from "./ci-github-test-fixtures.mjs";
import { enterEnvironment } from "./fixture-teardown-test-fixtures.mjs";
import {
  privacyRefusal,
  privateDirectory,
} from "./github-request-owner-endpoint.mjs";
import {
  ownerSecret,
  refusingOwner,
} from "./github-request-owner-refusal-test-fixtures.mjs";
import {
  ownerlessRequestRoot,
  ownerRecords,
  saidToOwner,
} from "./github-request-owner-test-fixtures.mjs";
import { greeted } from "./github-request-owner-endpoint-connection.mjs";
import { protocol } from "./github-request-owner-wire.mjs";
import { GitHubRequests } from "./github-requests.mjs";

const never = () => new AbortController().signal;
const workflow = ["api", "repos/owner/repo/actions/workflows/ci.yml"];

function consumer(t) {
  const github = instrumentedGithubFixture(t, {
    runs: [],
    attempts: {},
    jobs: [],
  });
  github.enter();
  const failed = [];
  return {
    github,
    failed,
    root: github.env.DOUGH_GITHUB_REQUEST_OWNER_ROOT,
    requests: new GitHubRequests({
      boundMs: 10_000,
      backoffBaseMs: 60_000,
      failed: ({ cause }) => failed.push(cause),
    }),
  };
}

test("a directory is private only as this user's own directory closed to everyone else", () => {
  const entry = (overrides) => ({
    isDirectory: () => true,
    uid: 501,
    mode: 0o40700,
    ...overrides,
  });
  assert.equal(privacyRefusal(entry(), 501), undefined);
  assert.equal(
    privacyRefusal(entry({ uid: 502 }), 501),
    "owned by another user",
  );
  assert.equal(
    privacyRefusal(entry({ mode: 0o40750 }), 501),
    "open to other users",
  );
  assert.equal(
    privacyRefusal(entry({ mode: 0o40701 }), 501),
    "open to other users",
  );
  assert.equal(
    privacyRefusal(entry({ isDirectory: () => false }), 501),
    "not a directory",
  );
});

test("the owner hears only a caller holding its token and speaking its protocol, and asks gh only the one fixed read", async (t) => {
  const { github, root, requests } = consumer(t);
  assert.equal((await requests.request(workflow, never())).status, 200);
  const [{ socket, token, directory }] = ownerRecords(root);
  const path = `${directory}/${socket}`;
  const bounds = { boundMs: 5_000, maxBufferBytes: 1_000_000 };
  const read = (id, args, scope = basename(directory)) => ({
    id,
    request: { args, ...bounds, scope },
  });

  for (const greeting of [
    { hello: protocol, token: "f".repeat(token.length) },
    { hello: protocol },
    read(1, workflow),
  ])
    assert.deepEqual(await saidToOwner(path, [greeting, read(1, workflow)]), {
      closed: true,
      lines: [{ refused: "unauthenticated" }],
    });
  assert.deepEqual(await saidToOwner(path, [{ hello: protocol + 1, token }]), {
    closed: true,
    lines: [{ refused: "incompatible" }],
  });

  const refusedReads = [
    ["auth", "token"],
    ["api"],
    ["api", "--input", "/etc/hosts", "repos/owner/repo"],
    ["api", "-X", "DELETE", "repos/owner/repo"],
    ["api", "-f", "name=changed", "repos/owner/repo"],
    ["api", "--hostname", "elsewhere.example", "repos/owner/repo"],
    ["api", "https://elsewhere.example/repos/owner/repo"],
    ["api", "repos/{owner}/{repo}"],
    ["api", "repos/owner/repo", "repos/owner/other"],
  ];
  const heard = await saidToOwner(
    path,
    [
      { hello: protocol, token },
      ...refusedReads.map((args, index) => read(index + 1, args)),
      { id: 20, request: { args: workflow, boundMs: 5_000 } },
      { id: 21, request: { args: workflow, ...bounds } },
      read(22, workflow, "0".repeat(12)),
      read(23, workflow),
    ],
    refusedReads.length + 5,
  );
  assert.equal(heard.closed, false);
  assert.deepEqual(heard.lines.slice(0, -1), [
    { welcome: protocol },
    ...[...refusedReads.keys(), 19, 20].map((index) => ({
      id: index + 1,
      refused: "not a GitHub API read",
    })),
    { id: 22, refused: "another login" },
  ]);
  assert.equal(heard.lines.at(-1).id, 23);
  assert.equal(heard.lines.at(-1).answer.status, 200);

  for (const other of [{ run: ["sh", "-c", "true"] }, { id: 1, stop: true }])
    assert.deepEqual(
      await saidToOwner(path, [{ hello: protocol, token }, other]),
      {
        closed: true,
        lines: [{ welcome: protocol }, { refused: "unknown operation" }],
      },
    );

  const asked = `api --include ${workflow[1]}`;
  assert.deepEqual(github.asked(), [asked, asked]);
});

test("a consumer whose endpoint is open to other users is answered as failed, asks nothing and starts no owner", async (t) => {
  const { github, root, requests, failed } = consumer(t);
  chmodSync(root, 0o755);
  const answer = await requests.request(workflow, never());
  assert.equal(answer.status, undefined);
  assert.deepEqual(answer.failure, {
    kind: "owner-unavailable",
    cause: "not-private",
  });
  assert.deepEqual(failed, ["owner-unavailable"]);
  assert.deepEqual(github.asked(), []);
  assert.deepEqual(ownerRecords(root), []);
});

// What a suite gives every process it starts, so a test asking GitHub
// through no owner of its own is refused and leaves the root to be found.
test("a consumer at the root that admits no owner makes that root, is answered as failed, asks nothing and starts no owner", async (t) => {
  const { github, root, requests, failed } = consumer(t);
  const ownerless = ownerlessRequestRoot(root);
  enterEnvironment(t, { DOUGH_GITHUB_REQUEST_OWNER_ROOT: ownerless });
  const answer = await requests.request(workflow, never());
  assert.deepEqual(answer.failure, {
    kind: "owner-unavailable",
    cause: "path-too-long",
  });
  assert.deepEqual(failed, ["owner-unavailable"]);
  assert.deepEqual(github.asked(), []);
  assert.equal(existsSync(ownerless), true);
  assert.deepEqual(ownerRecords(ownerless), []);
});

test("another user's directory and socket refuse with safe ownership causes", async (t) => {
  const { github, root } = consumer(t);
  const metadata = () => ({ isDirectory: () => true, uid: -1, mode: 0o700 });
  assert.throws(
    () => privateDirectory(root, metadata),
    (error) =>
      error.failure?.cause === "another-user" && !error.message.includes(root),
  );
  const { socket } = await refusingOwner(github, { refused: "incompatible" });
  await assert.rejects(
    greeted({ socket, token: ownerSecret }, () => {}, metadata),
    (error) => error.failure?.cause === "another-user",
  );
  assert.deepEqual(github.asked(), []);
});

test("a file used as an endpoint is a known directory fault with no upstream call", async (t) => {
  const { github, root, requests } = consumer(t);
  const file = join(root, "secret-path-sentinel");
  writeFileSync(file, ownerSecret);
  enterEnvironment(t, { DOUGH_GITHUB_REQUEST_OWNER_ROOT: file });
  const answer = await requests.request(workflow, never());
  assert.deepEqual(answer.failure, {
    kind: "owner-unavailable",
    cause: "not-directory",
  });
  assert.deepEqual(github.asked(), []);
  assert.doesNotMatch(
    JSON.stringify(answer),
    new RegExp(`${root}|${ownerSecret}`),
  );
});

for (const [greeting, cause] of [
  [{ refused: "incompatible" }, "incompatible"],
  [{ refused: "unauthenticated" }, "unauthenticated"],
  [{ refused: ownerSecret }, "unknown"],
  [null, "unknown"],
  ["close", "connection-failed"],
  ["silent", "unknown"],
  ["unanswered", "unknown"],
]) {
  test(`a reader names ${cause} from greeting ${JSON.stringify(greeting)} without asking GitHub`, async (t) => {
    const { github, root, requests, failed } = consumer(t);
    await refusingOwner(github, greeting);
    const answer = await requests.request(workflow, never());
    assert.deepEqual(answer.failure, { kind: "owner-unavailable", cause });
    assert.deepEqual(failed, ["owner-unavailable"]);
    assert.deepEqual(github.asked(), []);
    assert.equal(ownerRecords(root).length, 1);
    assert.doesNotMatch(
      JSON.stringify(answer),
      new RegExp(`${root}|${ownerSecret}`),
    );
  });
}

test("an owner process that exits during startup settles failed without a fallback", async (t) => {
  const { github } = consumer(t);
  const requests = new GitHubRequests({ boundMs: 10_000, backoffBaseMs: 0 });
  const answer = await requests.request(workflow, never());
  assert.deepEqual(answer.failure, {
    kind: "owner-unavailable",
    cause: "start-failed",
  });
  assert.deepEqual(github.asked(), []);
});
