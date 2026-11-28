// A revision-stream open whose page departs, or whose dashboard boundary
// closes, while request-owner scope resolution is still pending must ask
// origin nothing for that open and leave no paced observation. Driven
// in-process through the Vite plugin hooks and a plain http.Server (as
// ./authenticated-read-plugin-hooks.spec.ts) so closeServer() closes the
// boundary while this process and the traced Git origin keep observing. The
// synthetic `gh` hold is FAKE_GH_AUTH_HOLD on ../../test-support/fixtures/fake-gh.

import { expect, test } from "../../test-support/support/pageTest.ts";
import { existsSync, unlinkSync, writeFileSync } from "node:fs";
import http from "node:http";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { startInProcessAuthenticatedRead } from "../../test-support/support/inProcessAuthenticatedRead.ts";
import {
  abandonedRequest,
  openEventStream,
} from "../../test-support/support/rawHttp.ts";
import { streamOrigin } from "./revisionStreamBoundary.ts";

const knownSourceId = "open-dough";
const paceMs = 80;

type SetupServer = {
  readonly origin: string;
  readonly revision: string;
  readonly operations: () => number;
  readonly holdPath: string;
  readonly closeBoundary: () => void | Promise<void>;
  readonly close: () => Promise<void>;
};

function streamUrl(origin: string, query: string): string {
  return `${origin}/__authenticated-read?source=${knownSourceId}${query}`;
}

// The held `gh auth` marks its arrival once its process runs, however long a
// loaded machine takes to start it: the case's own budget bounds this wait.
async function waitAuthReached(holdPath: string): Promise<void> {
  while (!existsSync(`${holdPath}.reached`)) await delay(20);
}

function releaseAuth(holdPath: string): void {
  if (existsSync(holdPath)) unlinkSync(holdPath);
}

async function setupDepartureServer(): Promise<SetupServer> {
  const authHold = (tempRoot: string) => path.join(tempRoot, "auth.hold");
  const boundary = await startInProcessAuthenticatedRead({
    extraEnv(tempRoot) {
      const holdPath = authHold(tempRoot);
      writeFileSync(holdPath, "");
      return {
        FAKE_GH_AUTH_HOLD: holdPath,
        DOUGH_REVISION_STREAM_MS: String(paceMs),
        DOUGH_REVISION_CHECK_REUSE_MS: "0",
      };
    },
  });
  const git = await streamOrigin(path.join(boundary.tempRoot, "home"));
  const holdPath = authHold(boundary.tempRoot);

  return {
    origin: boundary.origin,
    revision: git.repository.trunkSha,
    operations: git.operations,
    holdPath,
    closeBoundary: boundary.closeBoundary,
    async close() {
      try {
        releaseAuth(holdPath);
      } finally {
        await boundary.close();
        await git.close();
      }
    },
  };
}

test.describe.configure({ mode: "serial" });

test.describe("revision stream setup departure (in-process boundary)", () => {
  test("a page departing during held setup causes no Git operations over several paces", async () => {
    const server = await setupDepartureServer();
    try {
      const departing = abandonedRequest({
        url: streamUrl(server.origin, `&at=${server.revision}`),
        headers: { Origin: server.origin },
      });
      await waitAuthReached(server.holdPath);
      departing.cutAfter(0);
      await new Promise((resolve) => setTimeout(resolve, 50));
      releaseAuth(server.holdPath);
      await new Promise((resolve) => setTimeout(resolve, paceMs * 4));
      expect(server.operations()).toBe(0);
    } finally {
      await server.close();
    }
  });

  test("a live page keeps shared observations; its close ends them after a departing open under the same hold", async () => {
    const server = await setupDepartureServer();
    try {
      const live = openEventStream({
        url: streamUrl(server.origin, `&at=${server.revision}`),
        headers: { Origin: server.origin },
      });
      const departing = abandonedRequest({
        url: streamUrl(server.origin, `&at=${server.revision}`),
        headers: { Origin: server.origin },
      });
      await waitAuthReached(server.holdPath);
      departing.cutAfter(0);
      await new Promise((resolve) => setTimeout(resolve, 50));
      releaseAuth(server.holdPath);

      expect(await live.nextEvent()).toMatchObject({
        revision: server.revision,
        changed: false,
      });
      expect(await live.nextEvent()).toMatchObject({
        revision: server.revision,
      });
      const whileLive = server.operations();
      expect(whileLive).toBeGreaterThan(2);
      live.close();
      await new Promise((resolve) => setTimeout(resolve, paceMs * 4));
      expect(server.operations()).toBe(whileLive);
    } finally {
      await server.close();
    }
  });

  test("a boundary closed during held setup acquires no Git operations and ends the response", async () => {
    const server = await setupDepartureServer();
    try {
      const url = new URL(streamUrl(server.origin, `&at=${server.revision}`));
      // The response's end (or the connection's), however long the pending
      // resolution takes to settle after the boundary closes.
      let responseEnded: () => void = () => {};
      const ended = new Promise<void>((resolve) => {
        responseEnded = resolve;
      });
      const req = http.request(
        {
          agent: false,
          hostname: url.hostname,
          port: url.port,
          path: `${url.pathname}${url.search}`,
          method: "GET",
          headers: { Origin: server.origin },
        },
        (res) => {
          res.on("end", responseEnded);
          res.resume();
        },
      );
      req.on("error", responseEnded);
      req.end();

      await waitAuthReached(server.holdPath);
      await server.closeBoundary();
      releaseAuth(server.holdPath);
      await new Promise((resolve) => setTimeout(resolve, paceMs * 4));
      expect(server.operations()).toBe(0);
      await ended;
    } finally {
      await server.close();
    }
  });

  test("a connected page through slow resolution is answered as today", async () => {
    const server = await setupDepartureServer();
    try {
      const stream = openEventStream({
        url: streamUrl(server.origin, `&at=${server.revision}`),
        headers: { Origin: server.origin },
      });
      await waitAuthReached(server.holdPath);
      releaseAuth(server.holdPath);
      expect(await stream.nextEvent()).toMatchObject({
        revision: server.revision,
        changed: false,
      });
      expect(await stream.nextEvent()).toMatchObject({
        revision: server.revision,
      });
      stream.close();
    } finally {
      await server.close();
    }
  });
});
