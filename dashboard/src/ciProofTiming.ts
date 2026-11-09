// One timing classification for every Intent CI cell: CI status Proof and a
// Summary's single-run rows (`./ciProofWording.ts`) and each story comparison
// endpoint (`./ciScopeComparisonTiming.ts`). The time of one unit's results
// at an entry or scope (`./ciProofUnits.ts`) is measured (milliseconds, a
// measured zero included), partial (each gap named), or not recorded (no
// measured value); one unit's time never adds to another's. A gap reads as a
// short label (`Part 2 untimed`, `Part 3 missing`, `4 test cases untimed`,
// `No timings`) and its full explanation ("part 2 of 3 has no duration")
// stays beside it for assistive technology and hover. Never invents zero
// for absence and never offers a lower bound for partial timing.

import type { CiProofEvidence, CiProofPart } from "./ciProof.ts";
import { unitNoun } from "./ciProofUnits.ts";
import type { CiScopeFigures } from "./ciScopeProof.ts";

type TimingGap = { readonly label: string; readonly phrase: string };

export type CiTiming =
  | { readonly kind: "measured"; readonly ms: number }
  | {
      readonly kind: "partial" | "not-recorded";
      readonly label: string;
      readonly explanation: string;
    };

// A timing cell: the short words it shows, the full explanation when it
// shows a gap label, the measured milliseconds when there are any, and, for
// a story CI comparison's Branch or Landed cell measured at both ends in one
// declared unit, its signed elapsed change from the measured Baseline and,
// when that baseline is positive, the change relative to it.
export type TimingCell = {
  readonly text: string;
  readonly explanation?: string;
  readonly ms?: number;
  readonly changeMs?: number;
  readonly relative?: number;
};

export function joinedAnd(parts: readonly string[]): string {
  if (parts.length <= 1) return parts.join("");
  return `${parts.slice(0, -1).join(", ")} and ${parts.at(-1) ?? ""}`;
}

// "1 test case" / "3 test files": COUNT of EVIDENCE's unit.
function unitCount(evidence: CiProofEvidence, count: number): string {
  return `${String(count)} ${unitNoun(evidence.unit, count)}`;
}

// "part 4 of 12 missing": one phrasing for Parts gaps and timing gaps.
export function partPhrase(part: CiProofPart, of: number, status: string) {
  return `part ${String(part.part)} of ${String(of)} ${status}`;
}

// The present parts of EVIDENCE whose fragment was not broken down by file,
// so no scope inside its entry holds their results.
function partsWithoutBreakdown(
  evidence: CiProofEvidence,
): readonly CiProofPart[] {
  return evidence.parts.filter(
    (part) => part.status === "present" && part.breakdown !== true,
  );
}

const partGap = (
  part: CiProofPart,
  of: number,
  label: string,
  status: string,
): TimingGap => ({
  label: `Part ${String(part.part)} ${label}`,
  phrase: partPhrase(part, of, status),
});

// Each present part of EVIDENCE without a file breakdown, as one gap: label
// `Part 2 no breakdown`, phrase "part 2 of 3 has no file breakdown". The
// timing cell, the Parts gaps (`./ciProofWording.ts`) and a Summary's
// outside labels (`./IntentScopeSummaryRows.tsx`) all read it.
export const noBreakdownGapsOf = (evidence: CiProofEvidence): TimingGap[] =>
  partsWithoutBreakdown(evidence).map((part) =>
    partGap(
      part,
      evidence.parts.length,
      "no breakdown",
      "has no file breakdown",
    ),
  );

// Each missing or ambiguous part of EVIDENCE.
const uncountedGaps = (evidence: CiProofEvidence): TimingGap[] =>
  evidence.parts
    .filter((part) => part.status !== "present")
    .map((part) =>
      partGap(part, evidence.parts.length, part.status, part.status),
    );

const untimedGap = (evidence: CiProofEvidence, untimed: number): TimingGap => ({
  label: `${unitCount(evidence, untimed)} untimed`,
  phrase: `${unitCount(evidence, untimed)} without a duration`,
});

const noTimings = (why: string): CiTiming => ({
  kind: "not-recorded",
  label: "No timings",
  explanation: `Not recorded: ${why}`,
});

function gapTiming(
  kind: "partial" | "not-recorded",
  gaps: readonly TimingGap[],
): CiTiming {
  return {
    kind,
    label: gaps.map((gap) => gap.label).join(", "),
    explanation: `${kind === "partial" ? "Partial" : "Not recorded"}: ${joinedAnd(gaps.map((gap) => gap.phrase))}`,
  };
}

// One unit's cumulative timing at its entry: measured when every part is
// present with a duration and no counted result lacks one; not recorded for
// a summary without durations; otherwise partial with each gap.
export function entryTimingOf(evidence: CiProofEvidence): CiTiming {
  const of = evidence.parts.length;
  const present = evidence.parts.filter((part) => part.status === "present");
  const timed = present.filter((part) => typeof part.durationMs === "number");
  const untimed = present.filter((part) => typeof part.durationMs !== "number");
  const untimedResults = timed.reduce(
    (sum, part) => sum + (part.untimed ?? 0),
    0,
  );
  const uncounted = uncountedGaps(evidence);
  if (uncounted.length === 0 && untimed.length === 0 && untimedResults === 0) {
    const ms = timed.reduce((sum, part) => sum + (part.durationMs ?? 0), 0);
    return { kind: "measured", ms };
  }
  if (uncounted.length === 0 && timed.length === 0)
    return noTimings("this summary has no test execution durations");
  return gapTiming("partial", [
    ...uncounted,
    ...(timed.length > 0
      ? untimed.map((part) => partGap(part, of, "untimed", "has no duration"))
      : []),
    ...(untimedResults > 0 ? [untimedGap(evidence, untimedResults)] : []),
  ]);
}

// Timing of a scope inside an entry with FIGURES of one unit's EVIDENCE, for
// evidence with a file breakdown and a scope holding a CI result: measured
// only when every part is present and broken down by file and every counted
// result recorded a duration; otherwise partial with each gap, or not
// recorded when no counted result has one.
export function scopeTimingOf(
  evidence: CiProofEvidence,
  figures: CiScopeFigures,
): CiTiming {
  const untimed = figures.untimed ?? 0;
  const gaps = [
    ...uncountedGaps(evidence),
    ...noBreakdownGapsOf(evidence),
    ...(untimed > 0 ? [untimedGap(evidence, untimed)] : []),
  ];
  if (figures.durationMs === undefined) {
    if (gaps.length === 0) return noTimings("no counted result has a duration");
    return gapTiming(
      untimed > 0 && gaps.length === 1 ? "not-recorded" : "partial",
      gaps,
    );
  }
  if (gaps.length > 0) return gapTiming("partial", gaps);
  return { kind: "measured", ms: figures.durationMs };
}

// The cell for TIMING, wording a measured value with WORDS.
export function timingCellOf(
  timing: CiTiming,
  words: (ms: number) => string,
): TimingCell {
  return timing.kind === "measured"
    ? { text: words(timing.ms), ms: timing.ms }
    : { text: timing.label, explanation: timing.explanation };
}
