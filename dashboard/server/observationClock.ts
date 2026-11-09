// The time this server's shared observations (`./sharedObservation.ts`)
// measure their reuse windows by, and landed CI collection its wait for a
// landing's own run (`./landedCiResolution.ts`): this machine's clock, unless
// a test names a file (`DOUGH_TEST_OBSERVATION_CLOCK_AHEAD_FILE`) holding how
// many milliseconds to run it ahead, or an ISO instant to fix it at. A journey whose page clock is paused lets
// a window end that way instead of waiting it out in real time. Production
// names no file; a named file that is gone (its test has ended) runs nothing
// ahead.

import { readFileSync } from "node:fs";

function controlledNow(file: string): number {
  try {
    const value = readFileSync(file, "utf8");
    const ahead = Number(value);
    if (Number.isFinite(ahead)) return Date.now() + ahead;
    const fixed = Date.parse(value);
    return Number.isFinite(fixed) ? fixed : Date.now();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return Date.now();
    throw error;
  }
}

export function observationNow(): number {
  const file = process.env["DOUGH_TEST_OBSERVATION_CLOCK_AHEAD_FILE"];
  if (file === undefined || file === "") return Date.now();
  return controlledNow(file);
}
