// One fixed provisional rule for admission, saved decisions and their reading.
import { z } from "zod";
import { attemptTimingBasis } from "./ciAttemptTiming.ts";

export const followUpRule = {
  percent: 5,
  provisional: true,
  timingBasis: attemptTimingBasis,
} as const;

export const followUpRuleSchema = z.object({
  percent: z.literal(followUpRule.percent),
  provisional: z.literal(followUpRule.provisional),
  timingBasis: z.literal(followUpRule.timingBasis),
});

export function reachesFollowUpThreshold(
  ms: number,
  averageMs: number,
  rule: typeof followUpRule,
): boolean {
  return ms * 100 >= averageMs * (100 + rule.percent);
}

export const provisionalRepeatRule = `Provisional rule: repeat once at or above ${followUpRule.percent}% slower than the saved prior-build average.`;
