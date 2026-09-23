import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { checkMailboxWorkerLiveness } from "./ci-mailbox-worker-process.mjs";

export function workerPid(fixture) {
  try {
    return Number(readFileSync(join(fixture.directory, "worker-pid")));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  return JSON.parse(readFileSync(join(fixture.mailbox, "worker.json"), "utf8"))
    .pid;
}

export function assertWorkerAlive(fixture) {
  assert.equal(
    checkMailboxWorkerLiveness({ pid: workerPid(fixture) }, fixture.mailbox),
    "alive",
  );
}

export function assertWorkerDead(fixture) {
  assert.equal(
    checkMailboxWorkerLiveness({ pid: workerPid(fixture) }, fixture.mailbox),
    "dead",
  );
}
