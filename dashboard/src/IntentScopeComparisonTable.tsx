// Summary table comparing a selected story's baseline, branch and landed
// execution times (`./IntentScopeProof.tsx`) through the shared scope
// comparison (`./ciScopeComparison.ts`), with change markers from the story
// overlay and the homepage's observed-not-attributed statement.

import { shortSha } from "./baseCiWording.ts";
import {
  CiProofTable,
  ScopePath,
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
import { changeKindWords, ChildName } from "./IntentScopeProofChild.tsx";
import type { IntentTreeFile } from "./intentStoryOverlay.ts";
import type { IntentSelection } from "./intentWorkspaceSelection.ts";
import type { StoryCiComparisonSlot } from "./storyCiComparison.ts";
import { observedNotAttributed } from "./storyCiComparisonWording.ts";
import type { ComparisonEndpointProofs } from "./useIntentCiComparisonEntries.ts";

const outsideRowLabel = "Not in the rows above";

function SlotSha({ slot }: { readonly slot: StoryCiComparisonSlot }) {
  if (slot.kind === "build" || slot.kind === "running")
    return <code>{shortSha(slot.revision)}</code>;
  return slot.explanation;
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

function baselineLookupOf(
  treeFiles: ReadonlyMap<string, IntentTreeFile> | undefined,
  path: string,
): string {
  const file = changeOf(treeFiles, path);
  if (file?.change?.kind === "renamed") return file.change.oldPath;
  return path;
}

export function ComparisonTable({
  path,
  inventory,
  proofs,
  treeFiles,
  onOpen,
}: {
  readonly path: string;
  readonly inventory: readonly string[];
  readonly proofs: ComparisonEndpointProofs;
  readonly treeFiles: ReadonlyMap<string, IntentTreeFile> | undefined;
  readonly onOpen: (next: IntentSelection) => void;
}) {
  const children = immediateChildrenOf(path, inventory);
  const checking =
    proofs.baseline.kind === "checking" ||
    proofs.branch.kind === "checking" ||
    proofs.landed.kind === "checking";
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
      baselineLookupOf(treeFiles, scopePath),
      file?.kind,
    );
  };
  const childRow = (child: SummaryChild): CiProofTableRow => {
    const file = changeOf(treeFiles, child.path);
    return {
      key: child.path,
      scope: (
        <ChildName
          child={child}
          onOpen={onOpen}
          {...(file?.kind === undefined ? {} : { marker: file.kind })}
        />
      ),
      cells: cellsFor(child.path),
    };
  };
  const rootMarker = changeOf(treeFiles, path)?.kind;
  const rows: CiProofTableRow[] = [
    {
      key: path,
      scope: (
        <>
          <ScopePath path={path} />
          {rootMarker !== undefined ? ` ${changeKindWords[rootMarker]}` : ""}
        </>
      ),
      cells: cellsFor(path),
    },
    ...children.map(childRow),
  ];
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
        ),
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
      <CiProofTable
        label={`CI proof of ${path} and its immediate folders and files`}
        scopeHeader="Scope"
        rows={rows}
      />
    </>
  );
}
