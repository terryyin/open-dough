// The authenticated read boundary owns pinned REST subprocesses. This proves
// they end on disconnect, their own wait bound, and server shutdown. Shared
// branch listing ownership is covered in the dedicated listing boundary specs.

import { expect, test } from "../../test-support/support/pageTest.ts";
import {
  processAlive,
  processRunning,
} from "../../test-support/support/processGroup.ts";
import {
  everyRepository,
  hangs,
} from "../../test-support/support/fakeGitHub.ts";
import { pinnedRead, readUrl } from "../../test-support/support/sharedReads.ts";
import {
  developmentBoundary,
  startDashboardServer,
  type DashboardServer,
} from "../../test-support/support/dashboardServer.ts";
import { waitUntil } from "../../test-support/support/waitUntil.ts";
import {
  abandonedRequest,
  rawRequest,
} from "../../test-support/support/rawHttp.ts";

test.describe.configure({ mode: "serial" });

// Each read kind whose `gh` subprocess the boundary owns.
const readKinds = [{ label: "pinned read", query: pinnedRead }] as const;

test.describe("authenticated read boundary: last-waiter disconnect ends pinned-read subprocesses (development environment)", () => {
  let server: DashboardServer;

  test.beforeAll(async () => {
    server = await startDashboardServer({
      ...developmentBoundary,
      ghTransport: "cli",
    });
  });

  test.afterAll(async () => {
    await server.close();
  });

  test("terminates a held pinned read when the request is abandoned (client disconnect)", async () => {
    server.github.serve(everyRepository, hangs);
    const abandoned = abandonedRequest({
      url: readUrl(server.baseURL, pinnedRead),
      headers: { Origin: server.origin },
    });
    const becameAlive = await waitUntil(() => processAlive(server.ghPid()), {
      timeoutMs: 5_000,
    });
    expect(becameAlive).toBe(true);
    abandoned.cutAfter(0);
    const died = await waitUntil(() => !processAlive(server.ghPid()), {
      timeoutMs: 5_000,
    });
    expect(died).toBe(true);
    expect(server.ghExitedBy()).toBe("SIGTERM");
  });
});

test.describe("authenticated read boundary: bounded timeout without changing the production bound", () => {
  let server: DashboardServer;
  // A short deadline for this isolated server only, via the same environment
  // seam `../../server/ghRead.ts`'s `readTimeoutMs` reads; the 30-second
  // production default is untouched (see that module and
  // `../../src/authenticatedReadRules.ts`'s `readWaitLimitMs`, which it mirrors).
  const shortTimeoutMs = 300;

  test.beforeAll(async () => {
    server = await startDashboardServer({
      ...developmentBoundary,
      ghTransport: "cli",
      readTimeoutMs: shortTimeoutMs,
      liveServer: "the server reads the GitHub request bound once per process",
    });
  });

  test.afterAll(async () => {
    await server.close();
  });

  for (const { label, query } of readKinds) {
    test(`ends a stalled ${label} at the read's own bound`, async () => {
      server.github.serve(everyRepository, hangs);
      const response = await rawRequest({
        url: readUrl(server.baseURL, query),
        headers: { Origin: server.origin },
      });
      expect(response.status).toBe(502);
      expect(response.body).toContain(
        "The local GitHub CLI did not answer within 0.3 seconds",
      );
      const died = await waitUntil(() => !processAlive(server.ghPid()), {
        timeoutMs: 5_000,
      });
      expect(died).toBe(true);
    });
  }
});

test.describe("authenticated read boundary: subprocess ownership across server shutdown", () => {
  // Left outstanding on purpose: each test's client never disconnects it.
  // Only `server.close()` acts. An earlier read case also destroyed
  // the connection after close, which confounded the result with the
  // request-disconnect path. The next describe isolates plugin-hook wiring;
  // these prove no owned subprocess survives a real shutdown.
  for (const { label, query } of readKinds) {
    test(`ends a held ${label} when the server itself closes`, async () => {
      const server = await startDashboardServer({
        ...developmentBoundary,
        liveServer: "separate process",
        ghTransport: "cli",
      });
      server.github.serve(everyRepository, hangs);
      abandonedRequest({
        url: readUrl(server.baseURL, query),
        headers: { Origin: server.origin },
      });
      const becameAlive = await waitUntil(() => processAlive(server.ghPid()), {
        timeoutMs: 5_000,
      });
      expect(becameAlive).toBe(true);
      const ghPid = server.ghPid();
      await server.close();
      // Already over once `close()` resolves: the harness removes the
      // directory this `gh` writes into, so it must not outlive the close.
      expect(processRunning(ghPid)).toBe(false);
    });
  }
});
