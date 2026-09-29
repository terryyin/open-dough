// The machine's sessions as the local launch boundary
// (../server/agentLaunchPlugin.ts) answers them over raw HTTP: every catalog
// project's kept launch records, each naming its project, joined by session id
// with one Claude Code listing, `claude agents --json --all` in the machine's
// home folder. A session it lists answers `listed` with its `state`, while
// its process runs its `status`, and, when Claude Code says, what a blocked
// session is `waitingFor`; one it no longer lists answers `unlisted`; and a
// listing that fails answers `unknown`. Nothing of it is stored, and with no
// records kept no `claude` runs. The synthetic `claude`
// (./fixtures/fake-claude) lists what it launched as the real one does, and
// its controls end or forget a session or fail the listing; the real one is
// never reached. What a launch answers and keeps is
// ./agent-launch-boundary.spec.ts.

import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import {
  launch,
  launchRequest,
  machineFolder,
  machineSessions,
  projectRecords,
  recordsOf,
} from "./agentLaunchBoundary.ts";
import {
  builtDashboardDir,
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import type { ClaudeSessionChange } from "./support/fakeClaude.ts";

type WithState = {
  session: { sessionId: string };
  sessionState: unknown;
};

test.describe("the machine's sessions, each joined with its state", () => {
  test.describe.configure({ mode: "serial" });
  let server: DashboardServer;
  let storeFile: string;

  test.beforeAll(async () => {
    server = await startDashboardServer({
      mode: "preview",
      prebuilt: builtDashboardDir,
      projectFolders: ["open-dough", "pygardon"],
    });
    storeFile = path.join(
      server.home,
      ".open-dough",
      "dashboard",
      "agent-launches.json",
    );
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
    server.claudeScenario("launched");
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
      const { record } = JSON.parse(
        (await launch(server, launchRequest)).body,
      ) as { record: WithState };
      expect(record.sessionState).toEqual({
        kind: "listed",
        state: "working",
        status: "busy",
      });
      sessions.push(record.session.sessionId);
    }
    const stored = readFileSync(storeFile, "utf8");
    for (const [index, [change, waitingFor]] of changes.entries()) {
      server.claudeSessionBecomes(sessions[index] ?? "?", change, waitingFor);
    }
    const callsBefore = server.claudeCalls().length;

    const states = await statesOf();
    expect(sessions.map((id) => states.get(id))).toEqual([
      { kind: "listed", state: "working", status: "busy" },
      { kind: "listed", state: "working", status: "idle" },
      { kind: "listed", state: "blocked", status: "waiting" },
      {
        kind: "listed",
        state: "blocked",
        status: "waiting",
        waitingFor: "permission to run npm test",
      },
      { kind: "listed", state: "done", status: "idle" },
      { kind: "listed", state: "done" },
      { kind: "listed", state: "failed" },
      { kind: "listed", state: "stopped" },
      { kind: "unlisted" },
    ]);
    expect(server.claudeCalls().slice(callsBefore)).toEqual([
      { argv: ["agents", "--json", "--all"], cwd: machineFolder(server) },
    ]);
    // The records read kept nothing of what it answered.
    expect(readFileSync(storeFile, "utf8")).toBe(stored);
  });

  test("answers a resumed session without the reason it waited for", async () => {
    const { record } = JSON.parse(
      (await launch(server, launchRequest)).body,
    ) as { record: WithState };
    const id = record.session.sessionId;
    server.claudeSessionBecomes(id, "blocked", "input needed");
    expect((await statesOf()).get(id)).toEqual({
      kind: "listed",
      state: "blocked",
      status: "waiting",
      waitingFor: "input needed",
    });

    server.claudeSessionBecomes(id, "working");
    expect((await statesOf()).get(id)).toEqual({
      kind: "listed",
      state: "working",
      status: "busy",
    });
  });

  test("answers every session unknown while the listing fails, and as listed once it answers again", async () => {
    const { record } = JSON.parse(
      (await launch(server, launchRequest)).body,
    ) as {
      record: WithState;
    };

    server.claudeListingFails(true);
    const unknown = await statesOf();
    expect(unknown.has(record.session.sessionId)).toBe(true);
    for (const state of unknown.values()) {
      expect(state).toEqual({ kind: "unknown" });
    }

    server.claudeListingFails(false);
    expect((await statesOf()).get(record.session.sessionId)).toEqual({
      kind: "listed",
      state: "working",
      status: "busy",
    });
  });

  test("answers every project's records, each naming its project, from one listing", async () => {
    server.claudeScenario("launched");
    const response = await launch(server, {
      ...launchRequest,
      source: "pygardon",
    });
    const { record } = JSON.parse(response.body) as { record: unknown };
    const callsBefore = server.claudeCalls().length;

    const sessions = await machineSessions(server);
    expect(projectRecords(sessions, "pygardon")).toEqual([record]);
    const openDough = projectRecords(sessions, "open-dough");
    expect(openDough.length).toBeGreaterThan(0);
    expect(sessions).toHaveLength(openDough.length + 1);
    expect(server.claudeCalls().slice(callsBefore)).toEqual([
      { argv: ["agents", "--json", "--all"], cwd: machineFolder(server) },
    ]);
  });
});
