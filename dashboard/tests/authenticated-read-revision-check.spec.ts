// The local authenticated read boundary's revision-only operations
// (../server/authenticatedRead.ts, ../server/revisionChecks.ts), tested
// directly against real HTTP and the synthetic `gh`, not through the
// browser: asking whether a catalog source's `main` still names the revision
// shown (`since`), and reading the backlog at a revision already resolved
// (`revision` without `path`). The fake GitHub answers a conditional request
// whose entity tag still matches with `304 Not Modified`, printed and exited
// the way the real `gh api --include` does, and records every invocation.
// Other reads and refusals: ./authenticated-read-boundary.spec.ts and
// ./authenticated-read-refusal.spec.ts.

import { expect, test } from "@playwright/test";
import {
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer";
import {
  commitAnswer,
  commitEtag,
  notLoggedIn,
  rateLimitedAnswer,
  type OriginAnswer,
} from "./originAnswers";
import { rawRequest } from "./support/rawHttp";

test.describe.configure({ mode: "serial" });

const revisionA = "a1".repeat(20);
const revisionB = "b2".repeat(20);
const backlog = "# Product backlog\n\n## Taken\n\n## Backlog list\n";

function checkArgv(repository: string, etag?: string): string[] {
  return [
    "api",
    "--include",
    ...(etag === undefined ? [] : ["-H", `If-None-Match: ${etag}`]),
    `repos/${repository}/commits/main`,
    "--jq",
    ".sha",
  ];
}

test.describe("authenticated read boundary revision check (dev launch mode)", () => {
  let server: DashboardServer;
  // What GitHub answers for each repository's `main`, as this case sets it.
  const main = new Map<string, OriginAnswer>();

  test.beforeAll(async () => {
    server = await startDashboardServer({ mode: "dev" });
    for (const repository of ["terryyin/open-dough", "nerds-odd-e/doughnut"]) {
      server.github.serve(repository, ({ request }) =>
        Promise.resolve(
          request.kind === "ref"
            ? (main.get(repository) ?? commitAnswer(revisionA))
            : commitAnswer(revisionA),
        ),
      );
    }
  });

  test.afterAll(async () => {
    await server.close();
  });

  async function check(source: string, since: string) {
    const callsBefore = server.ghCalls().length;
    const response = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${source}&since=${since}`,
      headers: { Origin: server.origin },
    });
    return {
      status: response.status,
      cacheControl: response.headers["cache-control"],
      body: JSON.parse(response.body) as unknown,
      calls: server.ghCalls().slice(callsBefore),
    };
  }

  test("an unchanged main answers unchanged: first by its commit, then by GitHub's 304", async () => {
    main.set("terryyin/open-dough", commitAnswer(revisionA));
    const first = await check("open-dough", revisionA);
    expect(first.status).toBe(200);
    expect(first.cacheControl).toBe("no-store");
    expect(first.body).toEqual({ revision: revisionA, changed: false });
    expect(first.calls).toEqual([checkArgv("terryyin/open-dough")]);

    const second = await check("open-dough", revisionA);
    expect(second.status).toBe(200);
    expect(second.body).toEqual({ revision: revisionA, changed: false });
    // Only the conditional ref request: GitHub answered 304 and gh exited 1.
    expect(second.calls).toEqual([
      checkArgv("terryyin/open-dough", commitEtag(revisionA)),
    ]);
  });

  test("a moved main answers changed with the new commit, and later checks are conditional on it", async () => {
    main.set("terryyin/open-dough", commitAnswer(revisionB));
    const moved = await check("open-dough", revisionA);
    expect(moved.status).toBe(200);
    expect(moved.body).toEqual({ revision: revisionB, changed: true });
    expect(moved.calls).toEqual([
      checkArgv("terryyin/open-dough", commitEtag(revisionA)),
    ]);

    const settled = await check("open-dough", revisionB);
    expect(settled.body).toEqual({ revision: revisionB, changed: false });
    expect(settled.calls).toEqual([
      checkArgv("terryyin/open-dough", commitEtag(revisionB)),
    ]);
  });

  test("one source's entity tag is never sent for another source", async () => {
    main.set("nerds-odd-e/doughnut", commitAnswer(revisionB));
    const other = await check("doughnut", revisionA);
    expect(other.body).toEqual({ revision: revisionB, changed: true });
    expect(other.calls).toEqual([checkArgv("nerds-odd-e/doughnut")]);
  });

  test("a real failure of the conditional request is still classified as a failure", async () => {
    main.set("terryyin/open-dough", rateLimitedAnswer());
    const limited = await check("open-dough", revisionB);
    expect(limited.status).toBe(502);
    expect(limited.body).toEqual({
      error:
        "GitHub limited the rate of the local GitHub CLI's requests (HTTP 403) while reading main of terryyin/open-dough. Wait before pressing Retry.",
    });

    main.set("terryyin/open-dough", notLoggedIn);
    const loggedOut = await check("open-dough", revisionB);
    expect(loggedOut.status).toBe(502);
    expect(loggedOut.body).toEqual({
      error:
        "The local GitHub CLI is not logged in, so main of terryyin/open-dough could not be read. Run `gh auth login` (check with `gh auth status`), then press Retry.",
    });
  });

  test("refuses a malformed or mixed revision check before launching gh", async () => {
    const callsBefore = server.ghCalls().length;
    for (const query of [
      `source=open-dough&since=main`,
      `source=open-dough&since=${revisionA}&revision=${revisionA}`,
      `source=open-dough&since=${revisionA}&path=${encodeURIComponent(".planning/PRODUCT-BACKLOG.md")}`,
    ]) {
      const response = await rawRequest({
        url: `${server.baseURL}/__authenticated-read?${query}`,
        headers: { Origin: server.origin },
      });
      expect(response.status, query).toBe(400);
    }
    const unknown = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=not-a-real-project&since=${revisionA}`,
      headers: { Origin: server.origin },
    });
    expect(unknown.status).toBe(404);
    const crossOrigin = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=open-dough&since=${revisionA}`,
      headers: { Origin: "http://evil.example" },
    });
    expect(crossOrigin.status).toBe(403);
    expect(server.ghCalls()).toHaveLength(callsBefore);
  });
});

test.describe("authenticated read boundary backlog at a known revision (dev launch mode)", () => {
  let server: DashboardServer;

  test.beforeAll(async () => {
    server = await startDashboardServer({ mode: "dev" });
  });

  test.afterAll(async () => {
    await server.close();
  });

  test("reads the backlog pinned to the named revision without resolving main", async () => {
    server.setControl({ mode: "normal", revision: revisionA, backlog });
    const response = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=pygardon&revision=${revisionB}`,
      headers: { Origin: server.origin },
    });
    expect(response.status).toBe(200);
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(JSON.parse(response.body)).toEqual({ revision: revisionB, backlog });
    expect(server.ghCalls()).toEqual([
      [
        "api",
        "-H",
        "Accept: application/vnd.github.raw+json",
        `repos/terryyin/pygardon/contents/.planning/PRODUCT-BACKLOG.md?ref=${revisionB}`,
      ],
    ]);
  });

  test("refuses a revision that is not a commit sha before launching gh", async () => {
    const callsBefore = server.ghCalls().length;
    const response = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=pygardon&revision=main`,
      headers: { Origin: server.origin },
    });
    expect(response.status).toBe(400);
    expect(server.ghCalls()).toHaveLength(callsBefore);
  });
});
