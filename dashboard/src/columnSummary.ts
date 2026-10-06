// One top-level entry per story or standalone session. Unknown inputs leave
// the heading and edge count incomplete; nested sessions add no entries.
export type ColumnSummary = {
  readonly name: string;
  readonly entries: number | undefined;
};

export function entryCount(entries: number | undefined): string {
  return entries === undefined
    ? "Entry count incomplete"
    : entries === 1
      ? "1 entry"
      : `${entries} entries`;
}
