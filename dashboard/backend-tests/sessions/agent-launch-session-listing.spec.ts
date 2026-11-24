// The launch boundary joins stored sessions from every project with a
// single native listing. Reading activity changes no stored record, and an
// empty store requires no native listing.
import { readFileSync } from "node:fs";
import {
  keptLaunchRecords,
  launchStoreFile,
} from "../../test-support/support/launchStore.ts";
import { expect, test } from "../../test-support/support/pageTest.ts";
import {
  machineFolder,
  machineSessions,
  projectRecords,
  recordsOf,
} from "../../test-support/agentLaunchBoundary.ts";
import { composeSession } from "../../test-support/agentTerminalBoundary.ts";
import {
  startDashboardServer,
  type DashboardServer,
} from "../../test-support/support/dashboardServer.ts";
import type { ClaudeSessionChange } from "../../test-support/support/fakeClaude.ts";

type WithState = {
  session: { sessionId: string };
  sessionState: unknown;
};

const working = {
  kind: "available",
  availability: "loaded",
  activity: "working",
};

test.describe("the machine's sessions, each joined with its state", () => {
  test.describe.configure({ mode: "serial" });
  let server: DashboardServer;

  test.beforeAll(async () => {
    server = await startDashboardServer({
      mode: "boundary",
      projectFolders: ["open-dough", "pygardon"],
    });
  });

  test.afterAll(async () => {
    await server.close();
  });

  async function statesOf(): Promise<Map<string, unknown>> {
    const kept = (await recordsOf(server, "open-dough")) as WithState[];
    return new Map(
      kept.map((record) => [record.session.sessionId, record.sessionState]),
    );
  }

  test("answers no records and runs no claude while none are kept", async () => {
    expect(await recordsOf(server, "open-dough")).toEqual([]);
    expect(server.claudeCalls()).toEqual([]);
  });

  test("answers each session as Claude Code lists it: working busy or idle, blocked with what it waits for when it says, done running or exited, failed, stopped, or no longer listed, keeping none of it", async () => {
    // Each session's change and the reason a blocked one gives, if any.
    const changes = [
      ["working"],
      ["working-idle"],
      ["blocked"],
      ["blocked", "permission to run npm test"],
      ["done-live"],
      ["done-exited"],
      ["failed"],
      ["stopped"],
      ["forgotten"],
    ] as const satisfies readonly (readonly [ClaudeSessionChange, string?])[];
    const sessions: string[] = [];
    while (sessions.length < changes.length) {
      sessions.push((await composeSession(server)).sessionId);
    }
    const initial = await statesOf();
    expect(sessions.map((id) => initial.get(id))).toEqual(
      changes.map(() => working),
    );
    const stored = readFileSync(launchStoreFile(server), "utf8");
    for (const [index, [change, waitingFor]] of changes.entries()) {
      server.claudeSessionBecomes(sessions[index] ?? "?", change, waitingFor);
    }
    const callsBefore = server.claudeCalls().length;

    const states = await statesOf();
    expect(sessions.map((id) => states.get(id))).toEqual([
      working,
      working,
      { kind: "available", availability: "loaded", activity: "waiting" },
      {
        kind: "available",
        availability: "loaded",
        activity: "waiting",
        waitingFor: "permission to run npm test",
      },
      { kind: "available", availability: "loaded", activity: "review" },
      { kind: "available", availability: "retained", activity: "review" },
      { kind: "available", availability: "retained", activity: "failed" },
      { kind: "available", availability: "retained", activity: "interrupted" },
      { kind: "unavailable" },
    ]);
    expect(server.claudeCalls().slice(callsBefore)).toEqual([
      { argv: ["agents", "--json", "--all"], cwd: machineFolder(server) },
    ]);
    // The records read kept nothing of what it answered.
    expect(readFileSync(launchStoreFile(server), "utf8")).toBe(stored);
  });

  test.describe("with an existing working session", () => {
    let sessionId: string;

    test.beforeAll(async () => {
      ({ sessionId } = await composeSession(server));
    });

    test("answers a resumed session without the reason it waited for", async () => {
      server.claudeSessionBecomes(sessionId, "blocked", "input needed");
      expect((await statesOf()).get(sessionId)).toEqual({
        kind: "available",
        availability: "loaded",
        activity: "waiting",
        waitingFor: "input needed",
      });

      server.claudeSessionBecomes(sessionId, "working");
      expect((await statesOf()).get(sessionId)).toEqual(working);
    });

    test("answers every session unknown while the listing fails, and as listed once it answers again", async () => {
      server.claudeListingFails(true);
      try {
        const unknown = await statesOf();
        expect(unknown.has(sessionId)).toBe(true);
        for (const state of unknown.values()) {
          expect(state).toEqual({ kind: "unknown" });
        }
      } finally {
        server.claudeListingFails(false);
      }

      expect((await statesOf()).get(sessionId)).toEqual(working);
    });

    test("answers each session as listed while Claude Code also lists an interactive session", async () => {
      server.claudeListsInteractiveSession();

      expect((await statesOf()).get(sessionId)).toEqual(working);
    });

    test("answers every project's records, each naming its project, from one listing", async () => {
      await composeSession(server, "pygardon");
      const [pygardon] = keptLaunchRecords(server, "pygardon");
      const callsBefore = server.claudeCalls().length;

      const sessions = await machineSessions(server);
      expect(projectRecords(sessions, "pygardon")).toEqual([
        { ...pygardon, sessionState: working },
      ]);
      const openDough = projectRecords(sessions, "open-dough");
      expect(openDough.length).toBeGreaterThan(0);
      expect(sessions).toHaveLength(openDough.length + 1);
      expect(server.claudeCalls().slice(callsBefore)).toEqual([
        { argv: ["agents", "--json", "--all"], cwd: machineFolder(server) },
      ]);
    });
  });
});
