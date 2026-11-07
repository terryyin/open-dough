// Tree consumption of Intent's one CI comparison evidence
// (`./IntentCiEvidence.tsx`, `./ciScopeComparison.ts`): location headers whose
// path is a compared entry, and file rows, reuse the same cells and cues as
// Summary and Proof with no further CI read. Folder rows stay uncued.

import { scopeComparisonCellsOf } from "./ciScopeComparison.ts";
import type { ComparisonAfterSide } from "./ciScopeComparisonCues.ts";
import { scopeEvidenceOf } from "./IntentScopeEvidence.tsx";
import type { CiEvidence } from "./IntentCiEvidence.tsx";
import { baselinePathOf, type IntentTreeFile } from "./intentStoryOverlay.ts";
import type {
  ComparisonEndpointProofs,
  ComparisonEntryCells,
} from "./storyCiComparisonEntries.ts";
import { activeComparisonAfterSideOf } from "./useIntentCiComparisonEntries.ts";

export type TreeComparisonReading =
  | { readonly kind: "none" }
  | {
      readonly kind: "comparison";
      readonly afterSide: ComparisonAfterSide;
      readonly proofs: ComparisonEndpointProofs;
    };

export function treeComparisonReadingOf(
  evidence: CiEvidence,
): TreeComparisonReading {
  const scope = scopeEvidenceOf(evidence);
  if (scope.kind !== "comparison") return { kind: "none" };
  return {
    kind: "comparison",
    afterSide: activeComparisonAfterSideOf(scope.answer, scope.proofs),
    proofs: scope.proofs,
  };
}

// True when PATH is a declared entry in any compared endpoint summary.
export function comparedEntryPathOf(
  proofs: ComparisonEndpointProofs,
  path: string,
): boolean {
  for (const proof of [proofs.baseline, proofs.branch, proofs.landed]) {
    if (proof.kind !== "summary") continue;
    if (proof.entries.some((entry) => entry.path === path)) return true;
  }
  return false;
}

export function treeScopeCellsOf(
  reading: Extract<TreeComparisonReading, { kind: "comparison" }>,
  path: string,
  treeFile?: IntentTreeFile,
): ComparisonEntryCells {
  const { proofs, afterSide } = reading;
  return scopeComparisonCellsOf(
    path,
    proofs.baseline,
    proofs.branch,
    proofs.landed,
    "precise",
    baselinePathOf(treeFile, path),
    treeFile?.kind,
    afterSide,
  );
}

function treeAfterWordsOf(
  cells: ComparisonEntryCells,
  afterSide: ComparisonAfterSide,
): string {
  return (afterSide === "landed" ? cells.landed : cells.branch).text;
}

// Accessible name: existing tree words, then the same Counts and after-side
// words Proof shows for that scope.
export function treeComparisonAccessibleName(
  base: string,
  cells: ComparisonEntryCells,
  afterSide: ComparisonAfterSide,
): string {
  return `${base}, ${cells.counts}, ${treeAfterWordsOf(cells, afterSide)}`;
}

export function treeLocationCellsOf(
  reading: TreeComparisonReading,
  locationPath: string,
): ComparisonEntryCells | undefined {
  if (reading.kind !== "comparison") return undefined;
  if (!comparedEntryPathOf(reading.proofs, locationPath)) return undefined;
  return treeScopeCellsOf(reading, locationPath);
}

export function treeFileCellsOf(
  reading: TreeComparisonReading,
  path: string,
  treeFile?: IntentTreeFile,
): ComparisonEntryCells | undefined {
  return reading.kind === "comparison"
    ? treeScopeCellsOf(reading, path, treeFile)
    : undefined;
}
