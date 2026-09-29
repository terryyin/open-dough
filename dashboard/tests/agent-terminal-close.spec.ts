// The terminal boundary (../server/agentTerminals.ts) when its server closes,
// in dev and preview: every open attach process ends with the SIGHUP a closed
// terminal sends, end to end and through the plugin's own `closeServer` hook
// alone, and its socket closes as a lost connection. An attach process that
// exits on its own instead closes its socket with the code that says the
// terminal ended. The synthetic `claude` (./fixtures/fake-claude) stands in
// for the attached session; the real one is never reached.

import { mkdtempSync, rmSync } from "node:fs";
import http from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { agentLaunchPlugin } from "../server/agentLaunchPlugin.ts";
import { terminalEndedCode } from "../src/agentTerminal.ts";
import {
  lastAttachEnded,
  launched,
  openTerminal,
  shows,
  type Terminal,
} from "./agentTerminalBoundary.ts";
import {
  builtDashboardDir,
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import { installFakeClaude } from "./support/fakeClaude.ts";
import { processRunning } from "./support/processGroup.ts";
import { withRestoredEnv } from "./support/testEnv.ts";

// What the plugin's `configureServer` hook calls `.use(handler)` with.
type StoredHandler = (
  req: http.IncomingMessage,
  res: http.ServerResponse,
  next: () => void,
) => void;

for (const mode of ["dev", "preview"] as const) {
  const prebuilt = mode === "preview" ? builtDashboardDir : undefined;

  test.describe(`agent terminal boundary on server close (${mode} launch mode)`, () => {
    let machine: string;

    test.beforeAll(() => {
      machine = mkdtempSync(path.join(tmpdir(), "dough-terminal-machine-"));
    });

    test.afterAll(() => {
      rmSync(machine, { recursive: true, force: true });
    });

    // End to end; a closing server's PTYs also hang up their processes, so
    // the plugin's own close hook is isolated in the test below.
    test("closing the server ends its open attach processes", async () => {
      const server = await startDashboardServer({
        mode,
        prebuilt,
        machine,
        projectFolders: ["open-dough"],
      });
      let closed = false;
      try {
        const session = await launched(server);
        const terminal = await openTerminal(server, session);
        expect(await shows(terminal, "attached")).toBe(true);
        const [attach] = server.claudeAttaches();
        expect(processRunning(attach?.pid)).toBe(true);

        await server.close();
        closed = true;

        expect(await terminal.closed).not.toBe(terminalEndedCode);
        expect(await lastAttachEnded(server)).toBe("SIGHUP");
      } finally {
        if (!closed) {
          await server.close();
        }
      }
    });

    test("an attach process that exits on its own closes its socket as ended", async () => {
      const server = await startDashboardServer({
        mode,
        prebuilt,
        projectFolders: ["open-dough"],
      });
      try {
        const session = await launched(server);
        const terminal = await openTerminal(server, session);
        expect(await shows(terminal, "attached")).toBe(true);

        // Ctrl+Z, which detaches the real CLI.
        terminal.send({ input: "\u001a" });

        expect(await terminal.closed).toBe(terminalEndedCode);
        expect(await lastAttachEnded(server)).toBe("Ctrl+Z");
      } finally {
        await server.close();
      }
    });
  });
}

test.describe("agent terminal boundary: closeServer hook wiring", () => {
  // As ./authenticated-read-plugin-hooks.spec.ts does for `gh`: the plugin's
  // hooks are called directly on a plain `http.Server` this test owns and
  // never closes, and the socket stays open, so `closeServer` alone is the
  // only possible cause of the attach process ending.
  test("closeServer, called alone with the socket and HTTP server still open, ends the attach process", async () => {
    const tempRoot = mkdtempSync(path.join(tmpdir(), "dough-terminal-hook-"));
    const claude = installFakeClaude(
      tempRoot,
      { binDir: tempRoot, path: process.env["PATH"] ?? "" },
      { projectFolders: ["open-dough"] },
    );
    const restoreEnv = withRestoredEnv(claude.env);

    let handler: StoredHandler | undefined;
    const middlewares = {
      use(fn: StoredHandler) {
        handler = fn;
      },
    };
    const rawServer = http.createServer((req, res) => {
      handler?.(req, res, () => {
        res.writeHead(404);
        res.end();
      });
    });
    const plugin = agentLaunchPlugin();
    const configureServer = plugin.configureServer as unknown as (server: {
      middlewares: typeof middlewares;
      httpServer: http.Server;
    }) => void;
    const closeServer = plugin.closeServer as unknown as () => void;
    configureServer({ middlewares, httpServer: rawServer });
    await new Promise<void>((resolve) => {
      rawServer.listen(0, "127.0.0.1", resolve);
    });
    const { port } = rawServer.address() as AddressInfo;
    const local = {
      baseURL: `http://127.0.0.1:${String(port)}`,
      origin: `http://127.0.0.1:${String(port)}`,
      ...claude.controls,
    } as unknown as DashboardServer;

    let terminal: Terminal | undefined;
    try {
      const session = await launched(local);
      terminal = await openTerminal(local, session);
      expect(await shows(terminal, "attached")).toBe(true);

      closeServer();

      expect(await lastAttachEnded(local)).toBe("SIGHUP");
    } finally {
      terminal?.socket.terminate();
      rawServer.closeAllConnections();
      await new Promise<void>((resolve) => {
        rawServer.close(() => {
          resolve();
        });
      });
      restoreEnv();
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });
});
