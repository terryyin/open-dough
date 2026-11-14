import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import {
  awaitReady,
  bashHangCheck,
  deadlineRepository,
  expireDeadline,
  nodeHangCheck,
  observeDir,
  processRunning,
  readDeadlineReady,
  runDeadlineSuite,
  timedOutRun,
} from "./test-runner-deadline-fixtures.mjs";

test("a blocked Bash check ends at its safety deadline with a named failure", async (t) => {
  const { result, times, outcomes, pid } = await timedOutRun(t, {
    files: {
      "checks/hang.sh": bashHangCheck(),
    },
    args: ["checks/hang.sh"],
  });
  assert.notEqual(result.code, 0, result.output);
  assert.match(
    result.output,
    /TIMEOUT: checks\/hang\.sh \(safety deadline 180s; after [0-9]+\.[0-9]s\)/,
  );
  assert.ok(
    !processRunning(pid),
    "owned Bash check must end when its deadline expires",
  );
  assert.match(
    readFileSync(times, "utf8"),
    /^[0-9]+\.[0-9]\tchecks\/hang\.sh$/m,
  );
  assert.match(readFileSync(outcomes, "utf8"), /^failed\tchecks\/hang\.sh$/m);
});

test("a blocked Node test file ends at its safety deadline with a named failure", async (t) => {
  const { result, times, outcomes, pid } = await timedOutRun(t, {
    files: {
      "checks/hang.test.mjs": nodeHangCheck(),
    },
    args: ["checks/hang.test.mjs"],
    observeName: "node-hang",
  });
  assert.notEqual(result.code, 0, result.output);
  assert.match(
    result.output,
    /TIMEOUT: checks\/hang\.test\.mjs \(safety deadline 180s; after [0-9]+\.[0-9]s\)/,
  );
  assert.ok(!processRunning(pid), "owned Node job must end at expiry");
  assert.match(
    readFileSync(times, "utf8"),
    /^[0-9]+\.[0-9]\tchecks\/hang\.test\.mjs$/m,
  );
  assert.match(
    readFileSync(outcomes, "utf8"),
    /^failed\tchecks\/hang\.test\.mjs$/m,
  );
});

test("expiry fails when deadline handling is disabled and passes when enabled", async (t) => {
  const { root, project } = await deadlineRepository(t, {
    files: {
      "checks/hang.sh": bashHangCheck(),
    },
  });
  const observation = observeDir(t, root, "discriminate");
  const readyFile = path.join(root, "deadline-ready");
  const disabled = runDeadlineSuite(
    t,
    project,
    observation,
    {
      OPEN_DOUGH_TEST_DISABLE_JOB_DEADLINE: "1",
      OPEN_DOUGH_TEST_JOB_DEADLINE_READY: readyFile,
    },
    ["checks/hang.sh"],
  );
  await awaitReady(observation, disabled);
  // No deadline FIFO is published while handling is disabled.
  await delay(100);
  assert.ok(!existsSync(readyFile));
  const pid = Number(readFileSync(path.join(observation, "pid"), "utf8"));
  assert.ok(processRunning(pid));
  writeFileSync(path.join(observation, "release"), "");
  const disabledResult = await disabled.result;
  assert.equal(disabledResult.code, 0, disabledResult.output);

  const enabledObservation = observeDir(t, root, "enabled");
  const enabledReady = path.join(root, "enabled-ready");
  const enabled = runDeadlineSuite(
    t,
    project,
    enabledObservation,
    { OPEN_DOUGH_TEST_JOB_DEADLINE_READY: enabledReady },
    ["checks/hang.sh"],
  );
  await awaitReady(enabledObservation, enabled);
  const armed = await readDeadlineReady(enabledReady);
  expireDeadline(armed.fifo);
  const enabledResult = await enabled.result;
  assert.notEqual(enabledResult.code, 0, enabledResult.output);
  assert.match(enabledResult.output, /TIMEOUT: checks\/hang\.sh/);
});
