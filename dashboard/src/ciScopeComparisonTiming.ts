// Timing of one scope path inside one comparison endpoint proof
// (`./ciScopeComparison.ts`): the endpoint's read state, or the one timing
// classification (`./ciProofTiming.ts`) of that scope's figures
// (`./ciScopeProof.ts`) in its unit, or several units' timings kept apart,
// never added (`./ciProofUnits.ts`); and baseline and after cells worded for
// precise or whole-second Summary and homepage wording
// (`./ciProofTimeWords.ts`). Every comparison depth takes its after cells
// from here: one shows its signed change from a measured baseline
// (`./storyCiRelativeChange.ts`) only in the same declared unit, and
// otherwise its own time with no change.

import {
  executionTimeDifferenceWords,
  executionTimeWords,
  wholeSecondDifferenceWords,
  wholeSecondWords,
} from "./ciProofTimeWords.ts";
import {
  entryTimingOf,
  scopeTimingOf,
  timingCellOf,
  type CiTiming,
  type TimingCell,
} from "./ciProofTiming.ts";
import {
  comparableUnits,
  hasFileBreakdown,
  unitName,
  type CiEntryEvidence,
  type CiProofUnit,
} from "./ciProofUnits.ts";
import {
  entryOutsidesOf,
  noResultsKindOf,
  owningEntryOf,
  unitResultsAt,
  unitsWithResults,
  type UnitResults,
  type SummaryChild,
} from "./ciScopeProof.ts";
import { endpointProofReadOf } from "./ciScopeComparisonEndpoint.ts";
import type { ChangeKind } from "./reviewFileTree.ts";
import type { ComparisonEndpointProof } from "./storyCiComparisonEntries.ts";
import { timeChangeOf } from "./storyCiRelativeChange.ts";

export type ComparisonTimingPrecision = "precise" | "whole-second";

// One unit's timing at a scope.
export type UnitTiming = CiTiming & { readonly unit: CiProofUnit };

export type ScopeEndpointTiming =
  | { readonly kind: "checking" }
  | { readonly kind: "status"; readonly text: string }
  | { readonly kind: "no-breakdown" }
  | { readonly kind: "absent" }
  | UnitTiming
  // Several units' timings at the scope, kept apart.
  | { readonly kind: "units"; readonly timings: readonly UnitTiming[] };

const noFileBreakdown = "no file breakdown";

const unitTimingOf = (
  evidence: CiEntryEvidence,
  timing: CiTiming,
): UnitTiming => ({ ...timing, unit: evidence.unit });

// One unit's timing, several units' timings kept apart, or, without any,
// OTHERWISE.
function timingOfUnits(
  timings: readonly UnitTiming[],
  otherwise: ScopeEndpointTiming,
): ScopeEndpointTiming {
  const [only] = timings;
  if (only === undefined) return otherwise;
  return timings.length === 1 ? only : { kind: "units", timings };
}

// The timing SHOWN at a scope (`unitResultsAt`) for each unit with results
// there (`unitsWithResults`): its entry timing at its entry's path, even
// without a file breakdown, else its scope timing; without any, why not.
function timingOfShown(shown: readonly UnitResults[]): ScopeEndpointTiming {
  return timingOfUnits(
    unitsWithResults(shown).map(({ evidence, figures }) =>
      unitTimingOf(
        evidence,
        figures === undefined
          ? entryTimingOf(evidence)
          : scopeTimingOf(evidence, figures),
      ),
    ),
    { kind: noResultsKindOf(shown) },
  );
}

// One path's timing inside one endpoint proof. LOOKUP is the path read in
// that summary (a rename's old path at baseline).
export function scopeEndpointTimingOf(
  proof: ComparisonEndpointProof,
  lookup: string,
): ScopeEndpointTiming {
  const read = endpointProofReadOf(proof);
  if (read.kind !== "summary") return read;
  const entry = owningEntryOf(read.entries, lookup);
  if (entry === undefined) return { kind: "absent" };
  return timingOfShown(unitResultsAt(entry, lookup));
}

export function outsideTimingOf(
  proof: ComparisonEndpointProof,
  path: string,
  children: readonly SummaryChild[],
): ScopeEndpointTiming {
  const read = endpointProofReadOf(proof);
  if (read.kind !== "summary") return read;
  const entry = owningEntryOf(read.entries, path);
  if (entry === undefined) return { kind: "absent" };
  if (!entry.evidence.some(hasFileBreakdown)) return { kind: "no-breakdown" };
  return timingOfUnits(
    entryOutsidesOf(entry, path, children).map(({ evidence, outside }) =>
      unitTimingOf(evidence, scopeTimingOf(evidence, outside.figures)),
    ),
    { kind: "absent" },
  );
}

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
  if (timing.kind === "units") return unitsCellOf(timing.timings, words);
  return timingCellOf(timing, words);
}

// A Branch or Landed cell: its read state, added or removed, several units'
// times kept apart, or one unit's time, measured as its signed change from
// the BASELINE timing when that is measured in the same declared unit;
// otherwise (no measured baseline, another unit, legacy results, a timing
// gap) as it is, with no change, relative mark or change to sort by.
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
