import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

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
  process.kill(workerPid(fixture), 0);
}

export function assertWorkerDead(fixture) {
  const pid = workerPid(fixture);
  assert.throws(() => process.kill(pid, 0), { code: "ESRCH" });
}
