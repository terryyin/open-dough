// Launch records that leave the operational store move into append-only
// launch history under this machine's dashboard home: a session marked done
// 31 days ago leaves on the next write and stays exactly once across a later
// write and restart; one marked done 29 days ago stays listed and out of
// history; when history cannot be written, the aged-out record remains in the
// operational document (still hidden from reads) until a later write moves it.
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "../../test-support/support/pageTest.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  identity,
  markDone,
  recordsOf,
  title,
} from "../../test-support/agentLaunchBoundary.ts";
import { composeSession } from "../../test-support/agentTerminalBoundary.ts";
import {
  startDashboardServer,
  type DashboardServer,
} from "../../test-support/support/dashboardServer.ts";
import {
  daysAgo,
  machineHome,
} from "../../test-support/machineLaunchRecords.ts";
import {
  keepLaunchStore,
  keptLaunchRecords,
} from "../../test-support/support/launchStore.ts";
import {
  launchHistoryDirectory,
  readLaunchHistory,
} from "../../server/launchHistory.ts";

const execution = (sessionId: string) =>
  makeMe.aLaunchRecord
    .executing({ identity, title })
    .inClaudeSession({ sessionId });

async function markExistingSessionDone(
  server: DashboardServer,
): Promise<string> {
  const { sessionId } = await composeSession(server);
  const done = await markDone(server, {
    source: "open-dough",
    session: sessionId,
  });
  expect(done.status, done.body).toBe(200);
  return sessionId;
}

test.describe("aged-out launch records move into launch history", () => {
  let machine: string;
  const servers: DashboardServer[] = [];

  async function serverOn(): Promise<DashboardServer> {
    const server = await startDashboardServer({
      mode: "boundary",
      environment: "production",
      machine,
      projectFolders: ["open-dough"],
    });
    servers.push(server);
    return server;
  }

  test.beforeEach(() => {
    machine = mkdtempSync(path.join(tmpdir(), "dough-launch-history-"));
  });

  test.afterEach(async () => {
    await Promise.all(servers.splice(0).map((server) => server.close()));
    rmSync(machine, { recursive: true, force: true });
  });

  test("moves a 31-day done session into history once across a later write and restart, leaving the 29-day session listed", async () => {
    const recentlyDone = execution("60000000-0000-4000-8000-000000000029")
      .launchedAt(daysAgo(60))
      .markedDoneAt(daysAgo(29))
      .please();
    const longDone = execution("60000000-0000-4000-8000-000000000031")
      .launchedAt(daysAgo(60))
      .markedDoneAt(daysAgo(31))
      .please();
    keepLaunchStore(machineHome(machine), {
      "open-dough": [longDone, recentlyDone],
    });
    const home = machineHome(machine);
    expect(await readLaunchHistory(home)).toEqual([]);

    const server = await serverOn();
    expect(await recordsOf(server, "open-dough")).toEqual([
      { ...recentlyDone, sessionState: { kind: "unavailable" } },
    ]);

    const first = await markExistingSessionDone(server);

    const afterFirst = keptLaunchRecords(home);
    expect(afterFirst).toEqual([
      recentlyDone,
      expect.objectContaining({
        doneAt: expect.any(String),
        session: expect.objectContaining({ sessionId: first }),
      }),
    ]);
    expect(afterFirst).not.toContainEqual(longDone);

    const historyAfterFirst = await readLaunchHistory(home);
    expect(historyAfterFirst).toEqual([
      expect.objectContaining({
        project: "open-dough",
        reason: "aged-out",
        record: longDone,
        leftAt: expect.any(String),
      }),
    ]);
    expect(historyAfterFirst).toHaveLength(1);

    await Promise.all(servers.splice(0).map((server) => server.close()));
    const restarted = await serverOn();
    const second = await markExistingSessionDone(restarted);

    const storedIds = keptLaunchRecords(home).map((entry) => {
      if (!("session" in entry)) throw new Error("Expected a kept session");
      return entry.session.sessionId;
    });
    expect(storedIds).toContain(recentlyDone.session.sessionId);
    expect(storedIds).toContain(second);
    expect(storedIds).not.toContain(longDone.session.sessionId);

    const history = await readLaunchHistory(home);
    expect(history).toHaveLength(1);
    expect(history[0]).toEqual(
      expect.objectContaining({
        project: "open-dough",
        reason: "aged-out",
        record: longDone,
      }),
    );
    expect(
      readdirSync(launchHistoryDirectory(home)).some((name) =>
        name.endsWith(".jsonl"),
      ),
    ).toBe(true);
  });

  test("keeps an aged-out record in the operational document when history is unwritable, then moves it once after restore", async () => {
    const recentlyDone = execution("60000000-0000-4000-8000-000000000129")
      .launchedAt(daysAgo(60))
      .markedDoneAt(daysAgo(29))
      .please();
    const longDone = execution("60000000-0000-4000-8000-000000000131")
      .launchedAt(daysAgo(60))
      .markedDoneAt(daysAgo(31))
      .please();
    const home = machineHome(machine);
    keepLaunchStore(home, {
      "open-dough": [longDone, recentlyDone],
    });
    const historyDir = launchHistoryDirectory(home);
    mkdirSync(historyDir, { recursive: true });
    chmodSync(historyDir, 0o500);

    const server = await serverOn();
    try {
      expect(await recordsOf(server, "open-dough")).toEqual([
        { ...recentlyDone, sessionState: { kind: "unavailable" } },
      ]);

      const marked = await markExistingSessionDone(server);

      const stored = keptLaunchRecords(home);
      expect(stored).toEqual(
        expect.arrayContaining([
          longDone,
          recentlyDone,
          expect.objectContaining({
            doneAt: expect.any(String),
            session: expect.objectContaining({ sessionId: marked }),
          }),
        ]),
      );
      expect(await readLaunchHistory(home)).toEqual([]);
      expect(await recordsOf(server, "open-dough")).toEqual(
        expect.arrayContaining([
          { ...recentlyDone, sessionState: { kind: "unavailable" } },
          expect.objectContaining({
            doneAt: expect.any(String),
            session: expect.objectContaining({ sessionId: marked }),
          }),
        ]),
      );
      expect(await recordsOf(server, "open-dough")).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            session: expect.objectContaining({
              sessionId: longDone.session.sessionId,
            }),
          }),
        ]),
      );
    } finally {
      chmodSync(historyDir, 0o700);
    }

    await markExistingSessionDone(server);

    const storedIds = keptLaunchRecords(home).map((entry) => {
      if (!("session" in entry)) throw new Error("Expected a kept session");
      return entry.session.sessionId;
    });
    expect(storedIds).toContain(recentlyDone.session.sessionId);
    expect(storedIds).not.toContain(longDone.session.sessionId);

    const history = await readLaunchHistory(home);
    expect(history).toHaveLength(1);
    expect(history[0]).toEqual(
      expect.objectContaining({
        project: "open-dough",
        reason: "aged-out",
        record: longDone,
      }),
    );
  });
});
