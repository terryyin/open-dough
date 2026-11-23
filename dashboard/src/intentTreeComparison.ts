// Tree consumption of Intent's one CI comparison evidence
// (`./IntentCiEvidence.tsx`, `./ciScopeComparison.ts`): location headers whose
// path is a compared entry, and file rows, reuse the same compared rows as
// Summary and Proof with no further CI read: one control names each row's
// Counts and after-side words and takes the cue its rows agree on
// (`./ciScopeComparisonAgreedCues.ts`). Folder rows stay uncued.

import { combinedCuesOf } from "./ciScopeComparisonAgreedCues.ts";
import type {
  ComparisonAfterSide,
  ScopeComparisonCues,
} from "./ciScopeComparisonCues.ts";
import { scopeEvidenceOf } from "./IntentScopeEvidence.tsx";
import type { CiEvidence } from "./IntentCiEvidence.tsx";
import {
  scopeComparisonReadingOf,
  scopeComparisonRowsFor,
  type ScopeComparisonReading,
} from "./intentScopeComparison.ts";
import type { IntentTreeFile } from "./intentStoryOverlay.ts";
import type {
  ComparedProofCells,
  ComparisonEndpointProof,
} from "./storyCiComparisonEntries.ts";

export type TreeComparisonReading =
  { readonly kind: "none" } | ScopeComparisonReading;

export function treeComparisonReadingOf(
  evidence: CiEvidence,
): TreeComparisonReading {
  const scope = scopeEvidenceOf(evidence);
  return scope.kind === "comparison" || scope.kind === "selection"
    ? scopeComparisonReadingOf(scope)
    : { kind: "none" };
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

function treeRowWords(
  cells: ComparedProofCells,
  afterSide: ComparisonAfterSide | undefined,
): string {
  if ("selection" in cells) {
    return cells.selection.ms === undefined
      ? cells.counts
      : `${cells.counts}, ${cells.selection.text}`;
  }
  const timing = afterSide === "landed" ? cells.landed : cells.branch;
  return `${cells.counts}, ${timing.text}`;
}

function treeScopeComparisonOf(
  reading: ScopeComparisonReading,
  path: string,
  treeFile?: IntentTreeFile,
): TreeComparison {
  const rows = scopeComparisonRowsFor(reading, path, treeFile);
  const afterSide =
    reading.kind === "comparison" ? reading.afterSide : undefined;
  return {
    words: rows.map((cells) => treeRowWords(cells, afterSide)).join("; "),
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
