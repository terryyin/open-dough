// Summary comparing a selected story's baseline, branch and landed execution
// times (`./IntentScopeProof.tsx`) through the shared scope comparison
// (`./ciScopeComparison.ts`): the scope's own compared figures above a
// sortable table of its immediate children, with each child's change from
// the story overlay under Change, and the outside row kept last, labelled
// from the primary endpoint's entry as a single run's is
// (`./IntentScopeSummaryRows.tsx`); and the
// comparison's identity as short labels (`./CiEvidenceLabels.tsx`) with the
// homepage's observed-not-attributed statement. A selected
// file reuses ComparisonNamed for its Proof
// (`./IntentFileProof.tsx`).

import { CircleDashed, GitCommitHorizontal, Hourglass } from "lucide-react";
import { EvidenceLabels, type EvidenceLabel } from "./CiEvidenceLabels.tsx";
import { CiProofTable, type CiProofSorting } from "./CiProofTable.tsx";
import {
  outsideComparisonCellsOf,
  primaryEndpointOf,
  scopeComparisonCellsOf,
} from "./ciScopeComparison.ts";
import {
  entryOutsidesOf,
  immediateChildrenOf,
  owningEntryOf,
} from "./ciScopeProof.ts";
import type { ScopeEvidence } from "./IntentScopeEvidence.tsx";
import { ScopeFigures, scopeTableLabel } from "./IntentScopeFigures.tsx";
import {
  childRowsOf,
  NoBreakdownLabel,
  OutsideExplanation,
  outsideRowOf,
} from "./IntentScopeSummaryRows.tsx";
import { baselinePathOf, type IntentTreeFile } from "./intentStoryOverlay.ts";
import type { IntentSelection } from "./intentWorkspaceSelection.ts";
import type { StoryCiComparisonSlot } from "./storyCiComparison.ts";
import {
  comparisonEndpointProofsChecking,
  type ComparisonEndpointName,
} from "./storyCiComparisonEntries.ts";
import { IntentCiComparisonFrame } from "./IntentCiComparisonFrame.tsx";
import { slotShortWords } from "./storyCiComparisonSlotWords.ts";
import { activeComparisonAfterSideOf } from "./useIntentCiComparisonEntries.ts";

// An endpoint as a label: "Baseline abc1234", "Landed Skipped def5678" or
// "Landed Not landed yet", its full status or explanation heard after it --
// the status words Intent's homepage comparison identity uses.
function endpointLabel(
  endpoint: ComparisonEndpointName | "Provisional",
  slot: StoryCiComparisonSlot,
): EvidenceLabel {
  const { status, revision, full } = slotShortWords(slot);
  return {
    key: endpoint,
    icon: revision === undefined ? CircleDashed : GitCommitHorizontal,
    words: (
      <>
        {endpoint}
        {status === undefined ? "" : ` ${status}`}
        {revision === undefined ? "" : " "}
        {revision !== undefined && <code>{revision}</code>}
      </>
    ),
    ...(full === undefined ? {} : { full }),
  };
}

const provisionalLabel: EvidenceLabel = {
  key: "provisional",
  icon: Hourglass,
  words: "Provisional",
  full: "The story is still Taken: its latest build, not a final result",
};

// A selected story's comparison identity as labels: Baseline, Branch and
// Landed, plus the provisional mark or distinct Trunk Mode endpoint while
// Taken. The shared comparison frame supplies observed-build framing.
export function ComparisonNamed({
  evidence,
}: {
  readonly evidence: Extract<ScopeEvidence, { kind: "comparison" }>;
}) {
  const { answer, story } = evidence;
  return (
    <EvidenceLabels
      label={`CI timing comparison of ${story}`}
      labels={[
        ...(answer.phase === "taken" && answer.provisional === undefined
          ? [provisionalLabel]
          : []),
        endpointLabel("Baseline", answer.baseline),
        endpointLabel("Branch", answer.branch),
        ...(answer.provisional === undefined
          ? []
          : [endpointLabel("Provisional", answer.provisional)]),
        endpointLabel("Landed", answer.landed),
      ]}
    />
  );
}

function changeOf(
  treeFiles: ReadonlyMap<string, IntentTreeFile> | undefined,
  path: string,
): IntentTreeFile | undefined {
  return treeFiles?.get(path);
}

export function ComparisonTable({
  path,
  inventory,
  evidence,
  treeFiles,
  onOpen,
  sorting,
}: {
  readonly path: string;
  readonly inventory: readonly string[];
  readonly evidence: Extract<ScopeEvidence, { kind: "comparison" }>;
  readonly treeFiles: ReadonlyMap<string, IntentTreeFile> | undefined;
  readonly onOpen: (next: IntentSelection) => void;
  readonly sorting: CiProofSorting;
}) {
  const { proofs, answer } = evidence;
  const children = immediateChildrenOf(path, inventory);
  const checking = comparisonEndpointProofsChecking(
    proofs.baseline,
    proofs.branch,
    proofs.landed,
  );
  const afterSide = activeComparisonAfterSideOf(answer, proofs);
  const primary = primaryEndpointOf(
    proofs.landed,
    proofs.branch,
    proofs.baseline,
  );
  const entry =
    primary.proof.kind === "summary"
      ? owningEntryOf(primary.proof.entries, path)
      : undefined;
  const cellsFor = (scopePath: string) => {
    const file = changeOf(treeFiles, scopePath);
    return scopeComparisonCellsOf(
      scopePath,
      proofs.baseline,
      proofs.branch,
      proofs.landed,
      "precise",
      baselinePathOf(file, scopePath),
      file?.kind,
      afterSide,
    );
  };
  const rows = childRowsOf(children, onOpen, cellsFor);
  const outsides =
    entry === undefined ? [] : entryOutsidesOf(entry, path, children);
  if (outsides.length > 0) {
    rows.push(
      outsideRowOf(
        outsideComparisonCellsOf(
          path,
          children,
          proofs.baseline,
          proofs.branch,
          proofs.landed,
          "precise",
          afterSide,
        ),
      ),
    );
  }
  const figures = cellsFor(path);
  const relatives = [figures, ...rows.map((row) => row.cells)].flatMap(
    (cells) =>
      "baseline" in cells ? [cells.branch.relative, cells.landed.relative] : [],
  );
  return (
    <IntentCiComparisonFrame
      answer={answer}
      proofs={proofs}
      relatives={relatives}
    >
      <ComparisonNamed evidence={evidence} />
      {checking && (
        <p className="intent-ci-reading" role="status">
          Reading entry comparison…
        </p>
      )}
      <ScopeFigures path={path} cells={figures} />
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
    </IntentCiComparisonFrame>
  );
}
