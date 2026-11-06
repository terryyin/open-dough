// The local authenticated read boundary (../../server/authenticatedRead.ts) is
// tested here directly against real HTTP and a real, but controlled,
// subprocess -- not through the browser. A synthetic `gh` on each isolated
// server process's PATH can hold a call open on command, so these tests can
// prove that a `gh` subprocess this boundary owns actually ends -- rather
// than being merely discarded -- when the last waiter disconnects (membership
// and extra-path reads), on its own read timeout, and on server shutdown. A
// revision-check listing runs under its own tracked controller
// (../../server/revisionChecks.ts), so a departed requester leaves `gh`
// alive until the listing settles or the boundary closes; that disconnect
// ownership is proved here, and close-while-running in
// ./authenticated-read-shared-listing-failures.spec.ts. The Vite plugin hooks
// that own shutdown cleanup are isolated in
// ./authenticated-read-plugin-hooks.spec.ts.
//
// This spec covers the boundary's subprocess lifecycle. Its HTTP contract is
// covered separately in ./authenticated-read-refusal.spec.ts and
// ./authenticated-read-boundary.spec.ts, which share this suite's harness
// (../support/dashboardServer.ts). Membership reads, extra-path reads, and
// revision checks differ by URL shape and, for disconnect, by whether the
// held work is the request itself or a shared listing. Every catalog source
// reaches that ownership through the same code, so each read kind is
// exercised for one source; which source is asked is covered in
// ../tests/observation/authenticated-project-observation.spec.ts. A page that abandons a check
// -- on hiding, a new read, or a project switch -- disconnects the same way.
//
// This spec's servers are separate processes, each with its own PATH and its
// own fake `gh`, so nothing here can leak into -- or race with -- the page
// journeys' own servers.

import { expect, test } from "../tests/support/pageTest.ts";
import { processAlive, processRunning } from "../tests/support/processGroup.ts";
import { everyRepository, hangs } from "../tests/support/fakeGitHub.ts";
import {
  authenticatedReadKinds,
  authenticatedReadUrl,
} from "../tests/support/authenticatedReadUrl.ts";
import {
  developmentBoundary,
  startDashboardServer,
  type DashboardServer,
} from "../tests/support/dashboardServer.ts";
import { waitUntil } from "../tests/support/waitUntil.ts";
import { abandonedRequest, rawRequest } from "../tests/support/rawHttp.ts";

test.describe.configure({ mode: "serial" });

test.describe("authenticated read boundary: last-waiter disconnect ends membership and extra-path subprocesses (development environment)", () => {
  let server: DashboardServer;

  test.beforeAll(async () => {
    server = await startDashboardServer(developmentBoundary);
  });

  test.afterAll(async () => {
    await server.close();
  });

  for (const { kind, label } of authenticatedReadKinds.filter(
    ({ kind: readKind }) => readKind !== "revision-check",
  )) {
    test(`terminates a held ${label} when the request is abandoned (client disconnect)`, async () => {
      server.github.serve(everyRepository, hangs);
      const abandoned = abandonedRequest({
        url: authenticatedReadUrl(server.baseURL, kind),
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
  }
});

test.describe("authenticated read boundary: revision-check listing survives requester disconnect (development environment)", () => {
  let server: DashboardServer;

  test.beforeAll(async () => {
    server = await startDashboardServer(developmentBoundary);
  });

  test.afterAll(async () => {
    await server.close();
  });

  test("leaves a held revision check running when the request is abandoned (client disconnect)", async () => {
    server.github.serve(everyRepository, hangs);
    const abandoned = abandonedRequest({
      url: authenticatedReadUrl(server.baseURL, "revision-check"),
      headers: { Origin: server.origin },
    });
    const becameAlive = await waitUntil(() => processAlive(server.ghPid()), {
      timeoutMs: 5_000,
    });
    expect(becameAlive).toBe(true);
    const ghPid = server.ghPid();
    abandoned.cutAfter(0);
    // The listing keeps its own tracked controller; only boundary close (or
    // settlement) ends it. Give a last-waiter SIGTERM time to have arrived,
    // then require the process still live. Close-while-running is covered in
    // ./authenticated-read-shared-listing-failures.spec.ts and in the
    // shutdown describe below.
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 1_000);
    });
    expect(processAlive(ghPid)).toBe(true);
    expect(processRunning(ghPid)).toBe(true);
  });
});

test.describe("authenticated read boundary: bounded timeout without changing the production bound", () => {
  let server: DashboardServer;
  // A short deadline for this isolated server only, via the same environment
  // seam `../server/ghRead.ts`'s `readTimeoutMs` reads; the 30-second
  // production default is untouched (see that module and
  // `../src/authenticatedReadRules.ts`'s `readWaitLimitMs`, which it mirrors).
  const shortTimeoutMs = 300;

  test.beforeAll(async () => {
    server = await startDashboardServer({
      ...developmentBoundary,
      readTimeoutMs: shortTimeoutMs,
    });
  });

  test.afterAll(async () => {
    await server.close();
  });

  for (const { kind, label } of authenticatedReadKinds) {
    test(`ends a stalled ${label} at the read's own bound`, async () => {
      server.github.serve(everyRepository, hangs);
      const response = await rawRequest({
        url: authenticatedReadUrl(server.baseURL, kind),
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
  // Only `server.close()` acts. An earlier membership case also destroyed
  // the connection after close, which confounded the result with the
  // request-disconnect path. The next describe isolates plugin-hook wiring;
  // these prove no owned subprocess survives a real shutdown.
  for (const { kind, label } of authenticatedReadKinds) {
    test(`ends a held ${label} when the server itself closes`, async () => {
      const server = await startDashboardServer(developmentBoundary);
      server.github.serve(everyRepository, hangs);
      abandonedRequest({
        url: authenticatedReadUrl(server.baseURL, kind),
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
