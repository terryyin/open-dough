// Shared Proof count line for one file's rows (`./IntentProof.tsx`) and for a
// location or folder summary (`./IntentSummary.tsx`): categories and order of
// the last successful proof, with rows without successful proof included,
// counted in the proof kind's case words (`./proofKinds.ts`). It is never a
// suite verdict.

import type { SuccessfulCaseObservation } from "./proofCases.ts";

const passed = "Passed";
const noSuccessfulProof = "No successful proof";
const passedAfterRetry = "Passed after retry";

// The count line's category for a row's last successful proof.
function categoryOf(
  observation: SuccessfulCaseObservation | undefined,
): string {
  if (observation === undefined) return noSuccessfulProof;
  if (observation.attempts > 1) {
    return passedAfterRetry;
  }
  return passed;
}

const countOrder = [passed, passedAfterRetry, noSuccessfulProof];

export function proofCountLine(
  observed: readonly (SuccessfulCaseObservation | undefined)[],
  cases: (count: number) => string,
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
      : [
          `${String(count)} ${category === noSuccessfulProof ? "without successful proof" : category.toLowerCase()}`,
        ];
  });
  return `Last successful proof: ${cases(observed.length)}: ${parts.join(", ")}`;
}

export { noSuccessfulProof, passed, passedAfterRetry };
