import { execFile } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as pause } from "node:timers/promises";
import { promisify } from "node:util";
import { readMailboxEvents, readWorkerIdentity } from "./ci-mailbox-store.mjs";
import { awaitSignalWhileRunning } from "./process-lifetime-test-fixtures.mjs";

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

async function processEnded(pid) {
  try {
    const { stdout } = await runCommand("ps", [
      "-p",
      String(pid),
      "-o",
      "stat=",
    ]);
    return stdout.trim().startsWith("Z");
  } catch (error) {
    if (error.code !== 1) throw error;
    return true;
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

// Waits for a started CI observer's first sign of life (`path`) for as long
// as the mailbox's recorded worker lives; the fixtures start it with a 60 s
// execution budget, after which it records a result and exits.
export async function awaitWorkerSignal(directory, path) {
  const { pid } = readWorkerIdentity(directory);
  const result = join(directory, "result.json");
  await awaitSignalWhileRunning(
    () => existsSync(path),
    () => processEnded(pid),
    () =>
      `CI observer worker ${pid} exited before ${path} appeared; result: ${
        existsSync(result) ? readFileSync(result, "utf8") : "none recorded"
      }; last event: ${JSON.stringify(readMailboxEvents(directory).at(-1)?.event ?? null)}`,
  );
}

export function blockingGithubEnvironment(t) {
  const root = mkdtempSync(join(tmpdir(), "ci-codex-lifecycle-test-"));
  const bin = join(root, "bin");
  writeBlockingGithubListCommand(bin);
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return {
    ...process.env,
    DOUGH_CI_MAILBOX_ROOT: root,
    TMPDIR: root,
    CI_TEST_ROOT: root,
    PATH: `${bin}:${process.env.PATH}`,
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
