// The request owner's private endpoint, spoken to directly over its socket
// and through a consumer whose endpoint is not private: only this user's
// directory holds it, only a caller with the owner's token is heard, and
// only the one fixed read, asked under the owner's own login, is asked of
// `gh`.
import assert from "node:assert/strict";
import { chmodSync } from "node:fs";
import { basename } from "node:path";
import { test } from "node:test";
import { instrumentedGithubFixture } from "./ci-github-test-fixtures.mjs";
import { privacyRefusal } from "./github-request-owner-endpoint.mjs";
import {
  ownerRecords,
  saidToOwner,
} from "./github-request-owner-test-fixtures.mjs";
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
  assert.deepEqual(answer.failure, { kind: "failed" });
  assert.deepEqual(failed, ["failed"]);
  assert.deepEqual(github.asked(), []);
  assert.deepEqual(ownerRecords(root), []);
});
