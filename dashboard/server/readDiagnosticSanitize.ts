// Bounded, validated diagnostic metadata for failed upstream reads
// (`./readDiagnostics.ts`): textual fields at most 256 printable characters;
// numeric values finite nonnegative safe integers. Never retains bodies,
// credentials, raw CLI output, or arbitrary headers.

import { directedWaitSeconds } from "./rateLimitDirection.ts";
import type { GhAnswer } from "./ghAnswer.ts";
import type { GhFailureReason } from "./ghFailure.ts";

export const textFieldLimit = 256;

export type RateLimitEvidence = {
  readonly limit?: number;
  readonly remaining?: number;
  readonly reset?: number;
  readonly resource?: string;
  readonly retryAfterSeconds?: number;
};

export function safeText(value: string | undefined): string | undefined {
  if (
    value === undefined ||
    value.length === 0 ||
    value.length > textFieldLimit
  ) {
    return undefined;
  }
  // Reject control characters and anything that is not plain printable text.
  if (!/^[\x20-\x7E]+$/.test(value)) {
    return undefined;
  }
  return value;
}

export function safeCount(value: string | undefined): number | undefined {
  if (value === undefined || !/^\d+$/.test(value)) {
    return undefined;
  }
  const n = Number(value);
  return isSafeCount(n) ? n : undefined;
}

export function isSafeCount(n: number): boolean {
  return Number.isSafeInteger(n) && n >= 0;
}

// HTTP status only when GitHub answered; never invented for timed-out,
// unreachable, held-back, or other local failures.
export function upstreamStatus(
  cause: GhFailureReason["kind"],
  answer: GhAnswer | undefined,
): number | undefined {
  if (cause !== "http" && cause !== "rate-limited") {
    return undefined;
  }
  if (answer?.status !== undefined && isSafeCount(answer.status)) {
    return answer.status;
  }
  const failure = answer?.failure;
  return failure !== undefined &&
    (failure.kind === "http" || failure.kind === "rate-limited") &&
    isSafeCount(failure.status)
    ? failure.status
    : undefined;
}

export function rateLimitEvidence(
  headers: ReadonlyMap<string, string>,
  nowMs: number,
): RateLimitEvidence | undefined {
  const limit = safeCount(headers.get("x-ratelimit-limit"));
  const remaining = safeCount(headers.get("x-ratelimit-remaining"));
  const reset = safeCount(headers.get("x-ratelimit-reset"));
  const resource = safeText(headers.get("x-ratelimit-resource"));
  const retryAfterSeconds = directedWaitSeconds(headers, nowMs);
  if (
    limit === undefined &&
    remaining === undefined &&
    reset === undefined &&
    resource === undefined &&
    retryAfterSeconds === undefined
  ) {
    return undefined;
  }
  return {
    ...(limit !== undefined && { limit }),
    ...(remaining !== undefined && { remaining }),
    ...(reset !== undefined && { reset }),
    ...(resource !== undefined && { resource }),
    ...(retryAfterSeconds !== undefined && { retryAfterSeconds }),
  };
}
