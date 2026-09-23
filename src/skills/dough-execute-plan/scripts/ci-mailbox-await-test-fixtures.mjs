import assert from "node:assert/strict";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { launcher, sha } from "./ci-mailbox-process-test-fixtures.mjs";

export const exec = promisify(execFile);

export async function waitFor(predicate, description) {
  const deadline = Date.now() + 5_000;
  while (Date.now() < deadline) {
    if (predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new Error(`Timed out waiting for ${description}`);
}

export async function register(env, mailbox, revision = sha) {
  await exec(process.execPath, [launcher, "register-push", mailbox, revision], {
    env,
  });
}

export function launchAwait(env, mailbox, revision = sha) {
  return launchMailboxCommand(env, ["await-revision", mailbox, revision]);
}

export function launchComplete(env, mailbox, revision = sha) {
  return launchMailboxCommand(env, ["complete-revision", mailbox, revision]);
}

function launchMailboxCommand(env, args) {
  // Observe handler registration without adding test hooks to the CLI protocol.
  const readinessProbe = `data:text/javascript,${encodeURIComponent(`
    process.on("newListener", (event) => {
      if (event === "SIGTERM") {
        queueMicrotask(() => process.send("cancellation-ready"));
      }
    });
  `)}`;
  const child = spawn(
    process.execPath,
    ["--import", readinessProbe, launcher, ...args],
    {
      env,
      stdio: ["ignore", "pipe", "pipe", "ipc"],
    },
  );
  let cancellationReady = false;
  child.on("message", (message) => {
    if (message === "cancellation-ready") cancellationReady = true;
  });
  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => {
    stdout += chunk;
  });
  child.stderr.on("data", (chunk) => {
    stderr += chunk;
  });
  const completed = new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("close", (code, signal) =>
      resolve({ code, signal, stdout, stderr }),
    );
  });
  return {
    child,
    completed,
    output: () => stdout,
    waitForCancellationReady: () =>
      waitFor(() => cancellationReady, "CLI cancellation handler"),
  };
}

export function parseReceipt(output) {
  assert.match(output, /^CI_OBSERVER \{.+\}\n$/);
  return JSON.parse(output.slice("CI_OBSERVER ".length));
}
