// A shared read that stalls, at the local authenticated read boundary
// (../../server/ghRead.ts): no request, however late it joins, waits past
// its own bound or keeps the `gh` call running past the call's, and the next
// request asks again. Tested directly against real HTTP and the synthetic
// `gh`, with the requests made to coincide on a held answer
// (../../test-support/support/sharedReads.ts). A refused shared read:
// ./authenticated-read-shared-requests.spec.ts.
// One request's refusals: ./authenticated-read-revision-check-failures.spec.ts;
// its bound: ./authenticated-read-subprocess-lifecycle.spec.ts.

import { expect, test } from "../../test-support/support/pageTest.ts";
import {
  developmentBoundary,
  startDashboardServer,
  type DashboardServer,
} from "../../test-support/support/dashboardServer.ts";
import { waitUntil } from "../../test-support/support/waitUntil.ts";
import type { GhRequest } from "../../test-support/support/ghRequest.ts";
import { processAlive } from "../../test-support/support/processGroup.ts";
import {
  askedSince,
  readAt,
  refusedMarker,
  servedHolding,
  sharedSeedPath,
  sharedSeedRead,
} from "../../test-support/support/sharedReads.ts";

test.describe.configure({ mode: "serial" });

const revisionOf = (pair: string) => pair.repeat(20);
const isSeed = (request: GhRequest) =>
  request.kind === "content" && request.path === sharedSeedPath;
const isListing = (request: GhRequest) => request.kind === "matching-refs";

const failed = (body: string) => JSON.parse(body) as unknown;

// A read's answer and when it arrived.
const answeredAt = (server: DashboardServer, query: string) =>
  readAt(server, query).then((answer) => ({ answer, at: Date.now() }));

test.describe("authenticated read boundary: a stalled shared read ends at its own bound for every waiter", () => {
  let server: DashboardServer;
  // A short bound for this isolated server only, through the environment
  // seam `../../server/ghRead.ts`'s `readTimeoutMs` reads, long enough for a
  // second request to join halfway through it with a comfortable margin on
  // either side.
  const boundMs = 3_000;

  test.beforeAll(async () => {
    server = await startDashboardServer({
      ...developmentBoundary,
      ghTransport: "cli",
      readTimeoutMs: boundMs,
      liveServer: "the server reads the GitHub request bound once per process",
    });
  });

  test.afterAll(async () => {
    await server.close();
  });

  const stalls = [
    {
      label: "pinned read",
      revision: revisionOf("7d"),
      held: isSeed,
      warm: (revision: string) => `&revision=${revision}`,
      read: sharedSeedRead,
      reading: (revision: string) => `${sharedSeedPath} at ${revision}`,
      asked: (revision: string) => `content ${sharedSeedPath}@${revision}`,
    },
    {
      label: "revision check",
      revision: revisionOf("7e"),
      held: isListing,
      warm: (revision: string) => `&since=${revision}`,
      read: (revision: string) => `&since=${revision}`,
      reading: () => "main of terryyin/open-dough",
      asked: () => "matching-refs",
    },
  ];

  for (const stall of stalls) {
    test(`a ${stall.label} joined late is answered as timed out within each request's bound, its \`gh\` ends at the read's bound, and a later request asks again`, async () => {
      const { revision } = stall;
      const held = await servedHolding(server, revision, stall.held, [
        stall.warm(revision),
      ]);
      const { before } = held;

      const firstAsked = Date.now();
      const first = answeredAt(server, stall.read(revision));
      await refusedMarker(server);
      await expect
        .poll(() => server.github.calls.length - before, { timeout: 5_000 })
        .toBe(1);
      expect(processAlive(server.ghPid())).toBe(true);
      // Join halfway through the read's bound: the read's bound then ends
      // half a bound before the joiner's own would, so a wait of the
      // joiner's own, or a read it kept outstanding, would end at or past
      // the joiner's deadline.
      await new Promise((resolve) =>
        setTimeout(resolve, firstAsked + boundMs / 2 - Date.now()),
      );
      const joinerDeadline = Date.now() + boundMs;
      const late = answeredAt(server, stall.read(revision));
      await refusedMarker(server);
      const { answer: firstAnswer, at: firstAnsweredAt } = await first;
      const { answer: lateAnswer, at: lateAnsweredAt } = await late;
      const ghEndedAt = (await waitUntil(() => !processAlive(server.ghPid()), {
        timeoutMs: 5_000,
      }))
        ? Date.now()
        : Infinity;

      const timedOut = {
        error: `The local GitHub CLI did not answer within ${String(boundMs / 1000)} seconds while reading ${stall.reading(revision)}.`,
        recovery: "transient",
      };
      expect([firstAnswer.status, lateAnswer.status]).toEqual([502, 502]);
      expect(failed(firstAnswer.body)).toEqual(timedOut);
      expect(failed(lateAnswer.body)).toEqual(timedOut);
      expect(firstAnsweredAt).toBeLessThan(joinerDeadline);
      expect(lateAnsweredAt).toBeLessThan(joinerDeadline);
      expect(ghEndedAt).toBeLessThan(joinerDeadline);
      expect(askedSince(server, before)).toEqual([stall.asked(revision)]);

      held.release();
      expect((await readAt(server, stall.read(revision))).status).toBe(200);
      expect(askedSince(server, before)).toEqual([
        stall.asked(revision),
        stall.asked(revision),
      ]);
    });
  }
});
