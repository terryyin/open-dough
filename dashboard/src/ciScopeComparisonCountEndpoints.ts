// Endpoint wording and selection for Intent's Counts cell: retain each
// observation's unit and evidence gaps, classify absent/unreported endpoints,
// and choose readable endpoints when their units cannot be compared.

import {
  comparableUnits,
  unitNoun,
  whyNotCompared,
  type CiProofUnit,
} from "./ciProofUnits.ts";
import {
  countHasGaps,
  formatTotal,
  measuredUnitsOf,
  observedCountWords,
  type MeasuredCount,
  type ScopeEndpointCount,
} from "./ciScopeComparisonCounts.ts";
import { unreportedWords } from "./ciScopeComparisonTiming.ts";
import type { ChangeKind } from "./reviewFileTree.ts";

const noFileBreakdown = "no file breakdown";

export const isMeasured = (count: ScopeEndpointCount) =>
  count.kind === "measured" || count.kind === "units";

// "5 test cases and 1 test file": a measured endpoint's totals with their
// units.
function measuredWords(count: MeasuredCount | ScopeEndpointCount): string {
  if (count.kind === "measured" || count.kind === "unobserved")
    return observedCountWords(count);
  if (count.kind === "units")
    return count.counts.map(measuredWords).join(" and ");
  return "";
}

// An endpoint's words in a Counts cell, ABSENT standing in where the
// endpoint holds no result for the scope.
function endpointCountText(count: ScopeEndpointCount, absent: string): string {
  if (count.kind === "checking") return "…";
  if (count.kind === "status") return count.text;
  if (count.kind === "no-breakdown") return noFileBreakdown;
  if (count.kind === "absent") return absent;
  if (count.kind === "unreported") return unreportedWords;
  if (count.kind === "nothing") return "nothing counted";
  if (count.kind === "unobserved") return observedCountWords(count);
  if (count.kind === "units") return measuredWords(count);
  return countHasGaps(count)
    ? observedCountWords(count)
    : formatTotal(count.total);
}

// Baseline's words: a scope only a later endpoint holds was added.
export const baselineCountText = (
  count: ScopeEndpointCount,
  presentLater: boolean,
): string => endpointCountText(count, presentLater ? "added" : "—");

// An after endpoint's words: where it lacks the scope, removed when the
// scope was deleted or the baseline held it, and added otherwise.
export const afterCountText = (
  count: ScopeEndpointCount,
  presentInBaseline: boolean,
  changeKind?: ChangeKind,
): string =>
  endpointCountText(
    count,
    changeKind === "deleted" || presentInBaseline ? "removed" : "added",
  );

// The one declared unit every measured endpoint of COUNTS has, when they
// all have exactly one and it compares; undefined otherwise.
export function comparedUnitOf(
  counts: readonly ScopeEndpointCount[],
): CiProofUnit | undefined {
  const measured = counts.filter(isMeasured);
  const [first] = measured;
  if (first?.kind !== "measured") return undefined;
  return measured.every(
    (count) =>
      count.kind === "measured" && comparableUnits(first.unit, count.unit),
  )
    ? first.unit
    : undefined;
}

export function sameMeasured(
  left: ScopeEndpointCount,
  right: ScopeEndpointCount,
): boolean {
  return (
    left.kind === "measured" &&
    right.kind === "measured" &&
    left.total === right.total &&
    left.unit === right.unit &&
    JSON.stringify(left.gaps) === JSON.stringify(right.gaps)
  );
}

// " test cases" after AFTER's total in UNIT; nothing for a gap.
export function nounAfter(
  after: ScopeEndpointCount,
  unit: CiProofUnit | undefined,
): string {
  return after.kind === "measured" && !countHasGaps(after) && unit !== undefined
    ? ` ${unitNoun(unit, after.total)}`
    : "";
}

// Why the measured endpoints of SHOWN do not compare (`whyNotCompared`).
// Nothing when fewer than two endpoints are measured, as a gap or "—"
// already says why.
function uncomparedReason(shown: readonly ScopeEndpointCount[]): string {
  const measured = shown.filter(isMeasured);
  if (measured.length < 2) return "";
  return ` (${whyNotCompared(measured.flatMap(measuredUnitsOf))})`;
}

// A Counts cell whose measured endpoints count in different units, several
// units, or legacy results, which never compare: each endpoint in its own
// words with its units, after endpoints chosen as a compared cell chooses
// them, and why there is no difference.
export function uncomparedCountsText(
  before: ScopeEndpointCount,
  branch: ScopeEndpointCount,
  landed: ScopeEndpointCount,
  presentLater: boolean,
  presentInBaseline: boolean,
  changeKind: ChangeKind | undefined,
): string {
  const words = (count: ScopeEndpointCount, text: string) => ({
    count,
    text: isMeasured(count) ? measuredWords(count) : text,
    measured: isMeasured(count),
  });
  const baseline = words(before, baselineCountText(before, presentLater));
  const after = (count: ScopeEndpointCount) =>
    words(count, afterCountText(count, presentInBaseline, changeKind));
  const branchWords = after(branch);
  const landedWords = after(landed);
  const shownAfter =
    branch.kind === "checking" || branch.kind === "status"
      ? [landedWords]
      : landed.kind === "checking" ||
          landed.kind === "status" ||
          branchWords.text === landedWords.text ||
          !landedWords.measured
        ? [branchWords]
        : [branchWords, landedWords];
  // A repeated gap is said once; a repeated total is kept, since it is
  // not compared.
  const shown = [baseline, ...shownAfter].filter(
    (one, at, all) =>
      at === 0 || one.measured || all[at - 1]?.text !== one.text,
  );
  return `${shown.map(({ text }) => text).join(" → ")}${uncomparedReason(shown.map(({ count }) => count))}`;
}
