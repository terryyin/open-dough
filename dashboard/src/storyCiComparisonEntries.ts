// Entry rows of a selected done story's CI comparison on Intent's homepage
// (`./IntentCiComparison.tsx`): match each endpoint's proof summary by path,
// show baseline / branch / landed execution times with signed whole-second
// differences, mark added and removed entries, and keep counts and
// completeness from the landed summary (or branch when landed has none).

import type { CiProof, CiProofEntry } from "./ciProof.ts";
import { unavailableLine } from "./ciProofAbsenceWording.ts";
import {
  wholeSecondDifferenceWords,
  wholeSecondWords,
} from "./ciProofTimeWords.ts";
import { ciProofCellsOf, entryTimingOf } from "./ciProofWording.ts";
import type { StoryCiComparisonSlot } from "./storyCiComparison.ts";

export type ComparisonEndpointProof =
  | { readonly kind: "checking" }
  | { readonly kind: "no-build"; readonly explanation: string }
  | { readonly kind: "summary"; readonly entries: readonly CiProofEntry[] }
  | { readonly kind: "unavailable"; readonly line: string };

export type ComparisonEntryCells = {
  readonly counts: string;
  readonly baseline: string;
  readonly branch: string;
  readonly landed: string;
  readonly completeness: string;
  readonly gaps: readonly string[];
};

export type ComparisonEntryRow = {
  readonly path: string;
  readonly cells: ComparisonEntryCells;
};

export type ComparisonEntries =
  | { readonly kind: "checking" }
  | { readonly kind: "empty"; readonly explanation: string }
  | { readonly kind: "rows"; readonly rows: readonly ComparisonEntryRow[] };

const added = "added";
const removed = "removed";

export function comparisonProofOf(
  slot: StoryCiComparisonSlot,
  proof: CiProof | undefined,
  reading: boolean,
): ComparisonEndpointProof {
  if (slot.kind === "build") {
    if (reading || proof === undefined) return { kind: "checking" };
    if (proof.kind === "summary")
      return { kind: "summary", entries: proof.summary.entries };
    return {
      kind: "unavailable",
      line: unavailableLine(proof.reason, proof.detail),
    };
  }
  if (slot.kind === "running")
    return { kind: "no-build", explanation: "Build is still running." };
  return { kind: "no-build", explanation: slot.explanation };
}

function entryOf(
  proof: ComparisonEndpointProof,
  path: string,
): CiProofEntry | undefined {
  if (proof.kind !== "summary") return undefined;
  return proof.entries.find((entry) => entry.path === path);
}

function baselineMsOf(
  baseline: ComparisonEndpointProof,
  path: string,
): number | undefined {
  const entry = entryOf(baseline, path);
  if (entry === undefined) return undefined;
  const timing = entryTimingOf(entry);
  return timing.kind === "complete" ? timing.ms : undefined;
}

// Checking / no-build / unavailable wording shared by baseline and after cells.
function endpointStatusText(
  proof: ComparisonEndpointProof,
): string | undefined {
  if (proof.kind === "checking") return "…";
  if (proof.kind === "no-build") return proof.explanation;
  if (proof.kind === "unavailable") return proof.line;
  return undefined;
}

function timingWords(entry: CiProofEntry): string {
  const timing = entryTimingOf(entry);
  return timing.kind === "complete" ? wholeSecondWords(timing.ms) : timing.text;
}

function baselineCell(
  baseline: ComparisonEndpointProof,
  path: string,
  presentLater: boolean,
): string {
  const status = endpointStatusText(baseline);
  if (status !== undefined) return status;
  const entry = entryOf(baseline, path);
  if (entry === undefined) return presentLater ? added : "—";
  return timingWords(entry);
}

function afterCell(
  proof: ComparisonEndpointProof,
  path: string,
  baselineMs: number | undefined,
  presentInBaseline: boolean,
): string {
  const status = endpointStatusText(proof);
  if (status !== undefined) return status;
  const entry = entryOf(proof, path);
  if (entry === undefined) return presentInBaseline ? removed : added;
  const timing = entryTimingOf(entry);
  if (timing.kind === "explained") return timing.text;
  const value = wholeSecondWords(timing.ms);
  // Diff only when baseline also measured this path; never invent a baseline.
  if (baselineMs === undefined) return value;
  return `${value} ${wholeSecondDifferenceWords(timing.ms - baselineMs)}`;
}

function primaryProofOf(
  landed: ComparisonEndpointProof,
  branch: ComparisonEndpointProof,
  baseline: ComparisonEndpointProof,
): ComparisonEndpointProof {
  if (landed.kind === "summary") return landed;
  if (branch.kind === "summary") return branch;
  return baseline;
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

function cellsForPath(
  path: string,
  baseline: ComparisonEndpointProof,
  branch: ComparisonEndpointProof,
  landed: ComparisonEndpointProof,
  primary: ComparisonEndpointProof,
): ComparisonEntryCells {
  const presentLater =
    entryOf(branch, path) !== undefined || entryOf(landed, path) !== undefined;
  const presentInBaseline = entryOf(baseline, path) !== undefined;
  const before = baselineMsOf(baseline, path);
  const primaryEntry = entryOf(primary, path);
  const sourceEntry =
    primaryEntry ??
    entryOf(branch, path) ??
    entryOf(landed, path) ??
    entryOf(baseline, path);
  const proofCells =
    sourceEntry === undefined
      ? { counts: "—", completeness: "—", gaps: [] as const }
      : ciProofCellsOf(sourceEntry);
  return {
    counts: proofCells.counts,
    baseline: baselineCell(baseline, path, presentLater),
    branch: afterCell(branch, path, before, presentInBaseline),
    landed: afterCell(landed, path, before, presentInBaseline),
    completeness: proofCells.completeness,
    gaps: proofCells.gaps,
  };
}

// Rows for the three endpoint proofs once each has settled; checking while any
// is still reading; empty with why when no summary names an entry.
export function comparisonEntriesOf(
  baseline: ComparisonEndpointProof,
  branch: ComparisonEndpointProof,
  landed: ComparisonEndpointProof,
): ComparisonEntries {
  if (
    baseline.kind === "checking" ||
    branch.kind === "checking" ||
    landed.kind === "checking"
  ) {
    return { kind: "checking" };
  }
  const primary = primaryProofOf(landed, branch, baseline);
  const paths = orderedPaths(primary, branch, baseline);
  if (paths.length === 0) {
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
      cells: cellsForPath(path, baseline, branch, landed, primary),
    })),
  };
}
