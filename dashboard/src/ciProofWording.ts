// Wording of one run attempt's CI proof in Intent's CI status homepage
// (`./IntentCiProof.tsx`) and in a selected entry's or folder's Summary
// (`./IntentScopeProof.tsx`): each row's table cells (`./CiProofTable.tsx`)
// -- its counts with their unit, its cumulative test execution time
// (complete, partial, or not recorded), how many of its entry's declared
// parts are present and each missing or ambiguous part, or part without a
// file breakdown, as a gap. Durations are worded by `./ciProofTimeWords.ts`;
// why no proof can be shown is `./ciProofAbsenceWording.ts`'s. A gap's counts
// are never part of the counts (the collector leaves them out), so the words
// say how many parts were counted. A missing duration is never a measured
// zero. Nothing relies on colour.

import type { CiProofEntry, CiProofFigures, CiProofPart } from "./ciProof.ts";
import { executionTimeWords } from "./ciProofTimeWords.ts";
import type { CiScopeFigures } from "./ciScopeProof.ts";

function joinedAnd(parts: readonly string[]): string {
  if (parts.length <= 1) return parts.join("");
  return `${parts.slice(0, -1).join(", ")} and ${parts.at(-1) ?? ""}`;
}

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

// "1 test" / "3 checks": COUNT of ENTRY's unit, singular for one.
function unitCount(entry: CiProofEntry, count: number): string {
  const unit = entry.unit ?? "results";
  return `${String(count)} ${count === 1 && unit.endsWith("s") ? unit.slice(0, -1) : unit}`;
}

// "2 tests without a duration": counted results whose time is unknown.
const untimedPhrase = (entry: CiProofEntry, untimed: number) =>
  `${unitCount(entry, untimed)} without a duration`;

// "2 of 2 parts present".
function entryParts(entry: CiProofEntry): string {
  const present = entry.parts.filter((part) => part.status === "present");
  const of = entry.parts.length;
  return `${String(present.length)} of ${String(of)} ${of === 1 ? "part" : "parts"} present`;
}

// "part 4 of 12 missing" / "part 2 of 2 has no duration" — one phrasing for
// gaps and for partial execution-time reasons.
function partPhrase(part: CiProofPart, of: number, status: string): string {
  return `part ${String(part.part)} of ${String(of)} ${status}`;
}

// "part 4 of 12 missing", one for each part not counted.
function entryGaps(entry: CiProofEntry): string[] {
  const of = entry.parts.length;
  return entry.parts
    .filter((part) => part.status !== "present")
    .map((part) => partPhrase(part, of, part.status));
}

// The present parts of ENTRY whose fragment was not broken down by file, so
// no scope inside the entry holds their results.
export function partsWithoutBreakdown(
  entry: CiProofEntry,
): readonly CiProofPart[] {
  return entry.parts.filter(
    (part) => part.status === "present" && part.breakdown !== true,
  );
}

// Whether any part of ENTRY was broken down by file.
export const hasFileBreakdown = (entry: CiProofEntry) =>
  entry.parts.some((part) => part.breakdown === true);

// "part 2 of 3 has no file breakdown", one for each such present part.
function breakdownGaps(entry: CiProofEntry): string[] {
  const of = entry.parts.length;
  return partsWithoutBreakdown(entry).map((part) =>
    partPhrase(part, of, "has no file breakdown"),
  );
}

// An entry's cumulative timing: a complete millisecond total when every part
// is present with a duration and no counted result lacks one; otherwise an
// explanation (older summary without durations, partial gaps, or a part
// without a duration). Never invents zero for absence. Story CI comparison
// (`./storyCiComparisonEntries.ts`) uses the same judgment with whole-second
// words.
export type EntryTiming =
  | { readonly kind: "complete"; readonly ms: number }
  | { readonly kind: "explained"; readonly text: string };

export function entryTimingOf(entry: CiProofEntry): EntryTiming {
  const of = entry.parts.length;
  const gaps = entry.parts.filter((part) => part.status !== "present");
  const present = entry.parts.filter((part) => part.status === "present");
  const timed = present.filter((part) => typeof part.durationMs === "number");
  const untimed = present.filter((part) => typeof part.durationMs !== "number");
  const untimedResults = timed.reduce(
    (sum, part) => sum + (part.untimed ?? 0),
    0,
  );
  if (gaps.length === 0 && untimed.length === 0 && untimedResults === 0) {
    const total = timed.reduce((sum, part) => sum + (part.durationMs ?? 0), 0);
    return { kind: "complete", ms: total };
  }
  if (gaps.length === 0 && timed.length === 0) {
    return {
      kind: "explained",
      text: "not recorded: this summary has no test execution durations",
    };
  }
  const named = [
    ...gaps.map((part) => partPhrase(part, of, part.status)),
    ...(timed.length > 0
      ? untimed.map((part) => partPhrase(part, of, "has no duration"))
      : []),
    ...(untimedResults > 0 ? [untimedPhrase(entry, untimedResults)] : []),
  ];
  return { kind: "explained", text: `partial: ${joinedAnd(named)}` };
}

// Cumulative test execution time in an entry's row, under its "Test execution
// time" column.
function entryExecutionTime(entry: CiProofEntry): string {
  const timing = entryTimingOf(entry);
  return timing.kind === "complete"
    ? executionTimeWords(timing.ms)
    : timing.text;
}

// Cumulative test execution time of a scope inside ENTRY: complete only when
// every part is present and broken down by file and every counted result
// recorded a duration; otherwise partial with why, or not recorded when no
// counted result has one.
function scopeExecutionTime(
  entry: CiProofEntry,
  figures: CiScopeFigures,
): string {
  const named = [
    ...entryGaps(entry),
    ...breakdownGaps(entry),
    ...((figures.untimed ?? 0) > 0
      ? [untimedPhrase(entry, figures.untimed ?? 0)]
      : []),
  ];
  if (figures.durationMs === undefined) {
    if (named.length === 0) return "not recorded";
    return (figures.untimed ?? 0) > 0 && named.length === 1
      ? `not recorded: ${named.join("")}`
      : `partial: ${joinedAnd(named)}`;
  }
  return named.length === 0
    ? executionTimeWords(figures.durationMs)
    : `partial: ${joinedAnd(named)}`;
}

// One CI proof table row's cells (`./CiProofTable.tsx`): counts with their
// unit, test execution time, and completeness followed by each gap.
export type CiProofCells = {
  readonly counts: string;
  readonly executionTime: string;
  readonly completeness: string;
  readonly gaps: readonly string[];
};

export function ciProofCellsOf(entry: CiProofEntry): CiProofCells {
  return {
    counts: countsWords(entry, entry),
    executionTime: entryExecutionTime(entry),
    completeness: entryParts(entry),
    gaps: entryGaps(entry),
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
  const parts = {
    completeness: entryParts(entry),
    gaps: [...entryGaps(entry), ...breakdownGaps(entry)],
  };
  if (!hasFileBreakdown(entry)) {
    return {
      counts: noFileBreakdown,
      executionTime: noFileBreakdown,
      ...parts,
    };
  }
  if (figures.files === 0) {
    return { counts: noCiResult, executionTime: noCiResult, ...parts };
  }
  return {
    counts: countsWords(entry, figures),
    executionTime: scopeExecutionTime(entry, figures),
    ...parts,
  };
}

// The cells of a row while no CI proof can be given for it, each saying WHY
// in a word or two ("checking", "no CI proof").
export const ciUnavailableCellsOf = (why: string): CiProofCells => ({
  counts: why,
  executionTime: why,
  completeness: why,
  gaps: [],
});
