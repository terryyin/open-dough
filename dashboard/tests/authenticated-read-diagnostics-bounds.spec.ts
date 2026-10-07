// Bounds and attribution for local authenticated-read diagnostics
// (../server/readDiagnostics.ts): newest-100 eviction, source filtering,
// optional/malformed/oversized metadata omission, ordinary waiter departure,
// and admitted pin on pinned content. Cause naming, refusal, shared-waiter
// count, and launch-mode mounting:
// ./authenticated-read-diagnostics.spec.ts.

import { expect, test } from "./support/pageTest.ts";
import {
  everyRepository,
  failsWith,
  hangs,
  publishes,
} from "./support/fakeGitHub.ts";
import { httpErrorAnswer, rateLimitedAnswer } from "./originAnswers.ts";
import { abandonedRequest, rawRequest } from "./support/rawHttp.ts";
import {
  inspect,
  knownSourceId,
  oversized,
  secretMarker,
  startDashboardServer,
} from "./support/readDiagnostics.ts";

test.describe.configure({ mode: "serial" });

test("keeps only the newest 100 failures and filters by configured source", async () => {
  // Fresh process so eviction is not confounded by earlier cases.
  const isolated = await startDashboardServer({ mode: "dev" });
  try {
    for (let at = 0; at < 101; at += 1) {
      isolated.github.serve(everyRepository, () =>
        Promise.resolve(
          httpErrorAnswer(503, `wave-${String(at)} ${secretMarker}`),
        ),
      );
      expect(
        (
          await rawRequest({
            url: `${isolated.baseURL}/__authenticated-read?source=${knownSourceId}`,
            headers: { Origin: isolated.origin },
          })
        ).status,
      ).toBe(502);
    }
    const openDough = await inspect(isolated, knownSourceId);
    expect(openDough.failures).toHaveLength(100);
    expect(openDough.failures[0]?.cause).toBe("http");
    expect(openDough.failures.every((entry) => entry.status === 503)).toBe(
      true,
    );
    expect(openDough.body).not.toContain(secretMarker);
    expect(openDough.body).not.toContain("wave-0");

    const other = await inspect(isolated, "pygardon");
    expect(other.status).toBe(200);
    expect(other.failures).toEqual([]);
  } finally {
    await isolated.close();
  }
});

test("omits optional, malformed, and oversized metadata and never retains secret-like markers", async () => {
  const isolated = await startDashboardServer({ mode: "dev" });
  try {
    // CLI failure first: a following rate-limit refusal would hold later
    // reads back without another upstream call.
    isolated.github.serve(
      everyRepository,
      failsWith(`fatal: ${secretMarker}\nGH_TOKEN=${secretMarker}\n`),
    );
    expect(
      (
        await rawRequest({
          url: `${isolated.baseURL}/__authenticated-read?source=${knownSourceId}`,
          headers: { Origin: isolated.origin },
        })
      ).status,
    ).toBe(502);

    isolated.github.serve(everyRepository, () =>
      Promise.resolve(
        rateLimitedAnswer(429, {
          "Retry-After": "not-a-wait",
          "X-RateLimit-Limit": "-1",
          "X-RateLimit-Remaining": "remaining",
          "X-RateLimit-Reset": "1.5",
          "X-RateLimit-Resource": oversized,
          "X-GitHub-Request-Id": oversized,
          "X-Custom": `token=${secretMarker}`,
        }),
      ),
    );
    expect(
      (
        await rawRequest({
          url: `${isolated.baseURL}/__authenticated-read?source=${knownSourceId}`,
          headers: { Origin: isolated.origin },
        })
      ).status,
    ).toBe(502);

    const seen = await inspect(isolated);
    expect(seen.body).not.toContain(secretMarker);
    expect(seen.body).not.toContain("GH_TOKEN");
    expect(seen.body).not.toContain("fatal:");
    expect(seen.body).not.toContain(oversized);
    expect(seen.failures).toHaveLength(2);
    expect(seen.failures[0]).toMatchObject({ cause: "failed" });
    expect(seen.failures[0]?.status).toBeUndefined();
    expect(seen.failures[1]).toMatchObject({
      cause: "rate-limited",
      status: 429,
    });
    expect(seen.failures[1]?.requestId).toBeUndefined();
    expect(seen.failures[1]?.rateLimit).toBeUndefined();
  } finally {
    await isolated.close();
  }
});

test("ordinary waiter departure does not record a diagnostic failure", async () => {
  const isolated = await startDashboardServer({
    mode: "dev",
    readTimeoutMs: 5_000,
  });
  try {
    isolated.github.serve(everyRepository, hangs);
    const abandoned = abandonedRequest({
      url: `${isolated.baseURL}/__authenticated-read?source=${knownSourceId}`,
      headers: { Origin: isolated.origin },
    });
    await expect
      .poll(() => isolated.ghCalls().length, { timeout: 5_000 })
      .toBeGreaterThanOrEqual(1);
    abandoned.cutAfter(0);
    await expect
      .poll(async () => (await inspect(isolated)).failures.length, {
        timeout: 5_000,
      })
      .toBe(0);
  } finally {
    await isolated.close();
  }
});

test("pinned content failures carry the admitted pin without changing the shared read", async () => {
  const server = await startDashboardServer({ mode: "dev" });
  try {
    const revision = "e2".repeat(20);
    const seedPath = ".planning/seeds/SEED-diagnostics.md";
    const backlog = `# Product backlog

## Taken

## Backlog list

- [Diagnostics](seeds/SEED-diagnostics.md#story) — SEED-diagnostics#story
`;
    server.github.serve(
      everyRepository,
      publishes({
        revision,
        backlog,
        files: {
          ".planning/PRODUCT-BACKLOG.md": backlog,
          [seedPath]: "# Seed\n",
        },
      }),
    );
    expect(
      (
        await rawRequest({
          url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}`,
          headers: { Origin: server.origin },
        })
      ).status,
    ).toBe(200);
    server.github.serve(everyRepository, () =>
      Promise.resolve(httpErrorAnswer(500)),
    );
    expect(
      (
        await rawRequest({
          url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}&revision=${revision}&path=${encodeURIComponent(seedPath)}`,
          headers: { Origin: server.origin },
        })
      ).status,
    ).toBe(502);
    const seen = await inspect(server);
    expect(seen.failures.at(-1)).toMatchObject({
      source: knownSourceId,
      category: "content",
      pin: revision,
      cause: "http",
      status: 500,
    });
  } finally {
    await server.close();
  }
});
