// Boundary close (../../server/authenticatedRead.ts,
// ../../server/localBoundaryPlugin.ts closeServer) releases held pinned reads,
// revision checks, and queued waits while the client stays connected. A later
// read is refused before GitHub is asked. In process over Node HTTP with the
// real CLI `gh`. Departure and the read's own bound stay with predecessor specs.

import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  backlogApart,
  describedRevision,
} from "../../test-support/describedRevisions.ts";
import {
  everyRepository,
  hangs,
  publishes,
} from "../../test-support/support/fakeGitHub.ts";
import { heldInTurn } from "../../test-support/support/heldGitHubAnswer.ts";
import { startInProcessAuthenticatedRead } from "../../test-support/support/inProcessAuthenticatedRead.ts";
import {
  processAlive,
  processRunning,
  readPid,
} from "../../test-support/support/processGroup.ts";
import { abandonedRequest } from "../../test-support/support/rawHttp.ts";
import {
  askedSince,
  pinnedRead,
  readAt,
  readUrl,
  refusedMarker,
  revisionCheck,
} from "../../test-support/support/sharedReads.ts";

const source = makeMe.aPublishedSource.openDough.please();
const revisionOf = (pair: string) => pair.repeat(20);
// A real CLI child under load can outlast Vitest's 5s default.
const realCliCaseMs = 20_000;
// How many reads one dashboard process has under way at GitHub at most.
const turnsOpen = 8;
const seedPaths = [...Array(12).keys()].map(
  (index) => `.planning/seeds/SEED-close-${String(index + 1)}.md`,
);
const queuedReads = makeMe.aRepository
  .withRevision("published", {
    backlog: {
      queued: seedPaths.map((path, index) =>
        makeMe.aBacklogEntry
          .with({
            identity: `SEED-close-${String(index + 1)}#close`,
            title: `Close ${String(index + 1)}`,
            href: `${path.replace(".planning/", "")}#close`,
          })
          .please(),
      ),
    },
    files: Object.fromEntries(seedPaths.map((path) => [path, `# ${path}\n`])),
  })
  .please();

type Started = Awaited<ReturnType<typeof startInProcessAuthenticatedRead>>;

const ofSource = (query: string) => ({ source: source.id, query });
const seedRead = (revision: string, path: string) =>
  `&revision=${revision}&path=${encodeURIComponent(path)}`;

function serverOf(boundary: Started) {
  return {
    baseURL: boundary.origin,
    origin: boundary.origin,
    github: boundary.github,
  };
}

// Leaves the client socket open: nothing destroys this request.
function keepReading(boundary: Started, query: string) {
  const server = serverOf(boundary);
  abandonedRequest({
    url: readUrl(server.baseURL, ofSource(query)),
    headers: { Origin: server.origin },
  });
}

async function opened(): Promise<Started> {
  return startInProcessAuthenticatedRead({
    ghTransport: "cli",
    extraEnv: () => ({ DOUGH_REVISION_CHECK_REUSE_MS: "0" }),
  });
}

async function untilRunning(boundary: Started): Promise<number> {
  const seen: { pid?: number } = {};
  await expect
    .poll(
      () => {
        const pid = readPid(boundary.gh.pidPath);
        if (pid !== undefined && processAlive(pid)) seen.pid = pid;
        return processAlive(pid);
      },
      { timeout: 5_000 },
    )
    .toBe(true);
  const pid = seen.pid;
  if (pid === undefined) {
    throw new Error("The held CLI child did not record its pid");
  }
  return pid;
}

// Observed after closeBoundary and before the fixture's own close.
function released(pid: number) {
  return expect.poll(() => processRunning(pid), { timeout: 5_000 }).toBe(false);
}

test(
  "boundary close releases a held pinned read while its client stays connected",
  async () => {
    const boundary = await opened();
    try {
      boundary.github.serve(everyRepository, hangs);
      keepReading(boundary, pinnedRead);
      const pid = await untilRunning(boundary);
      await boundary.closeBoundary();
      await released(pid);
    } finally {
      await boundary.close();
    }
  },
  realCliCaseMs,
);

test(
  "boundary close releases a held revision check while its client stays connected",
  async () => {
    const boundary = await opened();
    const server = serverOf(boundary);
    try {
      boundary.github.serve(everyRepository, hangs);
      keepReading(boundary, revisionCheck);
      const pid = await untilRunning(boundary);
      await boundary.closeBoundary();
      await released(pid);
      await expect
        .poll(() => askedSince(server, 0), { timeout: 5_000 })
        .toEqual(["matching-refs"]);
    } finally {
      await boundary.close();
    }
  },
  realCliCaseMs,
);

test(
  "boundary close releases one pinned read that two requests still wait on, after one upstream call",
  async () => {
    const boundary = await opened();
    const server = serverOf(boundary);
    try {
      boundary.github.serve(everyRepository, hangs);
      keepReading(boundary, pinnedRead);
      keepReading(boundary, pinnedRead);
      await refusedMarker(server);
      await expect
        .poll(() => server.github.calls.length, { timeout: 5_000 })
        .toBeGreaterThanOrEqual(1);
      const pid = await untilRunning(boundary);
      await boundary.closeBoundary();
      await released(pid);
      expect(server.github.calls).toHaveLength(1);
    } finally {
      await boundary.close();
    }
  },
  realCliCaseMs,
);

test(
  "closing ends outstanding reads and the waits still queued behind them",
  async () => {
    const boundary = await opened();
    const server = serverOf(boundary);
    const revision = revisionOf("8e");
    try {
      const published = publishes(
        backlogApart(describedRevision(queuedReads, revision)),
      );
      boundary.github.serve(everyRepository, published);
      expect(
        (await readAt(server, ofSource(`&revision=${revision}`))).status,
      ).toBe(200);
      const held = heldInTurn(
        published,
        (request) =>
          request.kind === "content" && seedPaths.includes(request.path),
      );
      boundary.github.serve(everyRepository, held.answer);
      const before = boundary.github.calls.length;
      for (const path of seedPaths.slice(0, turnsOpen)) {
        keepReading(boundary, seedRead(revision, path));
      }
      await expect
        .poll(() => askedSince(server, before).length, { timeout: 10_000 })
        .toBe(turnsOpen);
      for (const path of seedPaths.slice(turnsOpen)) {
        keepReading(boundary, seedRead(revision, path));
      }
      await refusedMarker(server);
      const pid = await untilRunning(boundary);
      await boundary.closeBoundary();
      await released(pid);
      const asked = askedSince(server, before);
      const queued = seedPaths
        .slice(turnsOpen)
        .map((path) => `content ${path}@${revision}`);
      expect(asked.filter((read) => queued.includes(read))).toEqual([]);
      expect(asked).toHaveLength(turnsOpen);
    } finally {
      await boundary.close();
    }
  },
  realCliCaseMs,
);

test(
  "after close, a later read is refused before asking GitHub",
  async () => {
    const boundary = await opened();
    const server = serverOf(boundary);
    try {
      boundary.github.serve(everyRepository, hangs);
      keepReading(boundary, pinnedRead);
      await untilRunning(boundary);
      await boundary.closeBoundary();
      await expect
        .poll(() => server.github.calls.length, { timeout: 5_000 })
        .toBeGreaterThan(0);
      const calls = server.github.calls.length;
      const later = await readAt(server, ofSource(pinnedRead));
      expect(later.status).toBe(503);
      expect(JSON.parse(later.body)).toEqual({
        error: "This dashboard is closing.",
      });
      expect(server.github.calls).toHaveLength(calls);
    } finally {
      await boundary.close();
    }
  },
  realCliCaseMs,
);
