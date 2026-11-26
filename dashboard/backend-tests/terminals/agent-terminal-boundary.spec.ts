// Real WebSocket upgrades exercise agentTerminals.ts and agentLaunchAdmission.ts
// at the boundary server, with fake-claude recording native attach calls.
// Same-origin recorded sessions pass output, input and size; socket close ends
// attachment while keeping the session (server close: agent-terminal-close.spec.ts;
// done marks: agent-terminal-reopen.spec.ts). Refusals never attach.
// A foreign Host on an upgrade reaches localOrigin.ts, which no Vite host check
// precedes here; the dev server's own HMR socket beside this guard is
// ../runtime/serving-modes.spec.ts.
// Other origin variations: agent-launch-refusal.spec.ts and
// authenticated-read-refusal.spec.ts; this suite proves their shared upgrade guard.

import { expect, test } from "../../test-support/support/pageTest.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { keepMoreLaunchRecordsBesideServer } from "../../test-support/support/launchStore.ts";
import {
  openDoughFolder,
  recordsOf,
} from "../../test-support/agentLaunchBoundary.ts";
import {
  lastAttachEnded,
  composeSession,
  openTerminal,
  refusedResponse,
  refusedStatus,
  shows,
  terminalUrl,
  withoutProjectFolder,
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
      projectFolders: ["open-dough", "pygardon"],
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

  test("attaches to a stopped session Claude Code still lists", async () => {
    const stopped = await composeSession(server);
    server.claudeSessionBecomes(stopped.sessionId, "stopped");
    const terminal = await openTerminal(server, stopped);

    expect(await shows(terminal, `attached ${stopped.shortId}`)).toBe(true);
    terminal.socket.close();
    expect(await lastAttachEnded(server)).toBe("SIGHUP");
  });

  test("attaches while Claude Code's listing cannot be read, as the page's open action allows", async () => {
    server.claudeListingFails(true);
    try {
      const terminal = await openTerminal(server, session);

      expect(await shows(terminal, `attached ${session.shortId}`)).toBe(true);
      terminal.socket.close();
      expect(await lastAttachEnded(server)).toBe("SIGHUP");
    } finally {
      server.claudeListingFails(false);
    }
  });

  test("a saved completed automatic feedback run cannot open a terminal by its exact old URL", async () => {
    const title = "Historical feedback maintenance";
    const sessionId = server.claudeListsSession({
      name: title,
      cwd: openDoughFolder(server),
      startedAt: Date.now(),
    });
    const saved = makeMe.aLaunchRecord
      .adHoc({ title, maintenance: { due: "2026-11-19" } })
      .inClaudeSession({ sessionId })
      .markedDone()
      .please();
    await keepMoreLaunchRecordsBesideServer(server, [saved]);
    const callsBefore = server.claudeCalls().length;
    expect(
      await refusedStatus(terminalUrl(server, "open-dough", sessionId), {
        origin: server.origin,
      }),
    ).toBe(404);
    expect(server.claudeCalls()).toHaveLength(callsBefore);
  });

  const sameOrigin = () => ({ origin: server.origin });
  for (const refused of [
    {
      upgrade: "from another site",
      status: 403,
      options: () => ({ origin: "http://evil.example" }),
    },
    {
      upgrade: "naming a foreign Host",
      status: 403,
      options: () => ({
        origin: "http://evil.example",
        headers: { Host: "evil.example" },
      }),
    },
    {
      upgrade: "for an unknown project",
      status: 404,
      source: "not-a-real-project",
      options: sameOrigin,
    },
    {
      upgrade: "for a session this dashboard did not launch",
      status: 404,
      sessionId: () => "00000000-0000-4000-8000-000000000000",
      options: sameOrigin,
    },
    {
      upgrade: "naming no session",
      status: 404,
      sessionId: () => undefined,
      options: sameOrigin,
    },
    {
      upgrade: "for another project's session",
      status: 404,
      source: "pygardon",
      options: sameOrigin,
    },
  ]) {
    test(`refuses an upgrade ${refused.upgrade} before running claude`, async () => {
      const callsBefore = server.claudeCalls().length;
      const status = await refusedStatus(
        terminalUrl(
          server,
          refused.source ?? "open-dough",
          refused.sessionId === undefined
            ? session.sessionId
            : refused.sessionId(),
        ),
        refused.options(),
      );

      expect(status).toBe(refused.status);
      expect(server.claudeCalls()).toHaveLength(callsBefore);
    });
  }

  test("refuses an upgrade for a session Claude Code no longer lists, without attaching", async () => {
    const forgotten = await composeSession(server);
    server.claudeSessionBecomes(forgotten.sessionId, "forgotten");
    const attachesBefore = attachCalls(server).length;

    const response = await refusedResponse(
      terminalUrl(server, "open-dough", forgotten.sessionId),
      { origin: server.origin },
    );

    expect(response.status).toBe(410);
    expect(JSON.parse(response.body)).toEqual({
      error: "Claude Code no longer lists this session.",
    });
    expect(attachCalls(server)).toHaveLength(attachesBefore);
  });

  test("refuses an upgrade whose execution checkout is gone, before running claude", async () => {
    const elsewhere = await composeSession(server, "pygardon");
    const callsBefore = server.claudeCalls().length;

    const status = await withoutProjectFolder(server, "pygardon", () =>
      refusedStatus(terminalUrl(server, "pygardon", elsewhere.sessionId), {
        origin: server.origin,
      }),
    );

    expect(status).toBe(404);
    expect(server.claudeCalls()).toHaveLength(callsBefore);
  });
});
