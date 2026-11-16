// The times form each browser test group's `<group>-times-<shard>` artifact
// prints: one `<seconds><TAB><label>` line per entry, seconds to a tenth,
// longest first, equal seconds bytewise by label.

const bytewise = (left, right) => (left < right ? -1 : left > right ? 1 : 0);

/**
 * @param {Iterable<[string, number]>} entries label and seconds
 * @returns {string[]}
 */
export function formatTimes(entries) {
  return [...entries]
    .map(([label, seconds]) => ({ label, printed: seconds.toFixed(1) }))
    .sort(
      (left, right) =>
        Number(right.printed) - Number(left.printed) ||
        bytewise(left.label, right.label),
    )
    .map(({ label, printed }) => `${printed}\t${label}`);
}
