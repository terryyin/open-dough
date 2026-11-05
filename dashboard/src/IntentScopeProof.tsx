// A selected entry's or folder's CI proof in its Summary
// (`./IntentSummary.tsx`), from the CI proof Intent's homepage shows
// (`./IntentCiEvidence.tsx`), with no source read: it names that evidence
// once (`./IntentScopeEvidence.tsx`), then one table in the homepage's columns
// (`./CiProofTable.tsx`, `./ciProofWording.ts`): the selected scope's own
// row, one row per immediate folder and file the tree lists, in its order,
// each name opening that folder or file, and a row for what the scope's
// figures hold that no child row shows (`./ciScopeProof.ts`), explained
// below it. Without usable evidence, the rows stay for drilling down and one
// line says why, as the homepage says it.

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
  ciUnavailableCellsOf,
  hasFileBreakdown,
  partsWithoutBreakdown,
  type CiProofCells,
} from "./ciProofWording.ts";
import {
  immediateChildrenOf,
  outsideOf,
  owningEntryOf,
  scopeFiguresOf,
  type ScopeOutside,
  type SummaryChild,
} from "./ciScopeProof.ts";
import { useIntentCiEvidence } from "./IntentCiEvidence.tsx";
import { EvidenceNamed, scopeEvidenceOf } from "./IntentScopeEvidence.tsx";
import type { IntentSelection } from "./intentWorkspaceSelection.ts";

const outsideRowLabel = "Not in the rows above";

// The child's name, opening it as its tree name does; a folder ends in `/`.
function ChildName({
  child,
  onOpen,
}: {
  readonly child: SummaryChild;
  readonly onOpen: (next: IntentSelection) => void;
}) {
  return (
    <button
      type="button"
      className="intent-open-link"
      onClick={() => {
        onOpen({ path: child.path, scope: child.kind });
      }}
    >
      <ScopePath
        path={child.kind === "folder" ? `${child.name}/` : child.name}
      />
    </button>
  );
}

// What the outside row holds, each kind of contribution named.
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

export function IntentScopeProof({
  path,
  inventory,
  revision,
  onOpen,
}: {
  // The selected entry or folder.
  readonly path: string;
  // The selection's location's browsable files.
  readonly inventory: readonly string[];
  // The revision the tree shows.
  readonly revision: string;
  readonly onOpen: (next: IntentSelection) => void;
}) {
  const evidence = scopeEvidenceOf(useIntentCiEvidence());
  const children = immediateChildrenOf(path, inventory);
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
  const table = (rows: readonly CiProofTableRow[]) => (
    <CiProofTable
      label={`CI proof of ${path} and its immediate folders and files`}
      scopeHeader="Scope"
      rows={rows}
    />
  );

  if (evidence.kind === "none") {
    const cells = ciUnavailableCellsOf(
      evidence.checking ? "checking" : "no CI proof",
    );
    return (
      <>
        <p
          className="intent-summary-evidence-absent"
          {...(evidence.checking ? { "aria-live": "polite" as const } : {})}
        >
          {evidence.line}
        </p>
        {table([
          rootRow(cells),
          ...children.map((child) => childRow(child, cells)),
        ])}
      </>
    );
  }

  const entry = owningEntryOf(evidence.summary.entries, path);
  if (entry === undefined) {
    const cells = ciUnavailableCellsOf("no CI entry");
    return (
      <>
        <EvidenceNamed evidence={evidence} revision={revision} />
        <p className="intent-summary-evidence-absent">
          This CI proof summary declares no entry holding <code>{path}</code>.
        </p>
        {table([
          rootRow(cells),
          ...children.map((child) => childRow(child, cells)),
        ])}
      </>
    );
  }
  const breakdown = hasFileBreakdown(entry);
  const outside = breakdown
    ? outsideOf(entry, path, new Set(inventory))
    : undefined;
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
      <EvidenceNamed evidence={evidence} revision={revision} />
      {!breakdown && (
        <p className="intent-summary-breakdown-absent">
          Child breakdown unavailable: this CI proof summary does not break{" "}
          <code>{entry.path}</code> down by file.
        </p>
      )}
      {table(rows)}
      <OutsideExplanation entry={entry} path={path} outside={outside} />
    </>
  );
}
