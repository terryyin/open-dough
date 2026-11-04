// One catalog source's open revision streams for a request-owner scope: while
// at least one subscriber is open, settles one branch-head listing per pace
// through `./revisionChecks.ts` via `./sharedObservation.ts`, and answers
// each stream through `./performedRevisionCheck.ts` in today's revision-check
// shape. Owned by `./revisionStreamObservation.ts`.

import type { IncomingMessage, ServerResponse } from "node:http";
import {
  readingRefOf,
  readWaitLimitMs,
} from "../src/authenticatedReadRules.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { checkIntervalMs } from "../src/revisionCheckSchedule.ts";
import type { BranchHeads } from "./branchHeads.ts";
import { configuredLimit } from "./configuredLimit.ts";
import { performRevisionCheck } from "./performedRevisionCheck.ts";
import type { PinnedTexts } from "./pinnedTexts.ts";
import { reportedFailure } from "./readFailureMessage.ts";
import type { Outcome } from "./readOutcome.ts";
import type { CheckedHeads, RevisionChecks } from "./revisionChecks.ts";
import type { RevisionStreamAsk } from "./requestedRevisionStream.ts";
import {
  endRevisionStream,
  unansweredRevisionObservation,
  writeRevisionStreamEvent,
} from "./revisionStreamEvents.ts";
import { SharedObservation } from "./sharedObservation.ts";

export function revisionStreamPaceMs(): number {
  return configuredLimit("DOUGH_REVISION_STREAM_MS", checkIntervalMs);
}

export type RevisionStreamReaders = {
  readonly tracked: Set<AbortController>;
  readonly pinned: PinnedTexts;
  readonly checks: RevisionChecks;
  readonly branches: BranchHeads;
};

type StreamSubscriber = {
  readonly at: string;
  readonly watched: readonly string[];
  readonly res: ServerResponse;
  readonly controller: AbortController;
};

export class SourceRevisionStream {
  private readonly subscribers = new Set<StreamSubscriber>();
  private readonly shared: SharedObservation<CheckedHeads, readonly [string]>;
  private readonly listing = new AbortController();
  private paceTimer: ReturnType<typeof setTimeout> | undefined;
  private closed = false;

  constructor(
    private readonly readers: RevisionStreamReaders,
    private readonly source: PublishedSource,
    private readonly scope: string | undefined,
    private readonly onEmpty: () => void,
  ) {
    readers.tracked.add(this.listing);
    this.listing.signal.addEventListener(
      "abort",
      () => {
        this.close();
      },
      { once: true },
    );
    this.shared = new SharedObservation(
      () => this.readers.checks.check(this.source, this.listing.signal),
      () => Math.max(1, revisionStreamPaceMs() - 1),
    );
  }

  open(
    ask: RevisionStreamAsk,
    req: IncomingMessage,
    res: ServerResponse,
  ): void {
    const controller = new AbortController();
    this.readers.tracked.add(controller);
    const subscriber: StreamSubscriber = {
      at: ask.at,
      watched: ask.watched,
      res,
      controller,
    };
    const leave = () => {
      this.leave(subscriber);
    };
    req.on("close", leave);
    res.on("close", leave);
    controller.signal.addEventListener("abort", leave, { once: true });
    this.subscribers.add(subscriber);
    // Answer from a shared demand first; schedule the pace only after that
    // settles so a lowered test pace cannot start a second listing before the
    // open answers are observed.
    void this.answerFromDemand(subscriber).finally(() => {
      if (
        !this.closed &&
        this.subscribers.size > 0 &&
        this.paceTimer === undefined
      ) {
        this.schedulePace();
      }
    });
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    if (this.paceTimer !== undefined) {
      clearTimeout(this.paceTimer);
      this.paceTimer = undefined;
    }
    if (!this.listing.signal.aborted) this.listing.abort();
    this.readers.tracked.delete(this.listing);
    for (const subscriber of [...this.subscribers]) {
      this.detach(subscriber);
      endRevisionStream(subscriber.res);
    }
    this.subscribers.clear();
    this.onEmpty();
  }

  private leave(subscriber: StreamSubscriber): void {
    if (!this.subscribers.delete(subscriber)) return;
    this.detach(subscriber);
    endRevisionStream(subscriber.res);
    if (this.subscribers.size === 0) this.close();
  }

  private detach(subscriber: StreamSubscriber): void {
    this.readers.tracked.delete(subscriber.controller);
    if (!subscriber.controller.signal.aborted) {
      subscriber.controller.abort();
    }
  }

  private schedulePace(): void {
    if (this.closed || this.subscribers.size === 0) return;
    this.paceTimer = setTimeout(() => {
      this.paceTimer = undefined;
      void this.paceTick();
    }, revisionStreamPaceMs());
  }

  private async paceTick(): Promise<void> {
    if (this.closed || this.subscribers.size === 0) return;
    // One listing per tick, then each open stream learns its own answer from
    // it — concurrent fresh demands on SharedObservation can each start a
    // listing when staggered by a microtask.
    const reading = readingRefOf(this.source);
    let listing: CheckedHeads | undefined;
    try {
      const demanded = await this.shared.demand(
        [this.scope ?? ""],
        readWaitLimitMs,
        this.listing.signal,
        true,
      );
      if (demanded.kind === "departed") {
        this.schedulePace();
        return;
      }
      if (demanded.kind !== "observed") {
        for (const subscriber of this.subscribers) {
          writeRevisionStreamEvent(
            subscriber.res,
            unansweredRevisionObservation(reading),
          );
        }
        this.schedulePace();
        return;
      }
      listing = demanded.value;
    } catch (error) {
      if (!this.listing.signal.aborted) {
        const failed: Outcome = {
          kind: "failed",
          ...reportedFailure(error, this.source, reading, undefined),
        };
        for (const subscriber of [...this.subscribers]) {
          writeRevisionStreamEvent(subscriber.res, failed);
        }
      }
      this.schedulePace();
      return;
    }
    await Promise.all(
      [...this.subscribers].map((subscriber) =>
        this.answerFromListing(subscriber, listing),
      ),
    );
    this.schedulePace();
  }

  private async answerFromDemand(subscriber: StreamSubscriber): Promise<void> {
    if (this.closed || subscriber.controller.signal.aborted) return;
    const reading = readingRefOf(this.source);
    try {
      const demanded = await this.shared.demand(
        [this.scope ?? ""],
        readWaitLimitMs,
        this.listing.signal,
        false,
      );
      if (demanded.kind !== "observed") {
        if (demanded.kind === "departed") return;
        writeRevisionStreamEvent(
          subscriber.res,
          unansweredRevisionObservation(reading),
        );
        return;
      }
      await this.answerFromListing(subscriber, demanded.value);
    } catch (error) {
      writeRevisionStreamEvent(subscriber.res, {
        kind: "failed",
        ...reportedFailure(error, this.source, reading, undefined),
      });
    }
  }

  private async answerFromListing(
    subscriber: StreamSubscriber,
    listing: CheckedHeads,
  ): Promise<void> {
    if (this.closed || subscriber.controller.signal.aborted) return;
    const reading = readingRefOf(this.source);
    try {
      const outcome = await performRevisionCheck(
        this.readers,
        this.source,
        {
          kind: "revision-check",
          since: subscriber.at,
          watched: subscriber.watched,
        },
        AbortSignal.any([subscriber.controller.signal, this.listing.signal]),
        listing,
      );
      writeRevisionStreamEvent(subscriber.res, outcome);
    } catch (error) {
      writeRevisionStreamEvent(subscriber.res, {
        kind: "failed",
        ...reportedFailure(error, this.source, reading, undefined),
      });
    }
  }
}
