// Collection tells an unanswered measure read from a final reason. Comparison
// still shows the same reason words; only the in-process mark differs.
import type { CiTimeWithoutRunnerWaits } from "../src/storyCiComparison.ts";

const unanswered = new WeakSet<object>();

export function unansweredTimeWithoutRunnerWaits(
  reason: string,
): CiTimeWithoutRunnerWaits {
  const answer = { reason };
  unanswered.add(answer);
  return answer;
}

export function isUnansweredTimeWithoutRunnerWaits(
  answer: CiTimeWithoutRunnerWaits,
): boolean {
  return "reason" in answer && unanswered.has(answer);
}
