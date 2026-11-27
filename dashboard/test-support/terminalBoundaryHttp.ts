// The launch boundary mounted on a plain HTTP server for terminal specs, with
// fake-claude on PATH and the given catalog projects configured in its HOME,
// plus fake-codex for Codex attaches. `closeBoundary` is Vite's close hook
// alone, leaving HTTP and sockets open.

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  ensureCursorRunner,
  stopCursorRunner,
} from "../server/hosts/cursor/runnerClient.ts";
import { installAgentLaunchMiddleware } from "../server/launchBoundary.ts";
import type { TerminalServer } from "./agentTerminalBoundary.ts";
import { prepareCatalogProjects } from "./support/catalogProjectOrigin.ts";
import { installFakeClaude } from "./support/fakeClaude.ts";
import { type FakeCodex, installFakeCodex } from "./support/fakeCodex.ts";
import { startInProcessBoundaryHttp } from "./support/inProcessBoundaryHttp.ts";
import { configureDevelopmentProjects } from "./support/projectConfiguration.ts";
import { withRestoredEnv } from "./support/testEnv.ts";

export async function startClaudeTerminalBoundary(
  projects: readonly string[],
): Promise<{
  readonly server: TerminalServer;
  readonly closeBoundary: () => Promise<void>;
  readonly stop: () => Promise<void>;
}> {
  const tempRoot = mkdtempSync(path.join(tmpdir(), "dough-terminal-"));
  const claude = installFakeClaude(
    tempRoot,
    { binDir: tempRoot, path: process.env["PATH"] ?? "" },
    {},
  );
  await prepareCatalogProjects(claude.controls.home, [...projects]);
  configureDevelopmentProjects(claude.controls.home);
  const restoreEnv = withRestoredEnv(claude.env);
  const boundary = await startInProcessBoundaryHttp({
    name: "dough-agent-launch",
    install: installAgentLaunchMiddleware,
  });
  const server = {
    baseURL: boundary.origin,
    origin: boundary.origin,
    ...claude.controls,
  };
  return {
    server,
    closeBoundary: boundary.closeBoundary,
    stop: async () => {
      await boundary.closeHttp();
      await boundary.closeBoundary();
      // The boundary started this HOME's Cursor runner, which outlives it.
      await ensureCursorRunner(server.home);
      await stopCursorRunner(server.home);
      restoreEnv();
      // A closed PTY's process may still be writing its last files there.
      rmSync(tempRoot, {
        recursive: true,
        force: true,
        maxRetries: 5,
        retryDelay: 100,
      });
    },
  };
}

// The same boundary with fake-codex serving the native protocol from its own
// temp root, wired into the environment until `stop`.
export async function startCodexTerminalBoundary(
  projects: readonly string[],
): Promise<{
  readonly server: TerminalServer;
  readonly native: FakeCodex;
  readonly closeBoundary: () => Promise<void>;
  readonly stop: () => Promise<void>;
}> {
  const boundary = await startClaudeTerminalBoundary(projects);
  const codexRoot = mkdtempSync(path.join(tmpdir(), "dough-codex-"));
  const native = await installFakeCodex(
    codexRoot,
    process.env["PATH"] ?? "",
    true,
  );
  const restoreEnv = withRestoredEnv(native.env);
  return {
    ...boundary,
    native,
    stop: async () => {
      restoreEnv();
      await native.close();
      await boundary.stop();
      // A closed PTY's process may still be writing its last files there.
      rmSync(codexRoot, {
        recursive: true,
        force: true,
        maxRetries: 5,
        retryDelay: 100,
      });
    },
  };
}
