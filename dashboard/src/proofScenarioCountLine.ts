// Shared Proof count line for one file's rows (`./IntentProof.tsx`) and for a
// location or folder summary (`./IntentSummary.tsx`): categories and order of
// the latest outcomes, never-observed rows counted as Not observed. It is
// never a suite verdict.

import type { ProofObservation } from "./cucumberProof.ts";

const outcomeWords: Record<ProofObservation["outcome"], string> = {
  passed: "Passed",
  failed: "Failed",
  skipped: "Skipped",
  pending: "Pending",
  undefined: "Undefined",
  ambiguous: "Ambiguous",
  unknown: "Unknown outcome",
};

const notObserved = "Not observed";
const passedAfterRetry = "Passed after retry";

// The count line's category for a row's latest observation.
function categoryOf(observation: ProofObservation | undefined): string {
  if (observation === undefined) return notObserved;
  if (observation.outcome === "passed" && observation.attempts > 1) {
    return passedAfterRetry;
  }
  return outcomeWords[observation.outcome];
}

const countOrder = [
  outcomeWords.passed,
  passedAfterRetry,
  outcomeWords.failed,
  outcomeWords.skipped,
  outcomeWords.pending,
  outcomeWords.undefined,
  outcomeWords.ambiguous,
  outcomeWords.unknown,
  notObserved,
];

export function proofScenarioCountLine(
  observed: readonly (ProofObservation | undefined)[],
): string {
  const counts = new Map<string, number>();
  for (const observation of observed) {
    const category = categoryOf(observation);
    counts.set(category, (counts.get(category) ?? 0) + 1);
  }
  const parts = countOrder.flatMap((category) => {
    const count = counts.get(category);
    return count === undefined
      ? []
      : [`${String(count)} ${category.toLowerCase()}`];
  });
  const total = observed.length;
  return `${String(total)} ${total === 1 ? "scenario" : "scenarios"}: ${parts.join(", ")}`;
}

export { notObserved, outcomeWords, passedAfterRetry };
