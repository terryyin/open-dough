// The Counts cell of one compared row (`./ciScopeComparison.ts`) from its
// Baseline, Branch and Landed counts (`./ciScopeComparisonCounts.ts`):
// baseline → after with a signed difference in parentheses for each after
// endpoint measured in the one declared unit Baseline measured
// (`./ciProofUnits.ts`). A gap endpoint shows its gap, an endpoint reporting
// none of the row's units shows "—", and endpoints counting in different
// units, several units, or legacy results show each endpoint with its units
// and why no difference exists, never an invented one.

import type { CiProofUnit } from "./ciProofUnits.ts";
import {
  measuredCountsComparable,
  measuredCountsPairWords,
  observedCountWords,
  signedCountWords,
  type ScopeEndpointCount,
} from "./ciScopeComparisonCounts.ts";
import {
  afterCountText,
  baselineCountText,
  comparedUnitOf,
  isMeasured,
  nounAfter,
  sameMeasured,
  uncomparedCountsText,
  type CountGroups,
} from "./ciScopeComparisonCountEndpoints.ts";
import type { ChangeKind } from "./reviewFileTree.ts";

function countsChangePhrase(
  before: ScopeEndpointCount,
  after: ScopeEndpointCount,
  presentLater: boolean,
  presentInBaseline: boolean,
  changeKind: ChangeKind | undefined,
  unit: CiProofUnit | undefined,
  beforeGroups?: CountGroups["before"],
  afterGroups?: CountGroups["branch"],
): string {
  if (before.kind === "measured" && after.kind === "measured") {
    return measuredCountsPairWords(before, after);
  }
  if (before.kind === "unobserved" || after.kind === "unobserved") {
    const baseline =
      before.kind === "measured" || before.kind === "unobserved"
        ? observedCountWords(before)
        : before.kind === "absent"
          ? "—"
          : baselineCountText(before, presentLater, beforeGroups);
    const later =
      after.kind === "measured" || after.kind === "unobserved"
        ? observedCountWords(after)
        : after.kind === "absent"
          ? "—"
          : afterCountText(after, presentInBaseline, changeKind, afterGroups);
    return baseline === later ? baseline : `${baseline} → ${later}`;
  }
  const baselineText =
    before.kind === "measured" && after.kind !== "measured"
      ? observedCountWords(before)
      : baselineCountText(before, presentLater, beforeGroups);
  const afterText = afterCountText(
    after,
    presentInBaseline,
    changeKind,
    afterGroups,
  );
  // The unit follows only a total an after endpoint measured, so
  // "1 → removed" stays a gap and "added → 1 test case" keeps its unit.
  const noun = nounAfter(after, unit);
  if (baselineText === afterText) return `${afterText}${noun}`;
  return `${baselineText} → ${afterText}${noun}`;
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
  if (unit === undefined && [before, branch, landed].some(isMeasured))
    return uncomparedCountsText(
      before,
      branch,
      landed,
      presentLater,
      presentInBaseline,
      changeKind,
      groups,
    );
  const phrase = (after: ScopeEndpointCount, shown?: CountGroups["branch"]) =>
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
  if (
    sameMeasured(branch, landed) ||
    (landed.kind !== "measured" && landed.kind !== "unobserved")
  ) {
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
    const landedChange = measuredCountsComparable(before, landed)
      ? ` (${signedCountWords(landed.total - before.total)})`
      : "";
    return `${measuredCountsPairWords(before, branch)} → ${observedCountWords(landed)}${landedChange}`;
  }
  // Landed keeps its own difference beside a Branch gap.
  const signed =
    before.kind === "measured" &&
    landed.kind === "measured" &&
    measuredCountsComparable(before, landed)
      ? ` (${signedCountWords(landed.total - before.total)})`
      : "";
  return `${phrase(branch, groups?.branch)} → ${landedText}${nounAfter(landed, unit)}${signed}`;
}
