// The one loop a background check of the local launch boundary
// (`./launchBoundary.ts`) runs, such as the session alerts
// (`./sessionAlerts.ts`) and the feedback maintenance check
// (`./feedbackMaintenanceCheck.ts`): it observes, never overlapping, then waits
// `interval()` or the shorter wait an observation asks for, until `signal`
// ends it. An observation that fails is tried again at the next.

import { setTimeout as delay } from "node:timers/promises";

export async function repeatUntilStopped(
  signal: AbortSignal,
  interval: () => number,
  observe: () => Promise<number | undefined>,
): Promise<void> {
  while (!signal.aborted) {
    let wait = interval();
    try {
      wait = (await observe()) ?? wait;
    } catch {
      // Tried again at the next observation.
    }
    try {
      await delay(wait, undefined, { signal });
    } catch {
      return;
    }
  }
}
