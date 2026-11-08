// Summary of one judged CI proof for a selected entry or folder
// (`./IntentScopeProof.tsx`): the scope's own figures above a sortable table
// of its immediate children and, when the proof has a file breakdown, the
// outside row (kept last) with what it holds as short labels; an entry
// without a file breakdown is labelled (`./IntentScopeSummaryRows.tsx`).

import { CiProofTable, type CiProofSorting } from "./CiProofTable.tsx";
import type { CiProofEntry } from "./ciProof.ts";
import {
  ciProofCellsOf,
  ciScopeCellsOf,
  hasFileBreakdown,
} from "./ciProofWording.ts";
import {
  immediateChildrenOf,
  outsideOf,
  scopeFiguresOf,
} from "./ciScopeProof.ts";
import { ScopeFigures, scopeTableLabel } from "./IntentScopeFigures.tsx";
import {
  childRowsOf,
  NoBreakdownLabel,
  OutsideExplanation,
  outsideRowOf,
} from "./IntentScopeSummaryRows.tsx";
import type { IntentSelection } from "./intentWorkspaceSelection.ts";

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
  const outside = hasFileBreakdown(entry)
    ? outsideOf(entry, path, children)
    : undefined;
  const own =
    path === entry.path
      ? ciProofCellsOf(entry)
      : ciScopeCellsOf(entry, scopeFiguresOf(entry, path));
  const rows = childRowsOf(children, onOpen, (child) =>
    ciScopeCellsOf(entry, scopeFiguresOf(entry, child)),
  );
  if (outside !== undefined)
    rows.push(outsideRowOf(ciScopeCellsOf(entry, outside.figures)));
  return (
    <>
      <ScopeFigures path={path} cells={own} />
      <NoBreakdownLabel entry={entry} summary="This CI proof summary" />
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
