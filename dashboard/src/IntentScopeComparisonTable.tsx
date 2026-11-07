// Summary comparing a selected story's baseline, branch and landed execution
// times (`./IntentScopeProof.tsx`) through the shared scope comparison
// (`./ciScopeComparison.ts`): the scope's own compared figures above a
// sortable table of its immediate children, with each child's change from
// the story overlay under Change, and the outside row kept last; and the
// comparison's identity as short labels (`./CiEvidenceLabels.tsx`) with the
// homepage's observed-not-attributed statement. A selected
// file reuses ComparisonNamed for its Proof
// (`./IntentFileProof.tsx`).

import {
  CircleDashed,
  Eye,
  GitCommitHorizontal,
  Hourglass,
} from "lucide-react";
import { EvidenceLabels, type EvidenceLabel } from "./CiEvidenceLabels.tsx";
import {
  CiProofTable,
  type CiProofSorting,
  type CiProofTableRow,
} from "./CiProofTable.tsx";
import {
  outsideComparisonCellsOf,
  primaryProofOf,
  scopeComparisonCellsOf,
} from "./ciScopeComparison.ts";
import { hasFileBreakdown } from "./ciProofWording.ts";
import {
  immediateChildrenOf,
  outsideOf,
  owningEntryOf,
  type SummaryChild,
} from "./ciScopeProof.ts";
import type { ScopeEvidence } from "./IntentScopeEvidence.tsx";
import { ScopeFigures, scopeTableLabel } from "./IntentScopeFigures.tsx";
import { ChildName } from "./IntentScopeProofChild.tsx";
import { baselinePathOf, type IntentTreeFile } from "./intentStoryOverlay.ts";
import type { IntentSelection } from "./intentWorkspaceSelection.ts";
import type {
  StoryCiComparisonAnswer,
  StoryCiComparisonSlot,
} from "./storyCiComparison.ts";
import { comparisonEndpointProofsChecking } from "./storyCiComparisonEntries.ts";
import { observedNotAttributedInFull } from "./storyCiComparisonWording.ts";
import { slotShortWords } from "./storyCiComparisonSlotWords.ts";
import {
  activeComparisonAfterSideOf,
  type ComparisonEndpointProofs,
} from "./useIntentCiComparisonEntries.ts";

const outsideRowLabel = "Not in the rows above";

// An endpoint as a label: "Baseline abc1234", "Landed Skipped def5678" or
// "Landed Not landed yet", its full status or explanation as description --
// the status words Intent's homepage comparison identity uses.
function endpointLabel(
  endpoint: "Baseline" | "Branch" | "Landed",
  slot: StoryCiComparisonSlot,
): EvidenceLabel {
  const { status, revision, full } = slotShortWords(slot);
  const name = [endpoint, status, revision]
    .filter((word) => word !== undefined)
    .join(" ");
  return {
    key: endpoint,
    icon: revision === undefined ? CircleDashed : GitCommitHorizontal,
    name,
    shown: (
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
  name: "Provisional",
  full: "The story is still Taken: its latest build, not a final result",
};

const framingLabel: EvidenceLabel = {
  key: "framing",
  icon: Eye,
  name: "Observed, not attributed",
  full: observedNotAttributedInFull,
};

// A selected story's comparison identity as labels: the provisional mark
// while Taken, Baseline, Branch and Landed, and the observed-not-attributed
// framing.
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
        ...(answer.phase === "taken" ? [provisionalLabel] : []),
        endpointLabel("Baseline", answer.baseline),
        endpointLabel("Branch", answer.provisional ?? answer.branch),
        endpointLabel("Landed", answer.landed),
        framingLabel,
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
  proofs,
  answer,
  treeFiles,
  onOpen,
  sorting,
}: {
  readonly path: string;
  readonly inventory: readonly string[];
  readonly proofs: ComparisonEndpointProofs;
  readonly answer: Extract<StoryCiComparisonAnswer, { kind: "comparison" }>;
  readonly treeFiles: ReadonlyMap<string, IntentTreeFile> | undefined;
  readonly onOpen: (next: IntentSelection) => void;
  readonly sorting: CiProofSorting;
}) {
  const children = immediateChildrenOf(path, inventory);
  const checking = comparisonEndpointProofsChecking(
    proofs.baseline,
    proofs.branch,
    proofs.landed,
  );
  const afterSide = activeComparisonAfterSideOf(answer, proofs);
  const primary = primaryProofOf(proofs.landed, proofs.branch, proofs.baseline);
  const entry =
    primary.kind === "summary"
      ? owningEntryOf(primary.entries, path)
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
  const childRow = (child: SummaryChild): CiProofTableRow => ({
    key: child.path,
    scope: <ChildName child={child} onOpen={onOpen} />,
    name: child.name,
    cells: cellsFor(child.path),
  });
  const rows: CiProofTableRow[] = children.map(childRow);
  if (entry !== undefined && hasFileBreakdown(entry)) {
    const outside = outsideOf(entry, path, children);
    if (outside !== undefined) {
      rows.push({
        key: "\0outside",
        scope: outsideRowLabel,
        cells: outsideComparisonCellsOf(
          path,
          children,
          proofs.baseline,
          proofs.branch,
          proofs.landed,
          "precise",
          afterSide,
        ),
        pinned: true,
      });
    }
  }
  return (
    <>
      {checking && (
        <p className="intent-ci-reading" role="status">
          Reading entry comparison…
        </p>
      )}
      <ScopeFigures path={path} cells={cellsFor(path)} />
      <CiProofTable
        label={scopeTableLabel(path)}
        scopeHeader="Scope"
        rows={rows}
        sorting={sorting}
        changes
      />
    </>
  );
}
