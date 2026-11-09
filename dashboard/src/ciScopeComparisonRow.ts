// The cells of one compared row of a scope (`./ciScopeComparison.ts`): each
// endpoint's count and timing in the row's units
// (`./ciScopeComparisonUnits.ts`) worded as Baseline / Branch / Landed cells
// (`./ciScopeComparisonTiming.ts`), a Counts cell
// (`./ciScopeComparisonCountsCell.ts`) and cues
// (`./ciScopeComparisonCues.ts`) that differ only between figures of one
// declared unit (`./ciProofUnits.ts`), with the row's units named.

import { joinedAnd } from "./ciProofTiming.ts";
import { unitName } from "./ciProofUnits.ts";
import {
  countedResultsOfCount,
  type ScopeEndpointCount,
} from "./ciScopeComparisonCounts.ts";
import { countsCellText } from "./ciScopeComparisonCountsCell.ts";
import {
  scopeComparisonCuesOf,
  type ComparisonAfterSide,
} from "./ciScopeComparisonCues.ts";
import {
  afterCellOf,
  baselineCellOf,
  type ComparisonTimingPrecision,
} from "./ciScopeComparisonTiming.ts";
import {
  rowEndpointOf,
  showsResults,
  type ComparedRow,
  type EndpointUnits,
} from "./ciScopeComparisonUnits.ts";
import type { ChangeKind } from "./reviewFileTree.ts";
import type { ComparisonEntryCells } from "./storyCiComparisonEntries.ts";

// What each endpoint shows of the scope.
export type ScopeEndpoints = {
  readonly before: EndpointUnits;
  readonly branch: EndpointUnits;
  readonly landed: EndpointUnits;
};

// What one row's cells are worded with, besides its endpoints.
export type RowContext = {
  readonly precision: ComparisonTimingPrecision;
  readonly afterSide: ComparisonAfterSide;
  readonly changeKind?: ChangeKind;
  // Said after Baseline's own figures: " (was tests/old.sh)".
  readonly renameNote?: string;
  readonly parts: (
    row: ComparedRow,
  ) => Pick<ComparisonEntryCells, "completeness" | "gaps">;
};

// Whether COUNT holds the scope's results in the row's units.
const holdsResults = (count: ScopeEndpointCount) =>
  count.kind !== "unreported" && count.kind !== "absent";

// The cells of ROW across ENDPOINTS: the scope was there later when a later
// endpoint holds it, and before when Baseline holds it or the story removed
// it.
export function rowCellsOf(
  row: ComparedRow,
  endpoints: ScopeEndpoints,
  context: RowContext,
): ComparisonEntryCells {
  const { precision, changeKind } = context;
  const presentLater =
    showsResults(endpoints.branch) || showsResults(endpoints.landed);
  const presentInBaseline =
    showsResults(endpoints.before) || changeKind === "deleted";
  const before = rowEndpointOf(endpoints.before, row);
  const branch = rowEndpointOf(endpoints.branch, row);
  const landed = rowEndpointOf(endpoints.landed, row);
  const after = context.afterSide === "landed" ? landed : branch;
  const baselineCell = baselineCellOf(before.timing, presentLater, precision);
  const renameNote =
    context.renameNote !== undefined && holdsResults(before.count)
      ? context.renameNote
      : "";
  return {
    counts: countsCellText(
      before.count,
      branch.count,
      landed.count,
      presentLater,
      presentInBaseline,
      changeKind,
    ),
    countedResults: countedResultsOfCount(after.count),
    ...context.parts(row),
    baseline:
      renameNote === ""
        ? baselineCell
        : { ...baselineCell, text: `${baselineCell.text}${renameNote}` },
    branch: afterCellOf(
      branch.timing,
      before.timing,
      presentInBaseline,
      precision,
      changeKind,
    ),
    landed: afterCellOf(
      landed.timing,
      before.timing,
      presentInBaseline,
      precision,
      changeKind,
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
}
