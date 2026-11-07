// Scope comparison of a selected story's CI endpoints for Intent Summaries,
// a selected file's Proof (`./IntentFileProof.tsx`), and
// the homepage's entry rows (`./IntentScopeProof.tsx`,
// `./storyCiComparisonEntries.ts`): for one path and each endpoint's proof
// summary, take that scope's figures by `./ciScopeProof.ts` (entry totals at
// the entry's own path; folder and file figures from the file breakdown),
// classify through `./ciScopeComparisonTiming.ts`,
// `./ciScopeComparisonCounts.ts` and `./ciScopeComparisonCues.ts`, and word
// baseline / branch / landed cells and the Counts cell with signed
// differences. A rename reads its baseline at its old path. Summary and file
// use precise duration words; the homepage keeps whole-second words. Parts
// completeness stays from the landed summary (or branch when landed has none).

import {
  countedResultsOfCount,
  countsCellText,
  outsideCountOf,
  scopeEndpointCountOf,
} from "./ciScopeComparisonCounts.ts";
import {
  noComparisonCues,
  scopeComparisonCuesOf,
  type ComparisonAfterSide,
} from "./ciScopeComparisonCues.ts";
import {
  afterCellOf,
  baselineCellOf,
  outsideTimingOf,
  scopeEndpointTimingOf,
  type ComparisonTimingPrecision,
  type ScopeEndpointTiming,
} from "./ciScopeComparisonTiming.ts";
import {
  absentOn,
  partsCellsOf,
  partsForPath,
  presentIn,
  primaryEntryOf,
} from "./ciScopeComparisonPrimary.ts";
import { hasFileBreakdown } from "./ciProofWording.ts";
import { outsideOf, type SummaryChild } from "./ciScopeProof.ts";
import type { ChangeKind } from "./reviewFileTree.ts";
import type {
  ComparisonEndpointProof,
  ComparisonEntryCells,
} from "./storyCiComparisonEntries.ts";

export { primaryProofOf } from "./ciScopeComparisonPrimary.ts";

const notInCompared = { text: "not in the compared builds" };

// Cells for one compared scope path across the three endpoint proofs.
// `baselineLookup` is the path read at baseline (a rename's old path).
// `changeKind` is the story overlay's marker when the path is a story change.
// `afterSide` is the active comparison's after endpoint for cues.
export function scopeComparisonCellsOf(
  path: string,
  baseline: ComparisonEndpointProof,
  branch: ComparisonEndpointProof,
  landed: ComparisonEndpointProof,
  precision: ComparisonTimingPrecision,
  baselineLookup: string = path,
  changeKind?: ChangeKind,
  afterSide: ComparisonAfterSide = "landed",
): ComparisonEntryCells {
  const presentLater = presentIn(branch, path) || presentIn(landed, path);
  const presentInBaseline =
    presentIn(baseline, baselineLookup) || changeKind === "deleted";
  const before = scopeEndpointTimingOf(baseline, baselineLookup);
  const branchTiming = scopeEndpointTimingOf(branch, path);
  const landedTiming = scopeEndpointTimingOf(landed, path);
  const baselineMs = before.kind === "measured" ? before.ms : undefined;
  const beforeCount = scopeEndpointCountOf(baseline, baselineLookup);
  const branchCount = scopeEndpointCountOf(branch, path);
  const landedCount = scopeEndpointCountOf(landed, path);
  const afterCount = afterSide === "landed" ? landedCount : branchCount;
  const afterTiming = afterSide === "landed" ? landedTiming : branchTiming;
  // Never measured in any compared summary — including when one endpoint is
  // still running or unavailable, and when a no-breakdown baseline cannot
  // place a later-trunk file. A removed story file keeps "removed" instead.
  const neverInComparedBuilds =
    changeKind !== "deleted" &&
    [baseline, branch, landed].some((proof) => proof.kind === "summary") &&
    ((absentOn(baseline, before) &&
      absentOn(branch, branchTiming) &&
      absentOn(landed, landedTiming)) ||
      (before.kind === "no-breakdown" &&
        branchTiming.kind === "absent" &&
        absentOn(landed, landedTiming) &&
        changeKind === undefined));
  if (neverInComparedBuilds) {
    return {
      // No measured count at any endpoint — same words as a scope with no
      // CI result, never a signed difference of zeros.
      counts: "no CI result",
      countedResults: undefined,
      ...partsForPath(path, baseline, branch, landed),
      baseline: notInCompared,
      branch: notInCompared,
      landed: notInCompared,
      cues: noComparisonCues,
    };
  }
  const renameNote =
    baselineLookup !== path &&
    (presentIn(baseline, baselineLookup) || before.kind === "measured")
      ? ` (was ${baselineLookup})`
      : "";
  const baselineCell = baselineCellOf(before, presentLater, precision);
  return {
    counts: countsCellText(
      beforeCount,
      branchCount,
      landedCount,
      presentLater,
      presentInBaseline,
      changeKind,
    ),
    countedResults: countedResultsOfCount(afterCount),
    ...partsForPath(path, baseline, branch, landed),
    baseline:
      renameNote === ""
        ? baselineCell
        : { ...baselineCell, text: `${baselineCell.text}${renameNote}` },
    branch: afterCellOf(
      branchTiming,
      baselineMs,
      presentInBaseline,
      precision,
      changeKind,
    ),
    landed: afterCellOf(
      landedTiming,
      baselineMs,
      presentInBaseline,
      precision,
      changeKind,
    ),
    cues: scopeComparisonCuesOf(beforeCount, afterCount, before, afterTiming),
  };
}

// Whether the outside figures exist at an endpoint, measured or not.
const hasTiming = (timing: ScopeEndpointTiming) =>
  timing.kind === "measured" ||
  timing.kind === "partial" ||
  timing.kind === "not-recorded";

// Comparison cells for the Summary's "Not in the rows above" row: each
// endpoint's outside figures under PATH given the same CHILDREN.
export function outsideComparisonCellsOf(
  path: string,
  children: readonly SummaryChild[],
  baseline: ComparisonEndpointProof,
  branch: ComparisonEndpointProof,
  landed: ComparisonEndpointProof,
  precision: ComparisonTimingPrecision,
  afterSide: ComparisonAfterSide = "landed",
): ComparisonEntryCells {
  const before = outsideTimingOf(baseline, path, children);
  const baselineMs = before.kind === "measured" ? before.ms : undefined;
  const branchOutside = outsideTimingOf(branch, path, children);
  const landedOutside = outsideTimingOf(landed, path, children);
  const beforeCount = outsideCountOf(baseline, path, children);
  const branchCount = outsideCountOf(branch, path, children);
  const landedCount = outsideCountOf(landed, path, children);
  const afterCount = afterSide === "landed" ? landedCount : branchCount;
  const afterTiming = afterSide === "landed" ? landedOutside : branchOutside;
  const presentLater = hasTiming(branchOutside) || hasTiming(landedOutside);
  const presentInBaseline = hasTiming(before);
  const primaryEntry = primaryEntryOf(path, baseline, branch, landed);
  const primaryOutside =
    primaryEntry !== undefined && hasFileBreakdown(primaryEntry)
      ? outsideOf(primaryEntry, path, children)
      : undefined;
  return {
    counts: countsCellText(
      beforeCount,
      branchCount,
      landedCount,
      presentLater,
      presentInBaseline,
    ),
    countedResults: countedResultsOfCount(afterCount),
    ...partsCellsOf(primaryEntry, primaryOutside?.figures),
    baseline: baselineCellOf(before, presentLater, precision),
    branch: afterCellOf(
      branchOutside,
      baselineMs,
      presentInBaseline,
      precision,
    ),
    landed: afterCellOf(
      landedOutside,
      baselineMs,
      presentInBaseline,
      precision,
    ),
    cues: scopeComparisonCuesOf(beforeCount, afterCount, before, afterTiming),
  };
}
