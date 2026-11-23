// Scope rows for Intent's Baseline and Selection pair. Both endpoints use
// the same declared-unit interpretation as the whole-story comparison.
import type { SelectedComparisonEndpointProofs } from "./ciComparisonProofs.ts";
import { joinedAnd } from "./ciProofTiming.ts";
import { unitName } from "./ciProofUnits.ts";
import {
  afterCountText,
  baselineCountText,
  comparedUnitOf,
  isMeasured,
} from "./ciScopeComparisonCountEndpoints.ts";
import {
  countedResultsOfCount,
  differentUnitsCountSuffix,
  measuredCountsComparable,
  measuredCountsPairWords,
  observedCountWords,
  type ScopeEndpointCount,
} from "./ciScopeComparisonCounts.ts";
import { scopeComparisonCuesOf } from "./ciScopeComparisonCues.ts";
import {
  selectionOutsideParts,
  selectionPartsForPath,
} from "./ciScopeComparisonPrimary.ts";
import { baselineRowCellOf } from "./ciScopeComparisonRow.ts";
import { afterCellOf } from "./ciScopeComparisonTiming.ts";
import {
  comparedRowsOf,
  outsideEndpointUnitsOf,
  rowEndpointOf,
  scopeEndpointUnitsOf,
  showsResults,
  type ComparedRow,
  type EndpointUnits,
  type RowEndpoint,
} from "./ciScopeComparisonUnits.ts";
import type { ChangeKind } from "./reviewFileTree.ts";
import type { SummaryChild } from "./ciScopeProof.ts";
import type { SelectionScopeComparisonRow } from "./storyCiComparisonEntries.ts";

export function selectionScopeComparisonRowsOf(
  path: string,
  proofs: SelectedComparisonEndpointProofs,
  baselineLookup: string = path,
  changeKind?: ChangeKind,
): readonly SelectionScopeComparisonRow[] {
  const baseline = scopeEndpointUnitsOf(proofs.baseline, baselineLookup);
  const selection = scopeEndpointUnitsOf(proofs.selection, path);
  return selectionRowsOf(baseline, selection, {
    renamedFrom: baselineLookup !== path ? baselineLookup : undefined,
    changeKind,
    parts: ({ units }) =>
      selectionPartsForPath(
        path,
        baselineLookup,
        units,
        proofs.baseline,
        proofs.selection,
      ),
  });
}

export function selectionOutsideComparisonRowsOf(
  path: string,
  children: readonly SummaryChild[],
  proofs: SelectedComparisonEndpointProofs,
): readonly SelectionScopeComparisonRow[] {
  return selectionRowsOf(
    outsideEndpointUnitsOf(proofs.baseline, path, children),
    outsideEndpointUnitsOf(proofs.selection, path, children),
    {
      parts: ({ units }) =>
        selectionOutsideParts(
          path,
          children,
          units,
          proofs.baseline,
          proofs.selection,
        ),
    },
  );
}

function selectionRowsOf(
  baseline: EndpointUnits,
  selection: EndpointUnits,
  {
    renamedFrom,
    changeKind,
    parts,
  }: {
    readonly renamedFrom?: string | undefined;
    readonly changeKind?: ChangeKind | undefined;
    readonly parts: (
      row: ComparedRow,
    ) => Pick<SelectionScopeComparisonRow, "completeness" | "gaps">;
  },
): readonly SelectionScopeComparisonRow[] {
  const presentLater = showsResults(selection);
  const presentBefore = showsResults(baseline) || changeKind === "deleted";
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
      baseline: baselineRowCellOf(
        before,
        presentLater,
        "precise",
        showsResults(baseline) ? renamedFrom : undefined,
      ),
      selection: afterCellOf(
        after.timing,
        before.timing,
        presentBefore,
        "precise",
        changeKind,
      ),
      ...parts(row),
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
  const counts = [left, right];
  const unit = comparedUnitOf(counts);
  if (
    left.kind === "measured" &&
    right.kind === "measured" &&
    unit !== undefined &&
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
  const unitReason =
    counts.every(isMeasured) && unit === undefined
      ? differentUnitsCountSuffix
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
