import { execFile, spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { createMailbox, recordWorkerIdentity } from "./ci-mailbox.mjs";
import { publishJson } from "./ci-mailbox-json-file.mjs";
import { fixtureTeardown } from "./fixture-teardown-test-fixtures.mjs";
import { deferObserverStop } from "./watch-ci-test-fixtures.mjs";

export const exec = promisify(execFile);
export const launcher = fileURLToPath(
  new URL("./ci-mailbox.mjs", import.meta.url),
);
const hook = fileURLToPath(new URL("./ci-host-hook.mjs", import.meta.url));
export const sha = "a".repeat(40);

// Preload source that runs `announce` at each pause before the product
// rechecks CI (its pauses go through node:timers/promises), so a test can wait
// for a finished observation pass instead of sleeping.
export function recheckPauseProbe(announce, imports = "") {
  return `
    import timers from "node:timers/promises";
    import { syncBuiltinESMExports } from "node:module";
    ${imports}
    const pause = timers.setTimeout;
    timers.setTimeout = (...args) => {
      ${announce};
      return pause(...args);
    };
    syncBuiltinESMExports();
  `;
}

// Preloaded into every process of the fixture; only the detached worker marks
// its recheck pauses.
const workerRecheckProbe = `data:text/javascript,${encodeURIComponent(
  recheckPauseProbe(
    `if (process.argv[2] === "worker") {
      writeFileSync(join(process.env.CI_TEST_ROOT, "worker-rechecking"), "");
    }`,
    `import { writeFileSync } from "node:fs";
    import { join } from "node:path";`,
  ),
)}`;

export async function setupProcessMailbox(
  t,
  startArguments = ["--execution", "owner/repo", "main", "60000"],
  { observeWorkerRechecks = false } = {},
) {
  const directory = mkdtempSync(join(tmpdir(), "ci-process-test-"));
  const teardown = fixtureTeardown(directory);
  t.after(teardown.cleanup);
  const bin = join(directory, "bin");
  mkdirSync(bin);
  writeFileSync(
    join(bin, "gh"),
    `#!${process.execPath}
(async () => {
const fs = require('node:fs');
const path = require('node:path');
const root = process.env.CI_TEST_ROOT;
const { guardFixtureProcess, waitForFixtureRelease } = await import(${JSON.stringify(new URL("./ci-process-lifetime-test-fixtures.mjs", import.meta.url).href)});
guardFixtureProcess(root);
const release = path.join(root, 'release');
if (process.argv[3] === 'list') {
  fs.writeFileSync(path.join(root, 'worker-pid'), String(process.ppid));
  fs.writeFileSync(path.join(root, 'github-pid'), String(process.pid));
  fs.writeFileSync(path.join(root, 'started'), '');
  process.on('SIGTERM', () => {
    fs.writeFileSync(path.join(root, 'request-stopped'), '');
    process.exit(0);
  });
  await waitForFixtureRelease(release);
  process.stdout.write(fs.readFileSync(release));
  fs.writeFileSync(path.join(root, 'observed'), '');
} else { process.stdout.write(JSON.stringify({jobs: []})); }
})();
`,
    { mode: 0o700 },
  );
  const env = {
    ...process.env,
    DOUGH_CI_MAILBOX_ROOT: directory,
    TMPDIR: directory,
    CI_TEST_ROOT: directory,
    PATH: `${bin}:${process.env.PATH}`,
    ...(observeWorkerRechecks
      ? {
          NODE_OPTIONS: [
            process.env.NODE_OPTIONS,
            `--import=${workerRecheckProbe}`,
          ]
            .filter(Boolean)
            .join(" "),
        }
      : {}),
  };
  const { stdout } = await exec(
    process.execPath,
    [launcher, "start", ...startArguments],
    { env, timeout: 5000 },
  );
  const mailbox = JSON.parse(stdout.slice("CI_OBSERVER ".length)).directory;
  deferObserverStop(teardown, { launcher, directory: mailbox, env });
  const deliver = async (host, receipt = "") => {
    const input = JSON.stringify({
      session_id: "process-test",
      conversation_id: "process-test",
      generation_id: "coordinator-turn",
      transcript_path: "/test/coordinator.jsonl",
      hook_event_name: host === "cursor" ? "postToolUse" : "PostToolUse",
      tool_name: host === "cursor" ? "Shell" : "Bash",
      tool_output: JSON.stringify({ stdout: receipt }),
      tool_response: { stdout: receipt },
    });
    const result = exec(process.execPath, [hook, host], { env });
    result.child.stdin.end(input);
    return JSON.parse((await result).stdout);
  };
  return { directory, mailbox, stdout, deliver, env, teardown };
}

export function releaseRun(directory, overrides = {}) {
  const run = {
    databaseId: 42,
    attempt: 1,
    headSha: sha,
    headBranch: "main",
    workflowName: "CI",
    event: "push",
    status: "completed",
    conclusion: "failure",
    ...overrides,
  };
  publishJson(directory, "release", [run]);
}

// A mailbox whose recorded worker identity is a live but unrelated process,
// used by tests proving a reused/mismatched PID is never signaled or reused
// as reassurance. Each caller gets its own storage directory to remain an
// isolation control for other observers.
export async function mailboxWithUnrelatedWorker(t) {
  const storage = mkdtempSync(join(tmpdir(), "ci-unrelated-worker-test-"));
  const directory = createMailbox(
    {
      mode: "execution",
      repo: "owner/repo",
      branch: "main",
      maxDurationMs: 60000,
    },
    { storage },
  );
  const unrelated = await spawnIdleNode(t);
  t.after(() => {
    rmSync(storage, { recursive: true, force: true });
  });
  recordWorkerIdentity(directory, { pid: unrelated.pid });
  return { directory, storage, unrelated };
}

export async function spawnIdleNode(t, trailingArguments = []) {
  const child = spawn(
    process.execPath,
    ["-e", "setInterval(() => {}, 1000)", ...trailingArguments],
    { stdio: "ignore" },
  );
  await new Promise((resolve, reject) => {
    child.once("spawn", resolve);
    child.once("error", reject);
  });
  t.after(() => {
    try {
      child.kill("SIGKILL");
    } catch (error) {
      if (error.code !== "ESRCH") throw error;
    }
  });
  return child;
}
