import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import {
  fixture,
  gateRef,
  git,
  repository,
  succeeded,
  until as lifecycleUntil,
} from "./local-test-suite-fixtures.mjs";
import { repositoryAtAdmissionGate } from "./local-test-suite-gates.mjs";
import {
  awaitReady,
  bashHangCheck,
  deadlineRepository,
  expireDeadline,
  observeDir,
  processRunning,
  readDeadlineReady,
  runDeadlineSuite,
  until,
} from "./test-runner-deadline-fixtures.mjs";

test("a TERM-resistant owned group dies before queued work continues and the run fails", async (t) => {
  const { root, project } = await deadlineRepository(t, {
    files: {
      "checks/first.sh": bashHangCheck({
        ignoreTerm: true,
        childIgnoresTerm: true,
      }),
      "checks/second.sh": `#!/usr/bin/env bash
set -euo pipefail
mkdir -p "$OBSERVE"
printf '%s\\n' "$$" > "$OBSERVE/second-pid"
touch "$OBSERVE/second-ready"
while [[ ! -e $OBSERVE/second-release ]]; do read -r -t 0.05 _ < "$OBSERVE/wakeup" || true; done
`,
      "checks/longest-first": "10.0\tchecks/first.sh\n9.0\tchecks/second.sh\n",
    },
  });
  const observation = observeDir(t, root, "term-resistant");
  const readyFile = path.join(root, "deadline-ready");
  const outcomes = path.join(root, "outcomes");
  const run = runDeadlineSuite(
    t,
    project,
    observation,
    {
      OPEN_DOUGH_TEST_JOB_DEADLINE_READY: readyFile,
      OPEN_DOUGH_TEST_OUTCOMES: outcomes,
      OPEN_DOUGH_TEST_JOBS: "1",
    },
    ["checks/first.sh", "checks/second.sh"],
  );
  await awaitReady(observation, run);
  await until("TERM-resistant child ready", () =>
    existsSync(path.join(observation, "child-ready")),
  );
  const parentPid = Number(readFileSync(path.join(observation, "pid"), "utf8"));
  const childPid = Number(
    readFileSync(path.join(observation, "child-pid"), "utf8"),
  );
  const armed = await readDeadlineReady(readyFile);
  expireDeadline(armed.fifo);
  await until("first job group ended before successor entry", () => {
    if (processRunning(parentPid) || processRunning(childPid)) return false;
    return existsSync(path.join(observation, "second-ready"));
  });
  assert.ok(
    !processRunning(parentPid) && !processRunning(childPid),
    "owned TERM-resistant group must be dead before the next check starts",
  );
  writeFileSync(path.join(observation, "second-release"), "");
  const result = await run.result;
  assert.notEqual(result.code, 0, result.output);
  assert.match(result.output, /TIMEOUT: checks\/first\.sh/);
  const outcomeText = readFileSync(outcomes, "utf8");
  assert.match(outcomeText, /^failed\tchecks\/first\.sh$/m);
  assert.match(outcomeText, /^passed\tchecks\/second\.sh$/m);
});

test("a completed check retires its deadline watcher so a successor survives past the old deadline", async (t) => {
  const { root, project } = await deadlineRepository(t, {
    files: {
      "checks/first.sh": `#!/usr/bin/env bash
set -euo pipefail
mkdir -p "$OBSERVE"
touch "$OBSERVE/first-done"
`,
      "checks/second.sh": bashHangCheck(),
      "checks/longest-first": "10.0\tchecks/first.sh\n9.0\tchecks/second.sh\n",
    },
  });
  const observation = observeDir(t, root, "retire");
  const readyFile = path.join(root, "deadline-ready");
  const readyLog = `${readyFile}.log`;
  const run = runDeadlineSuite(
    t,
    project,
    observation,
    {
      OPEN_DOUGH_TEST_JOB_DEADLINE_READY: readyFile,
      OPEN_DOUGH_TEST_JOBS: "1",
    },
    ["checks/first.sh", "checks/second.sh"],
  );
  await until("second job armed after first completed", () => {
    if (!existsSync(path.join(observation, "ready"))) return false;
    if (!existsSync(readyLog) || !existsSync(readyFile)) return false;
    const log = readFileSync(readyLog, "utf8");
    return (
      /^0\t/m.test(log) &&
      /^1\t/m.test(log) &&
      readFileSync(readyFile, "utf8").trim().startsWith("1\t")
    );
  });
  const firstFifo = readFileSync(readyLog, "utf8")
    .split("\n")
    .find((line) => line.startsWith("0\t"))
    .split("\t")[1];
  await until(
    "completed job removes its deadline FIFO",
    () => !existsSync(firstFifo),
  );
  // Advance beyond the retired deadline: the old FIFO is gone, and the
  // successor remains alive with only its own armed deadline published.
  const armed = await readDeadlineReady(readyFile);
  assert.equal(armed.index, "1");
  const pid = Number(readFileSync(path.join(observation, "pid"), "utf8"));
  assert.ok(
    processRunning(pid),
    "successor must remain alive after the first job's deadline would have passed",
  );
  writeFileSync(path.join(observation, "release"), "");
  const result = await run.result;
  assert.equal(result.code, 0, result.output);
  assert.doesNotMatch(result.output, /TIMEOUT:/);
});

test("a timed-out whole run releases suite admission for a waiting worktree", async (t) => {
  const { project, linked, observe } = await fixture(t);
  const ownerObs = observe("timeout-owner");
  const waiterObs = observe("timeout-waiter");
  const readyFile = path.join(ownerObs, "deadline-ready");
  const owner = repository(t, project, ownerObs, {
    OPEN_DOUGH_TEST_JOB_DEADLINE_READY: readyFile,
  });
  await lifecycleUntil("owner check entered", () =>
    existsSync(path.join(ownerObs, "start-0")),
  );
  const waiter = repositoryAtAdmissionGate(t, linked, waiterObs);
  assert.equal(await waiter.gate, git(project, "rev-parse", gateRef));
  const armed = await readDeadlineReady(readyFile);
  assert.equal(armed.seconds, 180);
  expireDeadline(armed.fifo);
  const ownerResult = await owner.result;
  assert.notEqual(ownerResult.code, 0, ownerResult.output);
  assert.match(ownerResult.output, /TIMEOUT: checks\/probe-0\.sh/);
  await lifecycleUntil(
    "waiter entered after timed-out owner released admission",
    () => existsSync(path.join(waiterObs, "start-0")),
  );
  writeFileSync(path.join(waiterObs, "release"), "");
  await succeeded(waiter);
  assert.equal(
    spawnSync("git", [
      "-C",
      project,
      "rev-parse",
      "--verify",
      "--quiet",
      gateRef,
    ]).status,
    1,
  );
});
