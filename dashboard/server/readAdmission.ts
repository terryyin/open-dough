// Whether this server process may ask GitHub now, for the one `gh`
// invocation every authenticated read and project addition reaches
// (`./ghRead.ts`): the one record of a rate limit, whichever read met it and
// whichever project or tab asks next, and the turns that bound how many reads
// are under way at GitHub at once. After any wait, directed or backed off,
// one read goes first: its answer reopens the turns, or a limit it meets
// starts the wait again with nothing else asked. It lives in this process's
// memory only, so a newly started process asks GitHub at once.

import { longestDirectedWaitSeconds } from "../src/authenticatedReadRules.ts";
import type { GhAnswer, GhPrintedFailure } from "./ghAnswer.ts";
import type { GhFailureReason } from "./ghFailure.ts";

type RateLimited = Extract<GhFailureReason, { readonly kind: "rate-limited" }>;

// How many reads one process has under way at GitHub at once, across every
// tab and project; further reads wait their turn in arrival order.
const readsUnderWayLimit = 8;

// Whether GitHub answered the read itself: a success, or a `304` naming what
// the conditional read already holds.
function succeeded(answer: GhAnswer<GhPrintedFailure>): boolean {
  return answer.failure === undefined || answer.status === 304;
}

export class ReadAdmission {
  // The time, by this server's clock, before which nothing is asked of
  // GitHub. It only ever moves later, and nothing but its time ends it.
  private resumesAtMs = 0;

  // How many rate limits that directed no wait were met since a read last
  // succeeded: each one waits twice as long as the one before.
  private backoffStep = 0;

  // How many reads hold a turn, and the reads waiting for one, in arrival
  // order: each begins its read when given a turn.
  private underWay = 0;
  private readonly waiting = new Set<() => void>();

  // Whether a wait was set and no read asked since it ended has been
  // answered without a limit: until then, one read at a time goes first.
  private resuming = false;

  // `backoffBaseMs` is the wait after the first rate limit that directs none
  // (`./ghRead.ts`'s `limitBackoffBaseMs`).
  constructor(private readonly backoffBaseMs: number) {}

  // Why a read may not be asked now, carrying the whole seconds left,
  // rounded up so a requester that waits as told never asks before this
  // process allows it; undefined when it may be asked.
  heldBack(nowMs: number): GhFailureReason | undefined {
    return nowMs < this.resumesAtMs
      ? { kind: "held-back", waitSeconds: this.secondsLeft(nowMs) }
      : undefined;
  }

  // Waits for one of this process's turns at GitHub, resolving with the
  // turn's end, which the read calls once it is over. A read whose `signal`
  // ends while it waits leaves without a turn, rejected with that signal's
  // reason, and the next read takes its place.
  turn(signal: AbortSignal): Promise<() => void> {
    if (signal.aborted) return Promise.reject(signal.reason as Error);
    if (this.waiting.size === 0 && this.underWay < this.turnsOpen()) {
      this.underWay += 1;
      return Promise.resolve(this.endOfTurn());
    }
    return new Promise((resolve, reject) => {
      const begin = () => {
        signal.removeEventListener("abort", leave);
        resolve(this.endOfTurn());
      };
      const leave = () => {
        this.waiting.delete(begin);
        reject(signal.reason as Error);
      };
      this.waiting.add(begin);
      signal.addEventListener("abort", leave, { once: true });
    });
  }

  // How many turns may be held at once: one while reading resumes after a
  // wait, otherwise the process's bound.
  private turnsOpen(): number {
    return this.resuming ? 1 : readsUnderWayLimit;
  }

  // A turn's end, which gives turns to the reads waiting longest while
  // turns are open. While a wait stands every waiting read is given one at
  // once: it is held back when its turn comes (`./ghRead.ts`'s `spawnedGh`)
  // and never reaches GitHub, so a wait answers them all without delay.
  private endOfTurn(): () => void {
    let over = false;
    return () => {
      if (over) return;
      over = true;
      this.underWay -= 1;
      const standing = this.heldBack(Date.now()) !== undefined;
      for (const next of this.waiting) {
        if (!standing && this.underWay >= this.turnsOpen()) return;
        this.waiting.delete(next);
        this.underWay += 1;
        next();
      }
    };
  }

  // Learns from one answer GitHub gave. A rate limit holds back every read
  // until the wait GitHub directed, or, when it directed none, until this
  // process's own backoff ends; a later time already standing stays. A read
  // that succeeds ends the backoff's doubling. No answer lifts a wait; an
  // answer GitHub gave without a limit to a read asked once the wait had
  // ended reopens the turns.
  answered(answer: GhAnswer<GhPrintedFailure>, nowMs: number): GhAnswer {
    const { failure } = answer;
    if (failure?.kind !== "rate-limited") {
      if (succeeded(answer)) this.backoffStep = 0;
      if (
        answer.status !== undefined &&
        Date.parse(answer.askedAt) >= this.resumesAtMs
      ) {
        this.resuming = false;
      }
      return { ...answer, failure };
    }
    this.resuming = true;
    const { status, waitSeconds } = failure;
    const limited: RateLimited =
      waitSeconds === undefined
        ? this.backedOff(status, nowMs)
        : { kind: "rate-limited", status, waitSeconds };
    this.resumesAtMs = Math.max(
      this.resumesAtMs,
      nowMs + limited.waitSeconds * 1000,
    );
    return { ...answer, failure: limited };
  }

  // A rate limit that directed no wait, given this process's own: the base
  // wait, doubled for each such limit since a read last succeeded, up to the
  // longest wait the boundary passes on. A read that was already at GitHub
  // when a wait started reports what is left of it and doubles nothing:
  // only the first read asked after a wait can show the limit continues.
  private backedOff(status: number, nowMs: number): RateLimited {
    const ownWait = (waitSeconds: number): RateLimited => ({
      kind: "rate-limited",
      status,
      waitSeconds,
      backoff: true,
    });
    if (nowMs < this.resumesAtMs) return ownWait(this.secondsLeft(nowMs));
    const longestMs = longestDirectedWaitSeconds * 1000;
    const waitMs = Math.min(
      this.backoffBaseMs * 2 ** this.backoffStep,
      longestMs,
    );
    if (waitMs < longestMs) this.backoffStep += 1;
    return ownWait(Math.ceil(waitMs / 1000));
  }

  private secondsLeft(nowMs: number): number {
    return Math.ceil((this.resumesAtMs - nowMs) / 1000);
  }
}
