// Controls only the authenticated-read stream's pace while the real HTTP
// server, request owner and synthetic GitHub keep using their normal timers.
import { AsyncLocalStorage } from "node:async_hooks";
import { EventEmitter, once } from "node:events";
import { mock } from "node:test";
import { installAuthenticatedReadMiddleware } from "../../server/authenticatedRead.ts";
import {
  everyRepository,
  type RepositoryAnswerer,
} from "../../tests/support/fakeGitHub.ts";
import type { GhRequest } from "../../tests/support/ghRequest.ts";
import { heldInTurn } from "../../tests/support/heldGitHubAnswer.ts";
import { startInProcessAuthenticatedRead } from "../../tests/support/inProcessAuthenticatedRead.ts";

// A distinctive delay separates the pace from the read and process timers
// inside the same request. Other requests never enter the clock's scope.
export const controlledPaceMs = 811;

function controlPace() {
  const streamRequest = new AsyncLocalStorage<boolean>();
  const armed = new EventEmitter();
  const pending = new Map<unknown, { due: number; run: () => void }>();
  let now = 0;
  const realSetTimeout = globalThis.setTimeout;
  const realClearTimeout = globalThis.clearTimeout;
  const set = mock.method(
    globalThis,
    "setTimeout",
    (
      callback: (...args: unknown[]) => void,
      delay?: number,
      ...args: unknown[]
    ) => {
      if (!streamRequest.getStore() || delay !== controlledPaceMs) {
        return realSetTimeout(callback, delay, ...args);
      }
      const handle = {} as ReturnType<typeof setTimeout>;
      pending.set(handle, {
        due: now + delay,
        run: AsyncLocalStorage.bind(() => {
          callback(...args);
        }),
      });
      armed.emit("armed");
      return handle;
    },
  );
  const clear = mock.method(
    globalThis,
    "clearTimeout",
    (handle?: Parameters<typeof clearTimeout>[0]) => {
      if (!pending.delete(handle)) realClearTimeout(handle);
    },
  );

  return {
    inStream: (handle: () => void) => {
      streamRequest.run(true, handle);
    },
    waitForPace: async () => {
      if (pending.size === 0) await once(armed, "armed");
    },
    pendingPaces: () => pending.size,
    advance: (ms: number) => {
      now += ms;
      let fired = 0;
      for (const [handle, timer] of pending) {
        if (timer.due > now) continue;
        pending.delete(handle);
        fired += 1;
        timer.run();
      }
      return fired;
    },
    restore() {
      clear.mock.restore();
      set.mock.restore();
    },
  };
}

export async function controlledStreamServer() {
  const clock = controlPace();
  const responses = new EventEmitter();
  const boundary = await startInProcessAuthenticatedRead({
    extraEnv: () => ({
      DOUGH_REVISION_STREAM_MS: String(controlledPaceMs),
      DOUGH_REVISION_CHECK_REUSE_MS: "0",
    }),
    install: (middlewares) =>
      installAuthenticatedReadMiddleware({
        use: (handler) =>
          middlewares.use((req, res, next) => {
            const url = new URL(req.url ?? "", "http://localhost");
            if (!url.searchParams.has("at")) {
              handler(req, res, next);
              return;
            }
            // Awaiters resume after the boundary's own synchronous close
            // handlers have processed this response's disconnect.
            res.once("close", () => responses.emit("disconnect"));
            clock.inStream(() => {
              handler(req, res, next);
            });
          }),
      }),
  }).catch((error: unknown) => {
    clock.restore();
    throw error;
  });

  return {
    baseURL: boundary.origin,
    origin: boundary.origin,
    github: boundary.github,
    advance: clock.advance,
    pendingPaces: clock.pendingPaces,
    waitForPace: clock.waitForPace,
    async disconnect(stream: { close(): void }) {
      const disconnected = once(responses, "disconnect");
      stream.close();
      await disconnected;
    },
    holdListings(published: RepositoryAnswerer) {
      const isListing = (request: GhRequest) =>
        request.kind === "matching-refs";
      const listings = heldInTurn(published, isListing);
      const arrivals = new EventEmitter();
      boundary.github.serve(everyRepository, (call) => {
        const answer = listings.answer(call);
        if (isListing(call.request)) arrivals.emit("listing");
        return answer;
      });
      return { ...listings, nextArrival: () => once(arrivals, "listing") };
    },
    closeBoundary: boundary.closeBoundary,
    async close() {
      try {
        await boundary.close();
      } finally {
        clock.restore();
      }
    },
  };
}
