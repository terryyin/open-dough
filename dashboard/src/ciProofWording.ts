// Wording of one run attempt's CI proof in Intent's CI status homepage
// (`./IntentCiProof.tsx`) and in a selected entry's or folder's Summary
// (`./IntentScopeProof.tsx`): each row's table cells (`./CiProofTable.tsx`)
// -- its counts with their unit, its cumulative test execution time
// (measured, partial, or not recorded), how many of its entry's declared
// parts are present and each missing or ambiguous part, or part without a
// file breakdown, as a gap. Timing is classified by `./ciProofTiming.ts` and
// durations are worded by `./ciProofTimeWords.ts`;
// why no proof can be shown is `./ciProofAbsenceWording.ts`'s. A gap's counts
// are never part of the counts (the collector leaves them out), so the words
// say how many parts were counted. A missing duration is never a measured
// zero. Nothing relies on colour.

import type { CiProofEntry, CiProofFigures } from "./ciProof.ts";
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
import type { CiScopeFigures } from "./ciScopeProof.ts";

// "19 passed and 1 failed tests": every nonzero outcome of FIGURES, then
// ENTRY's unit.
function countsWords(entry: CiProofEntry, figures: CiProofFigures): string {
  if (entry.unit === null) return "nothing counted";
  const counted = (
    [
      ["passed", figures.passed],
      ["failed", figures.failed],
      ["other", figures.other],
    ] as const
  )
    .filter(([, value]) => value > 0)
    .map(([outcome, value]) => `${String(value)} ${outcome}`);
  return counted.length === 0
    ? `no ${entry.unit}`
    : `${joinedAnd(counted)} ${entry.unit}`;
}

// "2 of 2 parts present".
function entryParts(entry: CiProofEntry): string {
  const present = entry.parts.filter((part) => part.status === "present");
  const of = entry.parts.length;
  return `${String(present.length)} of ${String(of)} ${of === 1 ? "part" : "parts"} present`;
}

// "part 4 of 12 missing", one for each part not counted.
function entryGaps(entry: CiProofEntry): string[] {
  const of = entry.parts.length;
  return entry.parts
    .filter((part) => part.status !== "present")
    .map((part) => partPhrase(part, of, part.status));
}

// Whether any part of ENTRY was broken down by file.
export const hasFileBreakdown = (entry: CiProofEntry) =>
  entry.parts.some((part) => part.breakdown === true);

// "part 2 of 3 has no file breakdown", one for each such present part.
const breakdownGaps = (entry: CiProofEntry): string[] =>
  noBreakdownGapsOf(entry).map((gap) => gap.phrase);

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

// One CI proof table row's cells (`./CiProofTable.tsx`): counts with their
// unit, test execution time, and completeness followed by each gap, with the
// counted results and the number of gaps beside their words for sorting
// (none when the row has no such figure).
export type CiProofCells = {
  readonly counts: string;
  readonly countedResults: CountedResults | undefined;
  readonly executionTime: TimingCell;
  readonly completeness: string;
  readonly gaps: readonly string[];
  readonly gapCount: number | undefined;
};

export function ciProofCellsOf(entry: CiProofEntry): CiProofCells {
  const gaps = entryGaps(entry);
  return {
    counts: countsWords(entry, entry),
    countedResults: countedResultsOf(entry),
    executionTime: executionTimeCell(entryTimingOf(entry)),
    completeness: entryParts(entry),
    gaps,
    gapCount: gaps.length,
  };
}

const noCiResult = "no CI result";
const noFileBreakdown = "no file breakdown";

// The cells of a scope inside ENTRY with FIGURES (`CiScopeFigures`): no CI
// result when no file matched, and no file breakdown when no part of the
// entry published one, never a zero; its parts cell also names each part
// without a file breakdown, whose results no scope inside the entry holds.
export function ciScopeCellsOf(
  entry: CiProofEntry,
  figures: CiScopeFigures,
): CiProofCells {
  const gaps = [...entryGaps(entry), ...breakdownGaps(entry)];
  const parts = {
    completeness: entryParts(entry),
    gaps,
    gapCount: gaps.length,
  };
  if (!hasFileBreakdown(entry)) {
    return {
      counts: noFileBreakdown,
      countedResults: undefined,
      executionTime: { text: noFileBreakdown },
      ...parts,
    };
  }
  if (figures.files === 0) {
    return {
      counts: noCiResult,
      countedResults: undefined,
      executionTime: { text: noCiResult },
      ...parts,
    };
  }
  return {
    counts: countsWords(entry, figures),
    countedResults: countedResultsOf(figures),
    executionTime: executionTimeCell(scopeTimingOf(entry, figures)),
    ...parts,
  };
}

// The cells of a row while no CI proof can be given for it, each saying WHY
// in a word or two ("checking", "no CI proof").
export const ciUnavailableCellsOf = (why: string): CiProofCells => ({
  counts: why,
  countedResults: undefined,
  executionTime: { text: why },
  completeness: why,
  gaps: [],
  gapCount: undefined,
});
