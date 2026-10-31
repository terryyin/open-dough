// Shared Cursor held-session reads (../../server/hosts/cursor/heldSessions.ts)
// join only under the same machine documents the read started from. Counted
// where the runner's address forwards (../support/cursorRunnerHeldReads.ts):
// a launch record written while a held read is outstanding is labeled from a
// read that includes it, and overlapping asks under unchanged documents still
// share one runner read.
import { setTimeout as delay } from "node:timers/promises";
import { expect, test } from "../support/pageTest.ts";
import { cursorRunnerSessionsEndpoint } from "../../src/cursorRunnerSessions.ts";
import { agentNotRunningLabel } from "../../src/sessionRecovery.ts";
import { launch } from "../agentLaunchBoundary.ts";
import { installFakeCursor } from "../support/fakeCursor.ts";
import { holdRunnerSessionsReads } from "../support/cursorRunnerHeldReads.ts";
import {
  instructedCursorRequest,
  keptCursor,
  withCursorLaunch,
} from "../support/keptCursorTurn.ts";
import { keepLaunchRecords } from "../support/storyLaunchRecord.ts";
import { rawRequest } from "../support/rawHttp.ts";
import type { DashboardServer } from "../support/dashboardServer.ts";

const instruction = "hold this session";

const askList = (dashboard: DashboardServer) =>
  rawRequest({
    url: `${dashboard.baseURL}${cursorRunnerSessionsEndpoint}`,
    headers: { Origin: dashboard.origin },
  });

const askSessions = (dashboard: DashboardServer) =>
  rawRequest({
    url: `${dashboard.baseURL}/__agent-launch`,
    headers: { Origin: dashboard.origin },
  });

test.describe.configure({ timeout: 120_000 });

test("a Cursor record written while a held read is outstanding is labeled from a read that includes it", async () => {
  const cursor = installFakeCursor({ screen: "working" });
  await withCursorLaunch({ mode: "boundary" }, cursor, async (dashboard) => {
    // Installed before the launch, so every runner read passes through it.
    const gate = await holdRunnerSessionsReads(dashboard.home);
    try {
      const launched = await launch(
        dashboard,
        instructedCursorRequest(instruction),
      );
      expect(launched.status).toBe(200);
      await expect.poll(() => cursor.attaches()).toHaveLength(1);
      const record = keptCursor(dashboard.home);

      // Drop the launch record while the runner still holds the client, so the
      // next held read begins under documents without it.
      await keepLaunchRecords(dashboard, []);

      const before = gate.sessionsReads();
      gate.hold();
      let list!: ReturnType<typeof askList>;
      let observation!: ReturnType<typeof askSessions>;
      try {
        list = askList(dashboard);
        await expect.poll(() => gate.sessionsReads()).toBe(before + 1);
        // The joiner's record lands after that read began.
        await keepLaunchRecords(dashboard, [record]);
        observation = askSessions(dashboard);
        await delay(300);
      } finally {
        gate.release();
      }
      await list;
      const sessions = await observation;
      expect(sessions.status).toBe(200);
      const body = JSON.parse(sessions.body) as {
        records: {
          session: { sessionId: string };
          sessionState: { kind?: string; label?: string; activity?: string };
        }[];
      };
      const observed = body.records.find(
        (entry) => entry.session.sessionId === record.session.sessionId,
      );
      expect(observed?.sessionState).toEqual({
        kind: "available",
        availability: "loaded",
        activity: "working",
      });
      expect(observed?.sessionState).not.toMatchObject({
        kind: "unknown",
        label: agentNotRunningLabel,
      });
      // Own read after the write: the outstanding one plus the joiner's.
      expect(gate.sessionsReads()).toBe(before + 2);
    } finally {
      await gate.close();
    }
  });
});

test("overlapping asks under unchanged documents still share one runner read", async () => {
  const cursor = installFakeCursor({ screen: "working" });
  await withCursorLaunch({ mode: "boundary" }, cursor, async (dashboard) => {
    const gate = await holdRunnerSessionsReads(dashboard.home);
    try {
      const launched = await launch(
        dashboard,
        instructedCursorRequest(instruction),
      );
      expect(launched.status).toBe(200);
      await expect.poll(() => cursor.attaches()).toHaveLength(1);

      const before = gate.sessionsReads();
      gate.hold();
      let lists: ReturnType<typeof askList>[] = [];
      let observation!: ReturnType<typeof askSessions>;
      try {
        lists = [askList(dashboard)];
        await expect.poll(() => gate.sessionsReads()).toBe(before + 1);
        lists.push(askList(dashboard), askList(dashboard));
        observation = askSessions(dashboard);
        await delay(300);
        expect(gate.sessionsReads()).toBe(before + 1);
      } finally {
        gate.release();
      }
      const answers = await Promise.all(lists);
      expect(answers.map(({ status }) => status)).toEqual([200, 200, 200]);
      expect(new Set(answers.map(({ body }) => body)).size).toBe(1);
      const sessions = await observation;
      expect(sessions.status).toBe(200);
      expect(sessions.body).toContain(cursor.sessionId);
      expect(gate.sessionsReads()).toBe(before + 1);
    } finally {
      await gate.close();
    }
  });
});
