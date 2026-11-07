// Summary of one judged CI proof for a selected entry or folder
// (`./IntentScopeProof.tsx`): the scope's own figures above a sortable table
// of its immediate children and, when the proof has a file breakdown, the
// outside row (kept last) with what it holds as short labels
// (`./CiEvidenceLabels.tsx`); an entry without a file breakdown is labelled.

import { CircleHelp, FileQuestion, ListX } from "lucide-react";
import { EvidenceLabels, type EvidenceLabel } from "./CiEvidenceLabels.tsx";
import {
  CiProofTable,
  type CiProofSorting,
  type CiProofTableRow,
} from "./CiProofTable.tsx";
import type { CiProofEntry } from "./ciProof.ts";
import {
  ciProofCellsOf,
  ciScopeCellsOf,
  hasFileBreakdown,
  type CiProofCells,
} from "./ciProofWording.ts";
import { partsWithoutBreakdown } from "./ciProofTiming.ts";
import {
  immediateChildrenOf,
  outsideOf,
  scopeFiguresOf,
  type ScopeOutside,
  type SummaryChild,
} from "./ciScopeProof.ts";
import { ScopeFigures, scopeTableLabel } from "./IntentScopeFigures.tsx";
import { ChildName } from "./IntentScopeProofChild.tsx";
import type { IntentSelection } from "./intentWorkspaceSelection.ts";

const outsideRowLabel = "Not in the rows above";

// What the outside row holds, as labels after the table: files the tree
// does not list (named in full on hover), results CI could not place in a
// file, and each part of the entry that published no file breakdown.
function OutsideExplanation({
  entry,
  path,
  outside,
}: {
  readonly entry: CiProofEntry;
  readonly path: string;
  readonly outside: ScopeOutside | undefined;
}) {
  const noBreakdown = path === entry.path ? partsWithoutBreakdown(entry) : [];
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
      name: `${files} not in the tree`,
      full: `Not in the tree: ${shown.join(", ")}${more}`,
    });
  }
  if (outside?.unassigned !== undefined) {
    labels.push({
      key: "unassigned",
      icon: CircleHelp,
      name: "Unplaced results",
      full: "Results CI could not place in a file",
    });
  }
  if (hasFileBreakdown(entry)) {
    for (const part of noBreakdown) {
      const words = `Part ${String(part.part)} no breakdown`;
      labels.push({
        key: `part ${String(part.part)}`,
        icon: ListX,
        name: words,
        full: `Part ${String(part.part)} of ${String(entry.parts.length)} published no file breakdown`,
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

export function SingleProofTable({
  path,
  inventory,
  entry,
  onOpen,
  sorting,
}: {
  readonly path: string;
  readonly inventory: readonly string[];
  readonly entry: CiProofEntry;
  readonly onOpen: (next: IntentSelection) => void;
  readonly sorting: CiProofSorting;
}) {
  const children = immediateChildrenOf(path, inventory);
  const breakdown = hasFileBreakdown(entry);
  const outside = breakdown ? outsideOf(entry, path, children) : undefined;
  const childRow = (
    child: SummaryChild,
    cells: CiProofCells,
  ): CiProofTableRow => ({
    key: child.path,
    scope: <ChildName child={child} onOpen={onOpen} />,
    name: child.name,
    cells,
  });
  const own =
    path === entry.path
      ? ciProofCellsOf(entry)
      : ciScopeCellsOf(entry, scopeFiguresOf(entry, path));
  const rows: CiProofTableRow[] = [
    ...children.map((child) =>
      childRow(child, ciScopeCellsOf(entry, scopeFiguresOf(entry, child.path))),
    ),
    ...(outside === undefined
      ? []
      : [
          {
            key: "\0outside",
            scope: outsideRowLabel,
            cells: ciScopeCellsOf(entry, outside.figures),
            pinned: true,
          } as const,
        ]),
  ];
  return (
    <>
      <ScopeFigures path={path} cells={own} />
      {!breakdown && (
        <EvidenceLabels
          label="About these figures"
          labels={[
            {
              key: "no breakdown",
              icon: ListX,
              name: "No file breakdown",
              full: `This CI proof summary does not break ${entry.path} down by file`,
            },
          ]}
        />
      )}
      <CiProofTable
        label={scopeTableLabel(path)}
        scopeHeader="Scope"
        rows={rows}
        sorting={sorting}
      />
      <OutsideExplanation entry={entry} path={path} outside={outside} />
    </>
  );
}
