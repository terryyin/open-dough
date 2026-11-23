// Overall counted-results wording for a story's CI comparison on Intent's
// homepage (`./IntentCiComparison.tsx`): per-unit totals of the two compared
// builds' proofs, framed as an observation between single builds, matched
// entry by entry as every compared scope matches its units
// (`./ciScopeComparisonUnits.ts`). An entry's results in a declared unit
// (`./ciProofUnits.ts`) count toward that unit's difference when both builds
// report the entry in it, or when only one build declares the entry at all
// (added or removed). When only one build reports a unit for an entry,
// show its total separately and explain the missing comparison. Timing and selection wording stay in
// `./storyCiComparisonWording.ts`.

import {
  countWords,
  differentUnitsCountSuffix,
  measuredCountsChangeWords,
  countObservationWords,
} from "./ciScopeComparisonCounts.ts";
import { overallCountCueOf } from "./ciScopeComparisonAgreedCues.ts";
import type { CountCue } from "./ciScopeComparisonCues.ts";
import { declaredUnits } from "./ciProofUnits.ts";
import type { ComparisonEndpointProof } from "./storyCiComparisonEntries.ts";
import {
  overallTotalsOf,
  observedTotalOf,
  unitHasGaps,
  type MatchedTotals,
  type Totals,
} from "./storyCiComparisonCountTotals.ts";

// The reported totals in display order.
function totalsWords(totals: Totals): string {
  const units = declaredUnits.filter((unit) => totals.has(unit));
  if (units.length === 0) return "—";
  return units
    .map((unit) => countWords(totals.get(unit) ?? 0, unit))
    .join(" and ");
}

// The results that do not compare, each build in its units, with why when
// both builds have such results.
function apartWords({ before, after }: MatchedTotals["apart"]): string[] {
  if (before.size === 0 && after.size === 0) return [];
  const why =
    before.size === 0 || after.size === 0 ? "" : differentUnitsCountSuffix;
  return [`${totalsWords(before)} → ${totalsWords(after)}${why}`];
}

// Overall counted-results difference with units kept apart (test cases and
// test files are never mixed), a unit only one build reports shown without a
// difference, and results that do not compare totalled apart. Partial when
// either build lacks a usable total.
export function overallCountsWords(
  baseline: ComparisonEndpointProof,
  after: ComparisonEndpointProof,
): string {
  const totals = overallTotalsOf(baseline, after);
  if (totals.kind === "partial")
    return `Overall count partial: ${totals.reason.replace(/\.$/, "")}.`;
  const { compared, apart } = totals;
  const parts = declaredUnits.flatMap((unit) => {
    if (unitHasGaps(totals, unit)) return [];
    const from = compared.before.get(unit);
    const to = compared.after.get(unit);
    if (from === undefined && to === undefined) return [];
    if (from !== undefined && to !== undefined)
      return [measuredCountsChangeWords(from, to, unit)];
    const side = (total: number | undefined) =>
      total === undefined ? "—" : countWords(total, unit);
    return [`${side(from)} → ${side(to)}`];
  });
  const incomplete = declaredUnits.flatMap((unit) => {
    if (!unitHasGaps(totals, unit)) return [];
    const side = (at: "before" | "after") =>
      countObservationWords(
        observedTotalOf(totals, at, unit),
        unit,
        totals.gaps[at].get(unit),
      );
    return [`${side("before")} → ${side("after")}`];
  });
  const completeApart = (at: "before" | "after") =>
    new Map([...apart[at]].filter(([unit]) => !unitHasGaps(totals, unit)));
  const shown = [
    ...parts,
    ...incomplete,
    ...apartWords({
      before: completeApart("before"),
      after: completeApart("after"),
    }),
  ];
  return shown.length === 0
    ? "No overall count: neither compared build has a usable total."
    : shown.join("; ");
}

// Overall count cue from the same totals the summary words use: only units
// both builds have compared totals in.
export function overallCountsCue(
  baseline: ComparisonEndpointProof,
  after: ComparisonEndpointProof,
): CountCue {
  const totals = overallTotalsOf(baseline, after);
  if (totals.kind === "partial") return { kind: "none", reason: "partial" };
  const { compared } = totals;
  return overallCountCueOf(
    declaredUnits.flatMap((unit) => {
      if (unitHasGaps(totals, unit)) return [];
      const from = compared.before.get(unit);
      const to = compared.after.get(unit);
      return from === undefined || to === undefined
        ? []
        : [{ before: from, after: to }];
    }),
  );
}
