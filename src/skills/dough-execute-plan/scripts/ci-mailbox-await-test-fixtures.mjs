import assert from "node:assert/strict";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { deferChildExit } from "./fixture-teardown-test-fixtures.mjs";
import {
  launcher,
  recheckPauseProbe,
  sha,
} from "./ci-mailbox-process-test-fixtures.mjs";

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

// Each command child is killed if still running, and its exit awaited, by the
// fixture's `fixtureTeardown` before the fixture is removed.
export function launchAwait(teardown, env, mailbox, revision = sha) {
  return launchMailboxCommand(teardown, env, [
    "await-revision",
    mailbox,
    revision,
  ]);
}

export function launchComplete(teardown, env, mailbox, revision = sha) {
  return launchMailboxCommand(teardown, env, [
    "complete-revision",
    mailbox,
    revision,
  ]);
}

function launchMailboxCommand(teardown, env, args) {
  // Observe handler registration and each recheck pause without adding test
  // hooks to the CLI protocol.
  const readinessProbe = `data:text/javascript,${encodeURIComponent(`
    process.on("newListener", (event) => {
      if (event === "SIGTERM") {
        queueMicrotask(() => process.send("cancellation-ready"));
      }
    });
    ${recheckPauseProbe(`if (process.connected) process.send("rechecking")`)}
  `)}`;
  const child = spawn(
    process.execPath,
    ["--import", readinessProbe, launcher, ...args],
    {
      env,
      stdio: ["ignore", "pipe", "pipe", "ipc"],
    },
  );
  deferChildExit(teardown, child, "SIGKILL");
  let cancellationReady = false;
  let rechecks = 0;
  let closed = false;
  child.on("message", (message) => {
    if (message === "cancellation-ready") cancellationReady = true;
    if (message === "rechecking") rechecks += 1;
  });
  child.once("close", () => {
    closed = true;
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
    // Resolves once the command has paused to recheck `count` times, each
    // after finding nothing to report yet, or once it has ended, so a caller
    // can assert what it wrote by then.
    waitForRechecks: (count) =>
      waitFor(() => rechecks >= count || closed, `${count} rechecks`),
  };
}

export function parseReceipt(output) {
  assert.match(output, /^CI_OBSERVER \{.+\}\n$/);
  return JSON.parse(output.slice("CI_OBSERVER ".length));
}
