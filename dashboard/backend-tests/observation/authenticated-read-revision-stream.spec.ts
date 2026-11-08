// The local authenticated read boundary's revision stream
// (../../server/authenticatedRead.ts, ../../server/revisionStreamObservation.ts),
// tested directly against real HTTP and the synthetic `gh`, not through the
// browser: a client opens a stream for a source, a shown revision (`at`, not
// `since`) and watched branches; the boundary answers at once and then once
// per lowered pace in today's revision-check shape, sharing one listing
// across that source's streams. Ordinary revision checks:
// ./authenticated-read-revision-check.spec.ts and
// ./authenticated-read-revision-check-failures.spec.ts.

import { expect, test } from "../../tests/support/pageTest.ts";
import { commitAnswer, rateLimitedAnswer } from "../../tests/originAnswers.ts";
import { rawRequest } from "../../tests/support/rawHttp.ts";
import { everyRepository } from "../../tests/support/fakeGitHub.ts";
import {
  heads,
  sharedReadsPublished,
} from "../../tests/support/sharedReads.ts";
import {
  gatewayTimeout,
  revisionA,
  revisionB,
} from "./revisionCheckBoundary.ts";
import {
  controlledPaceMs,
  controlledStreamServer,
} from "./controlledRevisionStream.ts";
import {
  answeringInstead,
  matchingRefsSince,
  openStream,
  settledWithin,
  streamServer,
  streamUrl,
  warmProfiles,
} from "./revisionStreamBoundary.ts";

test.describe.configure({ mode: "serial" });

test.describe("authenticated read boundary revision stream (development environment)", () => {
  test("the stream answers text/event-stream, uncacheable, with its first answer at open", async () => {
    const server = await streamServer();
    try {
      server.github.serve(everyRepository, sharedReadsPublished(revisionA));
      const stream = openStream(server, `&at=${revisionA}`);
      const opened = await stream.headers;
      expect(opened.status).toBe(200);
      expect(opened.headers["content-type"]).toMatch(/text\/event-stream/);
      expect(opened.headers["cache-control"]).toBe("no-store");
      expect(await stream.nextEvent()).toEqual({
        revision: revisionA,
        changed: false,
        branches: [],
      });
      stream.close();
    } finally {
      await server.close();
    }
  });

  test("two streams of one source at different revisions and watched branches cost one matching-refs per tick, each learning its own answer; after the last closes no further listing is asked", async () => {
    const server = await controlledStreamServer();
    try {
      const published = sharedReadsPublished(revisionA);
      server.github.serve(everyRepository, published);
      await warmProfiles(server, revisionA);
      await warmProfiles(server, revisionB);
      const listings = server.holdListings(published);

      const before = server.github.calls.length;
      const openingListing = listings.nextArrival();
      const watching = openStream(
        server,
        `&at=${revisionA}&watch=${encodeURIComponent("story/one")}`,
      );
      const moved = openStream(
        server,
        `&at=${revisionB}&watch=${encodeURIComponent("story/two")}`,
      );
      const watchingAnswer = {
        revision: revisionA,
        changed: false,
        branches: [{ branch: "story/one", head: heads["story/one"] }],
      };
      const movedAnswer = {
        revision: revisionA,
        changed: true,
        branches: [{ branch: "story/two", head: heads["story/two"] }],
      };
      // Both streams are open before their one listing is released.
      await Promise.all([watching.headers, moved.headers]);
      await openingListing;
      expect(listings.held()).toBe(1);
      expect(matchingRefsSince(server, before)).toBe(1);
      listings.releaseOldest();
      expect(await watching.nextEvent()).toEqual(watchingAnswer);
      expect(await moved.nextEvent()).toEqual(movedAnswer);

      await server.waitForPace();
      expect(server.pendingPaces()).toBe(1);
      expect(server.advance(controlledPaceMs - 1)).toBe(0);
      expect(matchingRefsSince(server, before)).toBe(1);
      const nextListing = listings.nextArrival();
      expect(server.advance(1)).toBe(1);
      await nextListing;
      expect(listings.held()).toBe(1);
      expect(matchingRefsSince(server, before)).toBe(2);
      listings.releaseOldest();
      expect(await watching.nextEvent()).toEqual(watchingAnswer);
      expect(await moved.nextEvent()).toEqual(movedAnswer);

      await server.waitForPace();
      expect(server.pendingPaces()).toBe(1);
      await server.disconnect(watching);
      expect(server.pendingPaces()).toBe(1);
      await server.disconnect(moved);
      expect(server.pendingPaces()).toBe(0);
      expect(server.advance(controlledPaceMs * 3)).toBe(0);
      expect(matchingRefsSince(server, before)).toBe(2);
    } finally {
      await server.close();
    }
  });

  test("a cross-site request is refused before any gh call", async () => {
    const server = await streamServer();
    try {
      const callsBefore = server.ghCalls().length;
      const response = await rawRequest({
        url: streamUrl(server, `&at=${revisionA}`),
        headers: { Origin: "http://evil.example" },
      });
      expect(response.status).toBe(403);
      expect(server.ghCalls()).toHaveLength(callsBefore);
    } finally {
      await server.close();
    }
  });

  test("closing the boundary ends open streams and stops the observation", async () => {
    const server = await controlledStreamServer();
    try {
      server.github.serve(everyRepository, sharedReadsPublished(revisionA));
      const stream = openStream(server, `&at=${revisionA}`);
      expect(await stream.nextEvent()).toMatchObject({ revision: revisionA });
      expect(matchingRefsSince(server, 0)).toBe(1);
      await server.waitForPace();
      expect(server.pendingPaces()).toBe(1);

      await server.closeBoundary();
      expect(await stream.ended).toEqual({ kind: "ended", eventCount: 1 });
      expect((await rawRequest({ url: server.origin })).status).toBe(404);
      expect(server.pendingPaces()).toBe(0);
      expect(server.advance(controlledPaceMs * 3)).toBe(0);
      expect(matchingRefsSince(server, 0)).toBe(1);
    } finally {
      await server.close();
    }
  });

  test("a 504 listing answers the ref alone without branches", async () => {
    const server = await streamServer();
    try {
      const published = sharedReadsPublished(revisionA);
      server.github.serve(everyRepository, published);
      await warmProfiles(server, revisionA);
      expect(
        (
          await rawRequest({
            url: streamUrl(server, `&since=${revisionA}`),
            headers: { Origin: server.origin },
          })
        ).status,
      ).toBe(200);
      server.github.serve(
        everyRepository,
        answeringInstead(published, {
          "matching-refs": gatewayTimeout,
          ref: commitAnswer(revisionB),
        }),
      );
      const stream = openStream(
        server,
        `&at=${revisionA}&watch=${encodeURIComponent("story/one")}`,
      );
      expect(await stream.nextEvent()).toEqual({
        revision: revisionB,
        changed: true,
      });
      stream.close();
    } finally {
      await server.close();
    }
  });

  test("a rate-limited listing answers limited with its wait", async () => {
    const server = await streamServer();
    try {
      const published = sharedReadsPublished(revisionA);
      server.github.serve(everyRepository, published);
      await warmProfiles(server, revisionA);
      server.github.serve(
        everyRepository,
        answeringInstead(published, {
          "matching-refs": rateLimitedAnswer(429, { "Retry-After": "120" }),
        }),
      );
      const stream = openStream(server, `&at=${revisionA}`);
      const event = (await stream.nextEvent()) as {
        error: string;
        retryAfterSeconds: number;
      };
      expect(event.retryAfterSeconds).toBe(120);
      expect(event.error).toMatch(/limited the rate/i);
      expect(event.error).toMatch(/120 seconds/);
      stream.close();
    } finally {
      await server.close();
    }
  });

  test("preview-mode with Accept-Encoding: gzip receives the first event promptly", async () => {
    const server = await streamServer({}, "preview");
    try {
      server.github.serve(everyRepository, sharedReadsPublished(revisionA));
      const stream = openStream(server, `&at=${revisionA}`, {
        "Accept-Encoding": "gzip",
      });
      const opened = await settledWithin(stream.headers, 2_000);
      expect(opened.timedOut).toBe(false);
      if (opened.timedOut) return;
      expect(opened.value.status).toBe(200);
      const event = await settledWithin(stream.nextEvent(), 2_000);
      expect(event.timedOut).toBe(false);
      if (!event.timedOut) {
        expect(event.value).toEqual({
          revision: revisionA,
          changed: false,
          branches: [],
        });
      }
      stream.close();
    } finally {
      await server.close();
    }
  });
});
