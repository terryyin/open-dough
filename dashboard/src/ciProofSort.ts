// Column sorting of an Intent CI figures table (`./CiProofTable.tsx`). Rows
// sort by the figures beside their words, never by the words: the scope by its
// path name, Counts by the number of counted results with failed results first
// among equal totals, a timing column by its measured milliseconds
// (`./ciProofTiming.ts`) — or, for Branch and Landed cells showing their
// change from Baseline, by that signed change — and a story comparison's
// Change by kind: added, modified, removed, then renamed. A row
// without a value for the sorted column (partial or unavailable timing, no CI
// result, an endpoint gap, a scope the story leaves unchanged, an entry
// without a measured change where changes are shown) follows the
// rows with one in either direction; such rows, and ties, keep the order the
// caller gave. A pinned row stays last under any sort. The first activation of
// a column sorts it ascending, the next reverses it. The sort choice is the
// caller's in-memory state.

import type { TimingCell } from "./ciProofTiming.ts";
import type { CiProofCells, CountedResults } from "./ciProofWording.ts";
import type { ChangeKind } from "./reviewFileTree.ts";
import {
  isComparisonCells,
  type ComparisonEntryCells,
} from "./storyCiComparisonEntries.ts";

export type SortDirection = "ascending" | "descending";

export type CiProofColumn =
  | "scope"
  | "change"
  | "counts"
  | "executionTime"
  | "baseline"
  | "branch"
  | "landed";

export type ColumnSort = {
  readonly column: CiProofColumn;
  readonly direction: SortDirection;
};

// What a row offers the sort: its scope's path name, its cells, and whether it
// stays last whatever the sort.
export type SortableRow = {
  readonly name?: string;
  readonly cells: CiProofCells | ComparisonEntryCells;
  readonly pinned?: true;
};

type SortValue = string | number | CountedResults | undefined;

// The sort after activating COLUMN's header while CURRENT applies.
export function nextSort(
  current: ColumnSort | undefined,
  column: CiProofColumn,
): ColumnSort {
  return {
    column,
    direction:
      current?.column === column && current.direction === "ascending"
        ? "descending"
        : "ascending",
  };
}

// The timing cell CELLS show under COLUMN, if COLUMN is one of their timing
// columns.
export function timingCellIn(
  cells: CiProofCells | ComparisonEntryCells,
  column: CiProofColumn,
): TimingCell | undefined {
  if (!isComparisonCells(cells))
    return column === "executionTime" ? cells.executionTime : undefined;
  return column === "baseline" || column === "branch" || column === "landed"
    ? cells[column]
    : undefined;
}

// The story change CELLS show under Change: a story comparison's change of
// its scope, none for a scope the story leaves unchanged or one run's figures.
export const changeIn = (
  cells: CiProofCells | ComparisonEntryCells,
): ChangeKind | undefined =>
  isComparisonCells(cells) ? cells.change : undefined;

// The order of story change kinds under Change.
const changeRank: Record<ChangeKind, number> = {
  added: 0,
  modified: 1,
  deleted: 2,
  renamed: 3,
};

function valueOf(row: SortableRow, column: CiProofColumn): SortValue {
  if (column === "scope") return row.name;
  if (column === "change") {
    const change = changeIn(row.cells);
    return change === undefined ? undefined : changeRank[change];
  }
  if (column === "counts") return row.cells.countedResults;
  const cell = timingCellIn(row.cells, column);
  const byChange =
    isComparisonCells(row.cells) &&
    (column === "branch" || column === "landed");
  return byChange ? cell?.changeMs : cell?.ms;
}

// Signed order of two values in DIRECTION; failed results come first among
// equal totals whichever the direction.
function compareValues(
  left: Exclude<SortValue, undefined>,
  right: Exclude<SortValue, undefined>,
  direction: SortDirection,
): number {
  const sign = direction === "ascending" ? 1 : -1;
  if (typeof left === "string" && typeof right === "string")
    return sign * left.localeCompare(right, "en");
  if (typeof left === "number" && typeof right === "number")
    return sign * (left - right);
  if (typeof left === "object" && typeof right === "object") {
    if (left.total !== right.total) return sign * (left.total - right.total);
    return right.failed - left.failed;
  }
  return 0;
}

// ROWS in SORT's order, or as given until a column is sorted.
export function sortedRows<Row extends SortableRow>(
  rows: readonly Row[],
  sort: ColumnSort | undefined,
): readonly Row[] {
  if (sort === undefined) return rows;
  const ranked = rows.map((row, at) => ({
    row,
    at,
    value: valueOf(row, sort.column),
  }));
  ranked.sort((left, right) => {
    const pinned =
      Number(left.row.pinned ?? false) - Number(right.row.pinned ?? false);
    if (pinned !== 0) return pinned;
    if (left.value === undefined || right.value === undefined) {
      const unmeasured =
        Number(left.value === undefined) - Number(right.value === undefined);
      if (unmeasured !== 0) return unmeasured;
    } else {
      const order = compareValues(left.value, right.value, sort.direction);
      if (order !== 0) return order;
    }
    return left.at - right.at;
  });
  return ranked.map(({ row }) => row);
}
