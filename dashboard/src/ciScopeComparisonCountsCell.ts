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
  whyNotCompared,
  type CiProofUnit,
} from "./ciProofUnits.ts";
import {
  countWords,
  measuredCountsChangeWords,
  measuredUnitsOf,
  signedCountWords,
  type ScopeEndpointCount,
} from "./ciScopeComparisonCounts.ts";
import {
  afterCountText,
  baselineCountText,
  groupsWords,
  isMeasuredCount,
  measuredCountWords,
  nounAfter,
} from "./ciScopeComparisonEndpointCountWords.ts";
import type { UnitGroup } from "./ciScopeComparisonUnits.ts";
import type { ChangeKind } from "./reviewFileTree.ts";

type CountGroups = {
  readonly before: readonly UnitGroup[] | undefined;
  readonly branch: readonly UnitGroup[] | undefined;
  readonly landed: readonly UnitGroup[] | undefined;
};

// The one declared unit every measured endpoint of COUNTS has, when they
// all have exactly one and it compares; undefined otherwise.
function comparedUnitOf(
  counts: readonly ScopeEndpointCount[],
): CiProofUnit | undefined {
  const measured = counts.filter(isMeasuredCount);
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

function countsChangePhrase(
  before: ScopeEndpointCount,
  after: ScopeEndpointCount,
  presentLater: boolean,
  presentInBaseline: boolean,
  changeKind: ChangeKind | undefined,
  unit: CiProofUnit | undefined,
  beforeGroups?: readonly UnitGroup[],
  afterGroups?: readonly UnitGroup[],
): string {
  if (before.kind === "measured" && after.kind === "measured") {
    return measuredCountsChangeWords(before.total, after.total, after.unit);
  }
  const baselineText =
    before.kind === "measured" && after.kind !== "measured"
      ? countWords(before.total, before.unit)
      : baselineCountText(before, presentLater, beforeGroups);
  const afterText = afterCountText(
    after,
    presentInBaseline,
    changeKind,
    afterGroups,
  );
  // A total keeps its unit even when no later endpoint measured it.
  const noun = nounAfter(after, unit);
  if (baselineText === afterText) return `${afterText}${noun}`;
  return `${baselineText} → ${afterText}${noun}`;
}

// Why the measured endpoints of SHOWN do not compare (`whyNotCompared`).
// Nothing when fewer than two endpoints are measured, as a gap or "—"
// already says why.
function uncomparedReason(shown: readonly ScopeEndpointCount[]): string {
  const measured = shown.filter(isMeasuredCount);
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
  groups?: CountGroups,
): string {
  const words = (
    count: ScopeEndpointCount,
    text: string,
    shown?: readonly UnitGroup[],
  ) => ({
    count,
    text:
      shown !== undefined && shown.length > 0
        ? groupsWords(shown)
        : isMeasuredCount(count)
          ? measuredCountWords(count)
          : text,
    measured: isMeasuredCount(count),
  });
  const baseline = words(
    before,
    baselineCountText(before, presentLater),
    groups?.before,
  );
  const after = (count: ScopeEndpointCount, shown?: readonly UnitGroup[]) =>
    words(count, afterCountText(count, presentInBaseline, changeKind), shown);
  const branchWords = after(branch, groups?.branch);
  const landedWords = after(landed, groups?.landed);
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
  groups?: CountGroups,
): string {
  const unit = comparedUnitOf([before, branch, landed]);
  if (unit === undefined && [before, branch, landed].some(isMeasuredCount))
    return uncomparedCountsText(
      before,
      branch,
      landed,
      presentLater,
      presentInBaseline,
      changeKind,
      groups,
    );
  const phrase = (after: ScopeEndpointCount, shown?: readonly UnitGroup[]) =>
    countsChangePhrase(
      before,
      after,
      presentLater,
      presentInBaseline,
      changeKind,
      unit,
      groups?.before,
      shown,
    );
  const branchText = afterCountText(
    branch,
    presentInBaseline,
    changeKind,
    groups?.branch,
  );
  const landedText = afterCountText(
    landed,
    presentInBaseline,
    changeKind,
    groups?.landed,
  );

  if (
    baselineCountText(before, presentLater, groups?.before) === branchText &&
    branchText === landedText &&
    !(before.kind === "measured" && branch.kind === "measured")
  ) {
    return phrase(branch, groups?.branch);
  }
  if (sameMeasured(branch, landed) || landed.kind !== "measured") {
    if (branch.kind === "measured" || branchText === landedText) {
      return phrase(branch, groups?.branch);
    }
  }
  if (branch.kind === "status" || branch.kind === "checking") {
    return phrase(landed, groups?.landed);
  }
  if (landed.kind === "status" || landed.kind === "checking") {
    return phrase(branch, groups?.branch);
  }
  if (branchText === landedText) {
    return phrase(branch, groups?.branch);
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
  return `${phrase(branch, groups?.branch)} → ${landedText}${nounAfter(landed, unit)}${signed}`;
}
