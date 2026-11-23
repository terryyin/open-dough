// Scope rows for Intent's Baseline and Selection pair. Both endpoints use
// the same declared-unit interpretation as the whole-story comparison.
import type { SelectedComparisonEndpointProofs } from "./ciComparisonProofs.ts";
import { joinedAnd, type TimingCell } from "./ciProofTiming.ts";
import { comparableUnits, unitName, whyNotCompared } from "./ciProofUnits.ts";
import {
  afterCountText,
  baselineCountText,
} from "./ciScopeComparisonCountEndpoints.ts";
import {
  countedResultsOfCount,
  measuredCountsComparable,
  measuredCountsPairWords,
  measuredUnitsOf,
  observedCountWords,
  type ScopeEndpointCount,
} from "./ciScopeComparisonCounts.ts";
import { scopeComparisonCuesOf } from "./ciScopeComparisonCues.ts";
import { selectionPartsForPath } from "./ciScopeComparisonPrimary.ts";
import { baselineRowCellOf } from "./ciScopeComparisonRow.ts";
import { afterCellOf } from "./ciScopeComparisonTiming.ts";
import {
  comparedRowsOf,
  rowEndpointOf,
  scopeEndpointUnitsOf,
  showsResults,
  type RowEndpoint,
} from "./ciScopeComparisonUnits.ts";
import type { ChangeKind } from "./reviewFileTree.ts";
import type { ComparisonEntryCells } from "./storyCiComparisonEntries.ts";

export type SelectionScopeComparisonRow = Omit<
  ComparisonEntryCells,
  "branch" | "landed"
> & { readonly selection: TimingCell };

export function selectionScopeComparisonRowsOf(
  path: string,
  proofs: SelectedComparisonEndpointProofs,
  baselineLookup: string = path,
  changeKind?: ChangeKind,
): readonly SelectionScopeComparisonRow[] {
  const baseline = scopeEndpointUnitsOf(proofs.baseline, baselineLookup);
  const selection = scopeEndpointUnitsOf(proofs.selection, path);
  const presentLater = showsResults(selection);
  const presentBefore = showsResults(baseline) || changeKind === "deleted";
  const renamedFrom =
    baselineLookup !== path && showsResults(baseline)
      ? baselineLookup
      : undefined;
  return comparedRowsOf(baseline, selection).map((row) => {
    const before = rowEndpointOf(baseline, row);
    const after = rowEndpointOf(selection, row);
    const counts = selectionCountsOf(
      before,
      after,
      presentLater,
      presentBefore,
      changeKind,
    );
    return {
      counts,
      countedResults:
        countedResultsOfCount(after.count) ??
        countedResultsOfCount(before.count),
      baseline: baselineRowCellOf(before, presentLater, "precise", renamedFrom),
      selection: afterCellOf(
        after.timing,
        before.timing,
        presentBefore,
        "precise",
        changeKind,
      ),
      ...selectionPartsForPath(
        path,
        baselineLookup,
        row.units,
        proofs.baseline,
        proofs.selection,
      ),
      cues: scopeComparisonCuesOf(
        before.count,
        after.count,
        before.timing,
        after.timing,
      ),
      ...(row.units === undefined
        ? {}
        : { units: joinedAnd(row.units.map(unitName)) }),
      ...(changeKind === undefined ? {} : { change: changeKind }),
    };
  });
}

function selectionCountsOf(
  before: RowEndpoint,
  after: RowEndpoint,
  presentLater: boolean,
  presentBefore: boolean,
  changeKind: ChangeKind | undefined,
): string {
  const left = before.count;
  const right = after.count;
  if (left.kind === "absent" && right.kind === "absent") return "no CI result";
  if (
    left.kind === "measured" &&
    right.kind === "measured" &&
    comparableUnits(left.unit, right.unit) &&
    measuredCountsComparable(left, right)
  ) {
    return measuredCountsPairWords(left, right);
  }
  const baseline =
    left.kind === "measured" || left.kind === "unobserved"
      ? observedCountWords(left)
      : baselineCountText(left, presentLater, before.groups);
  const selection =
    right.kind === "measured" || right.kind === "unobserved"
      ? observedCountWords(right)
      : afterCountText(right, presentBefore, changeKind, after.groups);
  const leftUnits = measuredUnitsOf(left);
  const rightUnits = measuredUnitsOf(right);
  const compared = leftUnits.some((unit) =>
    rightUnits.some((other) => comparableUnits(unit, other)),
  );
  const unitReason =
    leftUnits.length > 0 && rightUnits.length > 0 && !compared
      ? ` (${whyNotCompared([...leftUnits, ...rightUnits])})`
      : "";
  return `${observation("Baseline", left, baseline)} · ${observation("Selection", right, selection)}${unitReason}`;
}

function observation(
  endpoint: "Baseline" | "Selection",
  count: ScopeEndpointCount,
  words: string,
): string {
  return count.kind === "measured" ||
    count.kind === "unobserved" ||
    count.kind === "units"
    ? `${words} at ${endpoint}`
    : `${endpoint} · ${words}`;
}
