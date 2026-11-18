// Controls only the authenticated-read stream's pace while the real HTTP
// server, request owner and synthetic GitHub keep using their normal timers.
// Observe the held GitHub call before advancing its deadline. For a stream,
// observe the server disconnect or the clean response end, then step the
// cadence and check that the canceled timer fires no callback and GitHub
// receives no call. Keep process startup and teardown on real timers.
import { EventEmitter, once } from "node:events";
import { installAuthenticatedReadMiddleware } from "../../server/authenticatedRead.ts";
import { controlRequestTimers } from "../../test-support/support/controlledRequestTimers.ts";
import {
  everyRepository,
  type RepositoryAnswerer,
} from "../../test-support/support/fakeGitHub.ts";
import type { GhRequest } from "../../test-support/support/ghRequest.ts";
import { heldInTurn } from "../../test-support/support/heldGitHubAnswer.ts";
import { startInProcessAuthenticatedRead } from "../../test-support/support/inProcessAuthenticatedRead.ts";

// A distinctive delay separates the pace from the read and process timers
// inside the same request. Other requests never enter the clock's scope.
export const controlledPaceMs = 811;

export async function controlledStreamServer() {
  const clock = controlRequestTimers(controlledPaceMs);
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
            clock.inRequest(() => {
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
    pendingPaces: clock.pendingTimers,
    waitForPace: clock.waitForTimer,
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
