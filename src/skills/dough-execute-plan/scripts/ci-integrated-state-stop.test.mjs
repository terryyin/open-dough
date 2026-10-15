// Stopping the installed observer while its candidate fetch waits on a stalled
// target remote ends that fetch with the observation: the stop publishes the
// observer's own terminal result within the store's deadline, and no process
// the fetch started survives.
import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { setTimeout as pause } from "node:timers/promises";
import { exec } from "./publication-test-fixtures.mjs";
import { installTransportStall } from "./publication-stall-test-fixtures.mjs";
import { checkMailboxWorkerLiveness } from "./ci-mailbox-worker-process.mjs";
import {
  readWorkerIdentity,
  terminalResultDeadlineMs,
} from "./ci-mailbox-store.mjs";
import { parseReceipt } from "./ci-mailbox-await-test-fixtures.mjs";
import { createIntegratedStateJourney } from "./ci-integrated-state-journey-test-fixtures.mjs";

// A process that ended may stay visible until its new parent reaps it.
async function assertEnded(stall, pid) {
  const deadline = Date.now() + 2_000;
  while (stall.alive(pid) && Date.now() < deadline) await pause(20);
  assert.equal(stall.alive(pid), false, `the fetch's process ${pid} remains`);
}

test("a stop during a slow candidate fetch ends the fetch and confirms shutdown within the deadline", async (t) => {
  const journey = await createIntegratedStateJourney(t);
  const { fixture } = journey;
  const b = await journey.publishIncrement();
  const directory = await journey.observe(b);
  await journey.afterTwoPolls(directory, b);
  journey.recordRun(b, { state: "cancelled" });
  const stall = await installTransportStall({
    fixture: fixture.fixture,
    workspace: fixture.execution,
    origin: fixture.origin,
  });
  t.after(stall.cleanup);
  stall.stall({ service: "upload-pack" });
  // Another writer's green C, which the observing checkout lacks.
  const c = await journey.publishFromAnotherWriter("c.txt");
  assert.equal(c.success, true);
  journey.recordRun(c.sha, { state: "completed", executed: c });
  const stalled = () => stall.calls().find((call) => call.stalled);
  await journey.awaitCoverage(
    directory,
    b,
    () => stalled() !== undefined,
    "the candidate fetch reaching the stalled remote",
  );

  const started = Date.now();
  const stopped = await exec(
    process.execPath,
    [join(fixture.skill, "scripts/ci-mailbox.mjs"), "stop", directory],
    { cwd: fixture.execution, env: fixture.env },
  );
  const elapsed = Date.now() - started;
  const { terminal } = parseReceipt(stopped.stdout);
  assert.equal(terminal.status, "stopped");
  assert.equal(terminal.coverage.state, "ended", JSON.stringify(terminal));
  assert.ok(
    elapsed < terminalResultDeadlineMs(),
    `stop took ${elapsed} ms against a ${terminalResultDeadlineMs()} ms deadline`,
  );
  assert.equal(
    checkMailboxWorkerLiveness(readWorkerIdentity(directory), directory),
    "dead",
  );
  await assertEnded(stall, stalled().pid);
});
