// Summary comparing a selected story's baseline, branch and landed execution
// times (`./IntentScopeProof.tsx`) through the shared scope comparison
// (`./ciScopeComparison.ts`): the scope's own compared figures above a
// sortable table of its immediate children, with each child's change from
// the story overlay under Change, and the outside row kept last; and the
// homepage's observed-not-attributed statement. A selected
// file reuses ComparisonNamed for its Proof
// (`./IntentFileProof.tsx`).

import { shortSha } from "./baseCiWording.ts";
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
import {
  observedNotAttributed,
  requestedStatusOrExplanation,
  requestedStatusPrefix,
} from "./storyCiComparisonWording.ts";
import {
  activeComparisonAfterSideOf,
  type ComparisonEndpointProofs,
} from "./useIntentCiComparisonEntries.ts";

const outsideRowLabel = "Not in the rows above";

// Build/running slots name the requested revision's status (Skipped /
// Cancelled / No build) beside the short SHA of the build whose proof is
// used — same status words as Intent's homepage comparison identity.
function SlotSha({ slot }: { readonly slot: StoryCiComparisonSlot }) {
  if (slot.kind === "build" || slot.kind === "running") {
    return (
      <>
        {requestedStatusPrefix(slot)}
        <code>{shortSha(slot.revision)}</code>
      </>
    );
  }
  return requestedStatusOrExplanation(slot);
}

export function ComparisonNamed({
  evidence,
}: {
  readonly evidence: Extract<ScopeEvidence, { kind: "comparison" }>;
}) {
  const { answer, story } = evidence;
  const taken = answer.phase === "taken";
  const branchSlot = answer.provisional ?? answer.branch;
  return (
    <>
      <p className="intent-summary-evidence">
        CI timing comparison for {story}
        {taken ? " (provisional)" : ""}: Baseline{" "}
        <SlotSha slot={answer.baseline} />
        {" · "}
        Branch <SlotSha slot={branchSlot} />
        {" · "}
        Landed <SlotSha slot={answer.landed} />.
      </p>
      <p className="intent-ci-comparison-framing">({observedNotAttributed})</p>
    </>
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
