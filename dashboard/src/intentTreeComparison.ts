// Tree consumption of Intent's one CI comparison evidence
// (`./IntentCiEvidence.tsx`, `./ciScopeComparison.ts`): location headers whose
// path is a compared entry, and file rows, reuse the same compared rows as
// Summary and Proof with no further CI read: one control names each row's
// Counts and after-side words and takes the cue its rows agree on
// (`./ciScopeComparisonAgreedCues.ts`). Folder rows stay uncued.

import { scopeComparisonRowsOf } from "./ciScopeComparison.ts";
import { combinedCuesOf } from "./ciScopeComparisonAgreedCues.ts";
import type {
  ComparisonAfterSide,
  ScopeComparisonCues,
} from "./ciScopeComparisonCues.ts";
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

// A compared scope as one tree control shows it: each compared row's Counts
// and after-side words, and the cues its rows agree on.
export type TreeComparison = {
  readonly words: string;
  readonly cues: ScopeComparisonCues;
};

function afterWordsOf(
  cells: ComparisonEntryCells,
  afterSide: ComparisonAfterSide,
): string {
  return (afterSide === "landed" ? cells.landed : cells.branch).text;
}

export function treeScopeComparisonOf(
  reading: Extract<TreeComparisonReading, { kind: "comparison" }>,
  path: string,
  treeFile?: IntentTreeFile,
): TreeComparison {
  const { proofs, afterSide } = reading;
  const rows = scopeComparisonRowsOf(
    path,
    proofs.baseline,
    proofs.branch,
    proofs.landed,
    "precise",
    baselinePathOf(treeFile, path),
    treeFile?.kind,
    afterSide,
  );
  return {
    words: rows
      .map((cells) => `${cells.counts}, ${afterWordsOf(cells, afterSide)}`)
      .join("; "),
    cues: combinedCuesOf(rows.map(({ cues }) => cues)),
  };
}

// Accessible name: existing tree words, then the same Counts and after-side
// words Proof shows for that scope, row by row.
export function treeComparisonAccessibleName(
  base: string,
  comparison: TreeComparison,
): string {
  return `${base}, ${comparison.words}`;
}

export function treeLocationComparisonOf(
  reading: TreeComparisonReading,
  locationPath: string,
): TreeComparison | undefined {
  if (reading.kind !== "comparison") return undefined;
  if (!comparedEntryPathOf(reading.proofs, locationPath)) return undefined;
  return treeScopeComparisonOf(reading, locationPath);
}

export function treeFileComparisonOf(
  reading: TreeComparisonReading,
  path: string,
  treeFile?: IntentTreeFile,
): TreeComparison | undefined {
  return reading.kind === "comparison"
    ? treeScopeComparisonOf(reading, path, treeFile)
    : undefined;
}
