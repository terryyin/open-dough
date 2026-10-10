// The terminal boundary (../server/agentTerminals.ts) when its server closes:
// the plugin's own `closeServer` hook ends every open attach process with the
// SIGHUP a closed terminal sends. End to end, a closing server's PTYs hang up
// their processes anyway, so the hook is called alone here. How the page shows
// a lost connection or an ended terminal is ./agent-terminal-lifetime.spec.ts.
// The synthetic `claude` (./fixtures/fake-claude) stands in for the attached
// session; the real one is never reached.

import { mkdtempSync, rmSync } from "node:fs";
import http from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "./support/pageTest.ts";
import { agentLaunchPlugin } from "../server/agentLaunchPlugin.ts";
import {
  ensureCursorRunner,
  stopCursorRunner,
} from "../server/hosts/cursor/runnerClient.ts";
import {
  lastAttachEnded,
  launched,
  openTerminal,
  shows,
  type Terminal,
} from "./agentTerminalBoundary.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { installFakeClaude } from "./support/fakeClaude.ts";
import { withRestoredEnv } from "./support/testEnv.ts";
import { configureDevelopmentProjects } from "./support/projectConfiguration.ts";

// What the plugin's `configureServer` hook calls `.use(handler)` with.
type StoredHandler = (
  req: http.IncomingMessage,
  res: http.ServerResponse,
  next: () => void,
) => void;

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
    configureDevelopmentProjects(claude.controls.home);
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
      // The plugin started this HOME's Cursor runner, which outlives it; once
      // that start settles, the runner is stopped before its directory goes.
      await ensureCursorRunner(claude.controls.home);
      await stopCursorRunner(claude.controls.home);
      restoreEnv();
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });
});
