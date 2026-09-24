// The local authenticated read boundary's revision check
// (../server/authenticatedRead.ts, ../server/revisionChecks.ts), tested
// directly against real HTTP and the synthetic `gh`, not through the
// browser: asking whether a catalog source's `main` still names the revision
// shown (`since`), from one listing of every published branch head. The fake GitHub answers a conditional request whose entity
// tag still matches with `304 Not Modified`, printed and exited the way the
// real `gh api --include` does, and records every invocation. Reading the
// backlog at an already resolved revision:
// ./authenticated-read-revision-backlog.spec.ts; other reads and refusals:
// ./authenticated-read-boundary.spec.ts and
// ./authenticated-read-refusal.spec.ts.

import { expect, test } from "@playwright/test";
import {
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer";
import {
  asHeadsListing,
  commitAnswer,
  headsEtag,
  notLoggedIn,
  rateLimitedAnswer,
  type OriginAnswer,
} from "./originAnswers";
import { rawRequest } from "./support/rawHttp";

test.describe.configure({ mode: "serial" });

const revisionA = "a1".repeat(20);
const revisionB = "b2".repeat(20);

function checkArgv(repository: string, etag?: string): string[] {
  return [
    "api",
    "--include",
    ...(etag === undefined ? [] : ["-H", `If-None-Match: ${etag}`]),
    `repos/${repository}/git/matching-refs/heads/`,
  ];
}

// The entity tag of the listing that names `main` at `sha` and no other head.
const listingEtag = (sha: string) => headsEtag({ main: sha });

test.describe("authenticated read boundary revision check (dev launch mode)", () => {
  let server: DashboardServer;
  // What GitHub answers for each repository's `main`, as this case sets it.
  const main = new Map<string, OriginAnswer>();

  test.beforeAll(async () => {
    server = await startDashboardServer({ mode: "dev" });
    for (const repository of ["terryyin/open-dough", "nerds-odd-e/doughnut"]) {
      server.github.serve(repository, ({ request }) =>
        Promise.resolve(
          request.kind === "matching-refs"
            ? asHeadsListing(main.get(repository) ?? commitAnswer(revisionA))
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
    expect(first.body).toEqual({
      revision: revisionA,
      changed: false,
      branches: [],
    });
    expect(first.calls).toEqual([checkArgv("terryyin/open-dough")]);

    const second = await check("open-dough", revisionA);
    expect(second.status).toBe(200);
    expect(second.body).toEqual({
      revision: revisionA,
      changed: false,
      branches: [],
    });
    // Only the conditional listing: GitHub answered 304 and gh exited 1.
    expect(second.calls).toEqual([
      checkArgv("terryyin/open-dough", listingEtag(revisionA)),
    ]);
  });

  test("a moved main answers changed with the new commit, and later checks are conditional on it", async () => {
    main.set("terryyin/open-dough", commitAnswer(revisionB));
    const moved = await check("open-dough", revisionA);
    expect(moved.status).toBe(200);
    expect(moved.body).toEqual({
      revision: revisionB,
      changed: true,
      branches: [],
    });
    expect(moved.calls).toEqual([
      checkArgv("terryyin/open-dough", listingEtag(revisionA)),
    ]);

    const settled = await check("open-dough", revisionB);
    expect(settled.body).toEqual({
      revision: revisionB,
      changed: false,
      branches: [],
    });
    expect(settled.calls).toEqual([
      checkArgv("terryyin/open-dough", listingEtag(revisionB)),
    ]);
  });

  test("one source's entity tag is never sent for another source", async () => {
    main.set("nerds-odd-e/doughnut", commitAnswer(revisionB));
    const other = await check("doughnut", revisionA);
    expect(other.body).toEqual({
      revision: revisionB,
      changed: true,
      branches: [],
    });
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

  test("a rate limit that directs a wait passes on only that wait, validated and bounded, for the page's next check", async () => {
    const limitedMessage = (status: number, wait: string) =>
      `GitHub limited the rate of the local GitHub CLI's requests (HTTP ${String(status)}) while reading main of terryyin/open-dough. ${wait}`;

    main.set(
      "terryyin/open-dough",
      rateLimitedAnswer(429, { "Retry-After": "120" }),
    );
    const retryAfter = await check("open-dough", revisionB);
    expect(retryAfter.status).toBe(502);
    expect(retryAfter.body).toEqual({
      error: limitedMessage(
        429,
        "GitHub asked to wait 120 seconds before asking again.",
      ),
      retryAfterSeconds: 120,
    });

    const resetSeconds = Math.floor(Date.now() / 1000) + 90;
    main.set(
      "terryyin/open-dough",
      rateLimitedAnswer(403, {
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(resetSeconds),
      }),
    );
    const reset = await check("open-dough", revisionB);
    expect(reset.status).toBe(502);
    const { retryAfterSeconds } = reset.body as { retryAfterSeconds: number };
    expect(retryAfterSeconds).toBeGreaterThanOrEqual(85);
    expect(retryAfterSeconds).toBeLessThanOrEqual(90);

    // A direction beyond GitHub's own hour-long window is bounded to it.
    main.set(
      "terryyin/open-dough",
      rateLimitedAnswer(429, { "Retry-After": "86400" }),
    );
    expect((await check("open-dough", revisionB)).body).toMatchObject({
      retryAfterSeconds: 3600,
    });

    // Headers that direct nothing usable leave the ordinary failure alone:
    // an unreadable Retry-After, and a reset while allowance remains.
    for (const headers of [
      { "Retry-After": "soon" },
      { "X-RateLimit-Remaining": "12", "X-RateLimit-Reset": "1" },
    ]) {
      main.set("terryyin/open-dough", rateLimitedAnswer(403, headers));
      const undirected = await check("open-dough", revisionB);
      expect(undirected.status).toBe(502);
      expect(undirected.body).toEqual({
        error: limitedMessage(403, "Wait before pressing Retry."),
      });
    }
  });

  test("a successful answer that spends the last of the allowance is still an answer, not a failure", async () => {
    main.set("terryyin/open-dough", {
      ...commitAnswer(revisionB),
      headers: { "X-RateLimit-Remaining": "0", "X-RateLimit-Reset": "1" },
    });
    const spent = await check("open-dough", revisionA);
    expect(spent.status).toBe(200);
    expect(spent.body).toEqual({
      revision: revisionB,
      changed: true,
      branches: [],
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
