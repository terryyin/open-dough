// Cues agreed across several compared rows or units of Intent's story CI
// comparison (`./ciScopeComparisonCues.ts`): a scope's one cue from its unit
// rows' cues, as the tree shows one control per scope
// (`./intentTreeComparison.ts`), and the overall count cue across units kept
// apart (`./storyCiComparisonCountsWords.ts`). A measure takes the one
// direction every cued row or changed unit agrees on, strong when any is;
// otherwise no cue with why.

import {
  countStrength,
  severalUnits,
  type CountCue,
  type CueStrength,
  type DurationCue,
  type ScopeComparisonCues,
} from "./ciScopeComparisonCues.ts";

const mixedDirections = "mixed directions";

// The one direction every cue of CUED agrees on, strong when any is;
// undefined when they disagree.
function agreedOf<Direction extends string>(
  cued: readonly {
    readonly direction: Direction;
    readonly strength: CueStrength;
  }[],
):
  | { readonly direction: Direction; readonly strength: CueStrength }
  | undefined {
  const [first] = cued;
  if (first === undefined) return undefined;
  if (cued.some(({ direction }) => direction !== first.direction))
    return undefined;
  return {
    direction: first.direction,
    strength: cued.some(({ strength }) => strength === "strong")
      ? "strong"
      : "light",
  };
}

// No cue for several rows with REASONS: their one reason, or several units.
function noCueOf(reasons: readonly string[]): {
  readonly kind: "none";
  readonly reason: string;
} {
  const [first] = reasons;
  return {
    kind: "none",
    reason:
      first !== undefined && reasons.every((reason) => reason === first)
        ? first
        : severalUnits,
  };
}

// One scope's cues from its unit rows' CUES, as the tree shows one control
// per scope: each measure's direction when every cued row agrees on it,
// otherwise no cue with why.
export function combinedCuesOf(
  cues: readonly ScopeComparisonCues[],
): ScopeComparisonCues {
  const counts = cues.map(({ count }) => count);
  const durations = cues.map(({ duration }) => duration);
  const borders = counts.flatMap((cue) => (cue.kind === "border" ? [cue] : []));
  const tints = durations.flatMap((cue) => (cue.kind === "tint" ? [cue] : []));
  const reasons = (all: readonly (CountCue | DurationCue)[]) =>
    all.flatMap((cue) => (cue.kind === "none" ? [cue.reason] : []));
  const border = agreedOf(borders);
  const tint = agreedOf(tints);
  return {
    count:
      borders.length === 0
        ? noCueOf(reasons(counts))
        : border === undefined
          ? { kind: "none", reason: mixedDirections }
          : { kind: "border", ...border },
    duration:
      tints.length === 0
        ? noCueOf(reasons(durations))
        : tint === undefined
          ? { kind: "none", reason: mixedDirections }
          : { kind: "tint", ...tint },
  };
}

// Overall count cue across units kept apart: one direction when every changed
// unit agrees; otherwise no border with why.
export function overallCountCueOf(
  units: readonly { readonly before: number; readonly after: number }[],
): CountCue {
  if (units.length === 0) {
    return { kind: "none", reason: "no overall count" };
  }
  const borders = units.flatMap(({ before, after }) => {
    const delta = after - before;
    if (delta === 0) return [];
    const direction: "fewer" | "more" = delta < 0 ? "fewer" : "more";
    return [{ direction, strength: countStrength(before, delta) }];
  });
  if (borders.length === 0) return { kind: "none", reason: "unchanged" };
  const border = agreedOf(borders);
  return border === undefined
    ? { kind: "none", reason: mixedDirections }
    : { kind: "border", ...border };
}
