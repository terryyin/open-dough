// The authenticated revision stream uses real Git for trunk, while its
// watched branches still use the REST listing. A controlled pace separates
// successive origin checks from the requests that share one.
import { expect, test } from "../../test-support/support/pageTest.ts";
import { rawRequest } from "../../test-support/support/rawHttp.ts";
import { boardConfirmation } from "../../server/boardConfirmation.ts";
import {
  readUntilClosed,
  signalFifo,
} from "../review/verifiedOriginTrunkCase.ts";
import {
  controlledPaceMs,
  controlledStreamServer,
} from "./controlledRevisionStream.ts";
import {
  openStream,
  settledWithin,
  streamOrigin,
  streamServer,
  streamUrl,
  withStreamOrigin,
} from "./revisionStreamBoundary.ts";

const confirmed = (revision: string, changed: boolean) => ({
  revision,
  changed,
  askedAt: expect.any(String),
  confirmedAt: expect.any(String),
});

test.describe.configure({ mode: "serial" });

test.describe("authenticated read boundary revision stream (development environment)", () => {
  test("the stream answers text/event-stream, uncacheable, with its first answer at open", async () => {
    await withStreamOrigin(await streamServer(), async (origin, server) => {
      const revision = origin.repository.trunkSha;
      const stream = openStream(server, `&at=${revision}`);
      const opened = await stream.headers;
      expect(opened.status).toBe(200);
      expect(opened.headers["content-type"]).toMatch(/text\/event-stream/);
      expect(opened.headers["cache-control"]).toBe("no-store");
      expect(await stream.nextEvent()).toEqual(confirmed(revision, false));
      stream.close();
    });
  });

  test("overlapping streams share one verified origin check and departure leaves the other tab live", async () => {
    const server = await controlledStreamServer();
    const origin = await streamOrigin(server.home, 1);
    const held = readUntilClosed(origin.pack.heldFifo);
    try {
      const revision = origin.repository.trunkSha;
      const older = origin.repository.revisions.older;
      const watching = openStream(server, `&at=${revision}`);
      const moving = openStream(server, `&at=${older}`);
      const departing = openStream(server, `&at=${older}`);
      await Promise.all([watching.headers, moving.headers, departing.headers]);
      await expect(held).resolves.toBe("held\n");
      await server.disconnect(departing);
      expect(origin.operations()).toBe(2); // Probe and held fetch.
      await signalFifo(origin.pack.releaseFifo, true);

      const first = await watching.nextEvent();
      expect(first).toEqual(confirmed(revision, false));
      expect(await moving.nextEvent()).toEqual({
        ...(first as object),
        changed: true,
      });
      expect(origin.operations()).toBe(2);
      const recorded = await boardConfirmation(origin.review, "main");
      expect(first).toMatchObject(recorded ?? { missingConfirmation: true });

      await server.waitForPace();
      expect(server.pendingPaces()).toBe(1);
      expect(server.advance(controlledPaceMs - 1)).toBe(0);
      expect(origin.operations()).toBe(2);
      expect(server.advance(1)).toBe(1);
      const later = await watching.nextEvent();
      expect(later).toEqual(confirmed(revision, false));
      const laterRecord = await boardConfirmation(origin.review, "main");
      expect(later).toMatchObject(laterRecord ?? { missingConfirmation: true });
      expect(Date.parse(laterRecord?.confirmedAt ?? "")).toBeGreaterThan(
        Date.parse(recorded?.confirmedAt ?? ""),
      );
      expect(await moving.nextEvent()).toEqual({
        ...(later as object),
        changed: true,
      });
      expect(origin.operations()).toBe(3); // Warm check probes only.

      await server.waitForPace();
      await server.disconnect(watching);
      expect(server.pendingPaces()).toBe(1);
      await server.disconnect(moving);
      expect(server.pendingPaces()).toBe(0);
      expect(server.advance(controlledPaceMs * 3)).toBe(0);
      expect(origin.operations()).toBe(3);
    } finally {
      await signalFifo(origin.pack.releaseFifo, false);
      await server.close();
      await origin.close();
    }
  });

  test("a cross-site request is refused before any gh call", async () => {
    const server = await streamServer();
    try {
      const callsBefore = server.ghCalls().length;
      const response = await rawRequest({
        url: streamUrl(server, `&at=${"a".repeat(40)}`),
        headers: { Origin: "http://evil.example" },
      });
      expect(response.status).toBe(403);
      expect(server.ghCalls()).toHaveLength(callsBefore);
    } finally {
      await server.close();
    }
  });

  test("closing the boundary ends open streams and stops the observation", async () => {
    await withStreamOrigin(
      await controlledStreamServer(),
      async (origin, server) => {
        const stream = openStream(server, `&at=${origin.repository.trunkSha}`);
        expect(await stream.nextEvent()).toMatchObject({
          revision: origin.repository.trunkSha,
        });
        expect(origin.operations()).toBe(2);
        await server.waitForPace();
        expect(server.pendingPaces()).toBe(1);

        await server.closeBoundary();
        expect(await stream.ended).toEqual({ kind: "ended", eventCount: 1 });
        expect((await rawRequest({ url: server.origin })).status).toBe(404);
        expect(server.pendingPaces()).toBe(0);
        expect(server.advance(controlledPaceMs * 3)).toBe(0);
        expect(origin.operations()).toBe(2);
      },
    );
  });

  test("a verified check that cannot record its confirmation reports failure", async () => {
    await withStreamOrigin(
      await controlledStreamServer(),
      async (origin, server) => {
        const revision = origin.repository.trunkSha;
        const stream = openStream(server, `&at=${revision}`);
        expect(await stream.nextEvent()).toMatchObject({
          revision,
          changed: false,
        });
        const former = await boardConfirmation(origin.review, "main");
        origin.blockConfirmationWrite();
        await server.waitForPace();
        server.advance(controlledPaceMs);
        expect(await stream.nextEvent()).toMatchObject({
          error: expect.stringContaining("could not be saved"),
        });
        expect(await boardConfirmation(origin.review, "main")).toEqual(former);
        stream.close();
      },
    );
  });

  test("origin unavailability and explicit credential refusal stay distinct", async () => {
    await withStreamOrigin(
      await controlledStreamServer(),
      async (origin, server) => {
        const revision = origin.repository.trunkSha;
        const stream = openStream(server, `&at=${revision}`);
        expect(await stream.nextEvent()).toMatchObject({
          revision,
          changed: false,
        });
        origin.failOriginProbe("unavailable");
        await server.waitForPace();
        server.advance(controlledPaceMs);
        expect(await stream.nextEvent()).toMatchObject({
          error: expect.stringContaining("published trunk is unavailable"),
        });
        origin.failOriginProbe("credentials");
        await server.waitForPace();
        server.advance(controlledPaceMs);
        expect(await stream.nextEvent()).toMatchObject({
          error: expect.stringContaining("HTTP 401"),
        });
        stream.close();
      },
    );
  });

  test("preview-mode with Accept-Encoding: gzip receives the first event promptly", async () => {
    await withStreamOrigin(
      await streamServer({}, "preview"),
      async (origin, server) => {
        const revision = origin.repository.trunkSha;
        const stream = openStream(server, `&at=${revision}`, {
          "Accept-Encoding": "gzip",
        });
        const opened = await settledWithin(stream.headers, 2_000);
        expect(opened.timedOut).toBe(false);
        if (opened.timedOut) return;
        expect(opened.value.status).toBe(200);
        const event = await settledWithin(stream.nextEvent(), 2_000);
        expect(event.timedOut).toBe(false);
        if (!event.timedOut) {
          expect(event.value).toEqual(confirmed(revision, false));
        }
        stream.close();
      },
    );
  });
});
