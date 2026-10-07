// Whether this server process may ask GitHub now, for the one `gh`
// invocation every authenticated read and project addition reaches
// (`./ghRead.ts`): the one record of a rate limit GitHub directed, whichever
// read met it and whichever project or tab asks next. It lives in this
// process's memory only, so a newly started process asks GitHub at once.

import type { GhAnswer } from "./ghAnswer.ts";
import type { GhFailureReason } from "./ghRead.ts";

export class ReadAdmission {
  // The time, by this server's clock, before which nothing is asked of
  // GitHub. It only ever moves later, and nothing but its time ends it.
  private resumesAtMs = 0;

  // Why a read may not be asked now, carrying the whole seconds left,
  // rounded up so a requester that waits as told never asks before this
  // process allows it; undefined when it may be asked.
  heldBack(nowMs: number): GhFailureReason | undefined {
    return nowMs < this.resumesAtMs
      ? {
          kind: "held-back",
          waitSeconds: Math.ceil((this.resumesAtMs - nowMs) / 1000),
        }
      : undefined;
  }

  // Learns from one answer GitHub gave: a rate limit that directed a wait
  // holds back every read until then, unless a later time already stands.
  // No other answer -- an unmarked refusal, a `404`, a success -- lifts or
  // starts anything.
  answered(answer: GhAnswer, nowMs: number): GhAnswer {
    const { failure } = answer;
    if (failure?.kind === "rate-limited" && failure.waitSeconds !== undefined) {
      this.resumesAtMs = Math.max(
        this.resumesAtMs,
        nowMs + failure.waitSeconds * 1000,
      );
    }
    return answer;
  }
}
