// The local authenticated read boundary (../server/privateRead.ts) is
// tested here directly against real HTTP and a real, but controlled,
// subprocess -- not through the browser. A synthetic `gh` on this suite's own
// isolated server process's PATH answers exactly as each test arranges, and
// every invocation is logged, so these tests can assert what the boundary
// refuses before ever launching `gh`, what it pins into `gh`'s arguments, and
// what it never repeats into a failure response.
//
// This spec covers the boundary's HTTP contract: refusal, successful
// resolve-then-read, failure reporting, and dev/preview parity. Its
// subprocess lifecycle -- cancellation on disconnect, timeout, and shutdown
// -- is covered separately in ./private-read-subprocess-lifecycle.spec.ts,
// which shares this suite's harness (./support/privateReadServer.ts) but
// needs its own isolated server per scenario.
//
// This spec's servers are not the shared webServer (playwright.config.ts)
// the parallel public-origin specs use: each is a separate process, on its
// own port, with its own PATH and its own fake `gh`, so nothing here can
// leak into -- or race with -- those tests.

import { expect, test } from "@playwright/test";
import {
  startPrivateReadServer,
  type PrivateReadServer,
} from "./support/privateReadServer";
import { rawRequest } from "./support/rawHttp";

test.describe.configure({ mode: "serial" });

const knownSourceId = "open-dough";
const knownRepository = "terryyin/open-dough";
const revision = "ab".repeat(20);
const backlog = "# Product backlog\n\n## Taken\n\n## Backlog list\n";
const secretMarker = "gho_should-never-reach-a-browser-1234567890";

test.describe("private read boundary (dev launch mode)", () => {
  let server: PrivateReadServer;
  const port = 4290;

  test.beforeAll(async () => {
    server = await startPrivateReadServer({ mode: "dev", port });
  });

  test.afterAll(async () => {
    await server.close();
  });

  test("refuses a mismatched Origin before launching gh", async () => {
    server.setControl({ mode: "normal", revision, backlog });
    const response = await rawRequest({
      url: `${server.baseURL}/__private-read?source=${knownSourceId}`,
      headers: { Origin: "http://evil.example" },
    });
    expect(response.status).toBe(403);
    expect(server.ghCalls()).toHaveLength(0);
  });

  test("refuses a request with no Origin before launching gh", async () => {
    const response = await rawRequest({
      url: `${server.baseURL}/__private-read?source=${knownSourceId}`,
    });
    expect(response.status).toBe(403);
    expect(server.ghCalls()).toHaveLength(0);
  });

  test("refuses an unknown catalog source before launching gh", async () => {
    const response = await rawRequest({
      url: `${server.baseURL}/__private-read?source=not-a-real-project`,
      headers: { Origin: server.origin },
    });
    expect(response.status).toBe(404);
    expect(server.ghCalls()).toHaveLength(0);
  });

  test("refuses a non-GET method before launching gh", async () => {
    const response = await rawRequest({
      url: `${server.baseURL}/__private-read?source=${knownSourceId}`,
      method: "POST",
      headers: { Origin: server.origin },
    });
    expect(response.status).toBe(405);
    expect(server.ghCalls()).toHaveLength(0);
  });

  test("resolves the ref then reads the backlog pinned to that exact resolved revision", async () => {
    server.setControl({ mode: "normal", revision, backlog });
    const response = await rawRequest({
      url: `${server.baseURL}/__private-read?source=${knownSourceId}`,
      headers: { Origin: server.origin },
    });
    expect(response.status).toBe(200);
    expect(response.headers["cache-control"]).toBe("no-store");
    const body = JSON.parse(response.body) as {
      revision: string;
      backlog: string;
    };
    expect(body.revision).toBe(revision);
    expect(body.backlog).toBe(backlog);

    const calls = server.ghCalls();
    expect(calls).toHaveLength(2);
    const [refCall, contentCall] = calls as [string[], string[]];
    expect(refCall).toEqual([
      "api",
      `repos/${knownRepository}/commits/main`,
      "--jq",
      ".sha",
    ]);
    expect(contentCall).toEqual([
      "api",
      "-H",
      "Accept: application/vnd.github.raw+json",
      `repos/${knownRepository}/contents/.planning/PRODUCT-BACKLOG.md?ref=${revision}`,
    ]);
  });

  // A real browser's own same-origin `fetch` (this endpoint's only intended
  // caller) never carries an `Origin` header -- confirmed against this exact
  // production middleware from a real Chromium page in
  // ./private-project-overview.spec.ts, which this narrower case reproduces
  // without a browser: what it does carry is `Sec-Fetch-Site: same-origin`,
  // which `../server/localOrigin.ts` now accepts in place of `Origin`.
  test("accepts a same-origin request signaled by Sec-Fetch-Site with no Origin header at all", async () => {
    const callsBefore = server.ghCalls().length;
    const response = await rawRequest({
      url: `${server.baseURL}/__private-read?source=${knownSourceId}`,
      headers: { "Sec-Fetch-Site": "same-origin" },
    });
    expect(response.status).toBe(200);
    expect(server.ghCalls()).toHaveLength(callsBefore + 2);
  });

  test("still refuses Sec-Fetch-Site: cross-site even without an Origin header", async () => {
    const callsBefore = server.ghCalls().length;
    const response = await rawRequest({
      url: `${server.baseURL}/__private-read?source=${knownSourceId}`,
      headers: { "Sec-Fetch-Site": "cross-site" },
    });
    expect(response.status).toBe(403);
    expect(server.ghCalls()).toHaveLength(callsBefore);
  });

  test("never forwards gh's raw stderr or a credential-like marker into the failure response", async () => {
    const callsBefore = server.ghCalls().length;
    server.setControl({
      mode: "error",
      errorMessage: `fatal: ${secretMarker}\n`,
    });
    const response = await rawRequest({
      url: `${server.baseURL}/__private-read?source=${knownSourceId}`,
      headers: { Origin: server.origin },
    });
    expect(response.status).toBe(502);
    expect(response.body).not.toContain(secretMarker);
    expect(response.body).not.toContain("fatal:");
    // The ref resolution itself failed, so the content read is never
    // attempted with whatever partial/undefined revision that would imply.
    expect(server.ghCalls()).toHaveLength(callsBefore + 1);
  });
});

test.describe("private read boundary (preview launch mode)", () => {
  test("configurePreviewServer mounts the identical middleware", async () => {
    const server = await startPrivateReadServer({
      mode: "preview",
      port: 4293,
    });
    try {
      server.setControl({ mode: "normal", revision, backlog });
      const response = await rawRequest({
        url: `${server.baseURL}/__private-read?source=${knownSourceId}`,
        headers: { Origin: server.origin },
      });
      expect(response.status).toBe(200);
      const body = JSON.parse(response.body) as {
        revision: string;
        backlog: string;
      };
      expect(body.revision).toBe(revision);
      expect(body.backlog).toBe(backlog);
      expect(response.headers["cache-control"]).toBe("no-store");
    } finally {
      await server.close();
    }
  });
});
