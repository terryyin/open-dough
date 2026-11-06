// A revision-stream open whose page departs, or whose dashboard boundary
// closes, while request-owner scope resolution is still pending must ask
// GitHub nothing for that open and leave no paced observation. Driven
// in-process through the Vite plugin hooks and a plain http.Server (as
// ./authenticated-read-plugin-hooks.spec.ts) so closeServer() closes the
// boundary while this process and the fake GitHub keep observing. The
// synthetic `gh` hold is FAKE_GH_AUTH_HOLD on ../fixtures/fake-gh.

import { expect, test } from "../tests/support/pageTest.ts";
import {
  existsSync,
  mkdtempSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import http from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { installAuthenticatedReadMiddleware } from "../server/authenticatedRead.ts";
import {
  endFakeGh,
  fakeGhEnv,
  installFakeGh,
} from "../tests/support/fakeGh.ts";
import {
  everyRepository,
  startFakeGitHub,
  type FakeGitHub,
} from "../tests/support/fakeGitHub.ts";
import { startInProcessBoundaryHttp } from "../tests/support/inProcessBoundaryHttp.ts";
import { abandonedRequest, openEventStream } from "../tests/support/rawHttp.ts";
import { withRestoredEnv } from "../tests/support/testEnv.ts";
import { configureDevelopmentProjects } from "../tests/support/projectConfiguration.ts";
import { sharedReadsPublished } from "../tests/support/sharedReads.ts";
import { waitUntil } from "../tests/support/waitUntil.ts";
import { revisionA } from "./revisionCheckBoundary.ts";

const knownSourceId = "open-dough";
const paceMs = 80;

type SetupServer = {
  readonly origin: string;
  readonly github: FakeGitHub;
  readonly holdPath: string;
  readonly closeBoundary: () => void | Promise<void>;
  readonly close: () => Promise<void>;
};

function matchingRefsSince(github: FakeGitHub, before: number): number {
  return github.calls
    .slice(before)
    .filter(({ request }) => request.kind === "matching-refs").length;
}

function streamUrl(origin: string, query: string): string {
  return `${origin}/__authenticated-read?source=${knownSourceId}${query}`;
}

async function waitAuthReached(holdPath: string): Promise<void> {
  const reached = await waitUntil(() => existsSync(`${holdPath}.reached`), {
    timeoutMs: 5_000,
  });
  expect(reached).toBe(true);
}

function releaseAuth(holdPath: string): void {
  if (existsSync(holdPath)) unlinkSync(holdPath);
}

async function setupDepartureServer(): Promise<SetupServer> {
  const tempRoot = mkdtempSync(path.join(tmpdir(), "dough-setup-depart-"));
  const holdPath = path.join(tempRoot, "auth.hold");
  writeFileSync(holdPath, "");
  const gh = installFakeGh(tempRoot);
  const github = await startFakeGitHub();
  github.serve(everyRepository, sharedReadsPublished(revisionA));

  const home = path.join(tempRoot, "home");
  configureDevelopmentProjects(home);
  const restoreEnv = withRestoredEnv({
    ...fakeGhEnv(gh, github.url),
    HOME: home,
    FAKE_GH_AUTH_HOLD: holdPath,
    DOUGH_REVISION_STREAM_MS: String(paceMs),
    DOUGH_REVISION_CHECK_REUSE_MS: "0",
  });

  const boundary = await startInProcessBoundaryHttp({
    name: "dough-authenticated-read",
    install: installAuthenticatedReadMiddleware,
  });

  return {
    origin: boundary.origin,
    github,
    holdPath,
    closeBoundary: boundary.closeBoundary,
    async close() {
      releaseAuth(holdPath);
      await boundary.closeHttp();
      restoreEnv();
      await endFakeGh(gh);
      await github.close();
      rmSync(tempRoot, { recursive: true, force: true });
    },
  };
}

test.describe.configure({ mode: "serial" });
test.setTimeout(60_000);

test.describe("revision stream setup departure (in-process boundary)", () => {
  test("a page departing during held setup causes no matching-refs over several paces", async () => {
    const server = await setupDepartureServer();
    try {
      const before = server.github.calls.length;
      const departing = abandonedRequest({
        url: streamUrl(server.origin, `&at=${revisionA}`),
        headers: { Origin: server.origin },
      });
      await waitAuthReached(server.holdPath);
      departing.cutAfter(0);
      await new Promise((resolve) => setTimeout(resolve, 50));
      releaseAuth(server.holdPath);
      await new Promise((resolve) => setTimeout(resolve, paceMs * 4));
      expect(matchingRefsSince(server.github, before)).toBe(0);
    } finally {
      await server.close();
    }
  });

  test("a live page keeps shared observations; its close ends them after a departing open under the same hold", async () => {
    const server = await setupDepartureServer();
    try {
      const before = server.github.calls.length;
      const live = openEventStream({
        url: streamUrl(server.origin, `&at=${revisionA}`),
        headers: { Origin: server.origin },
      });
      const departing = abandonedRequest({
        url: streamUrl(server.origin, `&at=${revisionA}`),
        headers: { Origin: server.origin },
      });
      await waitAuthReached(server.holdPath);
      departing.cutAfter(0);
      await new Promise((resolve) => setTimeout(resolve, 50));
      releaseAuth(server.holdPath);

      expect(await live.nextEvent()).toEqual({
        revision: revisionA,
        changed: false,
        branches: [],
      });
      expect(await live.nextEvent()).toMatchObject({ revision: revisionA });
      const whileLive = matchingRefsSince(server.github, before);
      expect(whileLive).toBeGreaterThan(0);

      const afterLive = server.github.calls.length;
      live.close();
      await new Promise((resolve) => setTimeout(resolve, paceMs * 4));
      expect(matchingRefsSince(server.github, afterLive)).toBe(0);
    } finally {
      await server.close();
    }
  });

  test("a boundary closed during held setup acquires no matching-refs and ends the response", async () => {
    const server = await setupDepartureServer();
    try {
      const before = server.github.calls.length;
      let responseEnded = false;
      const url = new URL(streamUrl(server.origin, `&at=${revisionA}`));
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
          res.on("end", () => {
            responseEnded = true;
          });
          res.resume();
        },
      );
      req.on("error", () => {
        responseEnded = true;
      });
      req.end();

      await waitAuthReached(server.holdPath);
      await server.closeBoundary();
      releaseAuth(server.holdPath);
      await new Promise((resolve) => setTimeout(resolve, paceMs * 4));
      expect(matchingRefsSince(server.github, before)).toBe(0);
      const ended = await waitUntil(() => responseEnded, { timeoutMs: 5_000 });
      expect(ended).toBe(true);
    } finally {
      await server.close();
    }
  });

  test("a connected page through slow resolution is answered as today", async () => {
    const server = await setupDepartureServer();
    try {
      const stream = openEventStream({
        url: streamUrl(server.origin, `&at=${revisionA}`),
        headers: { Origin: server.origin },
      });
      await waitAuthReached(server.holdPath);
      releaseAuth(server.holdPath);
      expect(await stream.nextEvent()).toEqual({
        revision: revisionA,
        changed: false,
        branches: [],
      });
      expect(await stream.nextEvent()).toMatchObject({ revision: revisionA });
      stream.close();
    } finally {
      await server.close();
    }
  });
});
