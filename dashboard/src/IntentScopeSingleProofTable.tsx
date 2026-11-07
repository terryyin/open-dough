// Summary table of one judged CI proof for a selected entry or folder
// (`./IntentScopeProof.tsx`): the scope's own row, immediate children, and
// the outside row with its explanation when the proof has a file breakdown.

import type { ReactNode } from "react";
import {
  CiProofTable,
  ScopePath,
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
import { ChildName } from "./IntentScopeProofChild.tsx";
import type { IntentSelection } from "./intentWorkspaceSelection.ts";

const outsideRowLabel = "Not in the rows above";

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
  const lines: ReactNode[] = [];
  if (outside !== undefined && outside.files.length > 0) {
    const shown = outside.files.slice(0, 5);
    lines.push(
      <>
        {outside.files.length === 1
          ? "1 file this tree does not list"
          : `${String(outside.files.length)} files this tree does not list`}
        :{" "}
        {shown.map((file, at) => (
          <span key={file.path}>
            {at > 0 && ", "}
            <code>{file.path}</code>
          </span>
        ))}
        {outside.files.length > shown.length
          ? ` and ${String(outside.files.length - shown.length)} more`
          : ""}
      </>,
    );
  }
  if (outside?.unassigned !== undefined) {
    lines.push(<>results CI could not place in a file</>);
  }
  if (noBreakdown.length > 0 && hasFileBreakdown(entry)) {
    lines.push(
      <>
        {noBreakdown
          .map(
            (part) =>
              `part ${String(part.part)} of ${String(entry.parts.length)}`,
          )
          .join(", ")}
        , which published no file breakdown
      </>,
    );
  }
  if (lines.length === 0) return null;
  return (
    <p className="intent-summary-outside">
      The figures of <code>{path}</code> include what no folder or file row
      shows:{" "}
      {lines.map((line, at) => (
        <span key={at}>
          {at > 0 && "; "}
          {line}
        </span>
      ))}
      .
    </p>
  );
}

export function SingleProofTable({
  path,
  inventory,
  entry,
  onOpen,
}: {
  readonly path: string;
  readonly inventory: readonly string[];
  readonly entry: CiProofEntry;
  readonly onOpen: (next: IntentSelection) => void;
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
    cells,
  });
  const rootRow = (cells: CiProofCells): CiProofTableRow => ({
    key: path,
    scope: <ScopePath path={path} />,
    cells,
  });
  const rows = [
    rootRow(
      path === entry.path
        ? ciProofCellsOf(entry)
        : ciScopeCellsOf(entry, scopeFiguresOf(entry, path)),
    ),
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
          },
        ]),
  ];
  return (
    <>
      {!breakdown && (
        <p className="intent-summary-breakdown-absent">
          Child breakdown unavailable: this CI proof summary does not break{" "}
          <code>{entry.path}</code> down by file.
        </p>
      )}
      <CiProofTable
        label={`CI proof of ${path} and its immediate folders and files`}
        scopeHeader="Scope"
        rows={rows}
      />
      <OutsideExplanation entry={entry} path={path} outside={outside} />
    </>
  );
}
