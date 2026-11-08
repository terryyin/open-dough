import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import {
  closeSync,
  mkdirSync,
  mkdtempSync,
  openSync,
  readFileSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { makeMe } from "./makeMe.mjs";
import { materializeLocalCheckout } from "./repository-fixture.mjs";
import { copiedLayer } from "./repository-revision-files.mjs";

const source = fileURLToPath(new URL("../../", import.meta.url));
const cli = path.join(source, "node_modules/playwright/cli.js");
const bash = "bash";
const framework = pathToFileURL(
  path.join(source, "node_modules/@playwright/test/index.mjs"),
).href;
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

// The runner tooling a controlled suite runs, copied from this repository:
// what `copy_runner` copies, the budget and reporter helpers, the dashboard
// suite selection, and the Playwright configuration importing this
// repository's framework. Read once per process.
let runnerLayer;
function suiteRunnerLayer() {
  if (runnerLayer) return runnerLayer;
  const staging = mkdtempSync(path.join(tmpdir(), "dough-local-suite-runner-"));
  try {
    mkdirSync(path.join(staging, "scripts"));
    const copied = spawnSync(
      bash,
      [
        "-c",
        'source "$1"; copy_runner "$2"',
        "copy-runner",
        path.join(source, "tests/helpers/copy-runner.bash"),
        staging,
      ],
      { encoding: "utf8" },
    );
    assert.equal(copied.status, 0, copied.stderr);
    const runner = copiedLayer(
      staging,
      readdirSync(path.join(staging, "scripts")).map(
        (name) => `scripts/${name}`,
      ),
    );
    const helpers = copiedLayer(source, [
      "scripts/test-budget.sh",
      "tests/support/node-test-failures-reporter.mjs",
      "tests/support/check-stop-report.bash",
      "dashboard/tests/support/testFiles.mjs",
      "dashboard/tests/support/suiteDeadline.mjs",
      "dashboard/tests/support/fullSuiteSelection.mjs",
    ]);
    runnerLayer = {
      files: {
        ...runner.files,
        ...helpers.files,
        "dashboard/playwright.config.mts": readFileSync(
          path.join(source, "dashboard/playwright.config.ts"),
          "utf8",
        ).replace('"@playwright/test"', JSON.stringify(framework)),
      },
      executables: [...runner.executables, ...helpers.executables],
    };
    return runnerLayer;
  } finally {
    rmSync(staging, { recursive: true, force: true });
  }
}

// The controlled suites a case runs: `count` probe checks that record their
// start and wait for release, a nested check, and a dashboard probe spec
// with its configuration.
function controlledSuites(count) {
  const files = {};
  for (let index = 0; index < count; index++)
    files[`checks/probe-${index}.sh`] = `#!/usr/bin/env bash
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
`;
  return makeMe.aRepository
    .withRevision("controlled suites", {
      backlog: undefined,
      files: {
        ...files,
        "nested/pass.sh":
          '#!/usr/bin/env bash\nmkdir -p "$OBSERVE"\ntouch "$OBSERVE/start"\n',
        "dashboard/controlled.config.mts": `
import config from './playwright.config.mts';
export default { ...config, projects: [{name:'controlled'}], testMatch: /probe[.]spec[.]mts$/,
  timeout: 120_000, reporter: 'line', use: {}, globalSetup: './controlled-setup.mjs' };
`,
        "dashboard/controlled-setup.mjs": `
import {writeFileSync} from 'node:fs';
import {releaseLocalSuites} from '../scripts/local-test-suite.mjs';
export default async (resolved) => {
    writeFileSync(process.env.OBSERVE + '/workers', String(resolved.workers));
    return releaseLocalSuites;
};
`,
        "dashboard/tests/probe.spec.mts": `
import {test} from ${JSON.stringify(framework)};
import {existsSync, writeFileSync} from 'node:fs';
import {setTimeout as delay} from 'node:timers/promises';
test('needle', async () => {
  writeFileSync(process.env.OBSERVE + '/start', '');
  while (!existsSync(process.env.OBSERVE + '/release')) await delay(20);
});
`,
      },
    })
    .please();
}

// A checkout under a directory whose name has a space, committed with the
// controlled suites and the runner tooling, and a linked worktree of it.
export async function fixture(t, count = 1) {
  const root = mkdtempSync(path.join(tmpdir(), "dough-local-suite-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
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
