// MakeMe arrangement for relative timing journeys: one counted entry per path
// whose Baseline, Branch and Landed times slow down, speed up, stay, start at
// zero or are added, on a wall-timed compared story. Marks and percentages are
// read through ./relativeTimingMarks.ts.

import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { ComparedStoryBuilder } from "../../../Distribution/tests/support/comparedStoryTestData.mjs";

// Baseline → Branch → Landed: slower 4 min → 4 min 30 s (+13%) → 5 min
// (+25%); faster 2 min → 1 min 30 s (−25%) → 1 min (−50%); same 45 s
// throughout; zero 0 s → 30 s twice; added only after Baseline.
export const relativeTimes: Readonly<
  Record<string, readonly (number | undefined)[]>
> = {
  "e/slower": [240_000, 270_000, 300_000],
  "e/faster": [120_000, 90_000, 60_000],
  "e/same": [45_000, 45_000, 45_000],
  "e/zero": [0, 30_000, 30_000],
  "e/added": [undefined, 30_000, 30_000],
};

// STORY wall-timed (CI wall time 3 min → 3 min 20 s → 4 min; 2 min each
// without runner waits), its endpoints holding TIMES.
export const relativelyTimed = (
  story: ComparedStoryBuilder,
  times = relativeTimes,
) =>
  story.wallTimed().withEntries(
    [0, 1, 2].map((at) =>
      Object.entries(times).flatMap(([path, ms]) => {
        const time = ms[at];
        if (time === undefined) return [];
        return [makeMe.aCiProofEntry.at(path).counting(1).timed(time).please()];
      }),
    ),
  );
