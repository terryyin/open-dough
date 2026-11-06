// A selected entry's or folder's CI proof in its Summary
// (`./IntentSummary.tsx`), from the CI proof Intent's homepage shows
// (`./IntentCiEvidence.tsx`), with no source read: it names that evidence
// once (`./IntentScopeEvidence.tsx`), then one table in the homepage's columns
// (`./CiProofTable.tsx`, `./ciProofWording.ts`): the selected scope's own
// row, one row per immediate folder and file the tree lists, in its order,
// each name opening that folder or file, and a row for what the scope's
// figures hold that no child row shows (`./ciScopeProof.ts`), explained
// below it. When a story is selected, the same table compares baseline,
// branch and landed execution time through the shared scope comparison
// (`./ciScopeComparison.ts`), marks rows the story changed, and reuses the
// homepage's observed-not-attributed statement. Without usable evidence, the
// rows stay for drilling down and one line says why, as the homepage says it.

import {
  CiProofTable,
  ScopePath,
  type CiProofTableRow,
} from "./CiProofTable.tsx";
import { ciUnavailableCellsOf, type CiProofCells } from "./ciProofWording.ts";
import {
  immediateChildrenOf,
  owningEntryOf,
  type SummaryChild,
} from "./ciScopeProof.ts";
import { useIntentCiEvidence } from "./IntentCiEvidence.tsx";
import {
  EvidenceKept,
  EvidenceNamed,
  scopeEvidenceOf,
} from "./IntentScopeEvidence.tsx";
import {
  ComparisonNamed,
  ComparisonTable,
} from "./IntentScopeComparisonTable.tsx";
import { ChildName } from "./IntentScopeProofChild.tsx";
import { SingleProofTable } from "./IntentScopeSingleProofTable.tsx";
import type { IntentTreeFile } from "./intentStoryOverlay.ts";
import type { IntentSelection } from "./intentWorkspaceSelection.ts";

export function IntentScopeProof({
  path,
  inventory,
  revision,
  treeFiles,
  onOpen,
}: {
  // The selected entry or folder.
  readonly path: string;
  // The files the tree lists under the selection.
  readonly inventory: readonly string[];
  // The revision the tree shows.
  readonly revision: string;
  // The story overlay's files by repository path, when a story is selected.
  readonly treeFiles?: ReadonlyMap<string, IntentTreeFile>;
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
        <EvidenceKept kept={evidence.kept} />
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

  if (evidence.kind === "comparison") {
    return (
      <>
        <ComparisonNamed evidence={evidence} />
        <ComparisonTable
          path={path}
          inventory={inventory}
          proofs={evidence.proofs}
          treeFiles={treeFiles}
          onOpen={onOpen}
        />
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
  return (
    <>
      <EvidenceNamed evidence={evidence} revision={revision} />
      <SingleProofTable
        path={path}
        inventory={inventory}
        entry={entry}
        onOpen={onOpen}
      />
    </>
  );
}
