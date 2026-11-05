// Wording of one run attempt's CI proof in Intent's CI status homepage
// (`./IntentCiProof.tsx`) and in a selected entry's or folder's Summary
// (`./IntentScopeProof.tsx`): each row's table cells (`./CiProofTable.tsx`)
// -- its counts with their unit, its cumulative test execution time
// (complete, partial, or not recorded), how many of its entry's declared
// parts are present and each missing or ambiguous part, or part without a
// file breakdown, as a gap -- and the attempt's CI wall time; why no proof
// can be shown is `./ciProofAbsenceWording.ts`'s. A gap's counts are never part of the counts (the collector
// leaves them out), so the words say how many parts were counted. A missing
// duration is never a measured zero. Nothing relies on colour.

import type { CiProofEntry, CiProofFigures, CiProofPart } from "./ciProof.ts";
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

const minuteMs = 60_000;

// Whole minutes / hours / days for Intent CI wall time. Distinct from
// `./proofDurationWords.ts`, which names file Proof observation durations.
function wholeMinuteWords(ms: number): string {
  const minutes = Math.floor(Math.max(0, ms) / minuteMs);
  if (minutes < 1) return "less than 1 min";
  if (minutes < 60) return `${String(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${String(hours)} h ${String(minutes % 60)} min`;
  return `${String(Math.floor(hours / 24))} d ${String(hours % 24)} h`;
}

// "CI wall time 3 min" from the attempt's start and completion, or not
// recorded with why when either bound is absent. Never from summed durations.
export function ciWallTimeLine(
  startedAt: string | undefined,
  completedAt: string | undefined,
): string {
  const started = startedAt === undefined ? Number.NaN : Date.parse(startedAt);
  const completed =
    completedAt === undefined ? Number.NaN : Date.parse(completedAt);
  if (!Number.isFinite(started) || !Number.isFinite(completed)) {
    return "CI wall time not recorded: this attempt's CI read has no start and completion times.";
  }
  return `CI wall time ${wholeMinuteWords(completed - started)}.`;
}

// Cumulative test execution time, precise enough to tell sub-minute scopes
// apart: "340 ms", "12.5 s", "4 min 5 s", "2 h 3 min". A measured zero is
// "0 ms". CI wall time keeps its whole minutes (`ciWallTimeLine`).
export function executionTimeWords(ms: number): string {
  const rounded = Math.round(Math.max(0, ms));
  if (rounded < 1000) return `${String(rounded)} ms`;
  if (rounded < 59_950) return `${(rounded / 1000).toFixed(1)} s`;
  const seconds = Math.round(rounded / 1000);
  if (seconds < 3600) {
    const rest = seconds % 60;
    return `${String(Math.floor(seconds / 60))} min${rest === 0 ? "" : ` ${String(rest)} s`}`;
  }
  return wholeMinuteWords(rounded);
}

// Cumulative test execution time in an entry's row, under its "Test execution
// time" column: complete when every part is present with a duration and no
// counted result lacks one; not recorded when every present part lacks one
// and there is no gap (an older summary); otherwise partial from the entry's
// parts — gaps, present parts without a duration when another part recorded
// one, and counted results without a duration within timed parts. Never
// invents zero for absence.
function entryExecutionTime(entry: CiProofEntry): string {
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
    return executionTimeWords(total);
  }
  if (gaps.length === 0 && timed.length === 0) {
    return "not recorded: this summary has no test execution durations";
  }
  const named = [
    ...gaps.map((part) => partPhrase(part, of, part.status)),
    ...(timed.length > 0
      ? untimed.map((part) => partPhrase(part, of, "has no duration"))
      : []),
    ...(untimedResults > 0 ? [untimedPhrase(entry, untimedResults)] : []),
  ];
  return `partial: ${joinedAnd(named)}`;
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
