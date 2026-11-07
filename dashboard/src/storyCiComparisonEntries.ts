// Entry rows of a selected story's CI comparison on Intent's homepage
// (`./IntentCiComparison.tsx`): match each endpoint's proof summary by path
// through the shared scope comparison (`./ciScopeComparison.ts`), show
// baseline / branch / landed execution times with signed whole-second
// differences, counted-results differences in Counts, mark added and
// removed entries, and keep parts completeness from the landed summary (or
// branch when landed has none).

import { shortSha } from "./baseCiWording.ts";
import type { CiProof, CiProofEntry } from "./ciProof.ts";
import {
  adapterUnavailableLine,
  ambiguousAttemptLine,
  unavailableLine,
} from "./ciProofAbsenceWording.ts";
import type { TimingCell } from "./ciProofTiming.ts";
import type { CiProofCells, CountedResults } from "./ciProofWording.ts";
import { primaryProofOf, scopeComparisonCellsOf } from "./ciScopeComparison.ts";
import type {
  ComparisonAfterSide,
  ScopeComparisonCues,
} from "./ciScopeComparisonCues.ts";
import type { StoryCiComparisonSlot } from "./storyCiComparison.ts";

export type ComparisonEndpointProof =
  | { readonly kind: "checking" }
  | { readonly kind: "no-build"; readonly explanation: string }
  | { readonly kind: "summary"; readonly entries: readonly CiProofEntry[] }
  | {
      readonly kind: "unavailable";
      readonly line: string;
      readonly adapter?: true;
    };

export type ComparisonEndpointProofs = {
  readonly baseline: ComparisonEndpointProof;
  readonly branch: ComparisonEndpointProof;
  readonly landed: ComparisonEndpointProof;
};

export function comparisonEndpointProofsChecking(
  baseline: ComparisonEndpointProof,
  branch: ComparisonEndpointProof,
  landed: ComparisonEndpointProof,
): boolean {
  return (
    baseline.kind === "checking" ||
    branch.kind === "checking" ||
    landed.kind === "checking"
  );
}

// Cells of one compared scope: Counts words with the active after endpoint's
// counted results, each endpoint's timing, and Parts with its number of gaps
// (`./ciProofSort.ts` sorts by these values, none for a gap).
export type ComparisonEntryCells = {
  readonly counts: string;
  readonly countedResults: CountedResults | undefined;
  readonly baseline: TimingCell;
  readonly branch: TimingCell;
  readonly landed: TimingCell;
  readonly completeness: string;
  readonly gaps: readonly string[];
  readonly gapCount: number | undefined;
  // One classification for the active after endpoint; Summary, entry rows and
  // Proof all render from this.
  readonly cues: ScopeComparisonCues;
};

// Whether a CI figures table row's CELLS compare endpoints rather than show
// one run's figures.
export function isComparisonCells(
  cells: CiProofCells | ComparisonEntryCells,
): cells is ComparisonEntryCells {
  return "baseline" in cells;
}

export type ComparisonEntryRow = {
  readonly path: string;
  readonly cells: ComparisonEntryCells;
};

export type ComparisonEntries =
  | { readonly kind: "checking" }
  | { readonly kind: "empty"; readonly explanation: string }
  | { readonly kind: "rows"; readonly rows: readonly ComparisonEntryRow[] };

export function comparisonProofOf(
  slot: StoryCiComparisonSlot,
  proof: CiProof | undefined,
  reading: boolean,
): ComparisonEndpointProof {
  if (slot.kind === "build") {
    if (slot.adapterAttempt?.ambiguous === true)
      return {
        kind: "unavailable",
        adapter: true,
        line: ambiguousAttemptLine(
          slot.adapterAttempt.attemptId,
          shortSha(slot.revision),
        ),
      };
    if (reading || proof === undefined) return { kind: "checking" };
    if (proof.kind === "summary")
      return { kind: "summary", entries: proof.summary.entries };
    return slot.adapterAttempt === undefined
      ? {
          kind: "unavailable",
          line: unavailableLine(proof.reason, proof.detail),
        }
      : {
          kind: "unavailable",
          adapter: true,
          line: adapterUnavailableLine(proof.reason, proof.detail),
        };
  }
  if (slot.kind === "running")
    return { kind: "no-build", explanation: "Build is still running." };
  return { kind: "no-build", explanation: slot.explanation };
}

function orderedPaths(
  primary: ComparisonEndpointProof,
  branch: ComparisonEndpointProof,
  baseline: ComparisonEndpointProof,
): string[] {
  const seen = new Set<string>();
  const paths: string[] = [];
  const take = (proof: ComparisonEndpointProof) => {
    if (proof.kind !== "summary") return;
    for (const entry of proof.entries) {
      if (seen.has(entry.path)) continue;
      seen.add(entry.path);
      paths.push(entry.path);
    }
  };
  take(primary);
  take(branch);
  take(baseline);
  return paths;
}

// Rows for the three endpoint proofs once each has settled; checking while any
// is still reading; empty with why when no summary names an entry.
export function comparisonEntriesOf(
  baseline: ComparisonEndpointProof,
  branch: ComparisonEndpointProof,
  landed: ComparisonEndpointProof,
  afterSide: ComparisonAfterSide = "landed",
): ComparisonEntries {
  if (comparisonEndpointProofsChecking(baseline, branch, landed)) {
    return { kind: "checking" };
  }
  const primary = primaryProofOf(landed, branch, baseline);
  const paths = orderedPaths(primary, branch, baseline);
  if (paths.length === 0) {
    const endpoints = [
      ["Baseline", baseline],
      ["Branch", branch],
      ["Landed", landed],
    ] as const;
    const adapterGaps = endpoints.flatMap(([label, proof]) =>
      proof.kind === "unavailable" && proof.adapter === true
        ? [`${label} — ${proof.line}`]
        : [],
    );
    if (adapterGaps.length > 0)
      return { kind: "empty", explanation: adapterGaps.join(" ") };
    const gap = [landed, branch, baseline].find(
      (proof) => proof.kind === "unavailable" || proof.kind === "no-build",
    );
    const explanation =
      gap?.kind === "unavailable"
        ? gap.line
        : gap?.kind === "no-build"
          ? gap.explanation
          : "No CI entry summary is available to compare.";
    return { kind: "empty", explanation };
  }
  return {
    kind: "rows",
    rows: paths.map((path) => ({
      path,
      cells: scopeComparisonCellsOf(
        path,
        baseline,
        branch,
        landed,
        "whole-second",
        path,
        undefined,
        afterSide,
      ),
    })),
  };
}
