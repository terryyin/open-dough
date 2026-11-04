// In-process observation of origin for open revision streams on the local
// authenticated read boundary (`./authenticatedRead.ts`): while at least one
// stream is open for a catalog source and request-owner scope, this process
// settles one branch-head listing per pace (`../src/revisionCheckSchedule.ts`,
// lowered in tests through `./configuredLimit.ts`) through
// `./revisionChecks.ts`, shared by every stream of that key via
// `./sharedObservation.ts`, and answers each stream through
// `./performedRevisionCheck.ts` in today's revision-check shape. One source
// and scope is `./sourceRevisionStream.ts`. Timers and listing waits are
// registered in the boundary's `tracked` lifetime so closing the boundary
// ends them; the last stream closing stops the observation. No daemon,
// database, or cross-process scheduler.

import type { IncomingMessage, ServerResponse } from "node:http";
import type { PublishedSource } from "../src/publishedSource.ts";
import { requestOwnerScope } from "./ghRead.ts";
import type { RevisionStreamAsk } from "./requestedRevisionStream.ts";
import {
  SourceRevisionStream,
  type RevisionStreamReaders,
} from "./sourceRevisionStream.ts";

export {
  revisionStreamPaceMs,
  type RevisionStreamReaders,
} from "./sourceRevisionStream.ts";

type ObservationKey = string;

function observationKey(sourceId: string, scope: string | undefined): string {
  return JSON.stringify([sourceId, scope]);
}

export class RevisionStreamObservation {
  private readonly byKey = new Map<ObservationKey, SourceRevisionStream>();
  private unscoped = 0;

  constructor(private readonly readers: RevisionStreamReaders) {}

  async open(
    source: PublishedSource,
    ask: RevisionStreamAsk,
    req: IncomingMessage,
    res: ServerResponse,
  ): Promise<void> {
    if (res.writableEnded || res.destroyed) return;
    const scope = await requestOwnerScope();
    // An undefined scope shares nothing: each stream observes alone.
    const key =
      scope === undefined
        ? observationKey(source.id, `unscoped:${String(++this.unscoped)}`)
        : observationKey(source.id, scope);
    let observation = this.byKey.get(key);
    if (observation === undefined) {
      observation = new SourceRevisionStream(
        this.readers,
        source,
        scope,
        () => {
          this.byKey.delete(key);
        },
      );
      this.byKey.set(key, observation);
    }
    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });
    // Flush before any wait so a preview compression layer cannot hold the
    // first event for a full buffer.
    if (typeof res.flushHeaders === "function") res.flushHeaders();
    observation.open(ask, req, res);
  }

  close(): void {
    for (const observation of [...this.byKey.values()]) {
      observation.close();
    }
    this.byKey.clear();
  }
}
