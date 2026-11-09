// The rows and labels every Summary table shares (`./IntentScopeProof.tsx`):
// one row per immediate child and unit of results it shows, whose name
// opens it, the outside rows kept last, the labels after the table saying
// what those rows hold, and the label for each unit without a file
// breakdown, naming that unit when its entry reports several
// (`./ciProofUnits.ts`). A single-run Summary
// (`./IntentScopeSingleProofTable.tsx`) reads them from its entry; a story
// comparison (`./IntentScopeComparisonTable.tsx`) from its primary
// endpoint's entry.

import { CircleHelp, FileQuestion, ListX } from "lucide-react";
import { EvidenceLabels, type EvidenceLabel } from "./CiEvidenceLabels.tsx";
import type { CiProofTableRow } from "./CiProofTable.tsx";
import type { CiProofEntry } from "./ciProof.ts";
import { noBreakdownGapsOf } from "./ciProofTiming.ts";
import {
  countedAny,
  entryEvidenceOf,
  hasFileBreakdown,
  namesUnits,
  unitName,
} from "./ciProofUnits.ts";
import type { SummaryChild, UnitOutside } from "./ciScopeProof.ts";
import { ChildName } from "./IntentScopeProofChild.tsx";
import type { IntentSelection } from "./intentWorkspaceSelection.ts";

type RowCells = CiProofTableRow["cells"];

const outsideRowLabel = "Not in the rows above";

// One row per child, its name opening it, with CELLS for its path.
export function childRowsOf(
  children: readonly SummaryChild[],
  onOpen: (next: IntentSelection) => void,
  cellsOf: (path: string) => RowCells,
): CiProofTableRow[] {
  return childUnitRowsOf(children, onOpen, (path) => [cellsOf(path)]);
}

// One row per child and per cells CELLS_OF gives its path, one for each unit
// of results it shows, each named by the child's name that opens it.
export function childUnitRowsOf(
  children: readonly SummaryChild[],
  onOpen: (next: IntentSelection) => void,
  cellsOf: (path: string) => readonly RowCells[],
): CiProofTableRow[] {
  return children.flatMap((child) =>
    cellsOf(child.path).map((cells, at) => ({
      key: at === 0 ? child.path : `${child.path}\0${String(at)}`,
      scope: <ChildName child={child} onOpen={onOpen} />,
      name: child.name,
      cells,
    })),
  );
}

// The outside row with CELLS, kept last under any sort; AT tells several
// units' outside rows apart.
export const outsideRowOf = (cells: RowCells, at = 0): CiProofTableRow => ({
  key: at === 0 ? "\0outside" : `\0outside\0${String(at)}`,
  scope: outsideRowLabel,
  cells,
  pinned: true,
});

// What the outside rows hold, as labels after the table: files the tree
// does not list (named in full on hover), results CI could not place in a
// file, and each part of each unit of the entry that published no file
// breakdown, named by its unit when the entry reports several.
export function OutsideExplanation({
  entry,
  path,
  outsides,
}: {
  readonly entry: CiProofEntry;
  readonly path: string;
  readonly outsides: readonly UnitOutside[];
}) {
  const named = namesUnits(entry);
  const labels: EvidenceLabel[] = [];
  const outsideFiles = [
    ...new Set(
      outsides.flatMap(({ outside }) => outside.files.map((file) => file.path)),
    ),
  ];
  if (outsideFiles.length > 0) {
    const count = outsideFiles.length;
    const files = count === 1 ? "1 file" : `${String(count)} files`;
    const shown = outsideFiles.slice(0, 5);
    const more =
      count > shown.length ? ` and ${String(count - shown.length)} more` : "";
    labels.push({
      key: "files",
      icon: FileQuestion,
      words: `${files} not in the tree`,
      full: `Not in the tree: ${shown.join(", ")}${more}`,
    });
  }
  if (outsides.some(({ outside }) => outside.unassigned !== undefined)) {
    labels.push({
      key: "unassigned",
      icon: CircleHelp,
      words: "Unplaced results",
      full: "Results CI could not place in a file",
    });
  }
  if (path === entry.path) {
    for (const evidence of entryEvidenceOf(entry)) {
      if (!hasFileBreakdown(evidence)) continue;
      const unit = unitName(evidence.unit);
      for (const gap of noBreakdownGapsOf(evidence)) {
        labels.push({
          key: `${evidence.unit} ${gap.label}`,
          icon: ListX,
          words: named ? `${gap.label} (${unit})` : gap.label,
          full: named ? `${unit}: ${gap.phrase}` : gap.phrase,
        });
      }
    }
  }
  if (labels.length === 0) return null;
  return (
    <div className="intent-summary-outside">
      <span className="intent-summary-outside-lead" aria-hidden="true">
        {outsideRowLabel}:
      </span>
      <EvidenceLabels label={outsideRowLabel} labels={labels} />
    </div>
  );
}

// The label for each unit of ENTRY that SUMMARY ("This CI proof summary"
// or "The Landed CI proof summary") does not break down by file, naming the
// unit when ENTRY reports several, beside which a unit that counted nothing
// has nothing to break down; nothing otherwise.
export function NoBreakdownLabel({
  entry,
  summary,
}: {
  readonly entry: CiProofEntry;
  readonly summary: string;
}) {
  const named = namesUnits(entry);
  const labels: EvidenceLabel[] = entryEvidenceOf(entry)
    .filter(
      (evidence) =>
        !hasFileBreakdown(evidence) && (!named || countedAny(evidence)),
    )
    .map((evidence) => {
      const unit = unitName(evidence.unit);
      return {
        key: `no breakdown ${evidence.unit}`,
        icon: ListX,
        words: named ? `No file breakdown of ${unit}` : "No file breakdown",
        full: named
          ? `${summary} does not break the ${unit} of ${entry.path} down by file`
          : `${summary} does not break ${entry.path} down by file`,
      };
    });
  if (labels.length === 0) return null;
  return <EvidenceLabels label="About these figures" labels={labels} />;
}
