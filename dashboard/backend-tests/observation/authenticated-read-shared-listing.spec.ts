// Shared revision-check listings at the local authenticated read boundary
// (../../server/revisionChecks.ts): a settled listing answers later checks of
// the same source and request-owner scope within the reuse window, each with
// its own `since` and recorded story branch; a requester that leaves leaves the
// listing to settle. Failures, another scope, and closing the boundary:
// ./authenticated-read-shared-listing-failures.spec.ts. Simultaneous
// outstanding sharing and the zero-window case that asks again past it:
// ./authenticated-read-shared.spec.ts.

import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeRepository } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { defaultRepository } from "../../test-support/publishedOriginBasics.ts";
import { publishMain } from "../../test-support/committedOriginRepo.ts";
import { headsEtag } from "../../test-support/originAnswers.ts";
import { routeOriginThroughServedHomes } from "../../test-support/support/fixtureOriginRoute.ts";
import { expect, test } from "../../test-support/support/pageTest.ts";
import {
  developmentBoundary,
  startDashboardServer,
  type DashboardServer,
} from "../../test-support/support/dashboardServer.ts";
import { waitUntil } from "../../test-support/support/waitUntil.ts";
import { everyRepository } from "../../test-support/support/fakeGitHub.ts";
import { processAlive } from "../../test-support/support/processGroup.ts";
import { abandonedRequest } from "../../test-support/support/rawHttp.ts";
import {
  heads,
  listingReuseServer,
  readAt,
  refusedMarker,
  servedHolding,
  sharedReadsFacts,
  sharedReadsPublished,
} from "../../test-support/support/sharedReads.ts";

test.describe.configure({ mode: "serial" });

const watch = (revision: string, branch = "story/one") =>
  `&since=${revision}&watch=${encodeURIComponent(branch)}`;

const listingsSince = (server: DashboardServer, from: number) =>
  server.github.calls
    .slice(from)
    .filter(({ request }) => request.kind === "matching-refs");

async function publishedTrunk() {
  const facts = sharedReadsFacts();
  const origin = await materializeRepository(
    makeMe.aRepository
      .withRevision("older", facts)
      .withRevision("current", {
        ...facts,
        files: { ...facts.files, "advance.md": "An advance" },
      })
      .please(),
  );
  publishMain(origin.origin, origin.revisions.current);
  return origin;
}

async function withPublishedTrunk(
  run: (origin: Awaited<ReturnType<typeof publishedTrunk>>) => Promise<void>,
) {
  const origin = await publishedTrunk();
  try {
    await run(origin);
  } finally {
    await origin.cleanup();
  }
}

function serveTrunk(
  server: DashboardServer,
  origin: Awaited<ReturnType<typeof publishedTrunk>>,
) {
  server.github.serve(
    everyRepository,
    sharedReadsPublished(origin.revisions.current),
  );
  routeOriginThroughServedHomes(
    server.github,
    origin.origin,
    defaultRepository,
  );
}

async function warmWatch(server: DashboardServer, revision: string) {
  expect((await readAt(server, `&revision=${revision}`)).status).toBe(200);
  expect(
    (await readAt(server, `&revision=${revision}&agents=profiles`)).status,
  ).toBe(200);
}

test("sequential watches reuse one branch listing and check its ETag once reuse is disabled", () =>
  withPublishedTrunk(async (origin) => {
    const revision = origin.revisions.current;
    const server = await listingReuseServer();
    try {
      serveTrunk(server, origin);
      await warmWatch(server, revision);
      const before = server.github.calls.length;
      expect((await readAt(server, watch(revision))).status).toBe(200);
      expect(listingsSince(server, before)).toHaveLength(1);

      const within = server.github.calls.length;
      expect((await readAt(server, watch(revision))).status).toBe(200);
      expect(listingsSince(server, within)).toEqual([]);
    } finally {
      await server.close();
    }

    const zeroWindow = await startDashboardServer({
      ...developmentBoundary,
      revisionCheckReuseMs: 0,
    });
    try {
      serveTrunk(zeroWindow, origin);
      await warmWatch(zeroWindow, revision);
      const firstAt = zeroWindow.github.calls.length;
      expect((await readAt(zeroWindow, watch(revision))).status).toBe(200);
      expect(listingsSince(zeroWindow, firstAt)).toHaveLength(1);
      const secondAt = zeroWindow.github.calls.length;
      const unchanged = await readAt(zeroWindow, watch(revision));
      expect(unchanged.status).toBe(200);
      expect(JSON.parse(unchanged.body)).toMatchObject({
        branches: [{ branch: "story/one", head: heads["story/one"] }],
      });
      const listings = listingsSince(zeroWindow, secondAt);
      expect(listings).toHaveLength(1);
      expect(listings[0]?.argv).toContain(
        `If-None-Match: ${headsEtag({ main: revision, ...heads })}`,
      );

      const other = (query: string) => ({ source: "doughnut", query });
      routeOriginThroughServedHomes(
        zeroWindow.github,
        origin.origin,
        "nerds-odd-e/doughnut",
      );
      expect(
        (await readAt(zeroWindow, other(`&revision=${revision}`))).status,
      ).toBe(200);
      expect(
        (
          await readAt(
            zeroWindow,
            other(`&revision=${revision}&agents=profiles`),
          )
        ).status,
      ).toBe(200);
      const otherAt = zeroWindow.github.calls.length;
      expect((await readAt(zeroWindow, other(watch(revision)))).status).toBe(
        200,
      );
      expect(
        listingsSince(zeroWindow, otherAt).map(({ argv }) => argv),
      ).toEqual([
        [
          "api",
          "--include",
          "repos/nerds-odd-e/doughnut/git/matching-refs/heads/",
        ],
      ]);
    } finally {
      await zeroWindow.close();
    }
  }));

test("checks at different since and watched branches from one settled listing each report their own changed and heads", () =>
  withPublishedTrunk(async (origin) => {
    const { current: revision, older: other } = origin.revisions;
    const server = await listingReuseServer();
    try {
      serveTrunk(server, origin);
      await warmWatch(server, revision);
      await warmWatch(server, other);
      const before = server.github.calls.length;
      const first = await readAt(server, watch(revision, "story/one"));
      expect(first.status).toBe(200);
      expect(JSON.parse(first.body)).toMatchObject({
        revision,
        changed: false,
        branches: [{ branch: "story/one", head: heads["story/one"] }],
      });
      expect(listingsSince(server, before)).toHaveLength(1);

      const later = server.github.calls.length;
      const moved = await readAt(server, watch(other, "story/two"));
      expect(moved.status).toBe(200);
      expect(JSON.parse(moved.body)).toMatchObject({
        revision,
        changed: true,
        branches: [{ branch: "story/two", head: heads["story/two"] }],
      });
      expect(listingsSince(server, later)).toEqual([]);
    } finally {
      await server.close();
    }
  }));

test("a requester gone before settlement leaves the listing to settle; the next check within the window costs nothing", () =>
  withPublishedTrunk(async (origin) => {
    const revision = origin.revisions.current;
    const server = await listingReuseServer({ ghTransport: "cli" });
    try {
      serveTrunk(server, origin);
      await warmWatch(server, revision);
      const holding = await servedHolding(
        server,
        revision,
        ({ kind }) => kind === "matching-refs",
      );
      const left = abandonedRequest({
        url: `${server.baseURL}/__authenticated-read?source=open-dough${watch(revision)}`,
        headers: { Origin: server.origin },
      });
      await refusedMarker(server);
      await expect
        .poll(() => listingsSince(server, holding.before), {
          timeout: 5_000,
        })
        .toHaveLength(1);
      expect(processAlive(server.ghPid())).toBe(true);
      left.cutAfter(0);
      await refusedMarker(server);
      expect(processAlive(server.ghPid())).toBe(true);
      holding.release();
      await waitUntil(() => !processAlive(server.ghPid()), {
        timeoutMs: 5_000,
      });
      expect(listingsSince(server, holding.before)).toHaveLength(1);

      const later = server.github.calls.length;
      const reused = await readAt(server, watch(revision));
      expect(reused.status).toBe(200);
      expect(JSON.parse(reused.body)).toMatchObject({
        branches: [{ branch: "story/one", head: heads["story/one"] }],
      });
      expect(listingsSince(server, later)).toEqual([]);
    } finally {
      await server.close();
    }
  }));
