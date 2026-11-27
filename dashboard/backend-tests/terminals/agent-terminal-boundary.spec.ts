// Real WebSocket upgrades exercise agentTerminals.ts at the boundary server,
// with fake-claude recording native attach calls. Same-origin recorded
// sessions pass output, input and size; socket close ends attachment while
// keeping the session (server close: agent-terminal-close.spec.ts; done marks:
// agent-terminal-reopen.spec.ts). Which upgrades attach at all:
// agent-terminal-admission.spec.ts.

import { expect, test } from "../../test-support/support/pageTest.ts";
import {
  openDoughFolder,
  recordsOf,
} from "../../test-support/agentLaunchBoundary.ts";
import {
  lastAttachEnded,
  composeSession,
  openTerminal,
  shows,
  type RecordedSession,
} from "../../test-support/agentTerminalBoundary.ts";
import {
  startDashboardServer,
  type DashboardServer,
} from "../../test-support/support/dashboardServer.ts";

function attachCalls(server: DashboardServer) {
  return server.claudeCalls().filter((call) => call.argv[0] === "attach");
}
test.describe(`agent terminal boundary`, () => {
  test.describe.configure({ mode: "serial" });
  let server: DashboardServer;
  let session: RecordedSession;

  test.beforeAll(async () => {
    server = await startDashboardServer({
      mode: "boundary",
      projectFolders: ["open-dough"],
    });
    session = await composeSession(server);
  });

  test.afterAll(async () => {
    await server.close();
  });

  test("attaches a same-origin socket to the recorded session and passes output, input, and size", async () => {
    const terminal = await openTerminal(server, session);

    expect(await shows(terminal, `attached ${session.shortId} 80x24`)).toBe(
      true,
    );
    expect(attachCalls(server)).toEqual([
      { argv: ["attach", session.shortId], cwd: openDoughFolder(server) },
    ]);

    terminal.send({ input: "hello" });
    terminal.send({ input: "\r" });
    expect(await shows(terminal, "echo hello")).toBe(true);

    terminal.send({ resize: { cols: 120, rows: 40 } });
    expect(await shows(terminal, "resized 120x40")).toBe(true);

    terminal.socket.close();
    expect(await lastAttachEnded(server)).toBe("SIGHUP");
    expect(await recordsOf(server, "open-dough")).toMatchObject([
      {
        session: { sessionId: session.sessionId },
        sessionState: { kind: "available" },
      },
    ]);
    expect(server.claudeLaunchCalls()).toEqual([]);
  });

  for (const refused of [
    { message: "plain text", sent: "hello" },
    { message: "a command", sent: { command: "ls" } },
    { message: "input that is not text", sent: { input: 7 } },
    {
      message: "an oversized resize",
      sent: { resize: { cols: 5_000, rows: 40 } },
    },
    { message: "binary data", sent: Buffer.from("hello\r") },
  ]) {
    test(`closes the socket on ${refused.message} and ends its attach process`, async () => {
      const terminal = await openTerminal(server, session);
      expect(await shows(terminal, "attached")).toBe(true);

      if (Buffer.isBuffer(refused.sent)) {
        terminal.socket.send(refused.sent, { binary: true });
      } else {
        terminal.send(refused.sent);
      }

      expect(await terminal.closed).toBe(1008);
      expect(await lastAttachEnded(server)).toBe("SIGHUP");
      expect(terminal.output()).not.toContain("echo");
    });
  }
});
