// Cursor's list and host observation share held runner evidence by machine revision.
import { once } from "node:events";
import { mkdtempSync, rmSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  heldCursorSessionEvidence,
  heldCursorSessions,
} from "../../server/hosts/cursor/heldSessions.ts";
import { writeCursorRunnerAddress } from "../../server/hosts/cursor/runnerPaths.ts";
import type { CursorRunnerSessionsResult } from "../../server/hosts/cursor/runnerProtocol.ts";
import { machineRecordStore } from "../../server/launchRecordStore.ts";
import { withStates } from "../../server/launchStates.ts";
import { machineFolder } from "../../server/localFolder.ts";
import * as machineDocuments from "../../server/machineJsonStore.ts";
import { agentNotRunningLabel } from "../../src/sessionRecovery.ts";

const reuseMs = 1_000;

async function heldRunner() {
  const home = mkdtempSync(path.join(tmpdir(), "dough-held-cursor-"));
  vi.stubEnv("HOME", home);
  vi.stubEnv("DOUGH_SESSIONS_REUSE_MS", String(reuseMs));
  vi.stubEnv("DOUGH_TEST_OBSERVATION_CLOCK_AHEAD_FILE", undefined);
  vi.useFakeTimers({ toFake: ["Date"] });
  const record = makeMe.aLaunchRecord
    .executing({
      identity: "SEED-413#held-cursor",
      title: "Observe held Cursor",
    })
    .inCursorSession({
      sessionId: "1f946be3-825f-42f4-a295-1602218afefe",
      continuation: { workspace: home },
    })
    .withFirstInput({ state: "confirmed" })
    .please();
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  const wire = {
    sessions: [{ session: record.session, label: "working" }],
  } satisfies CursorRunnerSessionsResult;
  let reads = 0;
  const server = createServer((request, response) => {
    if (request.method !== "GET" || request.url !== "/sessions") {
      response.writeHead(404).end();
      return;
    }
    reads += 1;
    void held.then(() => {
      response.end(JSON.stringify(wire));
    });
  });
  onTestFinished(async () => {
    release();
    const closed = new Promise<void>((resolve) =>
      server.close(() => {
        resolve();
      }),
    );
    server.closeAllConnections();
    await closed;
    vi.useRealTimers();
    vi.unstubAllEnvs();
    rmSync(home, { recursive: true, force: true });
  });
  await once(server.listen(0, "127.0.0.1"), "listening");
  const address = server.address();
  if (address === null || typeof address === "string") {
    throw new Error("The held Cursor runner has no listening port.");
  }
  writeCursorRunnerAddress(home, { port: address.port, pid: process.pid });
  return { record, sessionsReads: () => reads, release };
}

// Use the settled real revision reads as an arrival signal while the runner
// reply is held, so the asks exercise a running read before settled reuse.
function watchViewers() {
  const revisions = vi.spyOn(machineDocuments, "machineDocumentsRevision");
  onTestFinished(() => {
    revisions.mockRestore();
  });
  return async (count: number) => {
    await expect
      .poll(
        () =>
          revisions.mock.settledResults.filter(
            ({ type }) => type === "fulfilled",
          ).length,
      )
      .toBe(count);
  };
}

test("a Cursor record written during a held read gets its own observation", async () => {
  const runner = await heldRunner();
  const viewers = watchViewers();
  const outstanding = heldCursorSessions();
  const asks: Promise<unknown>[] = [outstanding];
  try {
    await expect.poll(runner.sessionsReads).toBe(1);
    const { record } = runner;
    await machineRecordStore.replaceRecords(() => ({
      [record.request.source]: [record],
    }));
    const observation = withStates(machineFolder(), [record], "recurring");
    asks.push(observation);
    await viewers(2);
    runner.release();

    const [seen] = await observation;
    expect(seen?.session.sessionId).toBe(record.session.sessionId);
    expect(seen?.sessionState).toEqual({
      kind: "available",
      availability: "loaded",
      activity: "working",
    });
    expect(seen?.sessionState).not.toMatchObject({
      kind: "unknown",
      label: agentNotRunningLabel,
    });
    expect(runner.sessionsReads()).toBe(2);
  } finally {
    runner.release();
    await Promise.allSettled(asks);
  }
});

test("overlapping Cursor lists and evidence share a read and reuse it until expiry", async () => {
  const runner = await heldRunner();
  const { record } = runner;
  await machineRecordStore.replaceRecords(() => ({
    [record.request.source]: [record],
  }));
  const viewers = watchViewers();
  const lists = Promise.all([
    heldCursorSessions(),
    heldCursorSessions(),
    heldCursorSessions(),
  ]);
  const evidence = heldCursorSessionEvidence();
  const asks = Promise.all([lists, evidence]);
  try {
    await expect.poll(runner.sessionsReads).toBe(1);
    await viewers(4);
    expect(runner.sessionsReads()).toBe(1);
    runner.release();

    const [[first, ...others], observed] = await asks;
    expect(first).toEqual({
      runner: "running",
      sessions: [{ record, label: "working" }],
    });
    expect(others).toEqual([first, first]);
    expect(observed.runner).toBe("running");
    expect(
      observed.sessions.map(({ record: held }) => held.session.sessionId),
    ).toEqual([record.session.sessionId]);
    expect(runner.sessionsReads()).toBe(1);

    const settledAt = Date.now();
    vi.setSystemTime(settledAt + reuseMs - 1);
    expect(await heldCursorSessions()).toEqual(first);
    expect(runner.sessionsReads()).toBe(1);

    vi.setSystemTime(settledAt + reuseMs);
    expect(await heldCursorSessions()).toEqual(first);
    expect(runner.sessionsReads()).toBe(2);
  } finally {
    runner.release();
    await Promise.allSettled([asks]);
  }
});
