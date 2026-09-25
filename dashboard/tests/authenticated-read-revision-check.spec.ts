// The local authenticated read boundary's revision check
// (../server/authenticatedRead.ts, ../server/revisionChecks.ts), tested
// directly against real HTTP and the synthetic `gh`, not through the
// browser: asking whether a catalog source's `main` still names the revision
// shown (`since`), from one listing of every published branch head. The fake
// GitHub answers a conditional request whose entity tag still matches with
// `304 Not Modified`, printed and exited the way the real `gh api --include`
// does (./revisionCheckBoundary.ts). Failures and rate limits:
// ./authenticated-read-revision-check-failures.spec.ts. Reading the backlog
// at an already resolved revision:
// ./authenticated-read-revision-backlog.spec.ts; other reads and refusals:
// ./authenticated-read-boundary.spec.ts and
// ./authenticated-read-refusal.spec.ts.

import { expect, test } from "@playwright/test";
import { commitAnswer } from "./originAnswers.ts";
import { rawRequest } from "./support/rawHttp.ts";
import {
  checkArgv,
  listingEtag,
  revisionA,
  revisionB,
  revisionCheckBoundary,
} from "./revisionCheckBoundary.ts";

test.describe.configure({ mode: "serial" });

test.describe("authenticated read boundary revision check (dev launch mode)", () => {
  const boundary = revisionCheckBoundary();
  const { main, check } = boundary;

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

  test("refuses a malformed or mixed revision check before launching gh", async () => {
    const server = boundary.server();
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
