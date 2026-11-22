// @ts-check
// The prior-build reference figures a timing history read states, shared by
// the Done wall-time and scope history builders: how many prior builds it
// used, their average when it states one, and the selected timing's signed
// change against that average in the history's own words. Node-free.

/** @typedef {{ sampleCount: number; averageMs?: number }} StatedReference */

// The figures for a selected timing of SELECTEDMS, if measured, against
// STATED, with the change worded by WORDED.
/**
 * @param {StatedReference} stated
 * @param {number | undefined} selectedMs
 * @param {(changeMs: number) => string} worded
 */
export function referenceFiguresOf(
  { sampleCount, averageMs },
  selectedMs,
  worded,
) {
  if (averageMs === undefined) return { sampleCount };
  if (selectedMs === undefined) return { sampleCount, averageMs };
  const changeMs = selectedMs - averageMs;
  return {
    sampleCount,
    averageMs,
    difference: {
      text: worded(changeMs),
      changeMs,
      ...(averageMs === 0 ? {} : { relative: changeMs / averageMs }),
    },
  };
}
