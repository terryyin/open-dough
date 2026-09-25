import { execFile } from "node:child_process";
import { setTimeout as pause } from "node:timers/promises";
import { promisify } from "node:util";

const runCommand = promisify(execFile);

// Waits until `arrived()` holds for as long as the process producing that
// signal runs, not for a fixed time: its work before the signal scales with
// machine load, so only the process ending first (`ended()`) means the signal
// never comes. A live but silent process ends at its own execution budget.
// `failure()` describes that exit for the thrown error.
export async function awaitSignalWhileRunning(arrived, ended, failure) {
  while (!(await arrived())) {
    if (await ended()) {
      if (await arrived()) return;
      throw new Error(await failure());
    }
    await pause(20);
  }
}

// Returns an `ended` probe for a process whose end settles `promise`.
export function settledProbe(promise) {
  let settled = false;
  const settle = () => {
    settled = true;
  };
  promise.then(settle, settle);
  return () => settled;
}

// Whether process `pid` has ended. An exited process that its parent has not
// reaped yet (a zombie) has ended too, although kill(pid, 0) still finds it.
export async function processEnded(pid) {
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

// Waits until process `pid` has ended. A process that is not this one's child
// gives no exit notice, so its lifetime is observed rather than timed.
export async function awaitProcessExit(pid) {
  while (!(await processEnded(pid))) await pause(20);
}
