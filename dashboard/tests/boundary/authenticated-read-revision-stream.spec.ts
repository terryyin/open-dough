// The local authenticated read boundary's revision stream
// (../../server/authenticatedRead.ts, ../../server/revisionStreamObservation.ts),
// tested directly against real HTTP and the synthetic `gh`, not through the
// browser: a client opens a stream for a source, a shown revision (`at`, not
// `since`) and watched branches; the boundary answers at once and then once
// per lowered pace in today's revision-check shape, sharing one listing
// across that source's streams. Ordinary revision checks:
// ./authenticated-read-revision-check.spec.ts and
// ./authenticated-read-revision-check-failures.spec.ts.

import { expect, test } from "../support/pageTest.ts";
import { commitAnswer, rateLimitedAnswer } from "../originAnswers.ts";
import { rawRequest } from "../support/rawHttp.ts";
import { everyRepository } from "../support/fakeGitHub.ts";
import { heads, sharedReadsPublished } from "../support/sharedReads.ts";
import { revisionA, revisionB } from "./revisionCheckBoundary.ts";
import {
  matchingRefsSince,
  openStream,
  paceMs,
  streamServer,
  streamUrl,
  warmProfiles,
} from "./revisionStreamBoundary.ts";

test.describe.configure({ mode: "serial" });

test.setTimeout(120_000);

const gatewayTimeout = {
  status: 504,
  contentType: "application/json; charset=utf-8",
  body: JSON.stringify({ message: "Server Error" }),
};

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
    const server = await streamServer();
    try {
      server.github.serve(everyRepository, sharedReadsPublished(revisionA));
      await warmProfiles(server, revisionA);

      const before = server.github.calls.length;
      // One stream watches a recorded branch at the shown revision; the other
      // shows a different revision with no watch — each learns its own answer
      // from one listing.
      const watching = openStream(
        server,
        `&at=${revisionA}&watch=${encodeURIComponent("story/one")}`,
      );
      const moved = openStream(server, `&at=${revisionB}`);
      expect(await watching.nextEvent()).toEqual({
        revision: revisionA,
        changed: false,
        branches: [{ branch: "story/one", head: heads["story/one"] }],
      });
      expect(await moved.nextEvent()).toEqual({
        revision: revisionA,
        changed: true,
        branches: [],
      });
      expect(matchingRefsSince(server, before)).toBe(1);

      const afterOpen = server.github.calls.length;
      expect(await watching.nextEvent()).toEqual({
        revision: revisionA,
        changed: false,
        branches: [{ branch: "story/one", head: heads["story/one"] }],
      });
      expect(await moved.nextEvent()).toEqual({
        revision: revisionA,
        changed: true,
        branches: [],
      });
      expect(matchingRefsSince(server, afterOpen)).toBe(1);

      watching.close();
      moved.close();
      const afterClose = server.github.calls.length;
      await new Promise((resolve) => setTimeout(resolve, paceMs * 3));
      expect(matchingRefsSince(server, afterClose)).toBe(0);
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
    const server = await streamServer();
    server.github.serve(everyRepository, sharedReadsPublished(revisionA));
    const stream = openStream(server, `&at=${revisionA}`);
    expect(await stream.nextEvent()).toMatchObject({ revision: revisionA });
    const afterFirst = server.github.calls.length;
    const ended = stream.nextEvent();
    await server.close();
    await Promise.race([
      ended.then(
        () => {
          throw new Error("The stream answered after the boundary closed.");
        },
        () => undefined,
      ),
      new Promise((resolve) => setTimeout(resolve, paceMs * 3)),
    ]);
    expect(matchingRefsSince(server, afterFirst)).toBe(0);
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
      server.github.serve(everyRepository, (call) => {
        if (call.request.kind === "matching-refs") {
          return Promise.resolve(gatewayTimeout);
        }
        if (call.request.kind === "ref") {
          return Promise.resolve(commitAnswer(revisionB));
        }
        return published(call);
      });
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
      server.github.serve(everyRepository, (call) =>
        call.request.kind === "matching-refs"
          ? Promise.resolve(rateLimitedAnswer(429, { "Retry-After": "120" }))
          : published(call),
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
      const opened = await Promise.race([
        stream.headers.then((headers) => ({
          headers,
          timedOut: false as const,
        })),
        new Promise<{ timedOut: true }>((resolve) =>
          setTimeout(() => {
            resolve({ timedOut: true });
          }, 2_000),
        ),
      ]);
      expect(opened.timedOut).toBe(false);
      if (opened.timedOut) return;
      expect(opened.headers.status).toBe(200);
      const event = await Promise.race([
        stream.nextEvent().then((body) => ({ body, timedOut: false as const })),
        new Promise<{ timedOut: true }>((resolve) =>
          setTimeout(() => {
            resolve({ timedOut: true });
          }, 2_000),
        ),
      ]);
      expect(event.timedOut).toBe(false);
      if (!event.timedOut) {
        expect(event.body).toEqual({
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
