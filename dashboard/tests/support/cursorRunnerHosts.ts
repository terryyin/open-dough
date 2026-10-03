// Closing the dashboard hangs up Claude Code and Codex attachment clients.
// The Cursor client stays with the runner.
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "./pageTest.ts";
import { launch, refinementRequest } from "../agentLaunchBoundary.ts";
import {
  lastAttachEnded,
  launched,
  openTerminal,
  shows,
} from "../agentTerminalBoundary.ts";
import { codexSkill } from "./codexLaunch.ts";
import {
  codexAttaches,
  expectCodexHungUp,
  openCodexTerminal,
} from "./codexTerminal.ts";
import { startDashboardServer } from "./dashboardServer.ts";
import { installFakeCursor } from "./fakeCursor.ts";
import { stayedUp } from "./keptCursorTurn.ts";
import { instruction } from "./cursorRunnerJourney.ts";
import { stopCursorRunner } from "../../server/hosts/cursor/runnerClient.ts";

export async function serverCloseLeavesCursorAndHangsUpOtherHosts(): Promise<void> {
  test.setTimeout(180_000);
  const cursor = installFakeCursor({ working: true });
  const machine = path.join(
    tmpdir(),
    `dough-cursor-hosts-${process.pid.toString(36)}`,
  );
  mkdirSync(machine);
  // Codex terminal evidence lives in the server's own temp directory, which
  // close removes. This journey reads the hangup after that close, so the
  // record is kept in the machine directory that outlives the server.
  const codexTerminal = path.join(machine, "codex-terminal");
  mkdirSync(codexTerminal);
  writeFileSync(
    path.join(codexTerminal, "control.json"),
    JSON.stringify({ mode: "ready" }),
  );
  const server = await startDashboardServer({
    mode: "dev",
    machine,
    projectFolders: ["open-dough"],
    codex: true,
    pathPrefix: [cursor.binDir],
    extraEnv: { ...cursor.env, FAKE_CODEX_TERMINAL_ROOT: codexTerminal },
  });
  server.codex.env["FAKE_CODEX_TERMINAL_ROOT"] = codexTerminal;
  try {
    codexSkill(server.home);
    const cursorLaunch = await launch(server, {
      source: "open-dough",
      workflow: "ad-hoc",
      host: "cursor",
      instruction,
    });
    expect(cursorLaunch.status).toBe(200);
    const cursorPid = cursor.attaches()[0]?.pid ?? 0;
    const claude = await launched(server);
    const claudeTerminal = await openTerminal(server, claude);
    expect(await shows(claudeTerminal, "attached")).toBe(true);
    const codexLaunch = await launch(server, {
      ...refinementRequest,
      host: "codex",
    });
    expect(JSON.parse(codexLaunch.body)).toMatchObject({ kind: "launched" });
    const codexSession = await openCodexTerminal(server, server.codex.threadId);
    expect(await shows(codexSession, "original retained history")).toBe(true);
    const codexPid = codexAttaches(server.codex)[0]?.pid ?? 0;

    await server.close();
    await stayedUp(cursor, cursorPid, 500);
    expect(await lastAttachEnded(server)).toBe("SIGHUP");
    await expectCodexHungUp(server.codex, codexPid);
  } finally {
    await server.close();
    await stopCursorRunner(server.home);
    cursor.cleanup();
    rmSync(machine, { recursive: true, force: true });
  }
}
