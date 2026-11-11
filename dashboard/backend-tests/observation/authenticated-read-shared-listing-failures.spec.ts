// Shared revision-check listing failures and ownership at the local
// authenticated read boundary (../../server/revisionChecks.ts): a failed,
// timed-out, or rate-limited listing keeps nothing; another scope asks again;
// closing the boundary aborts a running listing. Settled reuse within the
// window: ./authenticated-read-shared-listing.spec.ts.

import { expect, test } from "../../tests/support/pageTest.ts";
import { everyRepository, hangs } from "../../tests/support/fakeGitHub.ts";
import {
  processAlive,
  processRunning,
} from "../../tests/support/processGroup.ts";
import { abandonedRequest } from "../../tests/support/rawHttp.ts";
import { inspect } from "../../tests/support/readDiagnostics.ts";
import { heldBackPattern } from "../../tests/support/heldBackReads.ts";
import { listingReuseWithOwnerClock } from "../../tests/support/listingReuseWithOwnerClock.ts";
import { rateLimitedAnswer, commitAnswer } from "../../tests/originAnswers.ts";
import {
  askedSince,
  heads,
  listingReuseServer,
  listingReuseWindowMs,
  readAt,
  refusedMarker,
  sharedReadsPublished,
} from "../../tests/support/sharedReads.ts";
import { RevisionChecks } from "../../server/revisionChecks.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { listingTimeoutBoundary } from "./listingTimeoutBoundary.ts";
import { gatewayTimeout } from "./revisionCheckBoundary.ts";

test.describe.configure({ mode: "serial" });

const revisionOf = (pair: string) => pair.repeat(20);

test("a 504 listing, a timed-out listing, and a rate-limited listing keep nothing; the next check asks again", async () => {
  const revision = revisionOf("8e");
  const server = await listingReuseServer();
  try {
    server.github.serve(everyRepository, (call) =>
      Promise.resolve(
        call.request.kind === "matching-refs"
          ? gatewayTimeout
          : commitAnswer(revision),
      ),
    );
    const firstAt = server.github.calls.length;
    const fallenBack = await readAt(server, `&since=${revision}`);
    expect(fallenBack.status).toBe(200);
    expect(JSON.parse(fallenBack.body)).toEqual({
      revision,
      changed: false,
    });
    expect(
      askedSince(server, firstAt).filter((asked) => asked === "matching-refs"),
    ).toHaveLength(1);

    server.github.serve(everyRepository, sharedReadsPublished(revision));
    const afterFallback = server.github.calls.length;
    expect((await readAt(server, `&since=${revision}`)).status).toBe(200);
    expect(askedSince(server, afterFallback)).toEqual(["matching-refs"]);
  } finally {
    await server.close();
  }

  const timedOut = await listingTimeoutBoundary();
  try {
    const published = sharedReadsPublished(revision);
    let reportListingArrival: (pid: number | undefined) => void = () =>
      undefined;
    const listingArrived = new Promise<number | undefined>((resolve) => {
      reportListingArrival = resolve;
    });
    timedOut.github.serve(everyRepository, (call) => {
      if (call.request.kind !== "matching-refs") return published(call);
      reportListingArrival(timedOut.ghPid());
      return hangs(call);
    });
    const beforeTimeout = timedOut.github.calls.length;
    const response = readAt(timedOut, `&since=${revision}`);
    const hungPid = await Promise.race([
      listingArrived,
      response.then(({ status, body }) => {
        throw new Error(
          `Check answered before its listing arrived (${status}): ${body}`,
        );
      }),
    ]);
    expect(hungPid).toBeDefined();
    expect(askedSince(timedOut, beforeTimeout)).toEqual(["matching-refs"]);
    expect(timedOut.expireWaiter()).toBe(1);
    const hung = await response;
    expect(hung.status).toBe(502);
    expect(hung.body).toContain("did not answer within");
    expect(processAlive(hungPid)).toBe(true);

    // The listing's own bound ends the hung observation after the waiter's;
    // once it has, a later check must ask GitHub again rather than reuse.
    expect(timedOut.expireListing()).toBe(1);
    await expect
      .poll(() => inspect(timedOut))
      .toMatchObject({
        status: 200,
        failures: expect.arrayContaining([
          expect.objectContaining({
            category: "revision-check",
            pin: revision,
            cause: "timed-out",
          }),
        ]),
      });
    await expect.poll(() => processRunning(hungPid)).toBe(false);

    timedOut.github.serve(everyRepository, published);
    const afterTimeout = timedOut.github.calls.length;
    expect((await readAt(timedOut, `&since=${revision}`)).status).toBe(200);
    expect(askedSince(timedOut, afterTimeout)).toEqual(["matching-refs"]);
  } finally {
    await timedOut.close();
  }

  const clocked = await listingReuseWithOwnerClock();
  const limited = clocked.server;
  try {
    const waitSeconds = 1;
    limited.github.serve(everyRepository, (call) =>
      Promise.resolve(
        call.request.kind === "matching-refs"
          ? rateLimitedAnswer(429, { "Retry-After": String(waitSeconds) })
          : commitAnswer(revision),
      ),
    );
    const beforeLimit = limited.github.calls.length;
    const refused = await readAt(limited, `&since=${revision}`);
    expect(refused.status).toBe(502);
    expect(JSON.parse(refused.body)).toMatchObject({
      error: expect.stringMatching(/GitHub limited the rate.*\(HTTP 429\)/),
      retryAfterSeconds: waitSeconds,
    });
    expect(askedSince(limited, beforeLimit)).toEqual(["matching-refs"]);
    expect(clocked.standingOwnerPid()).toBe(clocked.ownerPid);

    limited.github.serve(everyRepository, sharedReadsPublished(revision));
    const afterLimit = limited.github.calls.length;
    const heldBack = await readAt(limited, `&since=${revision}`);
    expect(heldBack.status).toBe(502);
    expect(JSON.parse(heldBack.body)).toMatchObject({
      error: expect.stringMatching(heldBackPattern),
      retryAfterSeconds: waitSeconds,
    });
    expect(askedSince(limited, afterLimit)).toEqual([]);
    expect(clocked.standingOwnerPid()).toBe(clocked.ownerPid);

    clocked.advanceOwnerClock(waitSeconds * 1_000 + 1);
    expect((await readAt(limited, `&since=${revision}`)).status).toBe(200);
    expect(askedSince(limited, afterLimit)).toEqual(["matching-refs"]);
    expect(clocked.standingOwnerPid()).toBe(clocked.ownerPid);
  } finally {
    await clocked.close();
  }
});

test("closing the boundary aborts a running listing", async () => {
  const server = await listingReuseServer();
  server.github.serve(everyRepository, hangs);
  const url = `${server.baseURL}/__authenticated-read?source=open-dough&since=${revisionOf("8f")}`;
  abandonedRequest({ url, headers: { Origin: server.origin } });
  await refusedMarker(server);
  await expect
    .poll(() => server.github.calls.length, { timeout: 5_000 })
    .toBeGreaterThanOrEqual(1);
  const ghPid = server.ghPid();
  expect(processAlive(ghPid)).toBe(true);
  await server.close();
  expect(processRunning(ghPid)).toBe(false);
});

test("a settled listing under one scope does not answer a check under another scope", async () => {
  const tracked = new Set<AbortController>();
  let currentScope = "login-a";
  let listings = 0;
  const revision = revisionOf("8g");
  const checks = new RevisionChecks({
    tracked,
    reuseMs: () => listingReuseWindowMs,
    scope: () => Promise.resolve(currentScope),
    listHeads: () => {
      listings += 1;
      return Promise.resolve({
        revision,
        heads: new Map([
          ["main", revision],
          ["story/one", heads["story/one"] ?? revision],
        ]),
      });
    },
  });
  const source = makeMe.aPublishedSource
    .with({
      id: "open-dough",
      label: "Open Dough",
      repository: "terryyin/open-dough",
    })
    .please();
  const open = () => new AbortController().signal;
  expect((await checks.check(source, open())).revision).toBe(revision);
  expect(listings).toBe(1);
  expect((await checks.check(source, open())).revision).toBe(revision);
  expect(listings).toBe(1);
  currentScope = "login-b";
  expect((await checks.check(source, open())).revision).toBe(revision);
  expect(listings).toBe(2);
});
