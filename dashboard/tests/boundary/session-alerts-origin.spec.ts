// Listening-address selection also has to reach existing local admission.
// These servers use the real socket/Host/Origin guard, with no helper or host.
import { createServer, type Server } from "node:http";
import { expect, test } from "../support/pageTest.ts";
import { dashboardOrigin } from "../../server/dashboardOrigin.ts";
import { verifyLocalOrigin } from "../../server/localOrigin.ts";
import { rawRequest } from "../support/rawHttp.ts";

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
        const response = await rawRequest({ url: `${origin}/`, headers });
        expect(response.status).toBe(200);
        expect(response.body).toBe("admitted");
      }
    } finally {
      await close(server);
    }
    expect(dashboardOrigin(server)).toBeUndefined();
  });
}

test("null, non-TCP, unusable explicit addresses, and invalid ports have no invented destination", () => {
  expect(dashboardOrigin(null)).toBeUndefined();
  for (const address of [
    null,
    "/tmp/dashboard.sock",
    ...[
      ["192.0.2.1", 1234],
      ["127.0.0.2", 1234],
      ["127.0.0.1", 0],
      ["127.0.0.1", -1],
      ["127.0.0.1", 65_536],
    ].map(([host, port]) => ({
      address: String(host),
      port: Number(port),
      family: "IPv4",
    })),
  ]) {
    expect(dashboardOrigin({ address: () => address })).toBeUndefined();
  }
});
