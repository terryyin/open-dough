import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  closeSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  openSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fixtureTeardown } from "../../src/skills/dough-execute-plan/scripts/fixture-teardown-test-fixtures.mjs";
import { suiteRunnerLayer } from "./local-test-suite-checkout.mjs";
import { repository, until } from "./local-test-suite-fixtures.mjs";
import { makeMe } from "./makeMe.mjs";
import { materializeLocalCheckout } from "./repository-fixture.mjs";

const source = fileURLToPath(new URL("../../", import.meta.url));

const teardowns = new WeakMap();
function teardownOf(t) {
  if (!teardowns.has(t)) {
    const teardown = fixtureTeardown();
    teardowns.set(t, teardown);
    t.after(teardown.cleanup);
  }
  return teardowns.get(t);
}

// Blocking Bash check: announces readiness, optionally ignores TERM in an
// owned descendant, then waits for OBSERVE/release.
function bashHangCheck({ ignoreTerm = false, childIgnoresTerm = false } = {}) {
  const trap = ignoreTerm ? "trap '' TERM\n" : "";
  const child = childIgnoresTerm
    ? `bash -c 'trap "" TERM; printf "%s\\n" "$$" > "$OBSERVE/child-pid"; touch "$OBSERVE/child-ready"; while [[ ! -e $OBSERVE/release ]]; do read -r -t 0.05 _ < "$OBSERVE/wakeup" || true; done' &
`
    : "";
  return `#!/usr/bin/env bash
set -euo pipefail
mkdir -p "$OBSERVE"
${trap}printf '%s\\n' "$$" > "$OBSERVE/pid"
touch "$OBSERVE/ready"
${child}while [[ ! -e $OBSERVE/release ]]; do read -r -t 0.05 _ < "$OBSERVE/wakeup" || true; done
`;
}

function nodeHangCheck() {
  return `import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { test } from "node:test";
import { setTimeout as delay } from "node:timers/promises";
test("hang until released", async () => {
  const observe = process.env.OBSERVE;
  mkdirSync(observe, { recursive: true });
  writeFileSync(observe + "/pid", String(process.pid));
  writeFileSync(observe + "/ready", "");
  while (!existsSync(observe + "/release")) await delay(20);
});
`;
}

// MakeMe-built checkout with the copied runner and the named hang checks.
export async function deadlineRepository(t, { files, count = 0 } = {}) {
  const root = mkdtempSync(path.join(tmpdir(), "dough-deadline-"));
  teardownOf(t).defer(() => rmSync(root, { recursive: true, force: true }));
  const parent = path.join(root, "project");
  mkdirSync(parent);
  const builtFiles = { ...(files ?? {}) };
  for (let index = 0; index < count; index++) {
    builtFiles[`checks/probe-${index}.sh`] = bashHangCheck();
  }
  const description = makeMe.aRepository
    .withRevision("deadline checks", {
      backlog: null,
      files: builtFiles,
    })
    .please();
  const { integration: project } = await materializeLocalCheckout(
    t,
    description,
    { parent, layer: suiteRunnerLayer() },
  );
  return { root, project };
}

export function observeDir(t, root, name) {
  const directory = path.join(root, name);
  mkdirSync(directory);
  const fifo = path.join(directory, "wakeup");
  assert.equal(spawnSync("mkfifo", [fifo]).status, 0);
  const descriptor = openSync(fifo, "r+");
  teardownOf(t).defer(() => closeSync(descriptor));
  return directory;
}

export function runDeadlineSuite(t, project, observation, env = {}, args = []) {
  return repository(
    t,
    project,
    observation,
    { OPEN_DOUGH_TEST_JOBS: "1", ...env },
    args,
  );
}

export async function awaitReady(observation, run) {
  let ended;
  if (run) {
    run.result.then(
      (result) => {
        ended = new Error(
          `Runner ended before ready: code=${result.code}\n${result.output}`,
        );
      },
      (error) => {
        ended = error;
      },
    );
  }
  await until("check announced ready", () => {
    if (ended) throw ended;
    return existsSync(path.join(observation, "ready"));
  });
}

export async function readDeadlineReady(readyFile) {
  let line;
  await until("deadline armed", () => {
    if (!existsSync(readyFile)) return false;
    line = readFileSync(readyFile, "utf8").trim();
    return line.includes("\t");
  });
  const [index, fifo, seconds] = line.split("\t");
  return { index, fifo, seconds: Number(seconds) };
}

export function expireDeadline(fifo) {
  writeFileSync(fifo, "expire\n");
}

export function processRunning(pid) {
  const result = spawnSync("ps", ["-p", String(pid), "-o", "stat="], {
    encoding: "utf8",
  });
  if (result.status !== 0) return false;
  return !result.stdout.trim().startsWith("Z");
}

// Arms a hang check, asserts the fixed 180s allowance, expires the wait FIFO,
// and returns the completed run plus observation paths for case assertions.
export async function timedOutRun(
  t,
  { files, args, env = {}, observeName = "hang" },
) {
  const { root, project } = await deadlineRepository(t, { files });
  const observation = observeDir(t, root, observeName);
  const readyFile = path.join(root, "deadline-ready");
  const times = path.join(root, "times");
  const outcomes = path.join(root, "outcomes");
  const run = runDeadlineSuite(
    t,
    project,
    observation,
    {
      OPEN_DOUGH_TEST_JOB_DEADLINE_READY: readyFile,
      OPEN_DOUGH_TEST_TIMES: times,
      OPEN_DOUGH_TEST_OUTCOMES: outcomes,
      ...env,
    },
    args,
  );
  await awaitReady(observation, run);
  const armed = await readDeadlineReady(readyFile);
  assert.equal(
    armed.seconds,
    180,
    "selected safety duration must be the fixed 180-second allowance",
  );
  const pid = Number(readFileSync(path.join(observation, "pid"), "utf8"));
  assert.ok(processRunning(pid), "check must be live before expiry");
  expireDeadline(armed.fifo);
  const result = await run.result;
  return { result, observation, times, outcomes, armed, pid, project, root };
}

export { bashHangCheck, nodeHangCheck, source, until };
