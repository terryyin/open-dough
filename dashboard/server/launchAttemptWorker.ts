// Machine worker facts for an attempt, including the server that consumes a
// script's result while the recorded worker changes across the native handoff.
import type { LaunchAttemptRecord } from "../src/agentLaunch.ts";

type Worker = NonNullable<LaunchAttemptRecord["worker"]>;

export function attemptWorker(step: Worker["step"], pid = process.pid): Worker {
  return {
    pid,
    serverPid: process.pid,
    step,
    notedAt: new Date().toISOString(),
  };
}

// Permission refusal still verifies that the process exists on this machine.
export function workerAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error instanceof Error && "code" in error && error.code === "EPERM";
  }
}

// An unsettled attempt runs while its script or consuming server still lives.
export function attemptWorkerRunning(attempt: LaunchAttemptRecord): boolean {
  return (
    attempt.outcome === undefined &&
    attempt.worker !== undefined &&
    (workerAlive(attempt.worker.pid) ||
      (attempt.worker.serverPid !== undefined &&
        workerAlive(attempt.worker.serverPid)))
  );
}
