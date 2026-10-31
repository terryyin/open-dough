// Running Cursor sessions lists in several browsers, and the sessions answer's
// own Cursor observation, share the one runner read running while they ask
// (../server/hosts/cursor/heldSessions.ts), counted where the runner's address
// forwards (./support/cursorRunnerHeldReads.ts). A settled read answers nobody
// later: the next ask reads the runner again, so labels stay current.
import { setTimeout as delay } from "node:timers/promises";
import { cursorRunnerSessionsEndpoint } from "../src/cursorRunnerSessions.ts";
import { holdSession, withRunningCursor } from "./runningCursorSessionsPage.ts";
import { holdRunnerSessionsReads } from "./support/cursorRunnerHeldReads.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { rawRequest } from "./support/rawHttp.ts";
import { expect } from "./support/cursorStart.ts";

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

type Listed = {
  runner: string;
  sessions: { record: { session: { sessionId: string } }; label: string }[];
};

const shared = withRunningCursor({ screen: "working" });
shared(
  "overlapping Running Cursor sessions asks share one runner read, and the next ask after it settles reads again",
  async ({ dashboard, cursor }) => {
    shared.setTimeout(120_000);
    // Installed before the launch, so every runner read passes through it.
    const gate = await holdRunnerSessionsReads(dashboard.home);
    try {
      await holdSession(dashboard, cursor);
      const before = gate.sessionsReads();
      gate.hold();
      let lists: ReturnType<typeof askList>[] = [];
      let observation: ReturnType<typeof askSessions> | undefined;
      try {
        lists = [askList(dashboard)];
        await expect.poll(() => gate.sessionsReads()).toBe(before + 1);
        lists.push(askList(dashboard), askList(dashboard));
        observation = askSessions(dashboard);
        // Well under the runner client's own answer timeout.
        await delay(300);
        expect(gate.sessionsReads()).toBe(before + 1);
      } finally {
        gate.release();
      }
      const answers = await Promise.all(lists);
      expect(answers.map(({ status }) => status)).toEqual([200, 200, 200]);
      expect(new Set(answers.map(({ body }) => body)).size).toBe(1);
      const listed = JSON.parse(answers[0]?.body ?? "{}") as Listed;
      expect(listed.runner).toBe("running");
      expect(listed.sessions.map(({ label }) => label)).toEqual(["working"]);
      const sessions = await observation;
      expect(sessions.status).toBe(200);
      expect(sessions.body).toContain(cursor.sessionId);
      expect(gate.sessionsReads()).toBe(before + 1);

      const settled = gate.sessionsReads();
      const next = await askList(dashboard);
      expect(next.body).toBe(answers[0]?.body);
      expect(gate.sessionsReads()).toBeGreaterThan(settled);
    } finally {
      await gate.close();
    }
  },
);
