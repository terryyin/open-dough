// Which requests the local authenticated read boundary
// (../../server/authenticatedRead.ts) refuses before ever launching `gh`, and the
// same-origin signal it accepts in place of an Origin header -- tested
// directly against real HTTP, not through the browser. A synthetic `gh` on
// this spec's own isolated server process's PATH records every invocation
// through a fake GitHub, so each refusal can prove no `gh` call was made.
// What the boundary reads and reports once a request is accepted is covered
// in ./authenticated-read-boundary.spec.ts; malformed addition reads in
// ./authenticated-read-profile-addition-refusal.spec.ts.

import { expect, test } from "../../tests/support/pageTest.ts";
import {
  developmentBoundary,
  startDashboardServer,
  type DashboardServer,
} from "../../tests/support/dashboardServer.ts";
import { everyRepository, publishes } from "../../tests/support/fakeGitHub.ts";
import { rawRequest } from "../../tests/support/rawHttp.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { describedBacklog } from "../../tests/describedRevisions.ts";
import {
  branchReadRefusals,
  listedReadRefusals,
  watchedBranchRefusals,
} from "./authenticatedReadRefusalCases.ts";

test.describe.configure({ mode: "serial" });

const knownSourceId = "open-dough";
const revision = "ab".repeat(20);
// An empty project's backlog.
const backlog = describedBacklog(makeMe.aRepository.please());
const secretMarker = "gho_should-never-reach-a-browser-1234567890";

test.describe("authenticated read boundary refusal (development environment)", () => {
  let server: DashboardServer;

  test.beforeAll(async () => {
    // Cursor operations are outside this spec's proof; use the harness
    // stand-in so setup skips an unused real runner.
    server = await startDashboardServer({
      ...developmentBoundary,
      cursorRunner: "stand-in",
    });
  });

  test.afterAll(async () => {
    await server.close();
  });

  // A request refused for its parameters alone answers 400 with the reason,
  // before any `gh` call.
  async function expectRefusedParameters(query: string, error: string) {
    server.github.serve(everyRepository, publishes({ revision, backlog }));
    const callsBefore = server.ghCalls().length;
    const response = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}&${query}`,
      headers: { Origin: server.origin },
    });
    expect(response.status).toBe(400);
    expect(JSON.parse(response.body)).toMatchObject({ error });
    expect(server.ghCalls()).toHaveLength(callsBefore);
  }

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
  // ../../../e2e/observation/authenticated-project-observation.spec.ts, which this narrower case reproduces
  // without a browser: what it does carry is `Sec-Fetch-Site: same-origin`,
  // which `../../server/localOrigin.ts` now accepts in place of `Origin`.
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
    // Allowlist may read the backlog to decide, never the arbitrary path.
    expect(
      calls.every(
        (argv) => !argv.join(" ").includes("/contents/.planning/secrets/"),
      ),
    ).toBe(true);
  });
  // A listed records read, or a done catalog read, names only the pinned
  // revision: never another path, never with a revision check or the other
  // listed read, and never a branch name it would resolve itself.
  for (const {
    listed,
    named,
    onlyPinned,
    path,
    combined,
    unpinnedRevision,
  } of listedReadRefusals) {
    for (const refused of [
      {
        read: "that also names a repository path",
        query: `revision=${revision}&path=${encodeURIComponent(path)}`,
        error: onlyPinned,
      },
      { ...combined, error: onlyPinned },
      {
        read: "at a revision that is not a commit sha",
        query: "revision=main",
        error: unpinnedRevision,
      },
    ]) {
      test(`refuses ${listed} ${refused.read} before launching gh`, () =>
        expectRefusedParameters(`${named}&${refused.query}`, refused.error));
    }
  }
  // A branch read names a branch the server can put into GitHub's endpoint
  // unchanged, and reads a file only at a head it names as a commit.
  for (const refused of branchReadRefusals) {
    test(`refuses a branch read ${refused.read} before launching gh`, () =>
      expectRefusedParameters(refused.query, refused.error));
  }
  // A revision check watches only branches named plainly enough to compare
  // with GitHub's listing, and watching belongs to a revision check alone.
  for (const refused of watchedBranchRefusals) {
    test(`refuses a watched branch ${refused.read} before launching gh`, () =>
      expectRefusedParameters(refused.query, refused.error));
  }
});
