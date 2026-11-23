// Tree consumption of Intent's one CI comparison evidence
// (`./IntentCiEvidence.tsx`, `./ciScopeComparison.ts`): location headers whose
// path is a compared entry, and file rows, reuse the same compared rows as
// Summary and Proof with no further CI read: one control names each row's
// Counts and after-side words and takes the cue its rows agree on
// (`./ciScopeComparisonAgreedCues.ts`). Folder rows stay uncued.

import { scopeComparisonRowsOf } from "./ciScopeComparison.ts";
import type { SelectedComparisonEndpointProofs } from "./ciComparisonProofs.ts";
import { combinedCuesOf } from "./ciScopeComparisonAgreedCues.ts";
import type {
  ComparisonAfterSide,
  ScopeComparisonCues,
} from "./ciScopeComparisonCues.ts";
import { scopeEvidenceOf } from "./IntentScopeEvidence.tsx";
import type { CiEvidence } from "./IntentCiEvidence.tsx";
import { selectedComparisonOf } from "./intentCiEvidenceModel.ts";
import { baselinePathOf, type IntentTreeFile } from "./intentStoryOverlay.ts";
import { selectionScopeComparisonRowsOf } from "./selectionScopeComparison.ts";
import type {
  ComparisonEndpointProof,
  ComparisonEndpointProofs,
  ComparisonEntryCells,
} from "./storyCiComparisonEntries.ts";
import { activeComparisonAfterSideOf } from "./useIntentCiComparisonEntries.ts";

export type TreeComparisonReading =
  | { readonly kind: "none" }
  | {
      readonly kind: "selection";
      readonly proofs: SelectedComparisonEndpointProofs;
    }
  | {
      readonly kind: "comparison";
      readonly afterSide: ComparisonAfterSide;
      readonly proofs: ComparisonEndpointProofs;
    };

export function treeComparisonReadingOf(
  evidence: CiEvidence,
): TreeComparisonReading {
  const selection = selectedComparisonOf(evidence);
  if (selection !== undefined) {
    return selection.endpointProofs === undefined
      ? { kind: "none" }
      : { kind: "selection", proofs: selection.endpointProofs };
  }
  const scope = scopeEvidenceOf(evidence);
  if (scope.kind !== "comparison") return { kind: "none" };
  return {
    kind: "comparison",
    afterSide: activeComparisonAfterSideOf(scope.answer, scope.proofs),
    proofs: scope.proofs,
  };
}

// True when PATH is a declared entry in any compared endpoint summary.
function comparedEntryPathOf(
  proofs: readonly ComparisonEndpointProof[],
  path: string,
): boolean {
  for (const proof of proofs) {
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

function treeScopeComparisonOf(
  reading: Exclude<TreeComparisonReading, { kind: "none" }>,
  path: string,
  treeFile?: IntentTreeFile,
): TreeComparison {
  if (reading.kind === "selection") {
    const rows = selectionScopeComparisonRowsOf(
      path,
      reading.proofs,
      baselinePathOf(treeFile, path),
      treeFile?.kind,
    );
    return {
      words: rows
        .map(({ counts, selection }) =>
          selection.ms === undefined ? counts : `${counts}, ${selection.text}`,
        )
        .join("; "),
      cues: combinedCuesOf(rows.map(({ cues }) => cues)),
    };
  }
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
  if (reading.kind === "none") return undefined;
  if (!comparedEntryPathOf(Object.values(reading.proofs), locationPath))
    return undefined;
  return treeScopeComparisonOf(reading, locationPath);
}

export function treeFileComparisonOf(
  reading: TreeComparisonReading,
  path: string,
  treeFile?: IntentTreeFile,
): TreeComparison | undefined {
  return reading.kind === "none"
    ? undefined
    : treeScopeComparisonOf(reading, path, treeFile);
}
