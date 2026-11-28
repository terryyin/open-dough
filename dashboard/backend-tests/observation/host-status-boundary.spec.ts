import { beforeEach, expect, onTestFinished, test, vi } from "vitest";
import { installHostStatusMiddleware } from "../../server/hostStatusBoundary.ts";
import { HostStatusObservation } from "../../server/hostStatusObservation.ts";
import { hostStatusEndpoint } from "../../src/hostStatus.ts";
import {
  startInProcessBoundaryHttp,
  type InProcessBoundaryHttp,
} from "../../test-support/support/inProcessBoundaryHttp.ts";
import { rawRequest } from "../../test-support/support/rawHttp.ts";

let server: InProcessBoundaryHttp;

beforeEach(async () => {
  const mounted = await startInProcessBoundaryHttp(
    { name: "dough-host-status", install: installHostStatusMiddleware },
    "production",
  );
  onTestFinished(async () => {
    try {
      await mounted.closeBoundary();
    } finally {
      await mounted.closeHttp();
    }
  });
  server = mounted;
});

test("the host status endpoint refuses foreign origins, foreign hosts and POST before sampling", async () => {
  const sample = vi.spyOn(HostStatusObservation.prototype, "observed");
  onTestFinished(() => {
    sample.mockRestore();
  });
  const url = `${server.origin}${hostStatusEndpoint}`;
  const foreignOrigin = await rawRequest({
    url,
    headers: { Origin: "http://other.example" },
  });
  const foreignHost = await rawRequest({
    url,
    headers: { Origin: server.origin, Host: "other.example" },
  });
  const post = await rawRequest({
    url,
    method: "POST",
    headers: { Origin: server.origin },
  });

  expect(foreignOrigin.status).toBe(403);
  expect(foreignHost.status).toBe(403);
  expect(post.status).toBe(405);
  expect(sample).not.toHaveBeenCalled();
});

test("a same-origin GET answers with uncached CPU and free bytes from a real sample", async () => {
  const answered = await rawRequest({
    url: `${server.origin}${hostStatusEndpoint}`,
    headers: { Origin: server.origin },
  });

  expect(answered.status).toBe(200);
  expect(answered.headers["cache-control"]).toBe("no-store");
  const { cpuPercent, freeBytes } = JSON.parse(answered.body) as {
    cpuPercent: unknown;
    freeBytes: unknown;
  };
  expect(cpuPercent).toBeTypeOf("number");
  expect(cpuPercent).toBeGreaterThanOrEqual(0);
  expect(cpuPercent).toBeLessThanOrEqual(100);
  expect(freeBytes).toBeTypeOf("number");
  expect(freeBytes).toBeGreaterThan(0);
});
