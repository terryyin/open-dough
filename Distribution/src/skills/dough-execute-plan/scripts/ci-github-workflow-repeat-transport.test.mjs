// One-shot transport across owner loss, login changes and controlled bounds.
import assert from "node:assert/strict";
import { chmodSync } from "node:fs";
import { test } from "node:test";
import { GitHubRequests } from "./github-requests.mjs";
import {
  instrumentedGithubFixture,
  until,
} from "./ci-github-test-fixtures.mjs";
import { loginMachine } from "./github-request-login-test-fixtures.mjs";
import { enterEnvironment } from "./fixture-teardown-test-fixtures.mjs";
import {
  ownerRecords,
  processGone,
} from "./github-request-owner-test-fixtures.mjs";
import { refusingOwner } from "./github-request-owner-refusal-test-fixtures.mjs";

const signal = () => new AbortController().signal;
const read = ["api", "repos/owner/repo/actions/runs/71"];
const options = { boundMs: 20_000, backoffBaseMs: 60_000 };
const posts = (github) =>
  github
    .calls()
    .filter(({ phase, method }) => phase === "asked" && method === "POST");
function provider(t) {
  const github = instrumentedGithubFixture(t, {
    runs: [],
    attempts: {},
    jobs: [],
    answers: {
      "POST runs/71/rerun": { head: "HTTP/2.0 201 Created", body: "{}" },
    },
  });
  github.enter();
  return github;
}

// The recorded POST is the event. Its wait keeps real time, captured before a
// case controls setTimeout, so ticking the client clock need not drive it. A
// file watch can miss a write made before its macOS event stream starts.
const realSetTimeout = globalThis.setTimeout;
async function posted(github) {
  const deadline = Date.now() + 20_000;
  while (posts(github).length === 0) {
    if (Date.now() > deadline)
      throw new Error("Timed out: the POST reached GitHub");
    await new Promise((resolve) => realSetTimeout(resolve, 20));
  }
}

test("a legacy read-only owner is still usable for reads and receives no action frame without its declared capability", async (t) => {
  const github = provider(t);
  const owner = await refusingOwner(github, "read-only");
  const client = new GitHubRequests(options);
  await client.request(read, signal());
  assert.deepEqual(await client.repeatWorkflow("owner/repo", 71, signal()), {
    kind: "refused",
    reason: "owner-unavailable",
    ownerCause: "operation-unavailable",
  });
  assert.equal(
    owner.messages.filter(({ request }) => request?.args !== undefined).length,
    1,
  );
  assert.deepEqual(
    owner.messages.filter(({ request }) => request?.operation !== undefined),
    [],
  );
  assert.deepEqual(github.asked(), []);
});

test("a lost owner socket after the POST leaves uncertainty; a replacement serves a later read without resending the action", async (t) => {
  const github = provider(t);
  const client = new GitHubRequests(options);
  github.holdRequests();
  github.teardown.defer(github.releaseRequests);
  const submission = client.repeatWorkflow("owner/repo", 71, signal());
  await until(
    () => posts(github).length === 1,
    "the original action reached GitHub",
  );
  const [owner] = ownerRecords(github.env.DOUGH_GITHUB_REQUEST_OWNER_ROOT);
  process.kill(owner.pid, "SIGKILL");
  assert.deepEqual(await submission, {
    kind: "uncertain",
    reason: "submission-unconfirmed",
  });
  await until(
    () => processGone(owner.pid),
    "the exact owned request owner ended",
  );
  github.releaseRequests();
  const replacementReader = new GitHubRequests(options);
  assert.equal((await replacementReader.request(read, signal())).status, 404);
  assert.equal(posts(github).length, 1);
  assert.notEqual(
    ownerRecords(github.env.DOUGH_GITHUB_REQUEST_OWNER_ROOT)[0].pid,
    owner.pid,
  );
});

test("a login change after submission never enters the read retry loop or posts under the new login", async (t) => {
  const machine = loginMachine(t);
  machine.github.set({
    runs: [],
    attempts: {},
    jobs: [],
    answers: {
      "POST runs/71/rerun": { head: "HTTP/2.0 201 Created", body: "{}" },
    },
  });
  const stored = machine.stored("first");
  enterEnvironment(t, { ...stored.env, GH_TOKEN: "" });
  const client = new GitHubRequests(options);
  machine.github.holdRequests();
  machine.github.teardown.defer(machine.github.releaseRequests);
  const submission = client.repeatWorkflow("owner/repo", 71, signal());
  await until(
    () => posts(machine.github).length === 1,
    "the first login's POST reached GitHub",
  );
  stored.login("second");
  machine.github.releaseRequests();
  assert.deepEqual(await submission, {
    kind: "uncertain",
    reason: "submission-unconfirmed",
  });
  await client.request(read, signal());
  assert.deepEqual(
    posts(machine.github).map(({ user }) => user),
    ["first"],
  );
});

test("the controlled request bound leaves a submitted action uncertain and never resends it", async (t) => {
  const github = provider(t);
  const client = new GitHubRequests({ ...options, boundMs: 60_000 });
  await client.request(read, signal()); // Reach and keep the real owner before controlling client time.
  github.holdRequests();
  github.teardown.defer(github.releaseRequests);
  t.mock.timers.enable({ apis: ["setTimeout"] });
  try {
    const observed = posted(github);
    const submission = client.repeatWorkflow("owner/repo", 71, signal());
    let outcome;
    const settled = submission.then((value) => {
      outcome = value;
    });
    await observed;
    t.mock.timers.tick(60_000);
    await new Promise(setImmediate);
    assert.deepEqual(outcome, {
      kind: "uncertain",
      reason: "submission-unconfirmed",
    });
    await settled;
  } finally {
    t.mock.timers.reset();
    github.releaseRequests();
  }
  await client.request(read, signal());
  assert.equal(posts(github).length, 1);
});

test("a local endpoint privacy refusal is a bounded pre-send refusal, not uncertain submission", async (t) => {
  const github = provider(t);
  const root = github.env.DOUGH_GITHUB_REQUEST_OWNER_ROOT;
  chmodSync(root, 0o755);
  github.teardown.defer(() => chmodSync(root, 0o700));
  assert.deepEqual(
    await new GitHubRequests(options).repeatWorkflow(
      "owner/repo",
      71,
      signal(),
    ),
    {
      kind: "refused",
      reason: "owner-unavailable",
      ownerCause: "not-private",
    },
  );
  assert.deepEqual(github.asked(), []);
});
