// Which proof and Parts figures a compared scope path uses
// (`./ciScopeComparison.ts`): the homepage's chosen build for completeness,
// and whether a path is present in an endpoint's summary.

import type { CiProofEntry } from "./ciProof.ts";
import {
  ciProofCellsOf,
  ciScopeCellsOf,
  hasFileBreakdown,
} from "./ciProofWording.ts";
import type { ScopeEndpointTiming } from "./ciScopeComparisonTiming.ts";
import {
  owningEntryOf,
  scopeFiguresOf,
  type CiScopeFigures,
} from "./ciScopeProof.ts";
import type {
  ComparisonEndpointProof,
  ComparisonEntryCells,
} from "./storyCiComparisonEntries.ts";

export function primaryProofOf(
  landed: ComparisonEndpointProof,
  branch: ComparisonEndpointProof,
  baseline: ComparisonEndpointProof,
): ComparisonEndpointProof {
  if (landed.kind === "summary") return landed;
  if (branch.kind === "summary") return branch;
  return baseline;
}

export function presentIn(
  proof: ComparisonEndpointProof,
  path: string,
): boolean {
  if (proof.kind !== "summary") return false;
  const entry = owningEntryOf(proof.entries, path);
  if (entry === undefined) return false;
  if (path === entry.path) return true;
  if (!hasFileBreakdown(entry)) return false;
  return scopeFiguresOf(entry, path).files > 0;
}

export function primaryEntryOf(
  path: string,
  baseline: ComparisonEndpointProof,
  branch: ComparisonEndpointProof,
  landed: ComparisonEndpointProof,
): CiProofEntry | undefined {
  const primary = primaryProofOf(landed, branch, baseline);
  const from = (proof: ComparisonEndpointProof) =>
    proof.kind === "summary" ? owningEntryOf(proof.entries, path) : undefined;
  return from(primary) ?? from(branch) ?? from(landed) ?? from(baseline);
}

// Parts completeness (and gaps) for the homepage's chosen build. Counts come
// from the three-endpoint comparison instead.
export function partsCellsOf(
  entry: CiProofEntry | undefined,
  figures?: CiScopeFigures,
): Pick<ComparisonEntryCells, "completeness" | "gaps" | "gapCount"> {
  if (entry === undefined)
    return { completeness: "—", gaps: [], gapCount: undefined };
  const cells =
    figures === undefined
      ? ciProofCellsOf(entry)
      : ciScopeCellsOf(entry, figures);
  return {
    completeness: cells.completeness,
    gaps: cells.gaps,
    gapCount: cells.gapCount,
  };
}

export function partsForPath(
  path: string,
  baseline: ComparisonEndpointProof,
  branch: ComparisonEndpointProof,
  landed: ComparisonEndpointProof,
): Pick<ComparisonEntryCells, "completeness" | "gaps" | "gapCount"> {
  const entry = primaryEntryOf(path, baseline, branch, landed);
  if (entry === undefined || path === entry.path) return partsCellsOf(entry);
  return partsCellsOf(entry, scopeFiguresOf(entry, path));
}

export function absentOn(
  proof: ComparisonEndpointProof,
  timing: ScopeEndpointTiming,
): boolean {
  // A gap endpoint does not place the path in a compared build.
  if (proof.kind !== "summary") return true;
  return timing.kind === "absent";
}
