// Local inspection of failed upstream reads at the authenticated read
// boundary (../server/readDiagnostics.ts, routed from
// ../server/authenticatedRead.ts): a same-origin loopback GET that names
// established causes and safe request evidence, and never discloses raw or
// credential-bearing input. Refusal makes no GitHub call. Eviction, metadata
// bounds, departure, and pin attribution:
// ./authenticated-read-diagnostics-bounds.spec.ts. Shares the harness with
// ./authenticated-read-boundary.spec.ts and the short-bound / shared-read
// fixtures used by subprocess-lifecycle and shared-waiters.

import { expect, test } from "./support/pageTest.ts";
import { everyRepository, hangs } from "./support/fakeGitHub.ts";
import type { GhRequest } from "./support/ghRequest.ts";
import { httpErrorAnswer, rateLimitedAnswer } from "./originAnswers.ts";
import { rawRequest } from "./support/rawHttp.ts";
import {
  readAt,
  refusedMarker,
  servedHolding,
  sharedSeedPath,
  sharedSeedRead,
} from "./support/sharedReads.ts";
import {
  diagnosticsUrl,
  inspect,
  knownSourceId,
  secretMarker,
  startDashboardServer,
  type DashboardServer,
} from "./support/readDiagnostics.ts";

test.describe.configure({ mode: "serial" });

test.describe("authenticated read diagnostics (dev launch mode)", () => {
  let server: DashboardServer;

  test.beforeAll(async () => {
    server = await startDashboardServer({ mode: "dev" });
  });

  test.afterAll(async () => {
    await server.close();
  });

  test("a new server has an empty diagnostic history and asks GitHub nothing to inspect it", async () => {
    const callsBefore = server.ghCalls().length;
    const seen = await inspect(server);
    expect(seen.status).toBe(200);
    expect(seen.failures).toEqual([]);
    expect(server.ghCalls()).toHaveLength(callsBefore);
  });

  test("refuses unknown sources, disallowed origins, and non-GET before any GitHub call", async () => {
    const callsBefore = server.ghCalls().length;
    expect(
      (
        await rawRequest({
          url: diagnosticsUrl(server, "not-a-real-project"),
          headers: { Origin: server.origin },
        })
      ).status,
    ).toBe(404);
    expect(
      (
        await rawRequest({
          url: diagnosticsUrl(server),
          headers: { Origin: "http://evil.example" },
        })
      ).status,
    ).toBe(403);
    expect(
      (
        await rawRequest({
          url: diagnosticsUrl(server),
          method: "POST",
          headers: { Origin: server.origin },
        })
      ).status,
    ).toBe(405);
    expect(server.ghCalls()).toHaveLength(callsBefore);
  });

  test("names a shared timeout, an unmarked 403, and a marked rate limit with available evidence", async () => {
    const short = await startDashboardServer({
      mode: "dev",
      readTimeoutMs: 300,
    });
    try {
      short.github.serve(everyRepository, hangs);
      expect(
        (
          await rawRequest({
            url: `${short.baseURL}/__authenticated-read?source=${knownSourceId}`,
            headers: { Origin: short.origin },
          })
        ).status,
      ).toBe(502);

      short.github.serve(everyRepository, () =>
        Promise.resolve(httpErrorAnswer(403, `forbidden body ${secretMarker}`)),
      );
      expect(
        (
          await rawRequest({
            url: `${short.baseURL}/__authenticated-read?source=${knownSourceId}`,
            headers: { Origin: short.origin },
          })
        ).status,
      ).toBe(502);

      const reset = Math.floor(Date.now() / 1000) + 90;
      short.github.serve(everyRepository, () =>
        Promise.resolve(
          rateLimitedAnswer(403, {
            "Retry-After": "60",
            "X-RateLimit-Limit": "5000",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(reset),
            "X-RateLimit-Resource": "core",
            "X-GitHub-Request-Id": "ABCD:efgh:1234:5678",
            "X-Secret-Header": `bearer ${secretMarker}`,
          }),
        ),
      );
      expect(
        (
          await rawRequest({
            url: `${short.baseURL}/__authenticated-read?source=${knownSourceId}`,
            headers: { Origin: short.origin },
          })
        ).status,
      ).toBe(502);

      const seen = await inspect(short);
      expect(seen.status).toBe(200);
      expect(seen.body).not.toContain(secretMarker);
      expect(seen.body).not.toContain("forbidden body");
      expect(seen.body).not.toContain("X-Secret-Header");
      expect(seen.body).not.toContain("bearer ");
      expect(seen.failures.map((entry) => entry.cause)).toEqual([
        "timed-out",
        "http",
        "rate-limited",
      ]);
      expect(seen.failures[0]).toMatchObject({
        source: knownSourceId,
        category: "ref",
        cause: "timed-out",
      });
      expect(seen.failures[0]?.status).toBeUndefined();
      expect(seen.failures[0]?.requestId).toBeUndefined();
      expect(seen.failures[0]?.elapsedMs).toBeGreaterThan(0);

      expect(seen.failures[1]).toMatchObject({
        source: knownSourceId,
        category: "ref",
        cause: "http",
        status: 403,
      });
      expect(seen.failures[1]?.requestId).toBeUndefined();

      expect(seen.failures[2]).toMatchObject({
        source: knownSourceId,
        category: "ref",
        cause: "rate-limited",
        status: 403,
        requestId: "ABCD:efgh:1234:5678",
        rateLimit: {
          limit: 5000,
          remaining: 0,
          reset,
          resource: "core",
          retryAfterSeconds: 60,
        },
      });
    } finally {
      await short.close();
    }
  });

  test("one shared read with concurrent waiters produces one diagnostic entry", async () => {
    const revision = "d1".repeat(20);
    const isSeed = (request: GhRequest) =>
      request.kind === "content" && request.path === sharedSeedPath;
    const holding = await servedHolding(
      server,
      revision,
      isSeed,
      [`&revision=${revision}`],
      httpErrorAnswer(502, `shared-failure ${secretMarker}`),
    );
    const before = (await inspect(server)).failures.length;
    const first = readAt(server, sharedSeedRead(revision));
    const second = readAt(server, sharedSeedRead(revision));
    await refusedMarker(server);
    holding.release();
    expect((await first).status).toBe(502);
    expect((await second).status).toBe(502);
    const seen = await inspect(server);
    const added = seen.failures.slice(before);
    expect(added).toHaveLength(1);
    expect(added[0]).toMatchObject({
      source: knownSourceId,
      category: "content",
      pin: revision,
      cause: "http",
      status: 502,
    });
    expect(seen.body).not.toContain(secretMarker);
  });
});

test("preview launch mode mounts the same diagnostics route without asking GitHub", async () => {
  const server = await startDashboardServer({ mode: "preview" });
  try {
    const callsBefore = server.ghCalls().length;
    const seen = await inspect(server);
    expect(seen.status).toBe(200);
    expect(seen.failures).toEqual([]);
    expect(server.ghCalls()).toHaveLength(callsBefore);
    expect(server.outDir).toBeDefined();
    // Build output must not embed credential-like markers from this suite.
    expect(server.output()).not.toContain(secretMarker);
  } finally {
    await server.close();
  }
});
