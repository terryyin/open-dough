// Closing one consumer must not release its queued work or end the shared
// call another consumer still needs. Routes and held log bytes are transport
// inputs; no project/domain records are arranged here.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  instrumentedGithubFixture,
  until,
} from "./ci-github-test-fixtures.mjs";
import { startConsumer } from "./github-request-consumer-test-fixtures.mjs";
import { ownerRecords } from "./github-request-owner-test-fixtures.mjs";

const route = (job) => `repos/owner/repo/actions/jobs/${job}/logs`;
const log = (job) => ["api", route(job)];

test("disconnecting cancels all this consumer's waits together, preserves a peer's shared call, and permits a fresh connection", async (t) => {
  const github = instrumentedGithubFixture(t, {
    runs: [],
    attempts: {},
    jobs: [],
    holdLogs: true,
    log: "the log",
  });
  github.teardown.defer(() => github.releaseLogs());
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
