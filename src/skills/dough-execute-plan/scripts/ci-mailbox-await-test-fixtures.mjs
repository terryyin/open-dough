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
  const child = spawn(process.execPath, [launcher, ...args], {
    env,
    stdio: ["ignore", "pipe", "pipe"],
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
  return { child, completed, output: () => stdout };
}

export function parseReceipt(output) {
  assert.match(output, /^CI_OBSERVER \{.+\}\n$/);
  return JSON.parse(output.slice("CI_OBSERVER ".length));
}
