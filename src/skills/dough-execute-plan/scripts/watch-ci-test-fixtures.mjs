import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as pause } from "node:timers/promises";
import { promisify } from "node:util";
import { readMailboxEvents, readWorkerIdentity } from "./ci-mailbox-store.mjs";
import { checkMailboxWorkerLiveness } from "./ci-mailbox-worker-process.mjs";
import { fixtureTeardown } from "./fixture-teardown-test-fixtures.mjs";
import {
  awaitSignalWhileRunning,
  processEnded,
} from "./process-lifetime-test-fixtures.mjs";

const runCommand = promisify(execFile);

export const sha = "a".repeat(40);

export const run = (overrides = {}) => ({
  databaseId: 42,
  attempt: 1,
  headSha: sha,
  headBranch: "main",
  workflowName: "CI",
  event: "push",
  status: "completed",
  conclusion: "success",
  url: "https://github.com/example/example/actions/runs/42",
  ...overrides,
});

export const scriptedGithub =
  (responses, calls = []) =>
  async (args) => {
    calls.push(args);
    if (!responses.length) throw new Error("unexpected GitHub request");
    const response = responses.shift();
    if (response instanceof Error) throw response;
    return response;
  };

export async function waitForFile(path, timeoutMs = 5000) {
  const deadline = Date.now() + timeoutMs;
  while (!existsSync(path)) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) throw new Error(`Missing ${path}`);
    await pause(Math.min(20, remaining));
  }
}

export async function waitForPidExit(pid, timeoutMs = 5000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await processEnded(pid)) return true;
    await pause(20);
  }
  return false;
}

// Waits until `arrived()` holds for as long as the mailbox's recorded worker
// lives, since that worker produces what the test awaits; the fixtures start
// it with a 60 s execution budget, after which it records a result and exits.
export async function awaitWorkerState(directory, arrived, description) {
  const { pid } = readWorkerIdentity(directory);
  const result = join(directory, "result.json");
  await awaitSignalWhileRunning(
    arrived,
    () => processEnded(pid),
    () =>
      `CI observer worker ${pid} exited before ${description}; result: ${
        existsSync(result) ? readFileSync(result, "utf8") : "none recorded"
      }; last event: ${JSON.stringify(readMailboxEvents(directory).at(-1)?.event ?? null)}`,
  );
}

// Waits for a started CI observer's first sign of life (`path`).
export async function awaitWorkerSignal(directory, path) {
  await awaitWorkerState(directory, () => existsSync(path), `${path} appeared`);
}

// Registers, on a `fixtureTeardown`, stopping the CI observer started at
// `directory` through the real `stop` command and proving its recorded worker
// exited, so the fixture it runs from is removed only after it is gone. A
// worker the test already ended is only confirmed dead: `stop` would wait on a
// lost worker, or fail on a mailbox the test removed.
export function deferObserverStop(teardown, observer) {
  const { directory } = observer;
  const worker = readWorkerIdentity(directory);
  teardown.defer(async () => {
    if (checkMailboxWorkerLiveness(worker, directory) !== "dead")
      await stopObserver(observer);
    assert.equal(checkMailboxWorkerLiveness(worker, directory), "dead");
  });
}

// Stops the CI observer at `directory` through the real `stop` command of
// `launcher`; a failing stop rejects.
export async function stopObserver({ launcher, directory, cwd, env }) {
  await runCommand(process.execPath, [launcher, "stop", directory], {
    cwd,
    env,
  });
}

// A fixture root whose `gh` blocks every request. Callers defer stopping what
// they start from it through the returned `teardown`, which `t.after` runs
// before the root is removed.
export function blockingGithubEnvironment(t) {
  const root = mkdtempSync(join(tmpdir(), "ci-codex-lifecycle-test-"));
  const teardown = fixtureTeardown(root);
  t.after(teardown.cleanup);
  const bin = join(root, "bin");
  writeBlockingGithubListCommand(bin);
  return {
    teardown,
    env: {
      ...process.env,
      DOUGH_CI_MAILBOX_ROOT: root,
      TMPDIR: root,
      CI_TEST_ROOT: root,
      PATH: `${bin}:${process.env.PATH}`,
    },
  };
}

export function writeBlockingGithubListCommand(bin) {
  mkdirSync(bin, { recursive: true });
  writeFileSync(
    join(bin, "gh"),
    `#!${process.execPath}
(async () => {
const fs = require('node:fs');
const path = require('node:path');
const root = process.env.CI_TEST_ROOT;
const { guardFixtureProcess } = await import(${JSON.stringify(new URL("./ci-process-lifetime-test-fixtures.mjs", import.meta.url).href)});
guardFixtureProcess(root);
process.on('SIGTERM', () => {
  fs.writeFileSync(path.join(root, 'github-request-stopped'), '');
  process.exit(0);
});
fs.writeFileSync(path.join(root, 'github-request-started'), '');
setInterval(() => {}, 1000);
})();
`,
    { mode: 0o700 },
  );
}

// A modeled GitHub Actions repository behind the `gh` seam. Unlike scripted
// responses, it answers each `gh run list` the way GitHub would for that
// request: only runs of the requested workflow file (unknown selectors fail
// like gh does), branch, commit and event, each carrying the display name its
// workflow declares. Tests mutate `runs` between polls to stage CI progress.
export function modeledGithubActions({ workflows, runs = [], jobs = {} }) {
  const listCalls = [];
  const option = (args, name) =>
    args.includes(name) ? args[args.indexOf(name) + 1] : undefined;
  const gh = async (args) => {
    if (args[0] === "run" && args[1] === "list") {
      listCalls.push(args);
      const workflow = option(args, "--workflow");
      if (!Object.hasOwn(workflows, workflow))
        throw new Error(`could not find any workflows named ${workflow}`);
      const [branch, commit, event] = ["--branch", "--commit", "--event"].map(
        (name) => option(args, name),
      );
      return runs
        .filter((candidate) => candidate.workflow === workflow)
        .map(({ workflow: file, ...candidate }) =>
          run({ ...candidate, workflowName: workflows[file] }),
        )
        .filter(
          (candidate) =>
            (!branch || candidate.headBranch === branch) &&
            (!commit || candidate.headSha === commit) &&
            (!event || candidate.event === event),
        )
        .slice(0, Number(option(args, "--limit") ?? 20));
    }
    if (args[0] === "run" && args[1] === "view") {
      const runId = Number(args[2]);
      if (args.at(-1) === "jobs") return { jobs: jobs[runId] ?? [] };
      const found = runs.find(({ databaseId }) => databaseId === runId);
      if (!found) throw new Error(`run ${runId} not found`);
      const { attempt, status, conclusion, url } = run(found);
      return { attempt, status, conclusion, url };
    }
    throw new Error(`unexpected gh call ${JSON.stringify(args)}`);
  };
  return {
    gh,
    runs,
    jobs,
    listCallCount: (branch) =>
      listCalls.filter((args) => option(args, "--branch") === branch).length,
  };
}
