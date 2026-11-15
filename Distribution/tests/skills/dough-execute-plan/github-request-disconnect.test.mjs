// Closing one consumer must not release its queued work or end the shared
// call another consumer still needs, and a call its requesters left stays the
// owner's until its `gh` is gone. Routes and held log bytes are transport
// inputs; no project/domain records are arranged here.
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { test } from "node:test";
import {
  instrumentedGithubFixture,
  until,
} from "./ci-github-test-fixtures.mjs";
import { startConsumer } from "./github-request-consumer-test-fixtures.mjs";
import {
  ownerRecords,
  processGone,
} from "./github-request-owner-test-fixtures.mjs";

const route = (job) => `repos/owner/repo/actions/jobs/${job}/logs`;
const log = (job) => ["api", route(job)];

function heldLogs(t) {
  const github = instrumentedGithubFixture(t, {
    runs: [],
    attempts: {},
    jobs: [],
    holdLogs: true,
    log: "the log",
  });
  github.teardown.defer(() => github.releaseLogs());
  return github;
}

test("disconnecting cancels all this consumer's waits together, preserves a peer's shared call, and permits a fresh connection", async (t) => {
  const github = heldLogs(t);
  const closing = startConsumer(github.env, github.teardown);
  const peer = startConsumer(github.env, github.teardown);
  const active = [1, 2, 3, 4, 5, 6, 7, 8].map((job) => closing.ask(log(job)));
  await closing.reached();
  await until(() => github.asked().length === 8, "eight held reads arrived");
  const shared = peer.ask(log(1));
  await peer.reached();
  const queued = [9, 10, 11, 12].map((job) => closing.ask(log(job)));
  await closing.reached();

  closing.disconnect();
  for (const request of [...active, ...queued])
    assert.equal((await request.settled).rejected, "left");
  const next = peer.ask(log(20));
  await until(
    () => github.asked().includes(`api --include ${route(20)}`),
    "the peer takes a released turn",
  );
  assert.deepEqual(
    github.asked().toSorted(),
    [
      ...[1, 2, 3, 4, 5, 6, 7, 8].map((job) => `api --include ${route(job)}`),
      `api --include ${route(20)}`,
    ].toSorted(),
  );
  github.releaseLogs();
  assert.equal((await shared.settled).status, 200);
  assert.equal((await next.settled).status, 200);
  assert.equal((await closing.ask(log(30)).settled).status, 200);
  assert.equal(
    ownerRecords(github.env.DOUGH_GITHUB_REQUEST_OWNER_ROOT).length,
    1,
  );
});

// The `gh` of a call nobody waits for any more is asked to end, and stays
// held until the logs are released: its record stands, as the owner's own
// running call, until that process is gone.
test("a call its requesters left keeps its record until its gh is gone", async (t) => {
  const github = heldLogs(t);
  github.recordEndings("stay");
  const [leaving, staying] = [0, 1].map(() =>
    startConsumer(github.env, github.teardown),
  );
  const left = leaving.ask(log(1));
  const stays = staying.ask(log(2));
  await Promise.all([leaving.reached(), staying.reached()]);
  await until(() => github.asked().length === 2, "both held reads arrived");

  left.cancel();
  assert.equal((await left.settled).rejected, "left");
  await until(
    () => github.calls().some(({ phase }) => phase === "told-to-end"),
    "the left call's gh was asked to end",
  );
  const { pid } = github.calls().find(({ phase }) => phase === "told-to-end");
  const [{ directory }] = ownerRecords(
    github.env.DOUGH_GITHUB_REQUEST_OWNER_ROOT,
  );
  const recorded = () =>
    readdirSync(directory).some((name) => name.endsWith(`.${pid}.json`));
  assert.equal(processGone(pid), false);
  assert.ok(recorded(), "a gh still exiting keeps its call record");

  github.releaseLogs();
  assert.equal((await stays.settled).status, 200);
  await until(() => !recorded(), "the ended call's record was withdrawn");
  assert.ok(processGone(pid), "the record outlived its gh");
});
