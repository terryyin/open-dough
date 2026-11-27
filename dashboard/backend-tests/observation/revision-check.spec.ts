// A revision check answers whether `main` still names the revision shown,
// from one conditional listing, and refuses a bad query before GitHub.

import { expect, test } from "vitest";
import { parseRequestedRead } from "../../server/requestedRead.ts";
import {
  checked,
  doughnut,
  etagAt,
  ghPrinted,
  ghScript,
  headsAt,
  listingArgs,
  openDough,
  revisionA,
  revisionB,
  revisionChecks,
} from "./revisionCheckHarness.ts";
import { withAuthenticatedRead } from "./revisionCheckHttp.ts";

test("an unchanged main answers unchanged: first by its commit, then by GitHub's 304", async () => {
  const script = ghScript();
  const checks = revisionChecks(script.exchange);
  script.answerListing(openDough.repository, headsAt(revisionA));
  const first = await checked(checks, openDough, revisionA);
  expect(first).toEqual({
    kind: "answered",
    answer: { revision: revisionA, changed: false, branches: [] },
  });
  expect(script.calls).toEqual([listingArgs(openDough.repository)]);

  script.answerListing(
    openDough.repository,
    ghPrinted({ code: 1 }, 304, {}, "", "gh: Not Modified (HTTP 304)", 0),
  );
  const second = await checked(checks, openDough, revisionA);
  expect(second).toEqual({
    kind: "answered",
    answer: { revision: revisionA, changed: false, branches: [] },
  });
  expect(script.calls[1]).toEqual(
    listingArgs(openDough.repository, etagAt(revisionA)),
  );

  const http = ghScript();
  http.answerListing(openDough.repository, headsAt(revisionA));
  await withAuthenticatedRead(
    { checks: revisionChecks(http.exchange) },
    async (get) => {
      const response = await get(`source=open-dough&since=${revisionA}`);
      expect(response.status).toBe(200);
      expect(response.cacheControl).toBe("no-store");
      expect(response.body).toEqual({
        revision: revisionA,
        changed: false,
        branches: [],
      });
    },
  );
});

test("a moved main answers changed with the new commit, and later checks are conditional on it", async () => {
  const script = ghScript();
  const checks = revisionChecks(script.exchange);
  script.answerListing(openDough.repository, headsAt(revisionA));
  await checked(checks, openDough, revisionA);

  script.answerListing(openDough.repository, headsAt(revisionB));
  const moved = await checked(checks, openDough, revisionA);
  expect(moved).toEqual({
    kind: "answered",
    answer: { revision: revisionB, changed: true, branches: [] },
  });
  expect(script.calls[1]).toEqual(
    listingArgs(openDough.repository, etagAt(revisionA)),
  );

  script.answerListing(openDough.repository, headsAt(revisionB));
  const settled = await checked(checks, openDough, revisionB);
  expect(settled).toEqual({
    kind: "answered",
    answer: { revision: revisionB, changed: false, branches: [] },
  });
  expect(script.calls[2]).toEqual(
    listingArgs(openDough.repository, etagAt(revisionB)),
  );
});

test("one source's entity tag is never sent for another source", async () => {
  const script = ghScript();
  const checks = revisionChecks(script.exchange);
  script.answerListing(openDough.repository, headsAt(revisionA));
  await checked(checks, openDough, revisionA);
  script.answerListing(doughnut.repository, headsAt(revisionB));
  const other = await checked(checks, doughnut, revisionA);
  expect(other).toEqual({
    kind: "answered",
    answer: { revision: revisionB, changed: true, branches: [] },
  });
  expect(script.calls[1]).toEqual(listingArgs(doughnut.repository));
});

test("refuses a malformed or mixed revision check before launching gh", async () => {
  const queries = [
    "since=main",
    `since=${revisionA}&revision=${revisionA}`,
    `since=${revisionA}&path=${encodeURIComponent(".planning/PRODUCT-BACKLOG.md")}`,
  ];
  for (const query of queries) {
    expect(parseRequestedRead(new URLSearchParams(query))).toMatchObject({
      kind: "refused",
      status: 400,
    });
  }
  expect(parseRequestedRead(new URLSearchParams(`since=${revisionA}`))).toEqual(
    { kind: "revision-check", since: revisionA, watched: [] },
  );

  const script = ghScript();
  await withAuthenticatedRead(
    { checks: revisionChecks(script.exchange) },
    async (get) => {
      for (const query of queries) {
        const response = await get(`source=open-dough&${query}`);
        expect(response.status, query).toBe(400);
        expect(response.cacheControl).toBe("no-store");
      }
      const unknown = await get(`source=not-a-real-project&since=${revisionA}`);
      expect(unknown.status).toBe(404);
      expect(unknown.cacheControl).toBe("no-store");
      const crossOrigin = await get(
        `source=open-dough&since=${revisionA}`,
        "http://evil.example",
      );
      expect(crossOrigin.status).toBe(403);
      expect(crossOrigin.cacheControl).toBe("no-store");
    },
  );
  expect(script.calls).toEqual([]);
});
