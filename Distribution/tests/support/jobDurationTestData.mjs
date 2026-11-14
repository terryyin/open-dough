// @ts-check
// Runner duration facts use the same label/seconds entries as its TSV encoder
// and return the Map consumed by dealShares. Allocation and parsing stay with
// the runner; this builder only gives each case its own duration map.

/** @typedef {Parameters<typeof import("../../../scripts/duration-list.mjs").formatTimes>[0]} DurationEntries */

/** @param {DurationEntries} entries */
export function jobDurations(entries) {
  const recorded = [...entries];
  return {
    /** @returns {Map<string, number>} */
    please: () => new Map(recorded),
  };
}
