// Shared revision-check listings at the local authenticated read boundary
// (../../server/revisionChecks.ts): a settled listing answers later checks of
// the same source and request-owner scope within the reuse window, each with
// its own `since` and watched branches; a requester that leaves leaves the
// listing to settle. Failures, another scope, and closing the boundary:
// ./authenticated-read-shared-listing-failures.spec.ts. Simultaneous
// outstanding sharing and the zero-window case that asks again past it:
// ./authenticated-read-shared.spec.ts.

import { expect, test } from "../../tests/support/pageTest.ts";
import {
  developmentBoundary,
  startDashboardServer,
} from "../../tests/support/dashboardServer.ts";
import { waitUntil } from "../../tests/support/waitUntil.ts";
import { everyRepository } from "../../tests/support/fakeGitHub.ts";
import { processAlive } from "../../tests/support/processGroup.ts";
import { abandonedRequest } from "../../tests/support/rawHttp.ts";
import {
  askedSince,
  heads,
  listingReuseServer,
  readAt,
  refusedMarker,
  servedHolding,
  sharedReadsPublished,
} from "../../tests/support/sharedReads.ts";

test.describe.configure({ mode: "serial" });

const revisionOf = (pair: string) => pair.repeat(20);

test("two sequential checks of one source after the first settled cost one matching-refs; with the window at zero the second costs another", async () => {
  const revision = revisionOf("8a");
  const server = await listingReuseServer();
  try {
    server.github.serve(everyRepository, sharedReadsPublished(revision));
    const before = server.github.calls.length;
    expect((await readAt(server, `&since=${revision}`)).status).toBe(200);
    expect(askedSince(server, before)).toEqual(["matching-refs"]);

    const within = server.github.calls.length;
    expect((await readAt(server, `&since=${revision}`)).status).toBe(200);
    expect(askedSince(server, within)).toEqual([]);
  } finally {
    await server.close();
  }

  const zeroWindow = await startDashboardServer({
    ...developmentBoundary,
    revisionCheckReuseMs: 0,
  });
  try {
    zeroWindow.github.serve(everyRepository, sharedReadsPublished(revision));
    const firstAt = zeroWindow.github.calls.length;
    expect((await readAt(zeroWindow, `&since=${revision}`)).status).toBe(200);
    expect(askedSince(zeroWindow, firstAt)).toEqual(["matching-refs"]);
    const secondAt = zeroWindow.github.calls.length;
    expect((await readAt(zeroWindow, `&since=${revision}`)).status).toBe(200);
    expect(askedSince(zeroWindow, secondAt)).toEqual(["matching-refs"]);
  } finally {
    await zeroWindow.close();
  }
});

test("checks at different since and watched branches from one settled listing each report their own changed and heads", async () => {
  const revision = revisionOf("8b");
  const other = revisionOf("8c");
  const server = await listingReuseServer();
  try {
    server.github.serve(everyRepository, sharedReadsPublished(revision));
    const before = server.github.calls.length;
    const first = await readAt(server, `&since=${revision}`);
    expect(first.status).toBe(200);
    expect(JSON.parse(first.body)).toEqual({
      revision,
      changed: false,
      branches: [],
    });
    expect(askedSince(server, before)).toEqual(["matching-refs"]);

    const later = server.github.calls.length;
    const moved = await readAt(server, `&since=${other}`);
    const watching = await readAt(
      server,
      `&since=${revision}&watch=${encodeURIComponent("story/one")}`,
    );
    expect(JSON.parse(moved.body)).toEqual({
      revision,
      changed: true,
      branches: [],
    });
    expect(JSON.parse(watching.body)).toEqual({
      revision,
      changed: false,
      branches: [{ branch: "story/one", head: heads["story/one"] }],
    });
    // Reachability may still read profiles for the watched branch; the
    // listing itself is answered from the settled observation.
    expect(
      askedSince(server, later).filter((asked) => asked === "matching-refs"),
    ).toEqual([]);
  } finally {
    await server.close();
  }
});

test("a requester gone before settlement leaves the listing to settle; the next check within the window costs nothing", async () => {
  const revision = revisionOf("8d");
  const server = await listingReuseServer({ ghTransport: "cli" });
  try {
    const holding = await servedHolding(
      server,
      revision,
      ({ kind }) => kind === "matching-refs",
    );
    const left = abandonedRequest({
      url: `${server.baseURL}/__authenticated-read?source=open-dough&since=${revision}`,
      headers: { Origin: server.origin },
    });
    await refusedMarker(server);
    await expect
      .poll(() => server.github.calls.length - holding.before, {
        timeout: 5_000,
      })
      .toBeGreaterThanOrEqual(1);
    expect(processAlive(server.ghPid())).toBe(true);
    left.cutAfter(0);
    await refusedMarker(server);
    expect(processAlive(server.ghPid())).toBe(true);
    holding.release();
    await waitUntil(() => !processAlive(server.ghPid()), { timeoutMs: 5_000 });
    expect(askedSince(server, holding.before)).toEqual(["matching-refs"]);

    const later = server.github.calls.length;
    expect((await readAt(server, `&since=${revision}`)).status).toBe(200);
    expect(askedSince(server, later)).toEqual([]);
  } finally {
    await server.close();
  }
});
