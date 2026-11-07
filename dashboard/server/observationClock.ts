// The time this server's shared observations (`./sharedObservation.ts`)
// measure their reuse windows by: this machine's clock, unless a test names
// a file (`DOUGH_TEST_OBSERVATION_CLOCK_AHEAD_FILE`) holding how many
// milliseconds to run it ahead. A journey whose page clock is paused lets a
// window end that way instead of waiting it out in real time. Production
// names no file; a named file that is gone (its test has ended) runs nothing
// ahead.

import { readFileSync } from "node:fs";

function aheadMs(file: string): number {
  try {
    const ahead = Number(readFileSync(file, "utf8"));
    return Number.isFinite(ahead) ? ahead : 0;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return 0;
    throw error;
  }
}

export function observationNow(): number {
  const file = process.env["DOUGH_TEST_OBSERVATION_CLOCK_AHEAD_FILE"];
  if (file === undefined || file === "") return Date.now();
  return Date.now() + aheadMs(file);
}
