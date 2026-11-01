import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import {
  closeSync,
  cpSync,
  mkdirSync,
  mkdtempSync,
  openSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

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
  const deadline = Date.now() + 20_000;
  while (!(await condition())) {
    assert.ok(Date.now() < deadline, `Timed out: ${description}`);
    await delay(20);
  }
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
    "DOUGH_LOCAL_SUITE_OWNERS",
    "DOUGH_LOCAL_SUITE_IDS",
    "DOUGH_LOCAL_SUITE_RUNNER_PID",
  ])
    if (!(key in extra)) delete env[key];
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
  t.after(async () => {
    if (child.exitCode === null && child.signalCode === null)
      child.kill("SIGTERM");
    await result;
  });
  return { child, result, output: () => output };
}

export function fixture(t, count = 1) {
  const root = mkdtempSync(path.join(tmpdir(), "dough-local-suite-"));
  const project = path.join(root, "main project");
  mkdirSync(project);
  git(project, "init", "-q", "-b", "main");
  mkdirSync(path.join(project, "scripts"));
  mkdirSync(path.join(project, "tests/support"), { recursive: true });
  mkdirSync(path.join(project, "checks"));
  const copied = spawnSync(
    bash,
    [
      "-c",
      'source "$1"; copy_runner "$2"',
      "copy-runner",
      path.join(source, "tests/helpers/copy-runner.bash"),
      project,
    ],
    { encoding: "utf8" },
  );
  assert.equal(copied.status, 0, copied.stderr);
  cpSync(
    path.join(source, "scripts/test-budget.sh"),
    path.join(project, "scripts/test-budget.sh"),
  );
  for (const name of [
    "node-test-failures-reporter.mjs",
    "check-stop-report.bash",
  ])
    cpSync(
      path.join(source, "tests/support", name),
      path.join(project, "tests/support", name),
    );
  for (let index = 0; index < count; index++)
    writeFileSync(
      path.join(project, `checks/probe-${index}.sh`),
      `#!/usr/bin/env bash
set -euo pipefail
mkdir -p "$OBSERVE"
if [[ \${IGNORE_TERM:-} == 1 ]]; then trap '' TERM; fi
printf '%s\\n' "$$" > "$OBSERVE/pid-${index}"
if [[ -n \${PREVIOUS_CHECK:-} ]]; then
  ps -p "$(cat "$PREVIOUS_CHECK")" -o stat= > "$OBSERVE/predecessor-state" || true
fi
touch "$OBSERVE/start-${index}"
if [[ -n \${NESTED_WORKTREE:-} ]]; then
  OPEN_DOUGH_TEST_DIR="$NESTED_WORKTREE/nested" NESTED_WORKTREE='' OBSERVE="$OBSERVE/nested" TZ=Europe/London LC_ALL=C bash "$NESTED_WORKTREE/scripts/test.sh"
  touch "$OBSERVE/nested-returned"
fi
while [[ ! -e $OBSERVE/release ]]; do read -r -t 0.05 _ < "$OBSERVE/wakeup" || true; done
exit "\${PROBE_EXIT:-0}"
`,
    );
  mkdirSync(path.join(project, "nested"));
  writeFileSync(
    path.join(project, "nested/pass.sh"),
    '#!/usr/bin/env bash\nmkdir -p "$OBSERVE"\ntouch "$OBSERVE/start"\n',
  );
  mkdirSync(path.join(project, "dashboard/tests/support"), { recursive: true });
  for (const name of [
    "testFiles.mjs",
    "suiteDeadline.mjs",
    "fullSuiteSelection.mjs",
  ])
    cpSync(
      path.join(source, "dashboard/tests/support", name),
      path.join(project, "dashboard/tests/support", name),
    );
  const framework = pathToFileURL(
    path.join(source, "node_modules/@playwright/test/index.mjs"),
  ).href;
  writeFileSync(
    path.join(project, "dashboard/playwright.config.mts"),
    readFileSync(
      path.join(source, "dashboard/playwright.config.ts"),
      "utf8",
    ).replace('"@playwright/test"', JSON.stringify(framework)),
  );
  writeFileSync(
    path.join(project, "dashboard/controlled.config.mts"),
    `
import config from './playwright.config.mts';
export default { ...config, projects: [{name:'controlled'}], testMatch: /probe[.]spec[.]mts$/,
  reporter: 'line', use: {}, globalSetup: './controlled-setup.mjs' };
`,
  );
  writeFileSync(
    path.join(project, "dashboard/controlled-setup.mjs"),
    `
import {writeFileSync} from 'node:fs';
import {releaseLocalSuites} from '../scripts/local-test-suite.mjs';
export default async (resolved) => {
    writeFileSync(process.env.OBSERVE + '/workers', String(resolved.workers));
    return releaseLocalSuites;
};
`,
  );
  writeFileSync(
    path.join(project, "dashboard/tests/probe.spec.mts"),
    `
import {test} from ${JSON.stringify(framework)};
import {existsSync, writeFileSync} from 'node:fs';
import {setTimeout as delay} from 'node:timers/promises';
test('needle', async () => {
  writeFileSync(process.env.OBSERVE + '/start', '');
  while (!existsSync(process.env.OBSERVE + '/release')) await delay(20);
});
`,
  );
  git(project, "add", ".");
  git(
    project,
    "-c",
    "user.name=Fixture",
    "-c",
    "user.email=fixture@example.test",
    "commit",
    "-qm",
    "controlled suites",
  );
  const linked = path.join(root, "linked worktree");
  git(project, "worktree", "add", "-q", "-b", "linked", linked);
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const observe = (name) => {
    const directory = path.join(root, name);
    mkdirSync(directory);
    const fifo = path.join(directory, "wakeup");
    assert.equal(spawnSync("mkfifo", [fifo]).status, 0);
    const descriptor = openSync(fifo, "r+");
    t.after(() => closeSync(descriptor));
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
