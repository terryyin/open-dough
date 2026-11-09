// Which proof and Parts figures a compared scope path uses, at the path or
// outside its children's rows (`./ciScopeComparison.ts`): the homepage's
// chosen build for completeness, of a compared row's own units
// (`./ciScopeComparisonUnits.ts`, `./ciProofUnits.ts`), each named when it
// shows several.

import type { CiProofEntry } from "./ciProof.ts";
import { entryEvidenceOf, unitName, type CiProofUnit } from "./ciProofUnits.ts";
import { unitResultsCellsOf } from "./ciProofWording.ts";
import { inRowUnits } from "./ciScopeComparisonUnits.ts";
import {
  entryOutsidesOf,
  owningEntryOf,
  unitResultsAt,
  type SummaryChild,
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

// The entry holding PATH with only its results a compared row in UNITS
// takes (`inRowUnits`; every unit's without UNITS): the chosen build's, else
// the first other endpoint's with such results.
function primaryEntryOf(
  path: string,
  baseline: ComparisonEndpointProof,
  branch: ComparisonEndpointProof,
  landed: ComparisonEndpointProof,
  units?: readonly CiProofUnit[],
): CiProofEntry | undefined {
  const from = (proof: ComparisonEndpointProof) => {
    if (proof.kind !== "summary") return undefined;
    const entry = owningEntryOf(proof.entries, path);
    const evidence =
      entry?.evidence.filter(({ unit }) => inRowUnits(units, unit)) ?? [];
    return entry === undefined || evidence.length === 0
      ? undefined
      : { ...entry, evidence };
  };
  return (
    from(primaryProofOf(landed, branch, baseline)) ??
    from(branch) ??
    from(landed) ??
    from(baseline)
  );
}

// Parts completeness (and gaps) for the homepage's chosen build: of each
// unit SHOWN at the scope, or of each of ENTRY's units when none is given,
// each named by its unit when there are several. Counts come from the
// three-endpoint comparison instead.
function partsCellsOf(
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

// Parts of PATH in a compared row's UNITS (`primaryEntryOf`).
export function partsForPath(
  path: string,
  units: readonly CiProofUnit[] | undefined,
  baseline: ComparisonEndpointProof,
  branch: ComparisonEndpointProof,
  landed: ComparisonEndpointProof,
): Pick<ComparisonEntryCells, "completeness" | "gaps"> {
  const entry = primaryEntryOf(path, baseline, branch, landed, units);
  if (entry === undefined || path === entry.path) return partsCellsOf(entry);
  return partsCellsOf(entry, unitResultsAt(entry, path));
}

// Parts of what PATH holds outside CHILDREN's rows in a compared row's UNITS
// (`primaryEntryOf`, `entryOutsidesOf`).
export function outsidePartsOf(
  path: string,
  children: readonly SummaryChild[],
  units: readonly CiProofUnit[] | undefined,
  baseline: ComparisonEndpointProof,
  branch: ComparisonEndpointProof,
  landed: ComparisonEndpointProof,
): Pick<ComparisonEntryCells, "completeness" | "gaps"> {
  const entry = primaryEntryOf(path, baseline, branch, landed, units);
  if (entry === undefined) return partsCellsOf(entry);
  return partsCellsOf(
    entry,
    entryOutsidesOf(entry, path, children).map(({ evidence, outside }) => ({
      evidence,
      figures: outside.figures,
    })),
  );
}
