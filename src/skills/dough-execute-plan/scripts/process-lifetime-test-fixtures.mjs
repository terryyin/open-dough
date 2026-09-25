import { setTimeout as pause } from "node:timers/promises";

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
