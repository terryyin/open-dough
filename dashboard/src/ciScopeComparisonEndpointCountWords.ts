// One endpoint's words in a comparison Counts cell. Its selected unit groups
// retain each declared unit beside a gap or a total; Baseline and after roles
// supply the words for an absent scope. The comparison phrase and differences
// belong to `./ciScopeComparisonCountsCell.ts`.

import { unitName, unitNoun, type CiProofUnit } from "./ciProofUnits.ts";
import { noFileBreakdownOf, nothingCountedAs } from "./ciProofWording.ts";
import {
  countWords,
  formatTotal,
  type ScopeEndpointCount,
} from "./ciScopeComparisonCounts.ts";
import { unreportedWords } from "./ciScopeComparisonTiming.ts";
import type { UnitGroup } from "./ciScopeComparisonUnits.ts";
import type { ChangeKind } from "./reviewFileTree.ts";

// Unit identity belongs to each endpoint even when it measured no total.
function groupWords({ unit, count }: UnitGroup): string {
  if (count.kind === "measured") return countWords(count.total, unit);
  if (count.kind === "nothing") return nothingCountedAs(unit);
  if (count.kind === "no-breakdown") return noFileBreakdownOf(unit);
  return `${count.text} (${unitName(unit)})`;
}

export const groupsWords = (groups: readonly UnitGroup[]): string =>
  groups.map(groupWords).join(" and ");

export const isMeasuredCount = (count: ScopeEndpointCount): boolean =>
  count.kind === "measured" || count.kind === "units";

// "5 test cases and 1 test file": a measured endpoint's totals with their
// units.
export function measuredCountWords(count: ScopeEndpointCount): string {
  if (count.kind === "measured") return countWords(count.total, count.unit);
  if (count.kind === "units")
    return count.counts.map(measuredCountWords).join(" and ");
  return "";
}

// An endpoint's words in a Counts cell, ABSENT standing in where the
// endpoint holds no result for the scope.
function endpointCountText(
  count: ScopeEndpointCount,
  absent: string,
  groups?: readonly UnitGroup[],
): string {
  if (groups !== undefined && groups.length > 0 && !isMeasuredCount(count))
    return groupsWords(groups);
  if (count.kind === "checking") return "…";
  if (count.kind === "status") return count.text;
  if (count.kind === "no-breakdown") return noFileBreakdownOf(undefined);
  if (count.kind === "absent") return absent;
  if (count.kind === "unreported") return unreportedWords;
  if (count.kind === "nothing") return "nothing counted";
  if (count.kind === "units") return measuredCountWords(count);
  return formatTotal(count.total);
}

// Baseline's words: a scope only a later endpoint holds was added.
export const baselineCountText = (
  count: ScopeEndpointCount,
  presentLater: boolean,
  groups?: readonly UnitGroup[],
): string => endpointCountText(count, presentLater ? "added" : "—", groups);

// An after endpoint's words: where it lacks the scope, removed when the
// scope was deleted or the baseline held it, and added otherwise.
export const afterCountText = (
  count: ScopeEndpointCount,
  presentInBaseline: boolean,
  changeKind?: ChangeKind,
  groups?: readonly UnitGroup[],
): string =>
  endpointCountText(
    count,
    changeKind === "deleted" || presentInBaseline ? "removed" : "added",
    groups,
  );

// " test cases" after AFTER's total in UNIT; nothing for a gap.
export function nounAfter(
  after: ScopeEndpointCount,
  unit: CiProofUnit | undefined,
): string {
  return after.kind === "measured" && unit !== undefined
    ? ` ${unitNoun(unit, after.total)}`
    : "";
}
