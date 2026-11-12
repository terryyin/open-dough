// Providers establish comparability; the saved rule gives both one verdict.
import { reachesFollowUpThreshold } from "../src/ciFollowUpRule.ts";
import { wallTimeReadingOf } from "./ciWallTimeReference.ts";
import type { RepeatRequest } from "./ciFollowUpStore.ts";
import type { KeptBuild } from "./landedCiObservation.ts";

export function repeatTimingVerdict(
  request: Pick<RepeatRequest, "reference" | "rule">,
  repeat: KeptBuild,
): Pick<RepeatRequest["outcome"], "kind" | "explanation"> | undefined {
  const ms = wallTimeReadingOf(repeat).ms;
  const average = request.reference.averageMs;
  if (ms === undefined || average === undefined || average <= 0) return;
  const slow = reachesFollowUpThreshold(ms, average, request.rule);
  return {
    kind: slow ? "slow" : "recovered",
    explanation: slow ? "Possible CI slowdown" : "CI timing returned to range",
  };
}
