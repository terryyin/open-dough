// Summary of one judged CI proof for a selected entry or folder
// (`./IntentScopeProof.tsx`): the scope's own figures for each unit of
// results it shows (`./ciScopeProof.ts` `unitResultsAt`) above a sortable
// table of its immediate children, a row for each unit of results a child
// shows, and, for each unit with a file breakdown, the outside row (kept
// last) with what it holds as short labels; a unit without a file
// breakdown is labelled (`./IntentScopeSummaryRows.tsx`).

import { CiProofTable, type CiProofSorting } from "./CiProofTable.tsx";
import type { CiProofEntry } from "./ciProof.ts";
import { namesUnits, unitName } from "./ciProofUnits.ts";
import { ciScopeCellsOf, unitCellsAt } from "./ciProofWording.ts";
import { entryOutsidesOf, immediateChildrenOf } from "./ciScopeProof.ts";
import { ScopeFigures, scopeTableLabel } from "./IntentScopeFigures.tsx";
import {
  childUnitRowsOf,
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
  const own = unitCellsAt(entry, path);
  const rows = childUnitRowsOf(children, onOpen, (child) =>
    unitCellsAt(entry, child).map((unit) => unit.cells),
  );
  const outsides = entryOutsidesOf(entry, path, children);
  outsides.forEach(({ evidence, outside }, at) => {
    rows.push(
      outsideRowOf(
        ciScopeCellsOf(evidence, outside.figures, namesUnits(entry)),
        at,
      ),
    );
  });
  return (
    <>
      {own.map(({ evidence, cells }) => (
        <ScopeFigures
          key={evidence.unit}
          path={path}
          cells={cells}
          {...(own.length > 1 ? { unit: unitName(evidence.unit) } : {})}
        />
      ))}
      <NoBreakdownLabel entry={entry} summary="This CI proof summary" />
      <CiProofTable
        label={scopeTableLabel(path)}
        scopeHeader="Scope"
        rows={rows}
        sorting={sorting}
      />
      <OutsideExplanation entry={entry} path={path} outsides={outsides} />
    </>
  );
}
