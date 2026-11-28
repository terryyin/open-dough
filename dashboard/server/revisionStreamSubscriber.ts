// One admitted stream's delivery of a project observation and cleanup on
// departure. The source stream owns the observation's lifetime and cadence.
import type { IncomingMessage, ServerResponse } from "node:http";
import { readingRefOf } from "../src/authenticatedReadRules.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { performRevisionCheck } from "./performedRevisionCheck.ts";
import { reportedFailure } from "./readFailureMessage.ts";
import type { Outcome } from "./readOutcome.ts";
import type { RevisionStreamAsk } from "./requestedRevisionStream.ts";
import type { AskedOriginTrunk } from "./sharedVerifiedOriginTrunk.ts";
import {
  endRevisionStream,
  writeRevisionStreamEvent,
} from "./revisionStreamEvents.ts";

export class RevisionStreamSubscriber {
  private readonly leave: () => void;

  constructor(
    private readonly ask: RevisionStreamAsk,
    private readonly req: IncomingMessage,
    private readonly res: ServerResponse,
    private readonly controller: AbortController,
    private readonly tracked: Set<AbortController>,
    onLeave: (subscriber: RevisionStreamSubscriber) => void,
  ) {
    this.leave = () => {
      onLeave(this);
    };
    tracked.add(controller);
    req.on("close", this.leave);
    res.on("close", this.leave);
    controller.signal.addEventListener("abort", this.leave, { once: true });
  }

  get signal(): AbortSignal {
    return this.controller.signal;
  }

  close(): void {
    this.req.off("close", this.leave);
    this.res.off("close", this.leave);
    this.controller.signal.removeEventListener("abort", this.leave);
    this.tracked.delete(this.controller);
    if (!this.controller.signal.aborted) this.controller.abort();
    endRevisionStream(this.res);
  }

  write(outcome: Outcome): void {
    writeRevisionStreamEvent(this.res, outcome);
  }

  async answer(
    readers: Parameters<typeof performRevisionCheck>[0],
    source: PublishedSource,
    observationSignal: AbortSignal,
    observation: AskedOriginTrunk,
  ): Promise<void> {
    if (observationSignal.aborted || this.controller.signal.aborted) return;
    try {
      const outcome = await performRevisionCheck(
        readers,
        source,
        {
          since: this.ask.at,
          watched: this.ask.watched,
        },
        AbortSignal.any([this.controller.signal, observationSignal]),
        () => observation,
      );
      this.write(outcome);
    } catch (error) {
      this.write({
        kind: "failed",
        ...reportedFailure(error, source, readingRefOf(source), undefined),
      });
    }
  }
}
