// The figure columns of Intent's CI tables, after the scope: Counts and Test
// execution time for one run, or Counts and the Baseline, Branch and Landed
// times for a story comparison, led by Change in a table of compared scopes.
// Change names the story's change of the scope (added, modified, removed or
// renamed) and stays empty for a scope the story leaves unchanged. A table row
// (`./CiProofTable.tsx`) shows them as cells and a Summary's own figures
// (`./IntentScopeFigures.tsx`) add Parts in a labelled group without Change.
// A homepage entry that reports several units shows one labeled line per unit
// in Counts and Test execution time, aligned so each count, duration, or gap
// stays with its type. A timing gap shows its short label with its full
// explanation as hover text and so its accessible description; Parts reads
// completeness then each gap. A story CI comparison's change shows with its
// relative mark (`./IntentCiTimeChange.tsx`).

import { Fragment, type ReactNode } from "react";
import {
  changeIn,
  timingCellIn,
  unitLinesIn,
  type CiProofColumn,
} from "./ciProofSort.ts";
import { unitName } from "./ciProofUnits.ts";
import type { CiProofCells, CiProofUnitLine } from "./ciProofWording.ts";
import { TimeChangeFigure } from "./IntentCiTimeChange.tsx";
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

// One labeled unit line in a multi-unit Counts or Test execution time cell.
function UnitLine({
  line,
  column,
}: {
  readonly line: CiProofUnitLine;
  readonly column: "counts" | "executionTime";
}) {
  const label = unitName(line.unit);
  const value = column === "counts" ? line.counts : line.executionTime.text;
  const explanation =
    column === "executionTime" ? line.executionTime.explanation : undefined;
  return (
    <div
      className="intent-ci-proof-unit-line"
      aria-label={`${label}: ${value}`}
      {...(explanation === undefined
        ? {}
        : { title: explanation, "aria-description": explanation })}
    >
      <span className="intent-ci-proof-unit-label" aria-hidden="true">
        {label}
      </span>
      <span className="intent-ci-proof-unit-value">{value}</span>
    </div>
  );
}

function unitLinesFigure(
  lines: readonly CiProofUnitLine[],
  column: "counts" | "executionTime",
): Figure {
  return {
    words: lines.map((line) => (
      <UnitLine key={line.unit} line={line} column={column} />
    )),
  };
}

// The figure CELLS show under COLUMN.
export function figureOf(
  cells: CiProofCells | ComparisonEntryCells,
  column: CiProofColumn | "parts",
): Figure {
  const lines = unitLinesIn(cells);
  if (lines !== undefined && lines.length > 1) {
    if (column === "counts" || column === "executionTime")
      return unitLinesFigure(lines, column);
  }
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
  const change = timing?.changeMs;
  return {
    words:
      timing === undefined ? (
        ""
      ) : change === undefined ? (
        timing.text
      ) : (
        <TimeChangeFigure change={{ ...timing, changeMs: change }} />
      ),
    ...(timing?.explanation === undefined ? {} : { title: timing.explanation }),
  };
}
