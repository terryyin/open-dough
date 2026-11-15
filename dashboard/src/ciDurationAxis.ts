// CI timing's value axis on the dated history chart (`./chartValueAxis.ts`):
// whole-second wall time or precise execution time, with readable duration
// ticks, and the dashed prior-build average a timing series draws in the
// same words.
import { executionTimeWords, wholeSecondWords } from "./ciProofTimeWords.ts";
import { niceStep, ticksBetween, type ValueAxis } from "./chartValueAxis.ts";

const shortestRangeMs = 2 * 60_000;
const tickStepsSeconds = [
  10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600, 7200, 14_400,
];

// Precise execution time keeps a range floor of a fifth of its highest value
// (at least 10 ms), so each scope and unit reads on its own scale, sub-second
// ones included, without magnifying jitter; wall time keeps two minutes.
function timeTicks(values: readonly number[], precise: boolean): number[] {
  let low = Math.min(...values);
  let high = Math.max(...values);
  const minimumRange = precise ? Math.max(10, high / 5) : shortestRangeMs;
  if (high - low < minimumRange) {
    const middle = (low + high) / 2;
    low = middle - minimumRange / 2;
    high = middle + minimumRange / 2;
  }
  low = Math.max(0, low);
  const step = precise
    ? niceStep(low, high)
    : (tickStepsSeconds.find(
        (seconds) =>
          Math.ceil(high / (seconds * 1000)) -
            Math.floor(low / (seconds * 1000)) <=
          4,
      ) ?? 14_400) * 1000;
  return ticksBetween(low, high, step);
}

// CI wall time in whole seconds.
export const wallTimeAxis: ValueAxis = {
  ticks: (values) => timeTicks(values, false),
  words: wholeSecondWords,
};

// Scope Proof's precise execution time.
export const executionTimeAxis: ValueAxis = {
  ticks: (values) => timeTicks(values, true),
  words: executionTimeWords,
};

// The dashed average line in the series' timing words: "Prior-build
// average 8 min 24 s", or precisely "Prior-build average 103 ms".
export function priorAverageReference(
  axis: ValueAxis,
  averageMs: number | undefined,
) {
  return averageMs === undefined
    ? undefined
    : {
        value: averageMs,
        label: `Prior-build average ${axis.words(averageMs)}`,
      };
}
