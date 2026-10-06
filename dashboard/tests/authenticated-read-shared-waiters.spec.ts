// A read shared at the local authenticated read boundary
// (../server/ghRead.ts) belongs to the requests waiting on it: one leaving
// leaves it running for the other, the last one leaving ends its `gh`
// process, and closing the server ends it for every request. Tested
// directly against real HTTP and the synthetic `gh`, with the requests made
// to coincide on a held answer as ./authenticated-read-shared.spec.ts makes
// them (./support/sharedReads.ts). A single request's disconnect, bound, and
// shutdown: ./authenticated-read-subprocess-lifecycle.spec.ts.

import { expect, test } from "./support/pageTest.ts";
import {
  startDashboardServer,
  waitUntil,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import { everyRepository, hangs } from "./support/fakeGitHub.ts";
import type { GhRequest } from "./support/ghRequest.ts";
import { processAlive, processRunning } from "./support/processGroup.ts";
import { abandonedRequest } from "./support/rawHttp.ts";
import {
  askedSince,
  readAt,
  refusedMarker,
  servedHolding,
  sharedSeedPath,
  sharedSeedRead,
  sharedSeedText,
} from "./support/sharedReads.ts";

test.describe.configure({ mode: "serial" });

const revisionOf = (pair: string) => pair.repeat(20);
const isSeed = (request: GhRequest) =>
  request.kind === "content" && request.path === sharedSeedPath;
const ghAlive = (server: DashboardServer, alive: boolean) =>
  waitUntil(() => processAlive(server.ghPid()) === alive, {
    timeoutMs: 5_000,
  });
// Once the held call reached GitHub, its `gh` runs until it is answered.
const heldCallReached = async (server: DashboardServer, before: number) => {
  await expect
    .poll(() => server.github.calls.length - before, { timeout: 5_000 })
    .toBeGreaterThanOrEqual(1);
  expect(processAlive(server.ghPid())).toBe(true);
};

test.describe("authenticated read boundary: a shared read belongs to its waiters (dev launch mode)", () => {
  let server: DashboardServer;

  test.beforeAll(async () => {
    server = await startDashboardServer({ mode: "dev" });
  });

  test.afterAll(async () => {
    await server.close();
  });

  const leaving = (query: string) =>
    abandonedRequest({
      url: `${server.baseURL}/__authenticated-read?source=open-dough${query}`,
      headers: { Origin: server.origin },
    });

  test("a read continues while one of its two requests leaves, and its other request is answered", async () => {
    const revision = revisionOf("6a");
    const holding = await servedHolding(server, revision, isSeed, [
      `&revision=${revision}`,
    ]);
    const left = leaving(sharedSeedRead(revision));
    const staying = readAt(server, sharedSeedRead(revision));
    await refusedMarker(server);
    await heldCallReached(server, holding.before);
    left.cutAfter(0);
    await refusedMarker(server);
    expect(processAlive(server.ghPid())).toBe(true);
    holding.release();
    expect(JSON.parse((await staying).body)).toMatchObject({
      text: sharedSeedText,
    });
    expect(askedSince(server, holding.before)).toEqual([
      `content ${sharedSeedPath}@${revision}`,
    ]);
  });

  test("a read ends once its last request leaves, and a later request asks again", async () => {
    const revision = revisionOf("6b");
    const holding = await servedHolding(server, revision, isSeed, [
      `&revision=${revision}`,
    ]);
    const first = leaving(sharedSeedRead(revision));
    const last = leaving(sharedSeedRead(revision));
    await refusedMarker(server);
    await heldCallReached(server, holding.before);
    first.cutAfter(0);
    await refusedMarker(server);
    expect(processAlive(server.ghPid())).toBe(true);
    last.cutAfter(0);
    expect(await ghAlive(server, false)).toBe(true);
    expect(server.ghExitedBy()).toBe("SIGTERM");
    expect(askedSince(server, holding.before)).toEqual([
      `content ${sharedSeedPath}@${revision}`,
    ]);

    holding.release();
    expect((await readAt(server, sharedSeedRead(revision))).status).toBe(200);
    expect(askedSince(server, holding.before)).toEqual([
      `content ${sharedSeedPath}@${revision}`,
      `content ${sharedSeedPath}@${revision}`,
    ]);
  });
});

test("closing the server ends a read two requests wait on", async () => {
  const server = await startDashboardServer({ mode: "dev" });
  server.github.serve(everyRepository, hangs);
  const url = `${server.baseURL}/__authenticated-read?source=open-dough`;
  abandonedRequest({ url, headers: { Origin: server.origin } });
  abandonedRequest({ url, headers: { Origin: server.origin } });
  await refusedMarker(server);
  await heldCallReached(server, 0);
  const ghPid = server.ghPid();
  await server.close();
  expect(server.ghCalls()).toHaveLength(1);
  expect(processRunning(ghPid)).toBe(false);
});
