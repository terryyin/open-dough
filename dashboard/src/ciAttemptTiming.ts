// The comparable CI wall interval is the provider-reported attempt start
// through completion. Workflow creation and local request times cannot stand
// in for that start, including for a first attempt.
export const attemptTimingBasis = "attempt-start" as const;
export const unverifiedAttemptTiming =
  "Retained attempt-start timing basis is unverified";

export function hasAttemptTiming(
  build: { readonly timingBasis?: string | undefined } | undefined,
): boolean {
  return build?.timingBasis === attemptTimingBasis;
}
