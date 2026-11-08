// The rows and labels every Summary table shares (`./IntentScopeProof.tsx`):
// one row per immediate child whose name opens it, the outside row kept
// last, the labels after the table saying what that row holds, and the label
// for an entry without a file breakdown. A single-run Summary
// (`./IntentScopeSingleProofTable.tsx`) reads them from its entry; a story
// comparison (`./IntentScopeComparisonTable.tsx`) from its primary
// endpoint's entry.

import { CircleHelp, FileQuestion, ListX } from "lucide-react";
import { EvidenceLabels, type EvidenceLabel } from "./CiEvidenceLabels.tsx";
import type { CiProofTableRow } from "./CiProofTable.tsx";
import type { CiProofEntry } from "./ciProof.ts";
import { noBreakdownGapsOf } from "./ciProofTiming.ts";
import { hasFileBreakdown } from "./ciProofWording.ts";
import type { ScopeOutside, SummaryChild } from "./ciScopeProof.ts";
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
  return children.map((child) => ({
    key: child.path,
    scope: <ChildName child={child} onOpen={onOpen} />,
    name: child.name,
    cells: cellsOf(child.path),
  }));
}

// The outside row with CELLS, kept last under any sort.
export const outsideRowOf = (cells: RowCells): CiProofTableRow => ({
  key: "\0outside",
  scope: outsideRowLabel,
  cells,
  pinned: true,
});

// What the outside row holds, as labels after the table: files the tree
// does not list (named in full on hover), results CI could not place in a
// file, and each part of the entry that published no file breakdown.
export function OutsideExplanation({
  entry,
  path,
  outside,
}: {
  readonly entry: CiProofEntry;
  readonly path: string;
  readonly outside: ScopeOutside | undefined;
}) {
  const labels: EvidenceLabel[] = [];
  if (outside !== undefined && outside.files.length > 0) {
    const count = outside.files.length;
    const files = count === 1 ? "1 file" : `${String(count)} files`;
    const shown = outside.files.slice(0, 5).map((file) => file.path);
    const more =
      count > shown.length ? ` and ${String(count - shown.length)} more` : "";
    labels.push({
      key: "files",
      icon: FileQuestion,
      words: `${files} not in the tree`,
      full: `Not in the tree: ${shown.join(", ")}${more}`,
    });
  }
  if (outside?.unassigned !== undefined) {
    labels.push({
      key: "unassigned",
      icon: CircleHelp,
      words: "Unplaced results",
      full: "Results CI could not place in a file",
    });
  }
  if (path === entry.path && hasFileBreakdown(entry)) {
    for (const gap of noBreakdownGapsOf(entry)) {
      labels.push({
        key: gap.label,
        icon: ListX,
        words: gap.label,
        full: gap.phrase,
      });
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

// The label for ENTRY when SUMMARY ("This CI proof summary" or "The Landed
// CI proof summary") does not break it down by file; nothing otherwise.
export function NoBreakdownLabel({
  entry,
  summary,
}: {
  readonly entry: CiProofEntry;
  readonly summary: string;
}) {
  if (hasFileBreakdown(entry)) return null;
  return (
    <EvidenceLabels
      label="About these figures"
      labels={[
        {
          key: "no breakdown",
          icon: ListX,
          words: "No file breakdown",
          full: `${summary} does not break ${entry.path} down by file`,
        },
      ]}
    />
  );
}
