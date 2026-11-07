// A full sessions answer, regular or history, is sent gzip-encoded to a caller
// accepting gzip and as the same JSON unencoded to any other, one sending no
// `Accept-Encoding` or refusing gzip with `q=0` among them; either varies by
// `Accept-Encoding` and is never stored. An unchanged answer and a refusal
// stay unencoded JSON (../../server/agentLaunchResponse.ts). Sizes are the
// raw bytes received, read before any decoding.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { gunzipSync } from "node:zlib";
import { agentLaunchEndpoint } from "../../src/agentLaunch.ts";
import {
  sessionsAudienceParameter,
  sessionsHistoryAudience,
  sessionsRevisionHeader,
} from "../../src/machineSessionsRevision.ts";
import { markDone } from "../../tests/agentLaunchBoundary.ts";
import { launched } from "../../tests/agentTerminalBoundary.ts";
import {
  startDashboardServer,
  type DashboardServer,
} from "../../tests/support/dashboardServer.ts";
import { expect, test } from "../../tests/support/pageTest.ts";
import { rawRequest } from "../../tests/support/rawHttp.ts";

type Audience = "overview" | "history";

const ask = (
  server: DashboardServer,
  audience: Audience,
  headers: Readonly<Record<string, string>> = {},
) =>
  rawRequest({
    url: `${server.baseURL}${agentLaunchEndpoint}${audience === "history" ? `?${sessionsAudienceParameter}=${sessionsHistoryAudience}` : ""}`,
    headers: { Origin: server.origin, ...headers },
  });

const revisionOf = (body: string) =>
  (JSON.parse(body) as { revision: string }).revision;

// Callers accepting gzip, and callers that do not.
const accepting = [
  "gzip, deflate, br, zstd",
  "gzip",
  "GZIP;q=0.5",
  "x-gzip",
  "br;q=1, *;q=0.1",
];
const declining = [
  undefined,
  "gzip;q=0",
  "gzip; q=0.000, *",
  "identity",
  "br, deflate",
  "*;q=0",
  "gzip;q=2",
];

test.describe("the sessions answer's transfer encoding", () => {
  let machine: string;
  let server: DashboardServer;

  test.beforeEach(async () => {
    machine = mkdtempSync(path.join(tmpdir(), "dough-sessions-encoding-"));
    server = await startDashboardServer({
      mode: "boundary",
      machine,
      projectFolders: ["open-dough"],
    });
    // One retained done session and one open, so both audiences have entries.
    const done = await launched(server);
    await launched(server);
    expect(
      (
        await markDone(server, {
          source: "open-dough",
          session: done.sessionId,
        })
      ).status,
    ).toBe(200);
  });

  test.afterEach(async () => {
    await server.close();
    rmSync(machine, { recursive: true, force: true });
  });

  for (const audience of ["overview", "history"] as const) {
    test(`a full ${audience} answer is gzip-encoded only for a caller accepting gzip, decoding to the same JSON`, async () => {
      const plain = await ask(server, audience);
      expect(plain.status).toBe(200);
      const revision = revisionOf(plain.body);
      expect(plain.headers["content-encoding"]).toBeUndefined();
      for (const field of declining) {
        const declined = await ask(
          server,
          audience,
          field === undefined ? {} : { "Accept-Encoding": field },
        );
        expect(declined.status, field).toBe(200);
        expect(declined.headers["content-encoding"], field).toBeUndefined();
        expect(declined.headers["vary"], field).toBe("Accept-Encoding");
        expect(declined.headers["cache-control"], field).toBe("no-store");
        expect(declined.headers["content-type"], field).toBe(
          "application/json",
        );
        expect(declined.body, field).toBe(plain.body);
      }
      for (const field of accepting) {
        const encoded = await ask(server, audience, {
          "Accept-Encoding": field,
        });
        expect(encoded.status, field).toBe(200);
        expect(encoded.headers["content-encoding"], field).toBe("gzip");
        expect(encoded.headers["vary"], field).toBe("Accept-Encoding");
        expect(encoded.headers["cache-control"], field).toBe("no-store");
        expect(encoded.headers["content-type"], field).toBe("application/json");
        expect(Number(encoded.headers["content-length"]), field).toBe(
          encoded.raw.length,
        );
        // The raw bytes, before decoding, are fewer than the JSON's.
        expect(encoded.raw.length, field).toBeLessThan(plain.raw.length);
        const decoded = gunzipSync(encoded.raw).toString("utf8");
        // The same observation: the same revision, and the same JSON.
        expect(revisionOf(decoded), field).toBe(revision);
        expect(decoded, field).toBe(plain.body);
      }
    });

    test(`an unchanged ${audience} answer stays small, unencoded JSON`, async () => {
      const revision = revisionOf((await ask(server, audience)).body);
      const unchanged = await ask(server, audience, {
        "Accept-Encoding": "gzip, deflate, br",
        [sessionsRevisionHeader]: revision,
      });
      expect(unchanged.status).toBe(200);
      expect(unchanged.headers["content-encoding"]).toBeUndefined();
      expect(unchanged.headers["vary"]).toBeUndefined();
      expect(unchanged.headers["cache-control"]).toBe("no-store");
      expect(unchanged.body).toBe(
        `{"revision":${JSON.stringify(revision)},"unchanged":true}`,
      );
    });
  }

  test("a read from another site is refused as unencoded JSON", async () => {
    for (const audience of ["overview", "history"] as const) {
      const refused = await ask(server, audience, {
        Origin: "http://evil.example",
        "Accept-Encoding": "gzip",
      });
      expect(refused.status, audience).toBe(403);
      expect(refused.headers["content-encoding"], audience).toBeUndefined();
      expect(refused.headers["cache-control"], audience).toBe("no-store");
      expect(JSON.parse(refused.body), audience).toEqual({
        error: expect.any(String) as unknown,
      });
    }
  });
});
