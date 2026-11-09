// Counted-results of one scope path inside one comparison endpoint proof
// (`./ciScopeComparison.ts`): classify measured / several units / absent /
// no-breakdown / unavailable from `./ciScopeProof.ts` figures the same way
// timing does in `./ciScopeComparisonTiming.ts`, and word a total with its
// unit and the signed difference between two totals of one declared unit
// (`./ciProofUnits.ts`); a unit absent at an endpoint is never a zero. The
// Counts cell over every endpoint is `./ciScopeComparisonCountsCell.ts`'s;
// outcome detail and parts stay with the chosen build in
// `./ciScopeComparison.ts`.

import type { CiProofFigures } from "./ciProof.ts";
import {
  countedAny,
  hasFileBreakdown,
  unitNoun,
  type CiProofUnit,
  type CiEntryEvidence,
} from "./ciProofUnits.ts";
import { countedResultsOf, type CountedResults } from "./ciProofWording.ts";
import { endpointProofReadOf } from "./ciScopeComparisonEndpoint.ts";
import {
  entryOutsidesOf,
  noResultsKindOf,
  owningEntryOf,
  unitResultsAt,
  unitsWithResults,
  type UnitResults,
  type SummaryChild,
} from "./ciScopeProof.ts";
import type { ComparisonEndpointProof } from "./storyCiComparisonEntries.ts";

// One unit's measured total at a scope.
export type MeasuredCount = {
  readonly kind: "measured";
  readonly total: number;
  readonly failed: number;
  readonly unit: CiProofUnit;
};

export type ScopeEndpointCount =
  | { readonly kind: "checking" }
  | { readonly kind: "status"; readonly text: string }
  | { readonly kind: "no-breakdown" }
  | { readonly kind: "absent" }
  | { readonly kind: "nothing" }
  | MeasuredCount
  // Several units' totals at the scope, kept apart.
  | { readonly kind: "units"; readonly counts: readonly MeasuredCount[] };

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

const measuredOf = (
  evidence: CiEntryEvidence,
  figures: CiProofFigures,
): MeasuredCount => ({
  kind: "measured",
  ...countedResultsOf(figures),
  unit: evidence.unit,
});

// One total for one unit, several units' totals kept apart, or, without any
// total, what stands in for one.
function countOfMeasured(
  measured: readonly MeasuredCount[],
  otherwise: ScopeEndpointCount,
): ScopeEndpointCount {
  const [only] = measured;
  if (only === undefined) return otherwise;
  return measured.length === 1 ? only : { kind: "units", counts: measured };
}

// The totals SHOWN at a scope (`unitResultsAt`) of each unit with results
// there (`unitsWithResults`), where at its entry's path a unit without a
// present part counts nothing; without any, what stands in for one.
function countOfShown(shown: readonly UnitResults[]): ScopeEndpointCount {
  const measured = unitsWithResults(shown).flatMap(({ evidence, figures }) =>
    figures !== undefined || countedAny(evidence)
      ? [measuredOf(evidence, figures ?? evidence)]
      : [],
  );
  const atEntry = shown.some(({ figures }) => figures === undefined);
  return countOfMeasured(measured, {
    kind: atEntry ? "nothing" : noResultsKindOf(shown),
  });
}

export function scopeEndpointCountOf(
  proof: ComparisonEndpointProof,
  lookup: string,
): ScopeEndpointCount {
  const read = endpointProofReadOf(proof);
  if (read.kind !== "summary") return read;
  const entry = owningEntryOf(read.entries, lookup);
  if (entry === undefined) return { kind: "absent" };
  return countOfShown(unitResultsAt(entry, lookup));
}

export function outsideCountOf(
  proof: ComparisonEndpointProof,
  path: string,
  children: readonly SummaryChild[],
): ScopeEndpointCount {
  const read = endpointProofReadOf(proof);
  if (read.kind !== "summary") return read;
  const entry = owningEntryOf(read.entries, path);
  if (entry === undefined) return { kind: "absent" };
  if (!entry.evidence.some(hasFileBreakdown)) return { kind: "no-breakdown" };
  return countOfMeasured(
    entryOutsidesOf(entry, path, children).map(({ evidence, outside }) =>
      measuredOf(evidence, outside.figures),
    ),
    { kind: "absent" },
  );
}
