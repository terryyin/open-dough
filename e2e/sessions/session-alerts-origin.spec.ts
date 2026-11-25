// Real listener reachability for the address families dashboardOrigin admits.
// Typed origin decisions:
// ../../dashboard/backend-tests/sessions/session-alerts-origin.spec.ts.
// The notification journeys own the default dashboard listener and emitted
// URL (./session-alerts.spec.ts).
import { createServer, type Server } from "node:http";
import { expect, test } from "../../dashboard/test-support/support/pageTest.ts";
import { dashboardOrigin } from "../../dashboard/server/dashboardOrigin.ts";
import { verifyLocalOrigin } from "../../dashboard/server/localOrigin.ts";
import { rawRequest } from "../../dashboard/test-support/support/rawHttp.ts";

function close(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error === undefined) resolve();
      else reject(error);
    });
  });
}

for (const address of ["127.0.0.1", "0.0.0.0", "::1", "::"]) {
  test(`an actual ${address} ephemeral listener yields a reachable admitted origin`, async () => {
    const server = createServer((request, response) => {
      try {
        verifyLocalOrigin(request);
        response.end("admitted");
      } catch {
        response.writeHead(403);
        response.end("refused");
      }
    });
    expect(dashboardOrigin(server)).toBeUndefined();
    try {
      await new Promise<void>((resolve, reject) => {
        server.once("error", reject);
        server.listen(0, address, resolve);
      });
      const origin = dashboardOrigin(server);
      expect(origin).toBeDefined();
      const actual = server.address();
      if (actual === null || typeof actual === "string" || origin === undefined)
        throw new Error("No listening TCP address");
      expect(new URL(origin).port).toBe(String(actual.port));
      expect(actual.port).not.toBe(4173);
      for (const headers of [
        { Origin: origin },
        { "Sec-Fetch-Site": "same-origin" },
      ]) {
        // Exercise the actual listener family, retaining the computed URL and
        // real Host/Origin admission even when default DNS drops IPv6 loopback.
        const response = await rawRequest({
          url: `${origin}/`,
          family: actual.family === "IPv6" ? 6 : 4,
          headers,
        });
        expect(response.status).toBe(200);
        expect(response.body).toBe("admitted");
      }
    } finally {
      await close(server);
    }
    expect(dashboardOrigin(server)).toBeUndefined();
  });
}
