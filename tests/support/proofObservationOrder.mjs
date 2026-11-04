// Stable ordering and identity for Vitest-shaped proof observations.

/** Code-unit order, independent of locale, so snapshots stay stable. */
export function textOrder(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

/** Compare `test` name lists name by name; shorter prefix first. */
export function compareTestNames(left, right) {
  const n = Math.min(left.length, right.length);
  for (let i = 0; i < n; i += 1) {
    const order = textOrder(left[i], right[i]);
    if (order !== 0) return order;
  }
  return left.length - right.length;
}

/** Order by `file`, then `test`, then `project` (absent first). */
export function compareObservations(left, right) {
  const byFile = textOrder(left.file, right.file);
  if (byFile !== 0) return byFile;
  const byTest = compareTestNames(left.test, right.test);
  if (byTest !== 0) return byTest;
  if (left.project === undefined && right.project !== undefined) return -1;
  if (left.project !== undefined && right.project === undefined) return 1;
  if (left.project !== undefined && right.project !== undefined) {
    return textOrder(left.project, right.project);
  }
  return 0;
}

export function identityOf(row) {
  return JSON.stringify([row.file, row.test, row.project ?? null]);
}
