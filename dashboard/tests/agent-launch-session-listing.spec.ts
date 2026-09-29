// Each kept launch's session state as the local launch boundary
// (../server/agentLaunchPlugin.ts) answers it over raw HTTP: every records
// read joins Claude Code's own listing, `claude agents --json --all` in the
// project folder, by session id. A session it lists answers `listed` with its
// `state` and, while its process runs, its `status`; one it no longer lists
// answers `unlisted`; and a listing that fails answers `unknown`. Nothing is
// stored, and with no records kept no `claude` runs. The synthetic `claude`
// (./fixtures/fake-claude) lists what it launched as the real one does, and
// its controls end or forget a session or fail the listing; the real one is
// never reached. What a launch answers and keeps is
// ./agent-launch-boundary.spec.ts.

import { expect, test } from "@playwright/test";
import {
  launch,
  launchRequest,
  openDoughFolder,
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

test.describe("session state joined into the launch records answer", () => {
  test.describe.configure({ mode: "serial" });
  let server: DashboardServer;

  test.beforeAll(async () => {
    server = await startDashboardServer({
      mode: "preview",
      prebuilt: builtDashboardDir,
      projectFolders: ["open-dough"],
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

  test("answers each session as Claude Code lists it: running busy or idle, exited done or stopped, or no longer listed", async () => {
    server.claudeScenario("launched");
    const changes = [
      "working",
      "idle",
      "finished",
      "stopped",
      "forgotten",
    ] as const satisfies readonly ClaudeSessionChange[];
    const sessions = new Map<ClaudeSessionChange, string>();
    for (const change of changes) {
      const { record } = JSON.parse(
        (await launch(server, launchRequest)).body,
      ) as { record: WithState };
      expect(record.sessionState).toEqual({
        kind: "listed",
        state: "working",
        status: "busy",
      });
      sessions.set(change, record.session.sessionId);
    }
    for (const change of changes) {
      server.claudeSessionBecomes(sessions.get(change) ?? "?", change);
    }
    const callsBefore = server.claudeCalls().length;

    const states = await statesOf();
    expect(states.size).toBe(changes.length);
    const stateOf = (change: ClaudeSessionChange) =>
      states.get(sessions.get(change) ?? "?");
    expect(stateOf("working")).toEqual({
      kind: "listed",
      state: "working",
      status: "busy",
    });
    expect(stateOf("idle")).toEqual({
      kind: "listed",
      state: "done",
      status: "idle",
    });
    expect(stateOf("finished")).toEqual({ kind: "listed", state: "done" });
    expect(stateOf("stopped")).toEqual({ kind: "listed", state: "stopped" });
    expect(stateOf("forgotten")).toEqual({ kind: "unlisted" });
    expect(server.claudeCalls().slice(callsBefore)).toEqual([
      { argv: ["agents", "--json", "--all"], cwd: openDoughFolder(server) },
    ]);
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
});
