// The figure columns of Intent's CI figures, after the scope: Counts, Test
// execution time and Parts for one run, or Counts, the Baseline, Branch and
// Landed times and Parts for a story comparison; and each figure's words under
// its column name. A table row (`./CiProofTable.tsx`) shows them as cells and
// a Summary's own figures (`./IntentScopeFigures.tsx`) as a labelled group.
// A timing gap shows its short label with its full explanation as hover text
// and so its accessible description; Parts reads completeness then each gap.

import { Fragment, type ReactNode } from "react";
import { timingCellIn, type CiProofColumn } from "./ciProofSort.ts";
import type { CiProofCells } from "./ciProofWording.ts";
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

// The figure columns of a story comparison when COMPARISON, else of one run.
export const figureHeadersFor = (
  comparison: boolean,
): readonly FigureHeader[] => (comparison ? comparisonHeaders : proofHeaders);

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
