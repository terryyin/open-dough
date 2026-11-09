// The server time a test may run itself instead of waiting it out: the clock
// shared-observation reuse windows and landed CI collection's wait for a
// landing's own run are measured by (../../server/observationClock.ts) and
// the end of a launch wait (../../server/launchWait.ts). Each is a file the server is told about
// through its environment; a server started without the option names no file.
import { existsSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect } from "@playwright/test";

export type ServerTimeControls = {
  // Fixes the observation clock at an instant for exact deadline checks.
  setObservationClock(at: string): void;
  // Runs the observation clock `ms` further ahead; only on a server started
  // with `observationClock`.
  advanceObservationClock(ms: number): void;
  // Ends the one launch wait now running and returns once that wait took the
  // end; only on a server started with `launchWaitEnd`. Call it after
  // observing what the wait must not race.
  endLaunchWait(): Promise<void>;
};

export function installServerTimeControls(
  tempRoot: string,
  options: {
    readonly observationClock?: boolean | undefined;
    readonly launchWaitEnd?: boolean | undefined;
  },
): { readonly env: NodeJS.ProcessEnv; readonly controls: ServerTimeControls } {
  const env: NodeJS.ProcessEnv = {};
  const clockAheadFile = options.observationClock
    ? path.join(tempRoot, "observation-clock-ahead")
    : undefined;
  let clockAheadMs = 0;
  let fixedObservationMs: number | undefined;
  if (clockAheadFile !== undefined) {
    writeFileSync(clockAheadFile, "0");
    env["DOUGH_TEST_OBSERVATION_CLOCK_AHEAD_FILE"] = clockAheadFile;
  }
  const launchWaitEndFile = options.launchWaitEnd
    ? path.join(tempRoot, "launch-wait-end")
    : undefined;
  if (launchWaitEndFile !== undefined) {
    env["DOUGH_TEST_LAUNCH_WAIT_END_FILE"] = launchWaitEndFile;
  }
  return {
    env,
    controls: {
      setObservationClock(at) {
        if (clockAheadFile === undefined)
          throw new Error(
            "This server was not started with `observationClock`.",
          );
        fixedObservationMs = Date.parse(at);
        writeFileSync(clockAheadFile, at);
      },
      advanceObservationClock(ms) {
        if (clockAheadFile === undefined) {
          throw new Error(
            "This server was not started with `observationClock`.",
          );
        }
        if (fixedObservationMs !== undefined) {
          fixedObservationMs += ms;
          writeFileSync(
            clockAheadFile,
            new Date(fixedObservationMs).toISOString(),
          );
        } else {
          clockAheadMs += ms;
          writeFileSync(clockAheadFile, String(clockAheadMs));
        }
      },
      async endLaunchWait() {
        if (launchWaitEndFile === undefined) {
          throw new Error("This server was not started with `launchWaitEnd`.");
        }
        writeFileSync(launchWaitEndFile, "");
        await expect.poll(() => existsSync(launchWaitEndFile)).toBe(false);
      },
    },
  };
}
