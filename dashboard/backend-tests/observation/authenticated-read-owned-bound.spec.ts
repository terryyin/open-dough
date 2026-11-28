// A stalled pinned read at the local authenticated read boundary
// (../../server/authenticatedRead.ts, ../../server/ghRead.ts) ends when that
// work's own bound ends. A waiter that joins late keeps its own bound and
// does not extend the call or start a second one. In process over Node HTTP
// with the real CLI `gh`: the in-process transport does not create that
// child. `GitHubRequests` captures `DOUGH_READ_TIMEOUT_MS` when `ghRead.ts`
// is evaluated, so the short bound is set before that module loads.
// Departure and boundary close stay with their predecessor specs.

import { readFileSync } from "node:fs";
import { afterAll, beforeAll, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { readingPathAt } from "../../src/authenticatedReadRules.ts";
import type { GhRequest } from "../../test-support/support/ghRequest.ts";
import {
  processAlive,
  readPid,
} from "../../test-support/support/processGroup.ts";
import {
  askedSince,
  readAt,
  refusedMarker,
  servedHolding,
  sharedSeedPath,
  sharedSeedRead,
} from "../../test-support/support/sharedReads.ts";

const source = makeMe.aPublishedSource.openDough.please();
const revisionOf = (pair: string) => pair.repeat(20);
// Long enough to join halfway through a held call and still tell the
// call's bound from the joiner's own.
const boundMs = 3_000;
// A real CLI child under load can outlast Vitest's 5s default.
const realCliCaseMs = 20_000;

const isSeed = (request: GhRequest) =>
  request.kind === "content" && request.path === sharedSeedPath;

type StartedRead = Awaited<
  ReturnType<
    typeof import("../../test-support/support/inProcessAuthenticatedRead.ts").startInProcessAuthenticatedRead
  >
>;

let boundary: StartedRead;
let server: Parameters<typeof servedHolding>[0];

beforeAll(async () => {
  process.env["DOUGH_READ_TIMEOUT_MS"] = String(boundMs);
  vi.resetModules();
  const { startInProcessAuthenticatedRead } =
    await import("../../test-support/support/inProcessAuthenticatedRead.ts");
  boundary = await startInProcessAuthenticatedRead({
    ghTransport: "cli",
    extraEnv: () => ({
      DOUGH_READ_TIMEOUT_MS: String(boundMs),
      DOUGH_REVISION_CHECK_REUSE_MS: "0",
    }),
  });
  server = {
    baseURL: boundary.origin,
    origin: boundary.origin,
    github: boundary.github,
  };
});

afterAll(async () => {
  await boundary.close();
  Reflect.deleteProperty(process.env, "DOUGH_READ_TIMEOUT_MS");
});

const ofSource = (query: string) => ({ source: source.id, query });

const childPid = () => readPid(boundary.gh.pidPath);

function childExitedBy(): string | undefined {
  try {
    return readFileSync(`${boundary.gh.pidPath}.exited`, "utf8").trim();
  } catch {
    return undefined;
  }
}

const timedOut = (reading: string) => ({
  error: `The local GitHub CLI did not answer within ${String(boundMs / 1000)} seconds while reading ${reading}.`,
  recovery: "transient" as const,
});

const answeredAt = (query: string) =>
  readAt(server, ofSource(query)).then((answer) => ({
    answer,
    at: Date.now(),
  }));

const stalls = [
  {
    label: "pinned read",
    stallRevision: revisionOf("2a"),
    lateRevision: revisionOf("2c"),
    held: isSeed,
    warm: (revision: string) => `&revision=${revision}`,
    read: sharedSeedRead,
    reading: (revision: string) => readingPathAt(sharedSeedPath, revision),
    asked: (revision: string) => `content ${sharedSeedPath}@${revision}`,
  },
];

for (const stall of stalls) {
  test(
    `the work's own timeout releases a stalled ${stall.label}`,
    async () => {
      const revision = stall.stallRevision;
      const holding = await servedHolding(server, revision, stall.held, [
        stall.warm(revision),
      ]);
      const started = Date.now();
      const pending = readAt(server, ofSource(stall.read(revision)));
      try {
        await expect
          .poll(() => server.github.calls.length - holding.before, {
            timeout: 5_000,
          })
          .toBeGreaterThanOrEqual(1);
        const pid = childPid();
        expect(processAlive(pid)).toBe(true);
        expect(Date.now() - started).toBeLessThan(boundMs);
        const response = await pending;
        expect(response.status).toBe(502);
        expect(JSON.parse(response.body)).toEqual(
          timedOut(stall.reading(revision)),
        );
        await expect
          .poll(() => processAlive(pid), { timeout: 5_000 })
          .toBe(false);
        expect(childExitedBy()).toBe("SIGTERM");
        expect(askedSince(server, holding.before)).toEqual([
          stall.asked(revision),
        ]);
      } finally {
        holding.release();
      }
    },
    realCliCaseMs,
  );
}

for (const stall of stalls) {
  test(
    `a late ${stall.label} keeps its own bound and the held call is not extended or repeated`,
    async () => {
      const revision = stall.lateRevision;
      const holding = await servedHolding(server, revision, stall.held, [
        stall.warm(revision),
      ]);
      const first = answeredAt(stall.read(revision));
      try {
        await refusedMarker(server);
        await expect
          .poll(() => server.github.calls.length - holding.before, {
            timeout: 5_000,
          })
          .toBe(1);
        const pid = childPid();
        expect(processAlive(pid)).toBe(true);
        const heldAt = Date.now();
        await expect
          .poll(() => Date.now() >= heldAt + boundMs / 2, { timeout: boundMs })
          .toBe(true);
        expect(processAlive(pid)).toBe(true);
        const joinerDeadline = Date.now() + boundMs;
        const late = answeredAt(stall.read(revision));
        await refusedMarker(server);
        expect(processAlive(pid)).toBe(true);
        expect(askedSince(server, holding.before)).toEqual([
          stall.asked(revision),
        ]);
        const { answer: firstAnswer, at: firstAnsweredAt } = await first;
        const { answer: lateAnswer, at: lateAnsweredAt } = await late;
        expect([firstAnswer.status, lateAnswer.status]).toEqual([502, 502]);
        expect(JSON.parse(firstAnswer.body)).toEqual(
          timedOut(stall.reading(revision)),
        );
        expect(JSON.parse(lateAnswer.body)).toEqual(
          timedOut(stall.reading(revision)),
        );
        expect(firstAnsweredAt).toBeLessThan(joinerDeadline);
        expect(lateAnsweredAt).toBeLessThan(joinerDeadline);
        await expect
          .poll(() => processAlive(pid), { timeout: 5_000 })
          .toBe(false);
        expect(Date.now()).toBeLessThan(joinerDeadline);
        expect(childExitedBy()).toBe("SIGTERM");
        expect(askedSince(server, holding.before)).toEqual([
          stall.asked(revision),
        ]);
        holding.release();
        expect(
          (await readAt(server, ofSource(stall.read(revision)))).status,
        ).toBe(200);
        expect(askedSince(server, holding.before)).toEqual([
          stall.asked(revision),
          stall.asked(revision),
        ]);
      } finally {
        holding.release();
      }
    },
    realCliCaseMs,
  );
}
