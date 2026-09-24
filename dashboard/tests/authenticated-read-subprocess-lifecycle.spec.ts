// The local authenticated read boundary (../server/authenticatedRead.ts) is
// tested here directly against real HTTP and a real, but controlled,
// subprocess -- not through the browser. A synthetic `gh` on each isolated
// server process's PATH can hold a call open on command, so these tests can
// prove that a `gh` subprocess this boundary owns actually ends -- rather
// than being merely discarded -- on client disconnect, on its own read
// timeout, and on server shutdown. The Vite plugin hooks that own shutdown
// cleanup are isolated in ./authenticated-read-plugin-hooks.spec.ts.
//
// This spec covers the boundary's subprocess lifecycle. Its HTTP contract is
// covered separately in ./authenticated-read-refusal.spec.ts and
// ./authenticated-read-boundary.spec.ts, which share this suite's harness
// (./support/dashboardServer.ts). Membership reads, extra-path reads, and
// revision checks share the same cancellation ownership; cases differ only by
// URL shape. Every catalog source reaches that ownership through the same
// code, so each read kind is exercised for one source; which source is asked
// is covered in ./authenticated-project-overview.spec.ts. A page that
// abandons a check -- on hiding, a new read, or a project switch --
// disconnects the same way.
//
// This spec's servers are separate processes, each with its own PATH and its
// own fake `gh`, so nothing here can leak into -- or race with -- the page
// journeys' own servers.

import { expect, test } from "@playwright/test";
import { processAlive } from "./support/fakeGh";
import { everyRepository, hangs } from "./support/fakeGitHub";
import {
  authenticatedReadKinds,
  authenticatedReadUrl,
} from "./support/authenticatedReadUrl";
import {
  startDashboardServer,
  waitUntil,
  type DashboardServer,
} from "./support/dashboardServer";
import { abandonedRequest, rawRequest } from "./support/rawHttp";

test.describe.configure({ mode: "serial" });

test.describe("authenticated read boundary: cancels the held subprocess on client disconnect (dev mode)", () => {
  let server: DashboardServer;
  const port = 4295;

  test.beforeAll(async () => {
    server = await startDashboardServer({ mode: "dev", port });
  });

  test.afterAll(async () => {
    await server.close();
  });

  for (const { kind, label } of authenticatedReadKinds) {
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

test.describe("authenticated read boundary: bounded timeout without changing the production bound", () => {
  let server: DashboardServer;
  const port = 4291;
  // A short deadline for this isolated server only, via the same environment
  // seam `../server/ghRead.ts`'s `readTimeoutMs` reads; the 30-second
  // production default is untouched (see that module and
  // `../src/publishedWork.ts`'s `readWaitLimitMs`, which it mirrors).
  const shortTimeoutMs = 300;

  test.beforeAll(async () => {
    server = await startDashboardServer({
      mode: "dev",
      port,
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
      const port = {
        membership: 4292,
        "extra-path": 4302,
        "revision-check": 4303,
      }[kind];
      const server = await startDashboardServer({ mode: "dev", port });
      server.github.serve(everyRepository, hangs);
      abandonedRequest({
        url: authenticatedReadUrl(server.baseURL, kind),
        headers: { Origin: server.origin },
      });
      const becameAlive = await waitUntil(() => processAlive(server.ghPid()), {
        timeoutMs: 5_000,
      });
      expect(becameAlive).toBe(true);
      await server.close();
      const died = await waitUntil(() => !processAlive(server.ghPid()), {
        timeoutMs: 5_000,
      });
      expect(died).toBe(true);
    });
  }
});
