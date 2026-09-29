// The terminal boundary (../server/agentTerminals.ts, admitted by
// ../server/agentLaunchAdmission.ts) over a raw WebSocket, in dev and preview:
// a same-origin socket for a session this dashboard launched and Claude Code
// still lists runs `claude attach <short id>` in the project folder, passes
// output, input, and size, and ends that attach process when the socket
// closes, while the session stays listed (server close:
// ./agent-terminal-close.spec.ts; a session marked done:
// ./agent-terminal-reopen.spec.ts). Any other upgrade is refused with an HTTP
// status and no attach. The foreign-Host refusal is proved here: Vite's own
// host check answers such an HTTP request first, so only this upgrade reaches
// the shared check's Host test (../server/localOrigin.ts). Which other
// origins the check refuses is ./agent-launch-refusal.spec.ts and
// ./authenticated-read-refusal.spec.ts; one cross-site upgrade here proves the
// check guards this boundary. The synthetic `claude` (./fixtures/fake-claude)
// stands in for the attached session and records every call; the real one is
// never reached.

import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import WebSocket from "ws";
import { openDoughFolder, recordsOf } from "./agentLaunchBoundary.ts";
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

function attachCalls(server: DashboardServer) {
  return server.claudeCalls().filter((call) => call.argv[0] === "attach");
}

for (const mode of ["dev", "preview"] as const) {
  const prebuilt = mode === "preview" ? builtDashboardDir : undefined;

  test.describe(`agent terminal boundary (${mode} launch mode)`, () => {
    test.describe.configure({ mode: "serial" });
    let server: DashboardServer;
    let session: LaunchedSession;

    test.beforeAll(async () => {
      server = await startDashboardServer({
        mode,
        prebuilt,
        projectFolders: ["open-dough", "pygardon"],
      });
      session = await launched(server);
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
          sessionState: { kind: "listed" },
        },
      ]);
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
      const stopped = await launched(server);
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
      const forgotten = await launched(server);
      server.claudeSessionBecomes(forgotten.sessionId, "forgotten");
      const attachesBefore = attachCalls(server).length;

      const status = await refusedStatus(
        terminalUrl(server, "open-dough", forgotten.sessionId),
        { origin: server.origin },
      );

      expect(status).toBe(410);
      expect(attachCalls(server)).toHaveLength(attachesBefore);
    });

    if (mode === "dev") {
      test("leaves Vite's own HMR socket working", async () => {
        // Without an Origin, Vite's HMR asks for no page token.
        const hmr = new WebSocket(
          server.baseURL.replace(/^http/, "ws"),
          "vite-hmr",
        );
        try {
          const first = await new Promise<string>((resolve, reject) => {
            hmr.once("message", (data: Buffer) => {
              resolve(data.toString("utf8"));
            });
            hmr.once("error", reject);
          });
          expect(JSON.parse(first)).toMatchObject({ type: "connected" });
        } finally {
          hmr.close();
        }
      });
    }

    test("refuses an upgrade whose project folder is gone, before running claude", async () => {
      const elsewhere = await launched(server, "pygardon");
      const folder = path.join(server.home, "git", "pygardon");
      rmSync(folder, { recursive: true });
      try {
        const callsBefore = server.claudeCalls().length;
        const status = await refusedStatus(
          terminalUrl(server, "pygardon", elsewhere.sessionId),
          { origin: server.origin },
        );

        expect(status).toBe(404);
        expect(server.claudeCalls()).toHaveLength(callsBefore);
      } finally {
        mkdirSync(folder);
      }
    });
  });
}
