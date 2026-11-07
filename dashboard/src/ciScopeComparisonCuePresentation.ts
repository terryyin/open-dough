// DOM class names and data attributes for Intent CI comparison cues
// (`./ciScopeComparisonCues.ts`, `./intent-ci-cues.css`): one place for the
// overall summary lines and comparison table rows.

import type {
  CountCue,
  DurationCue,
  ScopeComparisonCues,
} from "./ciScopeComparisonCues.ts";

export function countCueAttr(cue: CountCue): string {
  return cue.kind === "none" ? "none" : `${cue.direction}-${cue.strength}`;
}

export function durationCueAttr(cue: DurationCue): string {
  return cue.kind === "none" ? "none" : `${cue.direction}-${cue.strength}`;
}

export function countCueClass(cue: CountCue): string | undefined {
  return cue.kind === "border"
    ? `intent-ci-cue-count-${cue.direction}-${cue.strength}`
    : undefined;
}

export function durationCueClass(cue: DurationCue): string | undefined {
  return cue.kind === "tint"
    ? `intent-ci-cue-duration-${cue.direction}-${cue.strength}`
    : undefined;
}

export type CueDataAttrs = {
  readonly className?: string;
  readonly "data-ci-count-cue"?: string;
  readonly "data-ci-duration-cue"?: string;
  readonly "data-ci-count-cue-reason"?: string;
  readonly "data-ci-duration-cue-reason"?: string;
};

// DOM attrs for one overall summary line that shows only a count or duration cue.
export function countCueElementAttrs(
  cue: CountCue,
  baseClass: string,
): CueDataAttrs {
  const cueClass = countCueClass(cue);
  return {
    className: cueClass === undefined ? baseClass : `${baseClass} ${cueClass}`,
    "data-ci-count-cue": countCueAttr(cue),
    ...(cue.kind === "none" ? { "data-ci-count-cue-reason": cue.reason } : {}),
  };
}

export function durationCueElementAttrs(
  cue: DurationCue,
  baseClass: string,
): CueDataAttrs {
  const cueClass = durationCueClass(cue);
  return {
    className: cueClass === undefined ? baseClass : `${baseClass} ${cueClass}`,
    "data-ci-duration-cue": durationCueAttr(cue),
    ...(cue.kind === "none"
      ? { "data-ci-duration-cue-reason": cue.reason }
      : {}),
  };
}

// DOM attrs for one comparison table row that may carry both cues.
export function scopeCueRowAttrs(cues: ScopeComparisonCues): CueDataAttrs {
  const classes = [
    countCueClass(cues.count),
    durationCueClass(cues.duration),
  ].filter((name): name is string => name !== undefined);
  return {
    ...(classes.length === 0 ? {} : { className: classes.join(" ") }),
    "data-ci-count-cue": countCueAttr(cues.count),
    "data-ci-duration-cue": durationCueAttr(cues.duration),
    ...(cues.count.kind === "none"
      ? { "data-ci-count-cue-reason": cues.count.reason }
      : {}),
    ...(cues.duration.kind === "none"
      ? { "data-ci-duration-cue-reason": cues.duration.reason }
      : {}),
  };
}
