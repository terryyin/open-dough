// What a dashboard process records of itself in this user's incident record
// (../../server/incidentLifecycle.ts, ../../server/eventLoopWatch.ts): a
// stall it observed in its own event loop, read by the next diagnostics
// read (../../server/readDiagnostics.ts); its start and, on a clean close,
// its end after every entry it had queued; and a successor reading a
// process killed without ending its record as lost. Failed reads across a
// replacement: ./authenticated-read-incident-record.spec.ts.

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "../support/pageTest.ts";
import { everyRepository } from "../support/fakeGitHub.ts";
import { httpErrorAnswer } from "../originAnswers.ts";
import { processRunning } from "../support/processGroup.ts";
import { rawRequest } from "../support/rawHttp.ts";
import {
  incidentEntries,
  inspect,
  knownSourceId,
  developmentBoundary,
  startDashboardServer,
} from "../support/readDiagnostics.ts";

test("the next diagnostics read shows a two-second stall with its delay, load, revision, process age, and the second it began", async () => {
  const machine = mkdtempSync(path.join(tmpdir(), "dough-incident-stall-"));
  try {
    const server = await startDashboardServer({
      ...developmentBoundary,
      machine,
      extraEnv: { DOUGH_TEST_EVENT_LOOP_BLOCK: "allow" },
    });
    try {
      const blocked = await rawRequest({
        url: `${server.baseURL}/__test/event-loop-block?ms=2000`,
        method: "POST",
      });
      expect(blocked.status).toBe(200);
      const { blockedFrom, blockedUntil } = JSON.parse(blocked.body) as {
        blockedFrom: string;
        blockedUntil: string;
      };
      const from = Date.parse(blockedFrom);
      const until = Date.parse(blockedUntil);

      const seen = await inspect(server);
      expect(seen.status).toBe(200);
      // A loaded machine may add stalls of its own; one is this block.
      const during = seen.record.stalls.filter(
        (stall) =>
          Date.parse(stall.at) >= from - 250 && Date.parse(stall.at) <= until,
      );
      expect(during).toHaveLength(1);
      const [stall] = during;
      expect(stall).toMatchObject({
        kind: "stall",
        pid: server.pid,
        stalls: 1,
      });
      expect(stall?.delayMs).toBeGreaterThanOrEqual(1_900);
      expect(stall?.loadAverage).toHaveLength(3);
      for (const load of stall?.loadAverage ?? [])
        expect(load).toBeGreaterThanOrEqual(0);
      expect(stall?.revision).toMatch(/^[0-9a-f]{40}$/);
      expect(stall?.processAgeMs).toBeGreaterThanOrEqual(until - from);
      expect(seen.record.processes).toEqual([
        expect.objectContaining({ pid: server.pid, state: "current" }),
      ]);
    } finally {
      await server.close();
    }
  } finally {
    rmSync(machine, { recursive: true, force: true });
  }
});

test("a clean close ends the record after its queued failure, and a successor reads a killed process as lost", async () => {
  const machine = mkdtempSync(path.join(tmpdir(), "dough-incident-ends-"));
  const linesOf = (pid: number) =>
    incidentEntries(machine)
      // A loaded machine may add stalls of its own.
      .filter((entry) => entry.pid === pid && entry.kind !== "stall");
  try {
    const closed = await startDashboardServer({
      ...developmentBoundary,
      machine,
    });
    try {
      closed.github.serve(everyRepository, () =>
        Promise.resolve(httpErrorAnswer(503, "unavailable")),
      );
      const failed = await rawRequest({
        url: `${closed.baseURL}/__authenticated-read?source=${knownSourceId}`,
        headers: { Origin: closed.origin },
      });
      expect(failed.status).toBe(502);
    } finally {
      // Closed at once: the failure may still be queued for writing.
      await closed.close();
    }
    expect(linesOf(closed.pid).map((entry) => entry.kind)).toEqual([
      "process-started",
      "failed-read",
      "process-ended",
    ]);

    const killed = await startDashboardServer({
      ...developmentBoundary,
      machine,
    });
    try {
      await expect
        .poll(() => linesOf(killed.pid).map((entry) => entry.kind), {
          timeout: 10_000,
        })
        .toEqual(["process-started"]);
      process.kill(killed.pid, "SIGKILL");
      await expect
        .poll(() => processRunning(killed.pid), { timeout: 10_000 })
        .toBe(false);
    } finally {
      await killed.close();
    }

    const successor = await startDashboardServer({
      ...developmentBoundary,
      machine,
    });
    try {
      const seen = await inspect(successor);
      expect(seen.status).toBe(200);
      const byPid = new Map(
        seen.record.processes.map((entry) => [entry.pid, entry]),
      );
      expect(byPid.get(closed.pid)).toMatchObject({ state: "ended" });
      expect(byPid.get(closed.pid)?.endedAt).toEqual(expect.any(String));
      const lost = byPid.get(killed.pid);
      expect(lost).toMatchObject({ state: "lost" });
      expect(lost?.endedAt).toBeUndefined();
      expect(Date.parse(lost?.lastAt ?? "")).toBeGreaterThanOrEqual(
        Date.parse(lost?.startedAt ?? ""),
      );
      expect(byPid.get(successor.pid)).toMatchObject({ state: "current" });
      expect(seen.record.processes.map((entry) => entry.pid)).toEqual([
        successor.pid,
        killed.pid,
        closed.pid,
      ]);
    } finally {
      await successor.close();
    }
  } finally {
    rmSync(machine, { recursive: true, force: true });
  }
});
