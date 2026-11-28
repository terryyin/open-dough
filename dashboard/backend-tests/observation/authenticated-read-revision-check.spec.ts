// The authenticated HTTP fallback observes real Git, including its sharing
// with the revision stream and its durable confirmation record.

import { boardConfirmation } from "../../server/boardConfirmation.ts";
import { expect, test } from "../../test-support/support/pageTest.ts";
import { rawRequest } from "../../test-support/support/rawHttp.ts";
import {
  readUntilClosed,
  signalFifo,
} from "../review/verifiedOriginTrunkCase.ts";
import { controlledStreamServer } from "./controlledRevisionStream.ts";
import {
  openStream,
  settledWithin,
  streamOrigin,
  streamServer,
  streamUrl,
  withStreamOrigin,
} from "./revisionStreamBoundary.ts";

const revisionA = "a1".repeat(20);

test.describe("authenticated read boundary revision check (development environment)", () => {
  test("one verified check answers overlapping streams and HTTP, and fresh HTTP waits for the next check", async () => {
    const server = await controlledStreamServer();
    const origin = await streamOrigin(server.home, 1);
    const held = readUntilClosed(origin.pack.heldFifo);
    const { older, published } = origin.repository.revisions;
    const requested = (query: string) =>
      rawRequest({
        url: streamUrl(server, query),
        headers: { Origin: server.origin },
      });
    const ordinary = requested(`&since=${older}`);
    try {
      await expect(held).resolves.toBe("held\n");
      const stream = openStream(server, `&at=${older}`);
      const second = openStream(server, `&at=${older}`);
      await Promise.all([stream.headers, second.headers]);
      const fresh = requested(`&since=${published}&fresh=1`);
      expect(await settledWithin(fresh, 100)).toEqual({ timedOut: true });
      expect(origin.operations()).toBe(2);
      expect(await boardConfirmation(origin.review, "main")).toBeUndefined();
      await signalFifo(origin.pack.releaseFifo, true);

      const first = await ordinary;
      expect(first.status).toBe(200);
      expect(first.headers["cache-control"]).toBe("no-store");
      const changed: unknown = JSON.parse(first.body);
      expect(changed).toEqual({
        revision: published,
        changed: true,
        askedAt: expect.any(String),
        confirmedAt: expect.any(String),
      });
      expect(await stream.nextEvent()).toEqual(changed);
      expect(await second.nextEvent()).toEqual(changed);

      const later = await fresh;
      expect(later.status).toBe(200);
      const unchanged = JSON.parse(later.body) as {
        confirmedAt: string;
        askedAt: string;
      };
      expect(unchanged).toMatchObject({ revision: published, changed: false });
      const firstCheck = changed as typeof unchanged;
      expect(Date.parse(unchanged.askedAt)).toBeGreaterThan(
        Date.parse(firstCheck.askedAt),
      );
      expect(Date.parse(unchanged.confirmedAt)).toBeGreaterThan(
        Date.parse(firstCheck.confirmedAt),
      );
      const recorded = await boardConfirmation(origin.review, "main");
      expect(recorded).toMatchObject({
        revision: published,
        confirmedAt: unchanged.confirmedAt,
      });
      expect(origin.operations()).toBe(3); // One shared probe/fetch, then a fresh warm probe.
      expect(server.github.calls).toEqual([]);
      stream.close();
      second.close();
    } finally {
      await signalFifo(origin.pack.releaseFifo, false);
      await server.close();
      await origin.close();
    }
  });

  test("origin and confirmation write failures answer beside the durable record", async () => {
    await withStreamOrigin(await streamServer(), async (origin, server) => {
      const revision = origin.repository.trunkSha;
      const check = () =>
        rawRequest({
          url: streamUrl(server, `&since=${revision}&fresh=1`),
          headers: { Origin: server.origin },
        });
      expect((await check()).status).toBe(200);
      const recorded = await boardConfirmation(origin.review, "main");
      origin.blockConfirmationWrite();
      const writeFailure = await check();
      expect(writeFailure.status).toBe(502);
      expect(JSON.parse(writeFailure.body)).toMatchObject({
        error: expect.stringContaining("could not be saved"),
      });
      origin.failOriginProbe("unavailable");
      const unavailable = await check();
      expect(unavailable.status).toBe(502);
      expect(JSON.parse(unavailable.body)).toMatchObject({
        error: expect.stringContaining("published trunk is unavailable"),
      });
      origin.failOriginProbe("credentials");
      const refused = await check();
      expect(refused.status).toBe(502);
      expect(JSON.parse(refused.body)).toMatchObject({
        error: expect.stringContaining("HTTP 401"),
      });
      expect(await boardConfirmation(origin.review, "main")).toEqual(recorded);
    });
  });

  test("refuses invalid revision checks without contacting the origin", async () => {
    await withStreamOrigin(await streamServer(), async (origin, server) => {
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
      expect(origin.operations()).toBe(0);
      expect(server.ghCalls()).toHaveLength(callsBefore);
    });
  });
});
