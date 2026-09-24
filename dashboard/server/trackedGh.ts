// One boundary request's owned `gh` work, for the local authenticated read
// boundary (`./authenticatedRead.ts`): tracked so closing the boundary can
// abort it, aborted when the requester disconnects, and given up as timed
// out once `./ghRead.ts`'s `readTimeoutMs` passes.

import type { IncomingMessage } from "node:http";
import { GhFailure, readTimeoutMs } from "./ghRead";

export async function withTrackedGh<T>(
  req: IncomingMessage,
  tracked: Set<AbortController>,
  run: (signal: AbortSignal) => Promise<T>,
): Promise<T> {
  const controller = new AbortController();
  tracked.add(controller);
  const timeout = new GhFailure({ kind: "timed-out" });
  const timer = setTimeout(() => {
    controller.abort(timeout);
  }, readTimeoutMs());
  const onClose = () => {
    controller.abort();
  };
  req.on("close", onClose);
  try {
    return await run(controller.signal);
  } catch (error) {
    throw controller.signal.reason === timeout ? timeout : error;
  } finally {
    clearTimeout(timer);
    req.off("close", onClose);
    tracked.delete(controller);
  }
}
