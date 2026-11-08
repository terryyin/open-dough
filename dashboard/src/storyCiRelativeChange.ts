// Timing change in a story's CI comparison (`./IntentCiComparison.tsx`):
// the signed whole-second change between two measured timings with, for a
// positive measured baseline, the change as a fraction of it (none for a zero
// baseline), and one symmetric scale shared by the summary and every entry
// cell. The scale reaches half its mark at a 50% change unless a larger
// change needs more room.

import { wholeSecondDifferenceWords } from "./ciProofTimeWords.ts";

// A signed elapsed change and, for a positive measured baseline, its
// relative size (0.125 for an eighth slower, −0.5 for half the time).
export type TimeChange = {
  readonly text: string;
  readonly changeMs: number;
  readonly relative?: number;
};

// The change from a measured BASELINE to a measured LATER timing ("+17 s",
// "−8 s", "0 s"), relative to a positive BASELINE. A measured zero baseline
// still gives a change, but no relative one.
export function timeChangeOf(baselineMs: number, laterMs: number): TimeChange {
  const changeMs = laterMs - baselineMs;
  return {
    text: wholeSecondDifferenceWords(changeMs),
    changeMs,
    ...(baselineMs > 0 ? { relative: changeMs / baselineMs } : {}),
  };
}

// The smallest relative change that fills one side of a mark.
export const leastRelativeScale = 0.5;

// One scale for every relative change shown: the largest change, at least
// `leastRelativeScale`.
export function relativeScaleOf(
  relatives: readonly (number | undefined)[],
): number {
  return relatives.reduce<number>(
    (scale, relative) =>
      relative === undefined ? scale : Math.max(scale, Math.abs(relative)),
    leastRelativeScale,
  );
}

// How far RELATIVE reaches from the zero mark, as a fraction of one side.
export function relativeReachOf(relative: number, scale: number): number {
  return Math.min(1, Math.abs(relative) / scale);
}

// Which way a relative change extends: faster left, slower right.
export function relativeDirectionOf(
  relative: number,
): "faster" | "slower" | "none" {
  return relative < 0 ? "faster" : relative > 0 ? "slower" : "none";
}
