// Bound Git reads at admission while honoring an optional caller's cancellation.
export function admissionBound(request?: AbortSignal): AbortSignal {
  const deadline = AbortSignal.timeout(30_000);
  return request === undefined
    ? deadline
    : AbortSignal.any([request, deadline]);
}

// Prefer request cancellation over a deadline-shaped refusal.
export function throwIfRequestAborted(request?: AbortSignal): void {
  if (request?.aborted) throw request.reason;
}
