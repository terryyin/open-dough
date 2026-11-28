// One source and credential scope's open revision streams. One shared Board
// trunk observation answers each pace, and subscriptions own their waits.

import type { IncomingMessage, ServerResponse } from "node:http";
import { readingRefOf } from "../src/authenticatedReadRules.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { checkIntervalMs } from "../src/revisionCheckSchedule.ts";
import type { BranchHeads } from "./branchHeads.ts";
import { configuredLimit } from "./configuredLimit.ts";
import type { PinnedTexts } from "./pinnedTexts.ts";
import { reportedFailure } from "./readFailureMessage.ts";
import type { Outcome } from "./readOutcome.ts";
import type { RevisionStreamAsk } from "./requestedRevisionStream.ts";
import {
  endRevisionStream,
  unansweredRevisionObservation,
} from "./revisionStreamEvents.ts";
import { RevisionStreamSubscriber } from "./revisionStreamSubscriber.ts";
import type { SharedVerifiedOriginTrunk } from "./sharedVerifiedOriginTrunk.ts";

export function revisionStreamPaceMs(): number {
  return configuredLimit("DOUGH_REVISION_STREAM_MS", checkIntervalMs);
}

export type RevisionStreamReaders = {
  readonly tracked: Set<AbortController>;
  readonly pinned: PinnedTexts;
  readonly trunks: SharedVerifiedOriginTrunk;
  readonly branches: BranchHeads;
};

export class SourceRevisionStream {
  private readonly subscribers = new Set<RevisionStreamSubscriber>();
  private readonly lifetime = new AbortController();
  private paceTimer: ReturnType<typeof setTimeout> | undefined;
  private closed = false;

  constructor(
    private readonly readers: RevisionStreamReaders,
    private readonly source: PublishedSource,
    private readonly onEmpty: () => void,
  ) {
    readers.tracked.add(this.lifetime);
    this.lifetime.signal.addEventListener(
      "abort",
      () => {
        this.close();
      },
      {
        once: true,
      },
    );
  }

  open(
    ask: RevisionStreamAsk,
    req: IncomingMessage,
    res: ServerResponse,
    // Admission-tracked controller; refuse if departure/registry close raced join.
    admission: AbortController,
  ): void {
    if (this.closed || admission.signal.aborted) {
      this.readers.tracked.delete(admission);
      endRevisionStream(res);
      return;
    }
    const subscriber = new RevisionStreamSubscriber(
      ask,
      req,
      res,
      admission,
      this.readers.tracked,
      (leaving) => {
        this.leave(leaving);
      },
    );
    this.subscribers.add(subscriber);
    // Shared demand first; schedule pace only after it settles so a lowered
    // test pace cannot start a second origin check before open answers are observed.
    void this.answer([subscriber], subscriber.signal, false).finally(() => {
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
    if (!this.lifetime.signal.aborted) this.lifetime.abort();
    this.readers.tracked.delete(this.lifetime);
    for (const subscriber of this.subscribers) subscriber.close();
    this.subscribers.clear();
    this.onEmpty();
  }

  private leave(subscriber: RevisionStreamSubscriber): void {
    if (!this.subscribers.delete(subscriber)) return;
    subscriber.close();
    if (this.subscribers.size === 0) this.close();
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
    await this.answer([...this.subscribers], this.lifetime.signal, true);
    this.schedulePace();
  }

  private async answer(
    subscribers: readonly RevisionStreamSubscriber[],
    signal: AbortSignal,
    fresh: boolean,
  ): Promise<void> {
    const reading = readingRefOf(this.source);
    try {
      const demanded = await this.readers.trunks.demand(
        this.source,
        this.readers.pinned,
        signal,
        { fresh },
      );
      if (demanded.kind === "departed") return;
      if (demanded.kind === "unanswered") {
        for (const subscriber of subscribers) {
          subscriber.write(unansweredRevisionObservation(reading));
        }
        return;
      }
      await Promise.all(
        subscribers.map((subscriber) =>
          subscriber.answer(this.readers, this.source, signal, demanded.value),
        ),
      );
    } catch (error) {
      if (signal.aborted) return;
      const failed: Outcome = {
        kind: "failed",
        ...reportedFailure(error, this.source, reading, undefined),
      };
      for (const subscriber of subscribers) {
        subscriber.write(failed);
      }
    }
  }
}
