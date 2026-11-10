// Summary proof content from held evidence; history remains in the public wrapper.
import { CiProofTable, type CiProofSorting } from "./CiProofTable.tsx";
import { ciUnavailableCellsOf, type CiProofCells } from "./ciProofWording.ts";
import { immediateChildrenOf, owningEntryOf } from "./ciScopeProof.ts";
import type { ScopeEvidence } from "./IntentScopeEvidence.tsx";
import type { ComparisonPreference } from "./IntentCiComparisonPreference.tsx";
import { EvidenceKept, EvidenceNamed } from "./IntentScopeEvidenceLabels.tsx";
import {
  ComparisonTable,
  ComparisonTableView,
} from "./IntentScopeComparisonTable.tsx";
import { ScopeFigures, scopeTableLabel } from "./IntentScopeFigures.tsx";
import { SingleProofTable } from "./IntentScopeSingleProofTable.tsx";
import { childRowsOf } from "./IntentScopeSummaryRows.tsx";
import type { IntentTreeFile } from "./intentStoryOverlay.ts";
import type { IntentSelection } from "./intentWorkspaceSelection.ts";

export function IntentScopeProofView({
  path,
  inventory,
  revision,
  treeFiles,
  onOpen,
  evidence,
  preference,
  sorting,
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
  readonly evidence: ScopeEvidence;
  readonly preference?: ComparisonPreference;
  readonly sorting: CiProofSorting;
}) {
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
          className={
            evidence.problem === true
              ? "intent-summary-evidence-absent intent-ci-proof-problem"
              : "intent-summary-evidence-absent"
          }
          {...(evidence.checking ? { "aria-live": "polite" as const } : {})}
        >
          {evidence.line}
        </p>
        {unavailable(cells)}
      </>
    );
  }

  if (evidence.kind === "comparison") {
    const compared = { path, inventory, evidence, treeFiles, onOpen, sorting };
    return preference === undefined ? (
      <ComparisonTable {...compared} />
    ) : (
      <ComparisonTableView {...compared} preference={preference} />
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
