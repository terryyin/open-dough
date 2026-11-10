import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { closeSync, mkdirSync, mkdtempSync, openSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { fixtureTeardown } from "../../src/skills/dough-execute-plan/scripts/fixture-teardown-test-fixtures.mjs";
import {
  controlledSuites,
  suiteRunnerLayer,
} from "./local-test-suite-checkout.mjs";
import { materializeLocalCheckout } from "./repository-fixture.mjs";

const source = fileURLToPath(new URL("../../", import.meta.url));
const cli = path.join(source, "node_modules/playwright/cli.js");
const bash = "bash";
export const gateRef = "refs/dough/local-test-suite";

export function git(directory, ...args) {
  const result = spawnSync("git", ["-C", directory, ...args], {
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

export async function until(description, condition) {
  const deadline = Date.now() + 60_000;
  while (!(await condition())) {
    assert.ok(Date.now() < deadline, `Timed out: ${description}`);
    await delay(20);
  }
}

// One teardown per test: every process a test launches is stopped, and its
// observations closed, before any fixture of that test is removed.
const teardowns = new WeakMap();
function teardownOf(t) {
  if (!teardowns.has(t)) {
    const teardown = fixtureTeardown();
    teardowns.set(t, teardown);
    t.after(teardown.cleanup);
  }
  return teardowns.get(t);
}

function launch(t, cwd, args, extra = {}, command = process.execPath) {
  const env = { ...process.env, ...extra };
  for (const key of [
    "CI",
    "TEST_WORKER_INDEX",
    "FORCE_COLOR",
    "NO_COLOR",
    "OPEN_DOUGH_DASHBOARD_SPLIT",
    "OPEN_DOUGH_TEST_DIR",
    "OPEN_DOUGH_TEST_JOBS",
    "OPEN_DOUGH_TEST_SLOT_GATE",
    "OPEN_DOUGH_TEST_ADMISSION_GATE",
    "OPEN_DOUGH_TEST_JOB_DEADLINE_READY",
    "OPEN_DOUGH_TEST_DISABLE_JOB_DEADLINE",
    "OPEN_DOUGH_TEST_DEADLINE_MS",
    "OPEN_DOUGH_TEST_RUN_DEADLINE_READY",
    "OPEN_DOUGH_TEST_DISABLE_RUN_DEADLINE",
    "OPEN_DOUGH_TEST_TIMES",
    "OPEN_DOUGH_TEST_OUTCOMES",
    "DOUGH_LOCAL_SUITE_OWNERS",
    "DOUGH_LOCAL_SUITE_IDS",
    "DOUGH_LOCAL_SUITE_RUNNER_PID",
  ])
    if (!(key in extra)) delete env[key];
  // Nested node --test jobs must not inherit this file's test context or Node
  // skips them as recursive runs.
  delete env.NODE_TEST_CONTEXT;
  const child = spawn(command, args, {
    cwd,
    env,
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  child.stdout.on("data", (chunk) => {
    output += chunk;
  });
  child.stderr.on("data", (chunk) => {
    output += chunk;
  });
  const result = new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("close", (code, signal) => resolve({ code, signal, output }));
  });
  teardownOf(t).defer(async () => {
    if (child.exitCode === null && child.signalCode === null)
      child.kill("SIGTERM");
    await result;
  });
  return { child, result, output: () => output };
}

// A checkout under a directory whose name has a space, committed with the
// controlled suites and the runner tooling, and a linked worktree of it.
export async function fixture(t, count = 1) {
  const root = mkdtempSync(path.join(tmpdir(), "dough-local-suite-"));
  const teardown = teardownOf(t);
  teardown.defer(() => rmSync(root, { recursive: true, force: true }));
  const parent = path.join(root, "main project");
  mkdirSync(parent);
  const { integration: project } = await materializeLocalCheckout(
    t,
    controlledSuites(count),
    { parent, layer: suiteRunnerLayer() },
  );
  const linked = path.join(root, "linked worktree");
  git(project, "worktree", "add", "-q", "-b", "linked", linked);
  const observe = (name) => {
    const directory = path.join(root, name);
    mkdirSync(directory);
    const fifo = path.join(directory, "wakeup");
    assert.equal(spawnSync("mkfifo", [fifo]).status, 0);
    const descriptor = openSync(fifo, "r+");
    teardown.defer(() => closeSync(descriptor));
    return directory;
  };
  return { root, project, linked, observe };
}

export function repository(t, project, observation, env = {}, args = []) {
  return launch(
    t,
    project,
    ["scripts/test.sh", ...args],
    { OBSERVE: observation, OPEN_DOUGH_TEST_DIR: "checks", ...env },
    bash,
  );
}

export function dashboard(t, project, observation, args = [], env = {}) {
  return launch(
    t,
    project,
    [cli, "test", "--config", "dashboard/controlled.config.mts", ...args],
    { OBSERVE: observation, ...env },
  );
}

export async function succeeded(run) {
  const result = await run.result;
  assert.equal(result.code, 0, result.output);
}
