// Classification of one compared row's count and duration change for
// Intent's story CI comparison cues (`./ciScopeComparison.ts`): direction,
// strength, or no-cue with a reason, from the same endpoint counts and
// timings the wording classifiers produce, only between figures of one
// declared unit (`./ciProofUnits.ts`). The overall summary, entry table,
// Summary rows and file Proof all consume this one result; cues agreed
// across several rows or units, such as the tree's one control per scope,
// are `./ciScopeComparisonAgreedCues.ts`'s.

import { comparableUnits } from "./ciProofUnits.ts";
import type { ScopeEndpointCount } from "./ciScopeComparisonCounts.ts";
import type { ScopeEndpointTiming } from "./ciScopeComparisonTiming.ts";
import type { ActiveComparedEndpoint } from "./storyCiComparisonWording.ts";

export type CueStrength = "light" | "strong";

export type CountCue =
  | { readonly kind: "none"; readonly reason: string }
  | {
      readonly kind: "border";
      readonly direction: "fewer" | "more";
      readonly strength: CueStrength;
    };

export type DurationCue =
  | { readonly kind: "none"; readonly reason: string }
  | {
      readonly kind: "tint";
      readonly direction: "faster" | "slower";
      readonly strength: CueStrength;
    };

export type ScopeComparisonCues = {
  readonly count: CountCue;
  readonly duration: DurationCue;
};

// Which after endpoint the active comparison uses for cues (Landed when it
// has proof, otherwise Branch — including Provisional).
export type ComparisonAfterSide = "branch" | "landed";

export function comparisonAfterSideOf(
  endpoint: ActiveComparedEndpoint,
): ComparisonAfterSide {
  return endpoint === "Landed" ? "landed" : "branch";
}

const strongShare = 0.5;
const durationTintShare = 0.1;
const durationTintFloorMs = 1_000;

export function countStrength(before: number, delta: number): CueStrength {
  if (!(before > 0)) return "light";
  return Math.abs(delta) / before >= strongShare ? "strong" : "light";
}

function durationStrength(beforeMs: number, deltaMs: number): CueStrength {
  if (!(beforeMs > 0)) return "light";
  return Math.abs(deltaMs) / beforeMs >= strongShare ? "strong" : "light";
}

export const severalUnits = "several units";
const unitsNotComparable = "units not comparable";
const unitNotReported = "unit not reported";

function countUnavailableReason(count: ScopeEndpointCount): string | undefined {
  if (count.kind === "checking") return "still reading";
  if (count.kind === "status") return count.text;
  if (count.kind === "no-breakdown") return "no file breakdown";
  if (count.kind === "nothing") return "nothing counted";
  if (count.kind === "unreported") return unitNotReported;
  if (count.kind === "units") return severalUnits;
  return undefined;
}

function timingUnavailableReason(
  timing: ScopeEndpointTiming,
): string | undefined {
  if (timing.kind === "checking") return "still reading";
  if (timing.kind === "status") return timing.text;
  if (timing.kind === "no-breakdown") return "no file breakdown";
  if (timing.kind === "unreported") return unitNotReported;
  if (timing.kind === "units") return severalUnits;
  if (timing.kind === "partial") return "partial";
  if (timing.kind === "not-recorded") return "not recorded";
  return undefined;
}

// Count cue: any measured change shows; strong at ≥50% of the baseline count.
// Added, removed, gap, or unmeasured sides take no border.
export function countCueOf(
  before: ScopeEndpointCount,
  after: ScopeEndpointCount,
): CountCue {
  const beforeGap = countUnavailableReason(before);
  if (beforeGap !== undefined) return { kind: "none", reason: beforeGap };
  const afterGap = countUnavailableReason(after);
  if (afterGap !== undefined) return { kind: "none", reason: afterGap };
  if (before.kind === "absent" && after.kind === "absent") {
    return { kind: "none", reason: "not in the compared builds" };
  }
  if (before.kind === "absent") return { kind: "none", reason: "added" };
  if (after.kind === "absent") return { kind: "none", reason: "removed" };
  if (before.kind !== "measured" || after.kind !== "measured") {
    return { kind: "none", reason: "no comparable count" };
  }
  if (!comparableUnits(before.unit, after.unit)) {
    return { kind: "none", reason: unitsNotComparable };
  }
  const delta = after.total - before.total;
  if (delta === 0) return { kind: "none", reason: "unchanged" };
  return {
    kind: "border",
    direction: delta < 0 ? "fewer" : "more",
    strength: countStrength(before.total, delta),
  };
}

// Duration cue: tint only for comparable measured durations both sides; no
// tint under 10% of baseline or under 1 s; strong at ≥50%; a measured zero
// baseline gets at most the light tint.
export function durationCueOf(
  before: ScopeEndpointTiming,
  after: ScopeEndpointTiming,
): DurationCue {
  const beforeGap = timingUnavailableReason(before);
  if (beforeGap !== undefined) return { kind: "none", reason: beforeGap };
  const afterGap = timingUnavailableReason(after);
  if (afterGap !== undefined) return { kind: "none", reason: afterGap };
  if (before.kind === "absent" && after.kind === "absent") {
    return { kind: "none", reason: "not in the compared builds" };
  }
  if (before.kind === "absent") return { kind: "none", reason: "added" };
  if (after.kind === "absent") return { kind: "none", reason: "removed" };
  if (before.kind !== "measured" || after.kind !== "measured") {
    return { kind: "none", reason: "no comparable duration" };
  }
  if (!comparableUnits(before.unit, after.unit)) {
    return { kind: "none", reason: unitsNotComparable };
  }
  return measuredDurationCueOf(before.ms, after.ms);
}

// The tint between two measured durations, BEFORE_MS and AFTER_MS.
function measuredDurationCueOf(beforeMs: number, afterMs: number): DurationCue {
  const delta = afterMs - beforeMs;
  if (delta === 0) return { kind: "none", reason: "unchanged" };
  if (beforeMs === 0) {
    return {
      kind: "tint",
      direction: delta < 0 ? "faster" : "slower",
      strength: "light",
    };
  }
  const share = Math.abs(delta) / beforeMs;
  if (share < durationTintShare || Math.abs(delta) < durationTintFloorMs) {
    return { kind: "none", reason: "below threshold" };
  }
  return {
    kind: "tint",
    direction: delta < 0 ? "faster" : "slower",
    strength: durationStrength(beforeMs, delta),
  };
}

export function scopeComparisonCuesOf(
  beforeCount: ScopeEndpointCount,
  afterCount: ScopeEndpointCount,
  beforeTiming: ScopeEndpointTiming,
  afterTiming: ScopeEndpointTiming,
): ScopeComparisonCues {
  return {
    count: countCueOf(beforeCount, afterCount),
    duration: durationCueOf(beforeTiming, afterTiming),
  };
}

export const noComparisonCues: ScopeComparisonCues = {
  count: { kind: "none", reason: "not in the compared builds" },
  duration: { kind: "none", reason: "not in the compared builds" },
};

export function overallDurationCueOf(
  beforeMs: number | undefined,
  afterMs: number | undefined,
): DurationCue {
  if (beforeMs === undefined || afterMs === undefined) {
    return { kind: "none", reason: "no comparable duration" };
  }
  return measuredDurationCueOf(beforeMs, afterMs);
}
