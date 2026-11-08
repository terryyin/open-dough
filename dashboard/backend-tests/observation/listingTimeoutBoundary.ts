// Drive the HTTP waiter's bound and then the dashboard listing's own bound
// while the request owner and synthetic gh use their real process timers.
import { installAuthenticatedReadMiddleware } from "../../server/authenticatedRead.ts";
import { readWaitLimitMs } from "../../src/authenticatedReadRules.ts";
import { controlRequestTimers } from "../../tests/support/controlledRequestTimers.ts";
import { startInProcessAuthenticatedRead } from "../../tests/support/inProcessAuthenticatedRead.ts";
import { readPid } from "../../tests/support/processGroup.ts";
import { listingReuseWindowMs } from "../../tests/support/sharedReads.ts";

const waiterBoundMs = 917;

export async function listingTimeoutBoundary() {
  // The dashboard's GitHubRequests captured the default readWaitLimitMs
  // when its module loaded. The HTTP waiter reads its bound on each request.
  const clock = controlRequestTimers(waiterBoundMs, readWaitLimitMs);
  const boundary = await startInProcessAuthenticatedRead({
    extraEnv: () => ({
      DOUGH_READ_TIMEOUT_MS: String(waiterBoundMs),
      DOUGH_REVISION_CHECK_REUSE_MS: String(listingReuseWindowMs),
    }),
    install: (middlewares) =>
      installAuthenticatedReadMiddleware({
        use: (handler) =>
          middlewares.use((req, res, next) => {
            const url = new URL(req.url ?? "", "http://localhost");
            if (url.searchParams.has("since")) {
              clock.inRequest(() => {
                handler(req, res, next);
              });
            } else {
              handler(req, res, next);
            }
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
    ghPid: () => readPid(boundary.gh.pidPath),
    expireWaiter: () => clock.advance(waiterBoundMs),
    expireListing: () => clock.advance(readWaitLimitMs - waiterBoundMs),
    async close() {
      try {
        await boundary.close();
      } finally {
        clock.restore();
      }
    },
  };
}
