// A shared pinned read at the local authenticated read boundary
// (../../server/authenticatedRead.ts, ../../server/ghRead.ts) stays for the
// waiter that remains and ends when the last waiter leaves. A revision-check
// listing (../../server/revisionChecks.ts) keeps its own CLI child after its
// requester leaves. In process over Node HTTP with the real CLI `gh`: the
// in-process transport does not create that child. Disconnect of one request,
// the read's own bound, and boundary close stay with their predecessor specs.

import { readFileSync } from "node:fs";
import { afterAll, beforeAll, expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { GhRequest } from "../../test-support/support/ghRequest.ts";
import { startInProcessAuthenticatedRead } from "../../test-support/support/inProcessAuthenticatedRead.ts";
import {
  processAlive,
  processRunning,
  readPid,
} from "../../test-support/support/processGroup.ts";
import { abandonedRequest } from "../../test-support/support/rawHttp.ts";
import {
  askedSince,
  readAt,
  readUrl,
  refusedMarker,
  servedHolding,
  sharedSeedPath,
  sharedSeedRead,
  sharedSeedText,
} from "../../test-support/support/sharedReads.ts";

const source = makeMe.aPublishedSource.openDough.please();
const revisionOf = (pair: string) => pair.repeat(20);
// A real CLI child under load can outlast Vitest's 5s default.
const realCliCaseMs = 20_000;

const isSeed = (request: GhRequest) =>
  request.kind === "content" && request.path === sharedSeedPath;

let boundary: Awaited<ReturnType<typeof startInProcessAuthenticatedRead>>;
let server: Parameters<typeof servedHolding>[0];

beforeAll(async () => {
  boundary = await startInProcessAuthenticatedRead({
    ghTransport: "cli",
    extraEnv: () => ({ DOUGH_REVISION_CHECK_REUSE_MS: "0" }),
  });
  server = {
    baseURL: boundary.origin,
    origin: boundary.origin,
    github: boundary.github,
  };
});

afterAll(async () => {
  await boundary.close();
});

const ofSource = (query: string) => ({ source: source.id, query });

const leaving = (query: string) =>
  abandonedRequest({
    url: readUrl(server.baseURL, ofSource(query)),
    headers: { Origin: server.origin },
  });

const childPid = () => readPid(boundary.gh.pidPath);

function childExitedBy(): string | undefined {
  try {
    return readFileSync(`${boundary.gh.pidPath}.exited`, "utf8").trim();
  } catch {
    return undefined;
  }
}

test(
  "one departing waiter leaves the shared pinned read alive and its peer is answered",
  async () => {
    const revision = revisionOf("6a");
    const holding = await servedHolding(server, revision, isSeed, [
      `&revision=${revision}`,
    ]);
    const left = leaving(sharedSeedRead(revision));
    const staying = readAt(server, ofSource(sharedSeedRead(revision)));
    try {
      await refusedMarker(server);
      await expect
        .poll(() => server.github.calls.length - holding.before, {
          timeout: 5_000,
        })
        .toBeGreaterThanOrEqual(1);
      const pid = childPid();
      expect(processAlive(pid)).toBe(true);
      left.cutAfter(0);
      await refusedMarker(server);
      expect(processAlive(pid)).toBe(true);
      holding.release();
      expect(JSON.parse((await staying).body)).toMatchObject({
        text: sharedSeedText,
      });
      expect(askedSince(server, holding.before)).toEqual([
        `content ${sharedSeedPath}@${revision}`,
      ]);
    } finally {
      holding.release();
    }
  },
  realCliCaseMs,
);

test(
  "the last departure releases the pinned read and a later request asks again",
  async () => {
    const revision = revisionOf("6b");
    const holding = await servedHolding(server, revision, isSeed, [
      `&revision=${revision}`,
    ]);
    const first = leaving(sharedSeedRead(revision));
    const last = leaving(sharedSeedRead(revision));
    try {
      await refusedMarker(server);
      await expect
        .poll(() => server.github.calls.length - holding.before, {
          timeout: 5_000,
        })
        .toBeGreaterThanOrEqual(1);
      const pid = childPid();
      expect(processAlive(pid)).toBe(true);
      first.cutAfter(0);
      await refusedMarker(server);
      expect(processAlive(pid)).toBe(true);
      last.cutAfter(0);
      await expect
        .poll(() => processAlive(pid), { timeout: 5_000 })
        .toBe(false);
      expect(childExitedBy()).toBe("SIGTERM");
      expect(askedSince(server, holding.before)).toEqual([
        `content ${sharedSeedPath}@${revision}`,
      ]);
      holding.release();
      expect(
        (await readAt(server, ofSource(sharedSeedRead(revision)))).status,
      ).toBe(200);
      expect(askedSince(server, holding.before)).toEqual([
        `content ${sharedSeedPath}@${revision}`,
        `content ${sharedSeedPath}@${revision}`,
      ]);
    } finally {
      holding.release();
    }
  },
  realCliCaseMs,
);

test(
  "a revision check's shared listing stays alive after its requester leaves",
  async () => {
    const revision = revisionOf("8d");
    const holding = await servedHolding(
      server,
      revision,
      (request) => request.kind === "matching-refs",
    );
    let pid: number | undefined;
    try {
      const left = leaving(`&since=${revision}`);
      await refusedMarker(server);
      await expect
        .poll(() => server.github.calls.length - holding.before, {
          timeout: 5_000,
        })
        .toBeGreaterThanOrEqual(1);
      pid = childPid();
      expect(processAlive(pid)).toBe(true);
      left.cutAfter(0);
      await refusedMarker(server);
      expect(processAlive(pid)).toBe(true);
      expect(processRunning(pid)).toBe(true);
      expect(askedSince(server, holding.before)).toEqual(["matching-refs"]);
    } finally {
      holding.release();
    }
    await expect.poll(() => processAlive(pid), { timeout: 5_000 }).toBe(false);
  },
  realCliCaseMs,
);
