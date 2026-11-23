// Summary comparing a selected story's baseline, branch and landed execution
// times (`./IntentScopeProof.tsx`) through the shared scope comparison
// (`./ciScopeComparison.ts`): the scope's own compared figures, one group per
// compared unit named by its units when there are several, above a sortable
// table of its immediate children, a row for each child's compared unit,
// with each child's change from the story overlay under Change, and the
// outside rows kept last, labelled from the primary endpoint's entry as a
// single run's are (`./IntentScopeSummaryRows.tsx`); and the
// comparison's identity as short labels (`./CiEvidenceLabels.tsx`) with the
// homepage's observed-not-attributed statement. A selected
// file reuses ComparisonNamed for its Proof
// (`./IntentFileProof.tsx`).

import { CiProofTable, type CiProofSorting } from "./CiProofTable.tsx";
import {
  outsideComparisonRowsOf,
  primaryEndpointOf,
} from "./ciScopeComparison.ts";
import {
  entryOutsidesOf,
  immediateChildrenOf,
  owningEntryOf,
} from "./ciScopeProof.ts";
import type { ScopeComparisonEvidence } from "./IntentScopeEvidence.tsx";
import { IntentScopeComparisonFrame } from "./IntentScopeComparisonFrame.tsx";
import {
  scopeComparisonReadingOf,
  scopeComparisonRowsFor,
} from "./intentScopeComparison.ts";
import { selectionOutsideComparisonRowsOf } from "./selectionScopeComparison.ts";
import { ScopeFigures, scopeTableLabel } from "./IntentScopeFigures.tsx";
import {
  childUnitRowsOf,
  NoBreakdownLabel,
  OutsideExplanation,
  outsideRowOf,
} from "./IntentScopeSummaryRows.tsx";
import type { IntentTreeFile } from "./intentStoryOverlay.ts";
import type { IntentSelection } from "./intentWorkspaceSelection.ts";
import { proofRelativeTimings } from "./storyCiComparisonEntries.ts";
import {
  useCiComparisonPreference,
  type ComparisonPreference,
} from "./IntentCiComparisonPreference.tsx";

export function ComparisonTableView({
  path,
  inventory,
  evidence,
  treeFiles,
  onOpen,
  sorting,
  preference,
}: {
  readonly path: string;
  readonly inventory: readonly string[];
  readonly evidence: ScopeComparisonEvidence;
  readonly treeFiles: ReadonlyMap<string, IntentTreeFile> | undefined;
  readonly onOpen: (next: IntentSelection) => void;
  readonly sorting: CiProofSorting;
  readonly preference: ComparisonPreference;
}) {
  const children = immediateChildrenOf(path, inventory);
  const reading = scopeComparisonReadingOf(evidence);
  const primary =
    reading.kind === "selection"
      ? reading.proofs.selection.kind === "summary"
        ? { endpoint: "Selection", proof: reading.proofs.selection }
        : { endpoint: "Baseline", proof: reading.proofs.baseline }
      : primaryEndpointOf(
          reading.proofs.landed,
          reading.proofs.branch,
          reading.proofs.baseline,
        );
  const entry =
    primary.proof.kind === "summary"
      ? owningEntryOf(primary.proof.entries, path)
      : undefined;
  const rowsFor = (scopePath: string) =>
    scopeComparisonRowsFor(reading, scopePath, treeFiles?.get(scopePath));
  const rows = childUnitRowsOf(children, onOpen, rowsFor);
  const outsides =
    entry === undefined ? [] : entryOutsidesOf(entry, path, children);
  if (outsides.length > 0) {
    const outsideRows =
      reading.kind === "selection"
        ? selectionOutsideComparisonRowsOf(path, children, reading.proofs)
        : outsideComparisonRowsOf(
            path,
            children,
            reading.proofs.baseline,
            reading.proofs.branch,
            reading.proofs.landed,
            "precise",
            reading.afterSide,
          );
    outsideRows.forEach((cells, at) => {
      rows.push(outsideRowOf(cells, at));
    });
  }
  const own = rowsFor(path);
  const relatives = [...own, ...rows.map((row) => row.cells)].flatMap(
    proofRelativeTimings,
  );
  return (
    <IntentScopeComparisonFrame
      preference={preference}
      evidence={evidence}
      relatives={relatives}
    >
      {own.map((cells) => (
        <ScopeFigures
          key={cells.units ?? ""}
          path={path}
          cells={cells}
          {...(own.length > 1 && cells.units !== undefined
            ? { unit: cells.units }
            : {})}
        />
      ))}
      {entry !== undefined && (
        <NoBreakdownLabel
          entry={entry}
          summary={`The ${primary.endpoint} CI proof summary`}
        />
      )}
      <CiProofTable
        label={scopeTableLabel(path)}
        scopeHeader="Scope"
        rows={rows}
        sorting={sorting}
        changes
      />
      {entry !== undefined && (
        <OutsideExplanation entry={entry} path={path} outsides={outsides} />
      )}
    </IntentScopeComparisonFrame>
  );
}

export function ComparisonTable(
  props: Omit<Parameters<typeof ComparisonTableView>[0], "preference">,
) {
  return (
    <ComparisonTableView {...props} preference={useCiComparisonPreference()} />
  );
}
