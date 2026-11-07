// The figure columns of Intent's CI figures, after the scope: Counts, Test
// execution time and Parts for one run, or Counts, the Baseline, Branch and
// Landed times and Parts for a story comparison, led by Change in a story
// comparison's table of scopes; and each figure's words under its column name.
// Change names the story's change of the scope (added, modified, removed or
// renamed) and stays empty for a scope the story leaves unchanged. A table row
// (`./CiProofTable.tsx`) shows them as cells and a Summary's own figures
// (`./IntentScopeFigures.tsx`), which carry no Change, as a labelled group.
// A timing gap shows its short label with its full explanation as hover text
// and so its accessible description; Parts reads completeness then each gap.

import { Fragment, type ReactNode } from "react";
import { changeIn, timingCellIn, type CiProofColumn } from "./ciProofSort.ts";
import type { CiProofCells } from "./ciProofWording.ts";
import type { ChangeKind } from "./reviewFileTree.ts";
import {
  isComparisonCells,
  type ComparisonEntryCells,
} from "./storyCiComparisonEntries.ts";

export type FigureHeader = {
  readonly column: CiProofColumn;
  readonly label: string;
};

const proofHeaders: readonly FigureHeader[] = [
  { column: "counts", label: "Counts" },
  { column: "executionTime", label: "Test execution time" },
  { column: "parts", label: "Parts" },
];
const comparisonHeaders: readonly FigureHeader[] = [
  { column: "counts", label: "Counts" },
  { column: "baseline", label: "Baseline" },
  { column: "branch", label: "Branch" },
  { column: "landed", label: "Landed" },
  { column: "parts", label: "Parts" },
];

const changeHeader: FigureHeader = { column: "change", label: "Change" };

// The words naming a story's change of a scope.
export const changeKindWords: Record<ChangeKind, string> = {
  added: "added",
  modified: "modified",
  deleted: "removed",
  renamed: "renamed",
};

// The figure columns of a story comparison when COMPARISON, led by Change when
// CHANGES, else of one run.
export const figureHeadersFor = (
  comparison: boolean,
  changes = false,
): readonly FigureHeader[] =>
  comparison
    ? changes
      ? [changeHeader, ...comparisonHeaders]
      : comparisonHeaders
    : proofHeaders;

// The figure columns of CELLS.
export const figureHeadersOf = (
  cells: CiProofCells | ComparisonEntryCells,
): readonly FigureHeader[] => figureHeadersFor(isComparisonCells(cells));

// One figure: the words it shows and, for a timing gap, its explanation.
export type Figure = { readonly words: ReactNode; readonly title?: string };

// The figure CELLS show under COLUMN.
export function figureOf(
  cells: CiProofCells | ComparisonEntryCells,
  column: CiProofColumn,
): Figure {
  const timing = timingCellIn(cells, column);
  if (timing !== undefined)
    return {
      words: timing.text,
      ...(timing.explanation === undefined
        ? {}
        : { title: timing.explanation }),
    };
  if (column === "counts") return { words: cells.counts };
  if (column === "change") {
    const change = changeIn(cells);
    return { words: change === undefined ? "" : changeKindWords[change] };
  }
  return {
    words: (
      <>
        {cells.completeness}
        {cells.gaps.map((gap) => (
          <Fragment key={gap}>
            {"; "}
            <span className="intent-ci-proof-gap">{gap}</span>
          </Fragment>
        ))}
      </>
    ),
  };
}
