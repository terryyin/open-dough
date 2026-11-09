// Counted results of one compared row of a scope path at one comparison
// endpoint (`./ciScopeComparison.ts`): the one unit's measured total a row
// shows there, several units' totals kept apart, or what stands in for a
// total (a read gap, absent, no file breakdown, nothing counted, or results
// reported in other units only), classified per unit by
// `./ciScopeComparisonUnits.ts` the same way timing is
// (`./ciScopeComparisonTiming.ts`); and the words for a total with its unit
// and the signed difference between two totals of one declared unit
// (`./ciProofUnits.ts`). A unit absent at an endpoint is never a zero. The
// Counts cell over every endpoint is `./ciScopeComparisonCountsCell.ts`'s;
// outcome detail and parts stay with the chosen build in
// `./ciScopeComparison.ts`.

import type { CiProofFigures } from "./ciProof.ts";
import {
  unitNoun,
  type CiEntryEvidence,
  type CiProofUnit,
} from "./ciProofUnits.ts";
import { countedResultsOf, type CountedResults } from "./ciProofWording.ts";
import type { RowEndpointGap } from "./ciScopeComparisonEndpoint.ts";

// One unit's measured total at a scope.
export type MeasuredCount = {
  readonly kind: "measured";
  readonly total: number;
  readonly failed: number;
  readonly unit: CiProofUnit;
};

export type ScopeEndpointCount =
  | RowEndpointGap
  | { readonly kind: "nothing" }
  | MeasuredCount
  // Several units' totals at the scope, kept apart.
  | { readonly kind: "units"; readonly counts: readonly MeasuredCount[] };

// The units COUNT measured totals in; none for a gap or nothing counted.
export const measuredUnitsOf = (
  count: ScopeEndpointCount,
): readonly CiProofUnit[] =>
  count.kind === "units"
    ? count.counts.map(({ unit }) => unit)
    : count.kind === "measured"
      ? [count.unit]
      : [];

const minus = "−";

export const totalCounted = (figures: CiProofFigures): number =>
  countedResultsOf(figures).total;

// The counted results a Counts column sorts COUNT by: none for a gap or for
// several units, and none counted for an entry that counts nothing.
export function countedResultsOfCount(
  count: ScopeEndpointCount,
): CountedResults | undefined {
  if (count.kind === "measured")
    return { total: count.total, failed: count.failed };
  return count.kind === "nothing" ? { total: 0, failed: 0 } : undefined;
}

export function formatTotal(total: number): string {
  return total.toLocaleString("en-US");
}

// "3 test cases".
export const countWords = (total: number, unit: CiProofUnit): string =>
  `${formatTotal(total)} ${unitNoun(unit, total)}`;

export function signedCountWords(delta: number): string {
  if (delta === 0) return "0";
  return delta > 0 ? `+${String(delta)}` : `${minus}${String(Math.abs(delta))}`;
}

// "12 → 10 test cases (−2)" or "6 test cases (no change)": two totals of one
// declared unit. Units stay with the totals; the signed difference is
// separate text in parentheses.
export function measuredCountsChangeWords(
  before: number,
  after: number,
  unit: CiProofUnit,
): string {
  if (before === after) return `${countWords(after, unit)} (no change)`;
  return `${formatTotal(before)} → ${countWords(after, unit)} (${signedCountWords(after - before)})`;
}

// EVIDENCE's total over FIGURES, in its unit.
export const measuredOf = (
  evidence: CiEntryEvidence,
  figures: CiProofFigures,
): MeasuredCount => ({
  kind: "measured",
  ...countedResultsOf(figures),
  unit: evidence.unit,
});
