import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { completionState } from "./ci-mailbox-completion-state.mjs";
import { completeRevision } from "./ci-mailbox-complete.mjs";
import { register } from "./ci-mailbox-await-test-fixtures.mjs";
import { publishJson } from "./ci-mailbox-json-file.mjs";
import { readWorkerIdentity } from "./ci-mailbox-store.mjs";
import {
  setupProcessMailbox,
  sha,
} from "./ci-mailbox-process-test-fixtures.mjs";
import { awaitProcessExit } from "./process-lifetime-test-fixtures.mjs";
import {
  awaitWorkerSignal,
  waitForPidExit,
} from "./watch-ci-test-fixtures.mjs";

test("at-cap worker loss stays explicitly unavailable alongside durable expiry and cannot create pending replacement coverage", async (t) => {
  const h = await setupProcessMailbox(t);
  await register(h.env, h.mailbox);
  let clock = 1000;
  const options = { storage: h.env.DOUGH_CI_MAILBOX_ROOT, now: () => clock };
  const first = completionState(h.mailbox, sha, options).handoff;
  clock = first.deadline;
  // A fresh recorded queue fact is only this test's starting precondition;
  // real adapter acquisition/projection is covered by the pending journey.
  publishJson(join(h.mailbox, "coverage"), `${sha}.json`, {
    sha,
    state: "undiscovered",
    queue: { sha, branch: "main", state: "running", observedAt: clock },
  });
  await awaitWorkerSignal(h.mailbox, join(h.directory, "started"));
  const { pid } = readWorkerIdentity(h.mailbox);
  const providerPid = Number(
    readFileSync(join(h.directory, "github-pid"), "utf8"),
  );
  process.kill(pid, "SIGKILL");
  await awaitProcessExit(pid);
  assert.equal(await waitForPidExit(providerPid), true);
  const result = await completeRevision(h.mailbox, sha, options);
  assert.equal(result.unresolvedReason, "completion_expired");
  assert.deepEqual(result.observation, {
    unresolvedReason: "observation_unavailable",
    detail: "worker_exited",
  });
  assert.equal(result.verdict, undefined);
  assert.equal(result.pending, undefined);
  assert.deepEqual(result.handoff, first);
  assert.equal(result.shutdown.terminal.coverage.state, "lost");
});
