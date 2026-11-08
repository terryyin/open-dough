// A selected entry's or folder's CI proof in its Summary
// (`./IntentSummary.tsx`), from the CI proof Intent's homepage shows
// (`./IntentCiEvidence.tsx`), with no source read: it names that evidence
// once (`./IntentScopeEvidence.tsx`), then the selected scope's own figures
// as a labelled group (`./IntentScopeFigures.tsx`) above one table in the
// homepage's columns (`./CiProofTable.tsx`, `./ciProofWording.ts`): one row
// per immediate folder and file the tree lists, in its order, each name
// opening that folder or file, and a row for what the scope's figures hold
// that no child row shows (`./ciScopeProof.ts`), explained below it. The table
// sorts by its columns with that outside row kept last; the sort choice is
// held with Intent's reading place (`./pageIntentReading.tsx`), in memory
// only, so it stays while drilling down and across Development and back.
// When a story is selected, the group and table compare baseline, branch and
// landed execution time through the shared scope comparison
// (`./ciScopeComparison.ts`), mark rows the story changed, and reuse the
// homepage's observed-not-attributed statement. Without usable evidence, the
// rows stay for drilling down, the group and rows say why in a word or two,
// and one line says why as the homepage says it.

import { CiProofTable, type CiProofSorting } from "./CiProofTable.tsx";
import type { ColumnSort } from "./ciProofSort.ts";
import { ciUnavailableCellsOf, type CiProofCells } from "./ciProofWording.ts";
import { immediateChildrenOf, owningEntryOf } from "./ciScopeProof.ts";
import { useIntentCiEvidence } from "./IntentCiEvidence.tsx";
import { scopeEvidenceOf } from "./IntentScopeEvidence.tsx";
import { EvidenceKept, EvidenceNamed } from "./IntentScopeEvidenceLabels.tsx";
import {
  ComparisonNamed,
  ComparisonTable,
} from "./IntentScopeComparisonTable.tsx";
import { ScopeFigures, scopeTableLabel } from "./IntentScopeFigures.tsx";
import { SingleProofTable } from "./IntentScopeSingleProofTable.tsx";
import { childRowsOf } from "./IntentScopeSummaryRows.tsx";
import type { IntentTreeFile } from "./intentStoryOverlay.ts";
import type { IntentSelection } from "./intentWorkspaceSelection.ts";
import { useKeptReading } from "./pageIntentReading.tsx";

// The Summary table's sort choice, kept with Intent's reading place.
function useSummarySorting(): CiProofSorting {
  const [sort, onSort] = useKeptReading<ColumnSort | undefined>(
    "summaryCiSort",
    () => undefined,
  );
  return { sort, onSort };
}

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
  const sorting = useSummarySorting();
  const children = immediateChildrenOf(path, inventory);
  // Every figure says why none can be given; the rows still drill down.
  const unavailable = (cells: CiProofCells) => (
    <>
      <ScopeFigures path={path} cells={cells} />
      <CiProofTable
        label={scopeTableLabel(path)}
        scopeHeader="Scope"
        rows={childRowsOf(children, onOpen, () => cells)}
        sorting={sorting}
      />
    </>
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
        {unavailable(cells)}
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
          answer={evidence.answer}
          treeFiles={treeFiles}
          onOpen={onOpen}
          sorting={sorting}
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
        {unavailable(cells)}
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
        sorting={sorting}
      />
    </>
  );
}
