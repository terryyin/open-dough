// One revision-stream SSE frame on an open response: today's revision-check
// answer or failure shape as a `data:` event, or ending the response.

import type { ServerResponse } from "node:http";
import { readWaitLimitMs } from "../src/authenticatedReadRules.ts";
import type { Outcome } from "./readOutcome.ts";

export function writeRevisionStreamEvent(
  res: ServerResponse,
  outcome: Outcome,
): void {
  if (res.writableEnded || res.destroyed) return;
  const body =
    outcome.kind === "answered"
      ? JSON.stringify(outcome.answer)
      : JSON.stringify({
          error: outcome.message,
          retryAfterSeconds:
            outcome.kind === "failed" ? outcome.retryAfterSeconds : undefined,
          recovery: outcome.kind === "failed" ? outcome.recovery : undefined,
        });
  res.write(`data: ${body}\n\n`);
}

export function endRevisionStream(res: ServerResponse): void {
  if (!res.writableEnded && !res.destroyed) {
    res.end();
  }
}

export function unansweredRevisionObservation(reading: string): Outcome {
  return {
    kind: "failed",
    message: `The revision observation for ${reading} was not settled within ${String(readWaitLimitMs / 1000)} seconds.`,
    retryAfterSeconds: undefined,
    recovery: undefined,
  };
}
