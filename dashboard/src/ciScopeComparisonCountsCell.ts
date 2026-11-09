// The Counts cell of one compared row (`./ciScopeComparison.ts`) from its
// Baseline, Branch and Landed counts (`./ciScopeComparisonCounts.ts`):
// baseline → after with a signed difference in parentheses for each after
// endpoint measured in the one declared unit Baseline measured
// (`./ciProofUnits.ts`). A gap endpoint shows its gap, an endpoint reporting
// none of the row's units shows "—", and endpoints counting in different
// units, several units, or legacy results show each endpoint with its units
// and why no difference exists, never an invented one.

import {
  comparableUnits,
  unitNoun,
  whyNotCompared,
  type CiProofUnit,
} from "./ciProofUnits.ts";
import {
  countWords,
  formatTotal,
  measuredCountsChangeWords,
  measuredUnitsOf,
  signedCountWords,
  type MeasuredCount,
  type ScopeEndpointCount,
} from "./ciScopeComparisonCounts.ts";
import { unreportedWords } from "./ciScopeComparisonTiming.ts";
import type { ChangeKind } from "./reviewFileTree.ts";

const noFileBreakdown = "no file breakdown";

const isMeasured = (count: ScopeEndpointCount) =>
  count.kind === "measured" || count.kind === "units";

// "5 test cases and 1 test file": a measured endpoint's totals with their
// units.
function measuredWords(count: MeasuredCount | ScopeEndpointCount): string {
  if (count.kind === "measured") return countWords(count.total, count.unit);
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
  if (count.kind === "units") return measuredWords(count);
  return formatTotal(count.total);
}

// Baseline's words: a scope only a later endpoint holds was added.
const baselineCountText = (
  count: ScopeEndpointCount,
  presentLater: boolean,
): string => endpointCountText(count, presentLater ? "added" : "—");

// An after endpoint's words: where it lacks the scope, removed when the
// scope was deleted or the baseline held it, and added otherwise.
const afterCountText = (
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
function comparedUnitOf(
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

function sameMeasured(
  left: ScopeEndpointCount,
  right: ScopeEndpointCount,
): boolean {
  return (
    left.kind === "measured" &&
    right.kind === "measured" &&
    left.total === right.total &&
    left.unit === right.unit
  );
}

// " test cases" after AFTER's total in UNIT; nothing for a gap.
function nounAfter(
  after: ScopeEndpointCount,
  unit: CiProofUnit | undefined,
): string {
  return after.kind === "measured" && unit !== undefined
    ? ` ${unitNoun(unit, after.total)}`
    : "";
}

function countsChangePhrase(
  before: ScopeEndpointCount,
  after: ScopeEndpointCount,
  presentLater: boolean,
  presentInBaseline: boolean,
  changeKind: ChangeKind | undefined,
  unit: CiProofUnit | undefined,
): string {
  if (before.kind === "measured" && after.kind === "measured") {
    return measuredCountsChangeWords(before.total, after.total, after.unit);
  }
  const baselineText = baselineCountText(before, presentLater);
  const afterText = afterCountText(after, presentInBaseline, changeKind);
  // The unit follows only a total an after endpoint measured, so
  // "1 → removed" stays a gap and "added → 1 test case" keeps its unit.
  const noun = nounAfter(after, unit);
  if (baselineText === afterText) return `${afterText}${noun}`;
  return `${baselineText} → ${afterText}${noun}`;
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
function uncomparedCountsText(
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

// One Counts cell: baseline → after with signed differences when both sides
// are measured in one declared unit; a gap endpoint shows its gap, and
// endpoints that do not compare show their units and why, never an invented
// difference.
export function countsCellText(
  before: ScopeEndpointCount,
  branch: ScopeEndpointCount,
  landed: ScopeEndpointCount,
  presentLater: boolean,
  presentInBaseline: boolean,
  changeKind?: ChangeKind,
): string {
  const unit = comparedUnitOf([before, branch, landed]);
  if (unit === undefined && [before, branch, landed].some(isMeasured))
    return uncomparedCountsText(
      before,
      branch,
      landed,
      presentLater,
      presentInBaseline,
      changeKind,
    );
  const phrase = (after: ScopeEndpointCount) =>
    countsChangePhrase(
      before,
      after,
      presentLater,
      presentInBaseline,
      changeKind,
      unit,
    );
  const branchText = afterCountText(branch, presentInBaseline, changeKind);
  const landedText = afterCountText(landed, presentInBaseline, changeKind);

  if (
    baselineCountText(before, presentLater) === branchText &&
    branchText === landedText &&
    !(before.kind === "measured" && branch.kind === "measured")
  ) {
    return phrase(branch);
  }
  if (sameMeasured(branch, landed) || landed.kind !== "measured") {
    if (branch.kind === "measured" || branchText === landedText) {
      return phrase(branch);
    }
  }
  if (branch.kind === "status" || branch.kind === "checking") {
    return phrase(landed);
  }
  if (landed.kind === "status" || landed.kind === "checking") {
    return phrase(branch);
  }
  if (branchText === landedText) {
    return phrase(branch);
  }
  if (
    before.kind === "measured" &&
    branch.kind === "measured" &&
    landed.kind === "measured"
  ) {
    return `${measuredCountsChangeWords(before.total, branch.total, branch.unit)} → ${countWords(landed.total, landed.unit)} (${signedCountWords(landed.total - before.total)})`;
  }
  // Landed keeps its own difference beside a Branch gap.
  const signed =
    before.kind === "measured" && landed.kind === "measured"
      ? ` (${signedCountWords(landed.total - before.total)})`
      : "";
  return `${phrase(branch)} → ${landedText}${nounAfter(landed, unit)}${signed}`;
}
