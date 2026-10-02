// closeServer alone (not OS process-group shutdown) detaches the native client.
import { mkdtempSync, rmSync } from "node:fs";
import http from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { agentLaunchPlugin } from "../server/agentLaunchPlugin.ts";
import { launch, refinementRequest } from "./agentLaunchBoundary.ts";
import { shows, type Terminal } from "./agentTerminalBoundary.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { installFakeClaude } from "./support/fakeClaude.ts";
import { installFakeCodex } from "./support/fakeCodex.ts";
import {
  codexAttaches,
  expectCodexHungUp,
  openCodexTerminal,
} from "./support/codexTerminal.ts";
import { codexSkill } from "./support/codexLaunch.ts";
import { withRestoredEnv } from "./support/testEnv.ts";
import { configureDevelopmentProjects } from "./support/projectConfiguration.ts";

type StoredHandler = (
  req: http.IncomingMessage,
  res: http.ServerResponse,
  next: () => void,
) => void;
test("closeServer closes an admitted Codex socket and its PTY while the HTTP server/native protocol remain alive", async () => {
  const tempRoot = mkdtempSync(path.join(tmpdir(), "dough-codex-close-"));
  const claude = installFakeClaude(
    tempRoot,
    { binDir: tempRoot, path: process.env["PATH"] ?? "" },
    { projectFolders: ["open-dough"] },
  );
  const native = await installFakeCodex(
    tempRoot,
    claude.env["PATH"] ?? "",
    true,
  );
  codexSkill(claude.controls.home);
  configureDevelopmentProjects(claude.controls.home);
  const restore = withRestoredEnv({ ...claude.env, ...native.env });
  let handler: StoredHandler | undefined;
  const middlewares = {
    use(fn: StoredHandler) {
      handler = fn;
    },
  };
  const server = http.createServer((req, res) =>
    handler?.(req, res, () => {
      res.writeHead(404);
      res.end();
    }),
  );
  const plugin = agentLaunchPlugin();
  const configure = plugin.configureServer as unknown as (value: {
    middlewares: typeof middlewares;
    httpServer: http.Server;
  }) => void;
  const close = plugin.closeServer as unknown as () => void;
  configure({ middlewares, httpServer: server });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const url = `http://127.0.0.1:${String((server.address() as AddressInfo).port)}`;
  const local = {
    baseURL: url,
    origin: url,
    ...claude.controls,
  } as unknown as DashboardServer;
  let terminal: Terminal | undefined;
  try {
    expect(
      JSON.parse(
        (await launch(local, { ...refinementRequest, host: "codex" })).body,
      ),
    ).toMatchObject({ kind: "launched" });
    terminal = await openCodexTerminal(local, native.threadId);
    expect(await shows(terminal, "original retained history")).toBe(true);
    const pid = codexAttaches(native)[0]?.pid ?? 0;
    close();
    expect(await terminal.closed).toBe(1006);
    await expectCodexHungUp(native, pid);
    expect(server.listening).toBe(true);
    expect(
      native.calls.filter((call) => call.method === "turn/interrupt"),
    ).toHaveLength(0);
    await expect.poll(() => native.sockets.size).toBe(0);
  } finally {
    terminal?.socket.terminate();
    close();
    server.closeAllConnections();
    await new Promise<void>((resolve) =>
      server.close(() => {
        resolve();
      }),
    );
    await native.close();
    restore();
    rmSync(tempRoot, { recursive: true, force: true });
  }
});
