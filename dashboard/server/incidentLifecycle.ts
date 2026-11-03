// The local boundary (`./localBoundaries.ts`) through which a dashboard
// server keeps this user's incident record (`./incidentRecord.ts`) for its
// own process: it records `process-started` when mounted, watches the event
// loop for stalls (`./eventLoopWatch.ts`) while it runs, and on a clean
// close writes every entry it queued and then `process-ended`. A process
// whose record has no end is read as lost (`./incidentProcesses.ts`).
//
// A clean close is the server's SIGTERM, which Vite's dev and preview
// servers and the boundary server (`./boundaryServer.ts`) answer by closing
// every boundary and exiting. The production preview runs under `npm`
// (`./productionPreview.mjs`), which forwards the SIGTERM its process group
// already received, so the server receives two; with no listener left after
// the first, the second would kill it mid-close. This boundary listens for
// SIGTERM while mounted, so a repeated one waits for that close, and exits
// the process if it has not ended `terminationGraceMs` after the first.
//
// With `DOUGH_TEST_EVENT_LOOP_BLOCK=allow` in its environment, and only
// then, it also answers `POST /__test/event-loop-block?ms=<n>` by blocking
// its event loop for that long: how a test makes the stall it observes.

import type { IncomingMessage, ServerResponse } from "node:http";
import { startEventLoopWatch } from "./eventLoopWatch.ts";
import { appendIncident, flushIncidents } from "./incidentRecord.ts";
import type { BoundaryCleanup, BoundaryMiddlewares } from "./localBoundary.ts";

const terminationGraceMs = 10_000;
const testBlockPath = "/__test/event-loop-block";
const testBlockLimitMs = 10_000;

export function installIncidentLifecycle(
  middlewares: BoundaryMiddlewares,
): BoundaryCleanup {
  appendIncident({ kind: "process-started" });
  const stopWatch = startEventLoopWatch();
  const releaseTermination = awaitCloseOnTermination();
  if (process.env["DOUGH_TEST_EVENT_LOOP_BLOCK"] === "allow") {
    middlewares.use(blockForTest);
  }
  let ending: Promise<void> | undefined;
  return () => {
    ending ??= (async () => {
      stopWatch();
      appendIncident({ kind: "process-ended" });
      await flushIncidents();
      releaseTermination();
    })();
    return ending;
  };
}

function awaitCloseOnTermination(): () => void {
  let grace: NodeJS.Timeout | undefined;
  const terminated = () => {
    grace ??= setTimeout(() => process.exit(143), terminationGraceMs);
    grace.unref();
  };
  process.on("SIGTERM", terminated);
  return () => {
    process.off("SIGTERM", terminated);
  };
}

function blockForTest(
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void,
): void {
  const url = new URL(req.url ?? "/", "http://127.0.0.1");
  if (url.pathname !== testBlockPath || req.method !== "POST") {
    next();
    return;
  }
  const asked = Number(url.searchParams.get("ms"));
  const ms = Number.isFinite(asked)
    ? Math.min(Math.max(asked, 0), testBlockLimitMs)
    : 0;
  const blockedFrom = Date.now();
  // Deliberately synchronous: the stall a test observes.
  let blockedFor = 0;
  while (blockedFor < ms) blockedFor = Date.now() - blockedFrom;
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      blockedFrom: new Date(blockedFrom).toISOString(),
      blockedUntil: new Date().toISOString(),
    }),
  );
}
