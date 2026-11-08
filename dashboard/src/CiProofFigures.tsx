// The figure columns of Intent's CI tables, after the scope: Counts and Test
// execution time for one run, or Counts and the Baseline, Branch and Landed
// times for a story comparison, led by Change in a table of compared scopes.
// Change names the story's change of the scope (added, modified, removed or
// renamed) and stays empty for a scope the story leaves unchanged. A table row
// (`./CiProofTable.tsx`) shows them as cells and a Summary's own figures
// (`./IntentScopeFigures.tsx`) add Parts in a labelled group without Change.
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
];
const comparisonHeaders: readonly FigureHeader[] = [
  { column: "counts", label: "Counts" },
  { column: "baseline", label: "Baseline" },
  { column: "branch", label: "Branch" },
  { column: "landed", label: "Landed" },
];

const changeHeader: FigureHeader = { column: "change", label: "Change" };
const partsHeader = { column: "parts", label: "Parts" } as const;

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

// The selected scope's own figures, including its parts completeness.
export const figureHeadersOf = (cells: CiProofCells | ComparisonEntryCells) => [
  ...figureHeadersFor(isComparisonCells(cells)),
  partsHeader,
];

// One figure: the words it shows and, for a timing gap, its explanation.
export type Figure = { readonly words: ReactNode; readonly title?: string };

// The figure CELLS show under COLUMN.
export function figureOf(
  cells: CiProofCells | ComparisonEntryCells,
  column: CiProofColumn | "parts",
): Figure {
  if (column === "counts") return { words: cells.counts };
  if (column === "change") {
    const change = changeIn(cells);
    return { words: change === undefined ? "" : changeKindWords[change] };
  }
  if (column === "parts") {
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
  const timing = timingCellIn(cells, column);
  return {
    words: timing?.text ?? "",
    ...(timing?.explanation === undefined ? {} : { title: timing.explanation }),
  };
}
