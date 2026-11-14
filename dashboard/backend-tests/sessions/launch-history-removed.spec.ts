// Explicit removal of a session the host no longer lists hides it and retires
// host-local state as before, and history holds one `removed` entry; when
// history cannot accept that move, deletion fails and the record stays.
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "../../tests/support/pageTest.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  deleteRecord,
  identity,
  recordsOf,
  title,
} from "../../tests/agentLaunchBoundary.ts";
import { launched } from "../../tests/agentTerminalBoundary.ts";
import {
  startDashboardServer,
  type DashboardServer,
} from "../../tests/support/dashboardServer.ts";
import { machineHome } from "../../tests/machineLaunchRecords.ts";
import {
  keepLaunchStore,
  keptLaunchRecords,
} from "../../tests/support/launchStore.ts";
import {
  launchHistoryDirectory,
  readLaunchHistory,
} from "../../server/launchHistory.ts";

const launchWaitMs = 4_000;

test.describe("removed sessions remain in launch history", () => {
  let machine: string;
  const servers: DashboardServer[] = [];

  async function serverOn(): Promise<DashboardServer> {
    const server = await startDashboardServer({
      mode: "boundary",
      environment: "production",
      machine,
      projectFolders: ["open-dough"],
      launchTimeoutMs: launchWaitMs,
    });
    servers.push(server);
    return server;
  }

  test.beforeEach(() => {
    machine = mkdtempSync(path.join(tmpdir(), "dough-launch-history-remove-"));
  });

  test.afterEach(async () => {
    await Promise.all(servers.splice(0).map((server) => server.close()));
    rmSync(machine, { recursive: true, force: true });
  });

  test("moves a removed session into history once, hides it, and retires its Cursor scope", async () => {
    const home = machineHome(machine);
    const sharedConfigDir = path.join(machine, "shared-cursor-config");
    mkdirSync(path.join(sharedConfigDir, "chats"), { recursive: true });
    const sharedConfig = `${JSON.stringify(makeMe.aCursorCliConfig.please())}\n`;
    writeFileSync(path.join(sharedConfigDir, "cli-config.json"), sharedConfig);
    const savedConversation = path.join(
      sharedConfigDir,
      "chats",
      "saved-conversation.txt",
    );
    writeFileSync(savedConversation, "saved conversation\n");

    const scopesHome = path.join(
      home,
      ".open-dough",
      "dashboard",
      "cursor-session-scopes",
    );
    const scope = path.join(scopesHome, "removed-scope");
    mkdirSync(scope, { recursive: true });
    writeFileSync(
      path.join(scope, "cli-config.json"),
      `${JSON.stringify(makeMe.aCursorCliConfig.withModel("gpt-5.2").please())}\n`,
    );
    symlinkSync(
      path.join(sharedConfigDir, "chats"),
      path.join(scope, "chats"),
      "dir",
    );

    const sessionId = "a0000000-0000-4000-8000-000000000201";
    const keptId = "a0000000-0000-4000-8000-000000000202";
    const removed = makeMe.aLaunchRecord
      .executing({ identity, title })
      .inCursorSession({
        sessionId,
        continuation: { workspace: "/tmp", configScope: scope },
      })
      .please();
    const kept = makeMe.aLaunchRecord
      .executing({ identity, title })
      .inCursorSession({
        sessionId: keptId,
        continuation: {
          workspace: "/tmp",
          configScope: path.join(scopesHome, "kept-scope"),
        },
      })
      .please();
    mkdirSync(path.join(scopesHome, "kept-scope"), { recursive: true });
    keepLaunchStore(home, { "open-dough": [removed, kept] });
    expect(existsSync(scope)).toBe(true);
    expect(await readLaunchHistory(home)).toEqual([]);

    const server = await serverOn();
    const response = await deleteRecord(server, {
      source: "open-dough",
      session: sessionId,
      host: "cursor",
    });

    expect(response.status).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ kind: "deleted" });

    const answeredIds = (await recordsOf(server, "open-dough")).map(
      (each) => (each as { session: { sessionId: string } }).session.sessionId,
    );
    expect(answeredIds).toContain(keptId);
    expect(answeredIds).not.toContain(sessionId);
    expect(
      keptLaunchRecords(home).map((entry) => {
        if (!("session" in entry)) throw new Error("Expected a kept session");
        return entry.session.sessionId;
      }),
    ).toEqual([keptId]);

    expect(existsSync(scope)).toBe(false);
    expect(existsSync(path.join(scopesHome, "kept-scope"))).toBe(true);
    expect(
      readdirSync(path.join(sharedConfigDir, "chats")).includes(
        "saved-conversation.txt",
      ),
    ).toBe(true);

    const history = await readLaunchHistory(home);
    expect(history).toHaveLength(1);
    expect(history[0]).toEqual(
      expect.objectContaining({
        project: "open-dough",
        reason: "removed",
        record: removed,
        leftAt: expect.any(String),
      }),
    );
  });

  test("refuses removal when history is unwritable and keeps the record", async () => {
    const server = await serverOn();
    const session = await launched(server);
    const before = keptLaunchRecords(server);
    const home = machineHome(machine);
    const historyDir = launchHistoryDirectory(home);
    mkdirSync(historyDir, { recursive: true });
    chmodSync(historyDir, 0o500);
    server.claudeSessionBecomes(session.sessionId, "forgotten");

    try {
      const response = await deleteRecord(server, {
        source: "open-dough",
        session: session.sessionId,
      });

      expect(response.status).toBe(500);
      expect(response.headers["content-type"]).toContain("application/json");
      expect(JSON.parse(response.body)).toEqual({
        error: expect.stringContaining(
          "The session record could not be deleted",
        ),
      });
    } finally {
      chmodSync(historyDir, 0o700);
    }

    expect(keptLaunchRecords(server)).toEqual(before);
    expect(
      (await recordsOf(server, "open-dough")).map(
        (each) =>
          (each as { session: { sessionId: string } }).session.sessionId,
      ),
    ).toContain(session.sessionId);
    expect(await readLaunchHistory(home)).toEqual([]);
  });
});
