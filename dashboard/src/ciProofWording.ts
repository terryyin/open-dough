// Wording of one run attempt's CI proof in Intent's CI status homepage
// (`./IntentCiProof.tsx`): each entry's table cells (`./CiProofTable.tsx`) --
// its counts with their unit, that entry's cumulative test execution time
// (complete, partial, or not recorded), how many of its declared parts are
// present and each missing or ambiguous part as a gap -- the attempt's CI
// wall time, and why no proof can be shown. A gap's counts are never part of
// the entry's counts (the collector leaves them out), so the words say how
// many parts were counted. Nothing relies on colour.

import type {
  CiProofEntry,
  CiProofPart,
  CiProofUnavailableReason,
} from "./ciProof.ts";

function joinedAnd(parts: readonly string[]): string {
  if (parts.length <= 1) return parts.join("");
  return `${parts.slice(0, -1).join(", ")} and ${parts.at(-1) ?? ""}`;
}

// "19 passed and 1 failed tests": every nonzero outcome, then the unit.
function entryCounts(entry: CiProofEntry): string {
  if (entry.unit === null) return "nothing counted";
  const counted = (
    [
      ["passed", entry.passed],
      ["failed", entry.failed],
      ["other", entry.other],
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

const unavailableLines: Readonly<Record<CiProofUnavailableReason, string>> = {
  none: "This run published no CI proof summary.",
  expired: "This run's CI proof summary has expired.",
  unreadable: "This run's CI proof summary could not be read.",
  invalid: "This run's CI proof summary is not a valid summary.",
  mismatched:
    "This run's CI proof summary is for another run, attempt or revision.",
};

// The one line under Proof saying why no proof can be shown, with what the
// reason observed when it says more.
export function unavailableLine(
  reason: CiProofUnavailableReason,
  detail: string | undefined,
): string {
  const line = unavailableLines[reason];
  return detail === undefined ? line : `${line} ${sentence(detail)}`;
}

// `text` ending with one full stop.
const sentence = (text: string) => (text.endsWith(".") ? text : `${text}.`);

const adapterUnavailableLines: Readonly<
  Record<CiProofUnavailableReason, string>
> = {
  none: "This attempt's CI adapter gave no CI proof summary",
  expired: "This attempt's CI proof summary has expired",
  unreadable: "This attempt's CI adapter answered no proof read",
  invalid: "This attempt's CI proof summary is not a valid summary",
  mismatched:
    "This attempt's CI proof summary is for another repository, attempt or revision",
};

// The one line under Proof saying why a ciAdapter attempt shows no proof,
// with what the adapter or the summary said: the adapter's own reason is
// shown as it gave it.
export function adapterUnavailableLine(
  reason: CiProofUnavailableReason,
  detail: string | undefined,
): string {
  return withDetail(adapterUnavailableLines[reason], detail);
}

// The dashboard's own read failed before any adapter answer reached the tab.
export function adapterReadFailedLine(detail: string | undefined): string {
  return withDetail("This attempt's CI proof could not be read", detail);
}

function withDetail(line: string, detail: string | undefined): string {
  return detail === undefined ? `${line}.` : `${line}: ${sentence(detail)}`;
}

// Another discovered attempt names the shown attempt's attemptId at its
// revision, so no adapter is asked which one a summary is of.
export function ambiguousAttemptLine(
  attemptId: string,
  revision: string,
): string {
  return `This attempt is ambiguous at its revision: another discovered attempt is also attempt ${attemptId} at ${revision}.`;
}

export const noRunLine =
  "No completed GitHub Actions run is shown, so there is no CI proof to show.";

// A ciAdapter project's tab shows no completed attempt.
export const noAttemptLine =
  "No completed CI attempt is shown, so there is no CI proof to show.";

const minuteMs = 60_000;

// Whole minutes / hours / days for Intent CI wall time and entry test
// execution time. Distinct from `./proofDurationWords.ts`, which names file
// Proof observation durations in ms / fractional seconds.
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

// Cumulative test execution time in an entry's row, under its "Test execution
// time" column: complete when every part is present with a duration; not
// recorded when every present part lacks one and there is no gap (an older
// summary); otherwise partial from the entry's parts — gaps, and present
// parts without a duration when another part recorded one. Never invents zero
// for absence.
function entryExecutionTime(entry: CiProofEntry): string {
  const of = entry.parts.length;
  const gaps = entry.parts.filter((part) => part.status !== "present");
  const present = entry.parts.filter((part) => part.status === "present");
  const timed = present.filter((part) => typeof part.durationMs === "number");
  const untimed = present.filter((part) => typeof part.durationMs !== "number");
  if (gaps.length === 0 && untimed.length === 0) {
    const total = timed.reduce((sum, part) => sum + (part.durationMs ?? 0), 0);
    return wholeMinuteWords(total);
  }
  if (gaps.length === 0 && timed.length === 0) {
    return "not recorded: this summary has no test execution durations";
  }
  const named = [
    ...gaps.map((part) => partPhrase(part, of, part.status)),
    ...(timed.length > 0
      ? untimed.map((part) => partPhrase(part, of, "has no duration"))
      : []),
  ];
  return `partial: ${joinedAnd(named)}`;
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
    counts: entryCounts(entry),
    executionTime: entryExecutionTime(entry),
    completeness: entryParts(entry),
    gaps: entryGaps(entry),
  };
}
