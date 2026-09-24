// Which requests the local authenticated read boundary
// (../server/authenticatedRead.ts) refuses before ever launching `gh`, and the
// same-origin signal it accepts in place of an Origin header -- tested
// directly against real HTTP, not through the browser. A synthetic `gh` on
// this spec's own isolated server process's PATH records every invocation
// through a fake GitHub, so each refusal can prove no `gh` call was made.
// What the boundary reads and reports once a request is accepted is covered
// in ./authenticated-read-boundary.spec.ts.

import { expect, test } from "@playwright/test";
import {
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer";
import { everyRepository, publishes } from "./support/fakeGitHub";
import { rawRequest } from "./support/rawHttp";
import { agentIdentity } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";

test.describe.configure({ mode: "serial" });

const knownSourceId = "open-dough";
const revision = "ab".repeat(20);
const backlog = "# Product backlog\n\n## Taken\n\n## Backlog list\n";
const secretMarker = "gho_should-never-reach-a-browser-1234567890";

test.describe("authenticated read boundary refusal (dev launch mode)", () => {
  let server: DashboardServer;

  test.beforeAll(async () => {
    server = await startDashboardServer({ mode: "dev" });
  });

  test.afterAll(async () => {
    await server.close();
  });

  test("refuses a mismatched Origin before launching gh", async () => {
    server.github.serve(everyRepository, publishes({ revision, backlog }));
    const response = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}`,
      headers: { Origin: "http://evil.example" },
    });
    expect(response.status).toBe(403);
    expect(server.ghCalls()).toHaveLength(0);
  });

  test("refuses a request with no Origin before launching gh", async () => {
    const response = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}`,
    });
    expect(response.status).toBe(403);
    expect(server.ghCalls()).toHaveLength(0);
  });

  test("refuses an unknown catalog source before launching gh", async () => {
    const response = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=not-a-real-project`,
      headers: { Origin: server.origin },
    });
    expect(response.status).toBe(404);
    expect(server.ghCalls()).toHaveLength(0);
  });

  test("refuses a non-GET method before launching gh", async () => {
    const response = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}`,
      method: "POST",
      headers: { Origin: server.origin },
    });
    expect(response.status).toBe(405);
    expect(server.ghCalls()).toHaveLength(0);
  });

  // A real browser's own same-origin `fetch` (this endpoint's only intended
  // caller) never carries an `Origin` header -- confirmed against this exact
  // production middleware from a real Chromium page in
  // ./authenticated-project-overview.spec.ts, which this narrower case reproduces
  // without a browser: what it does carry is `Sec-Fetch-Site: same-origin`,
  // which `../server/localOrigin.ts` now accepts in place of `Origin`.
  test("accepts a same-origin request signaled by Sec-Fetch-Site with no Origin header at all", async () => {
    server.github.serve(everyRepository, publishes({ revision, backlog }));
    const callsBefore = server.ghCalls().length;
    const response = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}`,
      headers: { "Sec-Fetch-Site": "same-origin" },
    });
    expect(response.status).toBe(200);
    expect(server.ghCalls()).toHaveLength(callsBefore + 2);
  });

  test("still refuses Sec-Fetch-Site: cross-site even without an Origin header", async () => {
    const callsBefore = server.ghCalls().length;
    const response = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}`,
      headers: { "Sec-Fetch-Site": "cross-site" },
    });
    expect(response.status).toBe(403);
    expect(server.ghCalls()).toHaveLength(callsBefore);
  });

  test("refuses an arbitrary repository path that the pinned revision's records do not name", async () => {
    server.github.serve(
      everyRepository,
      publishes({
        revision,
        backlog,
        files: {
          ".planning/PRODUCT-BACKLOG.md": backlog,
        },
      }),
    );
    const callsBefore = server.ghCalls().length;
    const response = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}&revision=${revision}&path=${encodeURIComponent(".planning/secrets/not-in-backlog.md")}`,
      headers: { Origin: server.origin },
    });
    expect(response.status).toBe(404);
    expect(response.body).not.toContain(secretMarker);
    const calls = server.ghCalls().slice(callsBefore);
    // Allowlist may read the backlog to decide, but must never fetch the
    // arbitrary path itself.
    expect(
      calls.every(
        (argv) => !argv.join(" ").includes("/contents/.planning/secrets/"),
      ),
    ).toBe(true);
  });
  // An agent profile read names only the pinned revision: it never widens to
  // another repository path, never doubles as a revision check, and never
  // resolves a branch name itself.
  const onlyPinned = "An agent profile read names only a pinned revision.";
  for (const refused of [
    {
      read: "that also names a repository path",
      query: `revision=${revision}&path=${encodeURIComponent(`.planning/${agentIdentity("Yui").path}`)}`,
      error: onlyPinned,
    },
    {
      read: "combined with a revision check",
      query: `revision=${revision}&since=${revision}`,
      error: onlyPinned,
    },
    {
      read: "at a revision that is not a commit sha",
      query: "revision=main",
      error: "The pinned revision is not a commit sha.",
    },
  ]) {
    test(`refuses an agent profile read ${refused.read} before launching gh`, async () => {
      server.github.serve(everyRepository, publishes({ revision, backlog }));
      const callsBefore = server.ghCalls().length;
      const response = await rawRequest({
        url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}&agents=profiles&${refused.query}`,
        headers: { Origin: server.origin },
      });
      expect(response.status).toBe(400);
      expect(JSON.parse(response.body)).toMatchObject({ error: refused.error });
      expect(server.ghCalls()).toHaveLength(callsBefore);
    });
  }
  // A branch read names a branch the server can put into GitHub's endpoint
  // unchanged, and reads a file only at a head it names as a commit.
  for (const refused of [
    {
      read: "whose branch name could reshape GitHub's endpoint",
      query: `revision=${revision}&branch=${encodeURIComponent("story/../../contents")}`,
      error: "The branch name is not usable.",
    },
    {
      read: "that names a file without the branch head",
      query: `revision=${revision}&branch=story%2Fexample&path=${encodeURIComponent(".planning/quick/092/PLAN.md")}`,
      error: "A read on a branch names the branch head it resolved.",
    },
    {
      read: "at a head that is not a commit sha",
      query: `revision=${revision}&branch=story%2Fexample&head=main&path=${encodeURIComponent(".planning/quick/092/PLAN.md")}`,
      error: "The branch head is not a commit sha.",
    },
    {
      read: "combined with a revision check",
      query: `since=${revision}&branch=story%2Fexample`,
      error:
        "A branch read names only a pinned revision, a recorded branch, and for a file its resolved head and repository path.",
    },
  ]) {
    test(`refuses a branch read ${refused.read} before launching gh`, async () => {
      server.github.serve(everyRepository, publishes({ revision, backlog }));
      const callsBefore = server.ghCalls().length;
      const response = await rawRequest({
        url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}&${refused.query}`,
        headers: { Origin: server.origin },
      });
      expect(response.status).toBe(400);
      expect(JSON.parse(response.body)).toMatchObject({ error: refused.error });
      expect(server.ghCalls()).toHaveLength(callsBefore);
    });
  }
  // A revision check watches only branches named plainly enough to compare
  // with GitHub's listing, and watching belongs to a revision check alone.
  const onlyWithCheck =
    "Watched branches are named only with a revision check.";
  for (const refused of [
    {
      read: "whose branch name could reshape what it names",
      query: `since=${revision}&watch=${encodeURIComponent("story/../main")}`,
      error: "A watched branch name is not usable.",
    },
    {
      read: "among too many",
      query: `since=${revision}${Array.from(
        Array(101).keys(),
        (at) => `&watch=story%2F${String(at)}`,
      ).join("")}`,
      error: "A revision check watches too many branches.",
    },
    {
      read: "without a revision check",
      query: `watch=story%2Fexample`,
      error: onlyWithCheck,
    },
    {
      read: "beside a pinned revision",
      query: `since=${revision}&revision=${revision}&watch=story%2Fexample`,
      error: onlyWithCheck,
    },
    {
      read: "beside a branch read",
      query: `since=${revision}&branch=story%2Fexample&watch=story%2Fexample`,
      error: onlyWithCheck,
    },
  ]) {
    test(`refuses a watched branch ${refused.read} before launching gh`, async () => {
      server.github.serve(everyRepository, publishes({ revision, backlog }));
      const callsBefore = server.ghCalls().length;
      const response = await rawRequest({
        url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}&${refused.query}`,
        headers: { Origin: server.origin },
      });
      expect(response.status).toBe(400);
      expect(JSON.parse(response.body)).toMatchObject({ error: refused.error });
      expect(server.ghCalls()).toHaveLength(callsBefore);
    });
  }
});
