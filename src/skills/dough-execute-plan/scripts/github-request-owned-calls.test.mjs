// What a request owner does about the `gh` calls an earlier owner left
// recorded in its endpoint directory, against processes of each test's own:
// only the very process a record names -- by its arguments and its start --
// is ended, asked first and killed a second later; any other process running
// under a recorded process ID is left alone, and one that cannot be looked
// at is counted until it is gone.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, readdirSync, renameSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { until } from "./ci-github-test-fixtures.mjs";
import { loginMachine } from "./github-request-login-test-fixtures.mjs";
import {
  earlierCallsEnded,
  OwnedCalls,
  shownProcess,
} from "./github-request-owned-calls.mjs";

const args = (job) => [
  "api",
  "--include",
  `repos/owner/repo/actions/jobs/${job}/logs`,
];

// An endpoint directory, and `gh` calls at GitHub that wait there until the
// test is over, each as a process of this test: `exit` resolves with how it
// ended.
function leftCalls(t, onEnd) {
  const { github } = loginMachine(t, { holdLogs: true });
  if (onEnd !== undefined) github.recordEndings(onEnd);
  const directory = mkdtempSync(join(tmpdir(), "request-calls-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  let started = 0;
  return {
    github,
    directory,
    records: () => readdirSync(directory).toSorted(),
    async call(job) {
      const child = spawn(join(github.env.CI_GH_FIXTURE, "gh"), args(job), {
        env: github.env,
        stdio: "ignore",
      });
      const exit = new Promise((resolve) =>
        child.once("exit", (code, signal) => resolve(signal ?? code)),
      );
      github.teardown.defer(() => {
        child.kill("SIGKILL");
        return exit;
      });
      started += 1;
      const running = started;
      await until(() => github.calls().length >= running, "the call was asked");
      return { pid: child.pid, exit, running: () => child.exitCode === null };
    },
  };
}

test("the process a record names is asked to end, and its record removed with those of calls already gone", async (t) => {
  const { github, directory, records, call } = leftCalls(t, "end");
  const owned = new OwnedCalls(directory, 1);
  const [left, gone] = [await call(1), await call(2)];
  owned.started(left.pid, args(1), "core");
  owned.started(gone.pid, args(2), "core");
  process.kill(gone.pid, "SIGKILL");
  await gone.exit;
  assert.deepEqual(
    records(),
    [`call.1.${left.pid}.json`, `call.1.${gone.pid}.json`].toSorted(),
  );

  assert.deepEqual(await earlierCallsEnded(directory, 2), []);
  assert.equal(await left.exit, 143);
  assert.deepEqual(
    github
      .calls()
      .map(({ phase, pid }) => [phase, pid])
      .at(-1),
    ["told-to-end", left.pid],
  );
  assert.deepEqual(records(), []);
});

test("a call that does not end when asked is looked at again and killed a second later", async (t) => {
  const { github, directory, records, call } = leftCalls(t, "stay");
  const left = await call(1);
  new OwnedCalls(directory, 1).started(left.pid, args(1), "core");

  assert.deepEqual(await earlierCallsEnded(directory, 2), []);
  assert.equal(await left.exit, "SIGKILL");
  const told = github.calls().find(({ phase }) => phase === "told-to-end");
  assert.ok(Date.now() - told.at >= 900);
  assert.deepEqual(records(), []);
});

test("a process running under a recorded process ID is never signalled unless it runs the recorded arguments and started when the record says", async (t) => {
  const { directory, records, call } = leftCalls(t, "end");
  const [otherArguments, otherStart] = [await call(1), await call(2)];
  const owned = new OwnedCalls(directory, 1);
  owned.started(otherArguments.pid, args(7), "core");
  // The very arguments, recorded as started an hour before this process.
  const realNow = Date.now;
  Date.now = () => realNow() - 3_600_000;
  try {
    owned.started(otherStart.pid, args(2), "core");
  } finally {
    Date.now = realNow;
  }
  // This test process, under arguments it does not run.
  owned.started(process.pid, args(3), "core");

  assert.deepEqual(await earlierCallsEnded(directory, 2), []);
  assert.deepEqual(records(), []);
  assert.ok(otherArguments.running());
  assert.ok(otherStart.running());
});

test("a recorded call that cannot be looked at is not signalled, and is counted until its process is gone", async (t) => {
  const { directory, records, call } = leftCalls(t, "end");
  const left = await call(1);
  new OwnedCalls(directory, 1).started(left.pid, args(1), "search");
  const denied = () =>
    Promise.reject(Object.assign(new Error("denied"), { code: "EPERM" }));

  const [counted, ...others] = await earlierCallsEnded(directory, 2, denied);
  assert.deepEqual(others, []);
  assert.equal(counted.resource, "search");
  assert.ok(left.running());
  // Its record stands for an owner that replaces this one meanwhile.
  assert.deepEqual(records(), [`call.1.${left.pid}.json`]);

  process.kill(left.pid, "SIGKILL");
  await counted.gone;
  assert.deepEqual(records(), []);
});

test("a record its owner was killed while writing still names its call, and an owner's own records and later ones are left alone", async (t) => {
  const { directory, records, call } = leftCalls(t, "end");
  const [drafted, own] = [await call(1), await call(2)];
  new OwnedCalls(directory, 1).started(drafted.pid, args(1), "core");
  const record = join(directory, `call.1.${drafted.pid}.json`);
  renameSync(record, `${record}.draft`);
  new OwnedCalls(directory, 2).started(own.pid, args(2), "core");

  assert.deepEqual(await earlierCallsEnded(directory, 2), []);
  assert.equal(await drafted.exit, 143);
  assert.deepEqual(records(), [`call.2.${own.pid}.json`]);
  assert.ok(own.running());
});

test("the process table shows a running process's command and start, and nothing for a process that is gone", async (t) => {
  const { call } = leftCalls(t);
  const asked = Date.now();
  const running = await call(1);
  const shown = await shownProcess(running.pid);
  assert.ok(shown.command.endsWith(`/gh ${args(1).join(" ")}`));
  assert.ok(shown.startedFromMs <= Date.now() && shown.startedByMs >= asked);
  assert.ok(shown.startedByMs - shown.startedFromMs < 60_000);

  process.kill(running.pid, "SIGKILL");
  await running.exit;
  assert.equal(await shownProcess(running.pid), undefined);
});
