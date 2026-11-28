// Controls only the authenticated-read stream's pace. The HTTP server,
// request owner and Git origin use real time. Check the next scheduled tick
// or the server's observed disconnect before stepping cadence.
import { EventEmitter, once } from "node:events";
import { installAuthenticatedReadMiddleware } from "../../server/authenticatedRead.ts";
import { controlRequestTimers } from "../../test-support/support/controlledRequestTimers.ts";
import path from "node:path";
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
    home: path.join(boundary.tempRoot, "home"),
    advance: clock.advance,
    pendingPaces: clock.pendingTimers,
    waitForPace: clock.waitForTimer,
    async disconnect(stream: { close(): void }) {
      const disconnected = once(responses, "disconnect");
      stream.close();
      await disconnected;
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
