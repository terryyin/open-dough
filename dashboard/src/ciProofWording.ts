// Wording of one run attempt's CI proof in Intent's CI status homepage
// (`./IntentCiProof.tsx`) and in a selected entry's or folder's Summary
// (`./IntentScopeProof.tsx`): each homepage row is one declared entry
// (`./ciProofEntryCells.ts`); when it reports several units they stay as
// labeled lines of that unit's own counts and time, never summed. A Summary's
// table cells (`./CiProofTable.tsx`) still show one unit's results
// (`./ciProofUnits.ts`): counts naming that unit (test cases, test files or
// legacy test results) and cumulative test execution time (measured, partial,
// or not recorded). The selected scope's own figures also show how many of
// that unit's declared parts are present and any gaps. Timing is classified
// by `./ciProofTiming.ts` and durations are worded by `./ciProofTimeWords.ts`;
// why no proof can be shown is `./ciProofAbsenceWording.ts`'s. A gap's counts
// are never part of the counts (the collector leaves them out), so the words
// say how many parts were counted. A missing duration is never a measured
// zero. Nothing relies on colour.

import type {
  CiProofEntry,
  CiProofEvidence,
  CiProofFigures,
} from "./ciProof.ts";
import {
  entryTimingOf,
  joinedAnd,
  noBreakdownGapsOf,
  partPhrase,
  scopeTimingOf,
  timingCellOf,
  type CiTiming,
  type TimingCell,
} from "./ciProofTiming.ts";
import { executionTimeWords } from "./ciProofTimeWords.ts";
import {
  countedAny,
  hasFileBreakdown,
  namesUnits,
  unitName,
  unitNoun,
  type CiProofUnit,
} from "./ciProofUnits.ts";
import {
  unitResultsAt,
  type CiScopeFigures,
  type UnitResults,
} from "./ciScopeProof.ts";

// "nothing counted", naming the publisher's declared UNIT when known:
// "nothing counted as test files".
export const nothingCountedAs = (unit: CiProofUnit | undefined): string =>
  unit === undefined
    ? "nothing counted"
    : `nothing counted as ${unitName(unit)}`;

const nothingCountedWords = (evidence: CiProofEvidence): string =>
  nothingCountedAs(evidence.unit === "legacy" ? undefined : evidence.unit);

// "19 passed and 1 failed test cases": every nonzero outcome of FIGURES,
// then EVIDENCE's unit, singular for one result.
function countsWords(
  evidence: CiProofEvidence,
  figures: CiProofFigures,
): string {
  if (!countedAny(evidence)) return nothingCountedWords(evidence);
  const counted = (
    [
      ["passed", figures.passed],
      ["failed", figures.failed],
      ["other", figures.other],
    ] as const
  )
    .filter(([, value]) => value > 0)
    .map(([outcome, value]) => `${String(value)} ${outcome}`);
  const total = figures.passed + figures.failed + figures.other;
  return counted.length === 0
    ? `no ${unitName(evidence.unit)}`
    : `${joinedAnd(counted)} ${unitNoun(evidence.unit, total)}`;
}

// "2 of 2 parts present".
function entryParts(evidence: CiProofEvidence): string {
  const present = evidence.parts.filter((part) => part.status === "present");
  const of = evidence.parts.length;
  return `${String(present.length)} of ${String(of)} ${of === 1 ? "part" : "parts"} present`;
}

// "part 4 of 12 missing", one for each part not counted.
function entryGaps(evidence: CiProofEvidence): string[] {
  const of = evidence.parts.length;
  return evidence.parts
    .filter((part) => part.status !== "present")
    .map((part) => partPhrase(part, of, part.status));
}

// "part 2 of 3 has no file breakdown", one for each such present part.
const breakdownGaps = (evidence: CiProofEvidence): string[] =>
  noBreakdownGapsOf(evidence).map((gap) => gap.phrase);

// Cumulative test execution time in an entry's or scope's row, under its
// "Test execution time" column (`./ciProofTiming.ts`).
const executionTimeCell = (timing: CiTiming) =>
  timingCellOf(timing, executionTimeWords);

// The counted results a Counts cell words, as its column sorts them
// (`./ciProofSort.ts`): how many, and how many of them failed.
export type CountedResults = {
  readonly total: number;
  readonly failed: number;
};

export const countedResultsOf = (figures: CiProofFigures): CountedResults => ({
  total: figures.passed + figures.failed + figures.other,
  failed: figures.failed,
});

// One unit's figures inside an entry's Proof row when that entry reports
// several (`unitLines`): its own counts and time, never summed with another.
export type CiProofUnitLine = {
  readonly unit: CiProofUnit;
  readonly counts: string;
  readonly countedResults: CountedResults | undefined;
  readonly executionTime: TimingCell;
};

// One CI proof table row's cells (`./CiProofTable.tsx`): counts with their
// unit, test execution time, and completeness followed by each gap, with the
// counted results and the number of gaps beside their words for sorting
// (none when the row has no such figure). An entry that reports several
// units carries each as `unitLines` instead of one combined count or time.
export type CiProofCells = {
  readonly counts: string;
  readonly countedResults: CountedResults | undefined;
  readonly executionTime: TimingCell;
  readonly completeness: string;
  readonly gaps: readonly string[];
  readonly unitLines?: readonly CiProofUnitLine[];
};

export function ciProofCellsOf(evidence: CiProofEvidence): CiProofCells {
  const gaps = entryGaps(evidence);
  return {
    counts: countsWords(evidence, evidence),
    countedResults: countedResultsOf(evidence),
    executionTime: executionTimeCell(entryTimingOf(evidence)),
    completeness: entryParts(evidence),
    gaps,
  };
}

const noCiResult = "no CI result";

// "no file breakdown", naming UNIT when given, as beside another unit's
// results: "no file breakdown of test files".
export const noFileBreakdownOf = (unit: CiProofUnit | undefined): string =>
  unit === undefined
    ? "no file breakdown"
    : `no file breakdown of ${unitName(unit)}`;

// The cells of a scope inside an entry with FIGURES (`CiScopeFigures`) of one
// unit's EVIDENCE: no CI result when no breakdown path matched, and no file
// breakdown when no part of that unit published one, never a zero, its unit
// NAMED beside another unit's results. Parts completeness also names each
// part without a file breakdown, whose results no scope inside the entry
// holds.
export function ciScopeCellsOf(
  evidence: CiProofEvidence,
  figures: CiScopeFigures,
  named = false,
): CiProofCells {
  const gaps = [...entryGaps(evidence), ...breakdownGaps(evidence)];
  const parts = {
    completeness: entryParts(evidence),
    gaps,
  };
  if (!hasFileBreakdown(evidence)) {
    const words = noFileBreakdownOf(named ? evidence.unit : undefined);
    return {
      counts: words,
      countedResults: undefined,
      executionTime: { text: words },
      ...parts,
    };
  }
  if (figures.paths === 0) {
    return {
      counts: noCiResult,
      countedResults: undefined,
      executionTime: { text: noCiResult },
      ...parts,
    };
  }
  return {
    counts: countsWords(evidence, figures),
    countedResults: countedResultsOf(figures),
    executionTime: executionTimeCell(scopeTimingOf(evidence, figures)),
    ...parts,
  };
}

// The cells of one unit's results as shown at a scope (`UnitResults`):
// its entry's totals at the entry's path, else the scope's figures, its unit
// NAMED in a gap beside another unit's results.
export const unitResultsCellsOf = (
  evidence: CiProofEvidence,
  figures: CiScopeFigures | undefined,
  named = false,
): CiProofCells =>
  figures === undefined
    ? ciProofCellsOf(evidence)
    : ciScopeCellsOf(evidence, figures, named);

// Each unit's results ENTRY shows at SCOPE (`unitResultsAt`) with their
// cells, a gap naming its unit when ENTRY reports several.
export type UnitCells = UnitResults & { readonly cells: CiProofCells };

export function unitCellsAt(
  entry: CiProofEntry,
  scope: string,
): readonly UnitCells[] {
  const named = namesUnits(entry);
  return unitResultsAt(entry, scope).map((shown) => ({
    ...shown,
    cells: unitResultsCellsOf(shown.evidence, shown.figures, named),
  }));
}

// The cells of a row while no CI proof can be given for it, each saying WHY
// in a word or two ("checking", "no CI proof").
export const ciUnavailableCellsOf = (why: string): CiProofCells => ({
  counts: why,
  countedResults: undefined,
  executionTime: { text: why },
  completeness: why,
  gaps: [],
});
