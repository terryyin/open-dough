// The history read's measure capability, as `gap-reasons=timing-basis` names
// newer gap reasons (`../server/ciHistoryGapVocabulary.ts`). A project read
// that names it answers points by CI time without runner waits kept with each
// build. Without it the read answers today's wall-time points, which a page
// opened before the capability existed parses. The public measure name matches
// the CI timing comparison's column.
import type { CiTimeWithoutRunnerWaits } from "./storyCiComparison.ts";

export const historyMeasure = {
  name: "measure",
  value: "time-without-runner-waits",
} as const;

// One name with the CI timing comparison: Project Intent's CI status history.
export const ciTimeWithoutRunnerWaitsWords = "CI time without runner waits";

export const measureHistoryTitleWords = `${ciTimeWithoutRunnerWaitsWords} history`;

export const measureHistoryChartLabelWords = `${ciTimeWithoutRunnerWaitsWords} by build date`;

export const readingMeasureHistoryWords = `Reading the collected ${measureHistoryTitleWords}…`;

export const unreadMeasureHistoryReason = `The ${measureHistoryTitleWords} could not be read`;

// How retained CI time without runner waits reads for history points, gaps and
// prior-build samples: a kept time, a kept reason, or an absent ask.
export type KeptMeasureReading =
  | { readonly kind: "milliseconds"; readonly milliseconds: number }
  | { readonly kind: "reason"; readonly reason: string }
  | { readonly kind: "absent" };

export function keptMeasureReadingOf(
  kept: CiTimeWithoutRunnerWaits | undefined,
): KeptMeasureReading {
  if (kept !== undefined && "milliseconds" in kept)
    return { kind: "milliseconds", milliseconds: kept.milliseconds };
  if (kept !== undefined && "reason" in kept)
    return { kind: "reason", reason: kept.reason };
  return { kind: "absent" };
}
