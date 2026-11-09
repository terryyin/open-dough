// Timing of one compared row of a scope path at one comparison endpoint
// (`./ciScopeComparison.ts`): the endpoint's read state, the one timing
// classification (`./ciProofTiming.ts`) of the scope's figures
// (`./ciScopeProof.ts`) in the row's unit, several units' timings kept
// apart, never added (`./ciProofUnits.ts`), or what stands in for a time,
// classified per unit by `./ciScopeComparisonUnits.ts`; and baseline and
// after cells worded for precise or whole-second Summary and homepage
// wording (`./ciProofTimeWords.ts`). Every comparison depth takes its after
// cells from here: one shows its signed change from a measured baseline
// (`./storyCiRelativeChange.ts`) only in the same declared unit, and
// otherwise its own time with no change.

import {
  executionTimeDifferenceWords,
  executionTimeWords,
  wholeSecondDifferenceWords,
  wholeSecondWords,
} from "./ciProofTimeWords.ts";
import {
  timingCellOf,
  type CiTiming,
  type TimingCell,
} from "./ciProofTiming.ts";
import {
  comparableUnits,
  unitName,
  type CiEntryEvidence,
  type CiProofUnit,
} from "./ciProofUnits.ts";
import type { RowEndpointGap } from "./ciScopeComparisonEndpoint.ts";
import type { ChangeKind } from "./reviewFileTree.ts";
import { timeChangeOf } from "./storyCiRelativeChange.ts";

export type ComparisonTimingPrecision = "precise" | "whole-second";

// One unit's timing at a scope.
export type UnitTiming = CiTiming & { readonly unit: CiProofUnit };

export type ScopeEndpointTiming =
  | RowEndpointGap
  | UnitTiming
  // Several units' timings at the scope, kept apart.
  | { readonly kind: "units"; readonly timings: readonly UnitTiming[] };

const noFileBreakdown = "no file breakdown";

// What a row shows for an endpoint reporting none of its units' results.
export const unreportedWords = "—";

// TIMING of EVIDENCE's results, in their unit.
export const unitTimingOf = (
  evidence: CiEntryEvidence,
  timing: CiTiming,
): UnitTiming => ({ ...timing, unit: evidence.unit });

function timingWords(precision: ComparisonTimingPrecision): {
  readonly value: (ms: number) => string;
  readonly difference: (ms: number) => string;
} {
  return precision === "precise"
    ? {
        value: executionTimeWords,
        difference: executionTimeDifferenceWords,
      }
    : {
        value: wholeSecondWords,
        difference: wholeSecondDifferenceWords,
      };
}

// Several units' times in one cell, each named by its unit, with no single
// measured value: "1.2 s (test cases); 300 ms (test files)".
function unitsCellOf(
  timings: readonly UnitTiming[],
  words: (ms: number) => string,
): TimingCell {
  const cells = timings.map((timing) => ({
    unit: unitName(timing.unit),
    cell: timingCellOf(timing, words),
  }));
  const explained = cells.filter(({ cell }) => cell.explanation !== undefined);
  return {
    text: cells.map(({ unit, cell }) => `${cell.text} (${unit})`).join("; "),
    ...(explained.length === 0
      ? {}
      : {
          explanation: explained
            .map(({ unit, cell }) => `${unit}: ${cell.explanation ?? ""}`)
            .join("; "),
        }),
  };
}

export function baselineCellOf(
  timing: ScopeEndpointTiming,
  presentLater: boolean,
  precision: ComparisonTimingPrecision,
): TimingCell {
  const words = timingWords(precision).value;
  if (timing.kind === "checking") return { text: "…" };
  if (timing.kind === "status") return { text: timing.text };
  if (timing.kind === "no-breakdown") return { text: noFileBreakdown };
  if (timing.kind === "absent") return { text: presentLater ? "added" : "—" };
  if (timing.kind === "unreported") return { text: unreportedWords };
  if (timing.kind === "units") return unitsCellOf(timing.timings, words);
  return timingCellOf(timing, words);
}

// A Branch or Landed cell: its read state, added or removed, no results in
// the row's units, several units' times kept apart, or one unit's time,
// measured as its signed change from the BASELINE timing when that is
// measured in the same declared unit; otherwise (no measured baseline,
// another unit, legacy results, a timing gap) as it is, with no change,
// relative mark or change to sort by.
export function afterCellOf(
  timing: ScopeEndpointTiming,
  baseline: ScopeEndpointTiming,
  presentInBaseline: boolean,
  precision: ComparisonTimingPrecision,
  changeKind?: ChangeKind,
): TimingCell {
  const words = timingWords(precision);
  if (timing.kind === "checking") return { text: "…" };
  if (timing.kind === "status") return { text: timing.text };
  if (timing.kind === "no-breakdown") return { text: noFileBreakdown };
  if (timing.kind === "absent") {
    return {
      text: changeKind === "deleted" || presentInBaseline ? "removed" : "added",
    };
  }
  if (timing.kind === "unreported") return { text: unreportedWords };
  if (timing.kind === "units") return unitsCellOf(timing.timings, words.value);
  if (
    timing.kind !== "measured" ||
    baseline.kind !== "measured" ||
    !comparableUnits(baseline.unit, timing.unit)
  )
    return timingCellOf(timing, words.value);
  return {
    ...timeChangeOf(baseline.ms, timing.ms, words.difference),
    ms: timing.ms,
  };
}
