// Reopening a session marked done at the terminal boundary
// (../server/agentTerminals.ts, admitted by ../server/agentLaunchAdmission.ts)
// over raw HTTP and a raw terminal socket: once `claude attach` starts for a
// session marked done, its record answers no done time, also after a restart.
// An upgrade refused before attaching leaves the session done. How the page
// shows the reopened session is ./agent-terminal-done.spec.ts, and how the
// boundary marks it done is ./agent-launch-done.spec.ts. The machine directory
// holds HOME and the synthetic `claude`'s (./fixtures/fake-claude) state; the
// real one is never reached.

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { markDone, recordsOf } from "./agentLaunchBoundary.ts";
import { closeOpenSessions } from "./openStorySessionSetup.ts";
import {
  lastAttachEnded,
  launched,
  openTerminal,
  refusedStatus,
  shows,
  terminalUrl,
  type LaunchedSession,
} from "./agentTerminalBoundary.ts";
import {
  builtDashboardDir,
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";

// The project's kept record of the session, as the launch boundary answers it.
async function recordOf(server: DashboardServer, session: LaunchedSession) {
  const records = (await recordsOf(server, "open-dough")) as {
    session: { sessionId: string };
    doneAt?: string;
  }[];
  return records.find(
    (record) => record.session.sessionId === session.sessionId,
  );
}

// Marks the session done through the launch boundary, answering its done time.
async function markedDone(
  server: DashboardServer,
  session: LaunchedSession,
): Promise<string> {
  const response = await markDone(server, {
    source: "open-dough",
    session: session.sessionId,
  });
  expect(response.status).toBe(200);
  return (JSON.parse(response.body) as { record: { doneAt: string } }).record
    .doneAt;
}

test.describe("reopening a session marked done through its terminal", () => {
  test.describe.configure({ mode: "serial" });
  let machine: string;
  let server: DashboardServer;

  const startServer = () =>
    startDashboardServer({
      mode: "preview",
      prebuilt: builtDashboardDir,
      machine,
      projectFolders: ["open-dough"],
    });

  test.beforeAll(async () => {
    machine = mkdtempSync(path.join(tmpdir(), "dough-reopen-"));
    server = await startServer();
  });

  test.afterAll(async () => {
    await server.close();
    rmSync(machine, { recursive: true, force: true });
  });

  test("reopens a session marked done once its attach starts, and keeps it reopened across a restart", async () => {
    const done = await launched(server);
    await markedDone(server, done);
    expect(await recordOf(server, done)).toHaveProperty("doneAt");

    const terminal = await openTerminal(server, done);

    expect(await shows(terminal, `attached ${done.shortId}`)).toBe(true);
    const reopened = await recordOf(server, done);
    expect(reopened).toMatchObject({
      session: { sessionId: done.sessionId },
      sessionState: { kind: "available" },
    });
    expect(reopened).not.toHaveProperty("doneAt");
    terminal.socket.close();
    expect(await lastAttachEnded(server)).toBe("SIGHUP");

    await server.close();
    server = await startServer();
    expect(await recordOf(server, done)).toMatchObject({
      session: { sessionId: done.sessionId },
    });
    expect(await recordOf(server, done)).not.toHaveProperty("doneAt");
  });

  test("keeps a done session Claude Code no longer lists done when its upgrade is refused", async () => {
    await closeOpenSessions(server);
    const forgotten = await launched(server);
    const doneAt = await markedDone(server, forgotten);
    server.claudeSessionBecomes(forgotten.sessionId, "forgotten");

    const status = await refusedStatus(
      terminalUrl(server, "open-dough", forgotten.sessionId),
      { origin: server.origin },
    );

    expect(status).toBe(410);
    expect(await recordOf(server, forgotten)).toMatchObject({ doneAt });
  });
});
