// Which proof and Parts figures a compared scope path uses
// (`./ciScopeComparison.ts`): the homepage's chosen build for completeness,
// each unit's own when the scope shows several (`./ciProofUnits.ts`), and
// whether a path is present in an endpoint's summary.

import type { CiProofEntry } from "./ciProof.ts";
import { entryEvidenceOf, unitName } from "./ciProofUnits.ts";
import { unitResultsCellsOf } from "./ciProofWording.ts";
import type { ScopeEndpointTiming } from "./ciScopeComparisonTiming.ts";
import {
  owningEntryOf,
  unitResultsAt,
  unitsWithResults,
  type UnitResults,
} from "./ciScopeProof.ts";
import type {
  ComparisonEndpointName,
  ComparisonEndpointProof,
  ComparisonEntryCells,
} from "./storyCiComparisonEntries.ts";

// The homepage's chosen build and its endpoint: Landed, else Branch, else
// Baseline.
export function primaryEndpointOf(
  landed: ComparisonEndpointProof,
  branch: ComparisonEndpointProof,
  baseline: ComparisonEndpointProof,
): {
  readonly endpoint: ComparisonEndpointName;
  readonly proof: ComparisonEndpointProof;
} {
  if (landed.kind === "summary") return { endpoint: "Landed", proof: landed };
  if (branch.kind === "summary") return { endpoint: "Branch", proof: branch };
  return { endpoint: "Baseline", proof: baseline };
}

export const primaryProofOf = (
  landed: ComparisonEndpointProof,
  branch: ComparisonEndpointProof,
  baseline: ComparisonEndpointProof,
): ComparisonEndpointProof => primaryEndpointOf(landed, branch, baseline).proof;

export function presentIn(
  proof: ComparisonEndpointProof,
  path: string,
): boolean {
  if (proof.kind !== "summary") return false;
  const entry = owningEntryOf(proof.entries, path);
  return (
    entry !== undefined &&
    unitsWithResults(unitResultsAt(entry, path)).length > 0
  );
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

// Parts completeness (and gaps) for the homepage's chosen build: of each
// unit SHOWN at the scope, or of each of ENTRY's units when none is given,
// each named by its unit when there are several. Counts come from the
// three-endpoint comparison instead.
export function partsCellsOf(
  entry: CiProofEntry | undefined,
  shown?: readonly UnitResults[],
): Pick<ComparisonEntryCells, "completeness" | "gaps"> {
  if (entry === undefined) return { completeness: "—", gaps: [] };
  const units =
    shown === undefined || shown.length === 0
      ? entryEvidenceOf(entry).map((evidence) => ({
          evidence,
          figures: undefined,
        }))
      : shown;
  const cells = units.map(({ evidence, figures }) => ({
    unit: unitName(evidence.unit),
    cells: unitResultsCellsOf(evidence, figures),
  }));
  const [only] = cells;
  if (cells.length === 1 && only !== undefined)
    return { completeness: only.cells.completeness, gaps: only.cells.gaps };
  return {
    completeness: cells
      .map(({ unit, cells: one }) => `${unit}: ${one.completeness}`)
      .join("; "),
    gaps: cells.flatMap(({ unit, cells: one }) =>
      one.gaps.map((gap) => `${unit}: ${gap}`),
    ),
  };
}

export function partsForPath(
  path: string,
  baseline: ComparisonEndpointProof,
  branch: ComparisonEndpointProof,
  landed: ComparisonEndpointProof,
): Pick<ComparisonEntryCells, "completeness" | "gaps"> {
  const entry = primaryEntryOf(path, baseline, branch, landed);
  if (entry === undefined || path === entry.path) return partsCellsOf(entry);
  return partsCellsOf(entry, unitResultsAt(entry, path));
}

export function absentOn(
  proof: ComparisonEndpointProof,
  timing: ScopeEndpointTiming,
): boolean {
  // A gap endpoint does not place the path in a compared build.
  if (proof.kind !== "summary") return true;
  return timing.kind === "absent";
}
