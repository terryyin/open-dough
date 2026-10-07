// Bounded in-memory history of failed upstream reads for the local
// authenticated read boundary (`./authenticatedRead.ts`): one entry per
// shared `gh` invocation that failed (`./ghRead.ts`), attributed to the
// admitted reader that started it, never to every waiter. Newest 100
// failures across this process; nothing is written to disk. A maintainer
// inspects them through `GET /__authenticated-read-diagnostics`. Held-back
// reads and ordinary waiter departures are not recorded here.
// Attribution context: `./readDiagnosticContext.ts`. Field sanitization:
// `./readDiagnosticSanitize.ts`.

import type { GhAnswer } from "./ghAnswer.ts";
import type { GhFailureReason } from "./ghFailure.ts";
import {
  currentReadDiagnosticContext,
  type DiagnosticCategory,
} from "./readDiagnosticContext.ts";
import {
  rateLimitEvidence,
  safeText,
  upstreamStatus,
  type RateLimitEvidence,
} from "./readDiagnosticSanitize.ts";

export type {
  DiagnosticCategory,
  ReadDiagnosticContext,
} from "./readDiagnosticContext.ts";
export {
  contextForAdmittedRead,
  contextForAvatarRead,
  withReadDiagnosticContext,
} from "./readDiagnosticContext.ts";
export type { RateLimitEvidence } from "./readDiagnosticSanitize.ts";

const historyLimit = 100;

export type ReadDiagnosticEntry = {
  readonly at: string;
  readonly source: string;
  readonly category: DiagnosticCategory;
  readonly pin?: string;
  readonly cause: GhFailureReason["kind"];
  readonly elapsedMs: number;
  readonly status?: number;
  readonly requestId?: string;
  readonly rateLimit?: RateLimitEvidence;
};

export type DiagnosticOutcome = {
  readonly kind: "diagnostics";
  readonly failures: readonly ReadDiagnosticEntry[];
};

// Newest last; oldest are dropped once size exceeds `historyLimit`.
const failures: ReadDiagnosticEntry[] = [];

// That source's entries among the newest failures kept in this process.
export function diagnosticsForSource(
  sourceId: string,
): readonly ReadDiagnosticEntry[] {
  return failures.filter((entry) => entry.source === sourceId);
}

// Records one failed shared invocation when an admitted reader started it.
// Omits held-back/unasked answers, successful or unchanged (`304`) answers,
// and calls with no admitted context.
export function recordFailedRead(input: {
  readonly cause: GhFailureReason["kind"];
  readonly startedAtMs: number;
  readonly askedAt?: string;
  readonly answer?: GhAnswer;
}): void {
  const carried = currentReadDiagnosticContext();
  if (carried === undefined) {
    return;
  }
  // Conditional success: `gh` exits non-zero for `304`, but the heads check
  // treats it as unchanged — not a failure to retain.
  if (input.answer?.status === 304) {
    return;
  }
  const elapsedMs = Math.max(0, Date.now() - input.startedAtMs);
  const status = upstreamStatus(input.cause, input.answer);
  const headers = input.answer?.headers;
  const requestId =
    headers === undefined
      ? undefined
      : safeText(headers.get("x-github-request-id"));
  const rateLimit =
    headers === undefined ? undefined : rateLimitEvidence(headers, Date.now());
  failures.push({
    at: input.askedAt ?? new Date().toISOString(),
    source: carried.source,
    category: carried.category,
    ...(carried.pin !== undefined && { pin: carried.pin }),
    cause: input.cause,
    elapsedMs,
    ...(status !== undefined && { status }),
    ...(requestId !== undefined && { requestId }),
    ...(rateLimit !== undefined && { rateLimit }),
  });
  while (failures.length > historyLimit) {
    failures.shift();
  }
}
