// Closing the development Dashboard closes each attachment according to its
// owner. The machine-local runner owns the Cursor client, so it stays ready to
// continue a detached prompt; the Dashboard owns Claude Code and Codex
// attachment clients, so the same close hangs them up. Cases run in order:
// each sets the fake hosts' environment for its Dashboard.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { afterEach, expect, test } from "vitest";
import { readCursorRunnerAddress } from "../../server/hosts/cursor/runnerPaths.ts";
import {
  composeSession,
  lastAttachEnded,
  openTerminal,
  shows,
} from "../../test-support/agentTerminalBoundary.ts";
import { givenSavedCodexSession } from "../../test-support/support/codexObservation.ts";
import {
  codexAttaches,
  codexEndOnceGone,
  openCodexTerminal,
} from "../../test-support/support/codexTerminal.ts";
import {
  cursorDashboardMachine,
  launchedCursorClient,
  type CursorDashboardMachine,
} from "../../test-support/support/cursorDashboardMachine.ts";
import {
  developmentBoundary,
  startDashboardServer,
} from "../../test-support/support/dashboardServer.ts";
import { installFakeCursor } from "../../test-support/support/fakeCursor.ts";
import { stayedUp } from "../../test-support/support/keptCursorTurn.ts";

let machine: CursorDashboardMachine | undefined;

afterEach(async () => {
  await machine?.remove();
  machine = undefined;
});

test("the runner keeps a detached follow-up prompt while the dashboard is down", async () => {
  const cursor = installFakeCursor({ screen: "working", becomeReady: true });
  machine = cursorDashboardMachine(cursor);
  const server = await machine.startDashboard();
  const { pid } = await launchedCursorClient(server, cursor);

  await server.close();
  await stayedUp(cursor, pid, 400);
  expect(cursor.signals(pid)).not.toContain("SIGHUP");
  cursor.showReady();
  await stayedUp(cursor, pid, 500);
  expect(readCursorRunnerAddress(server.home)).toBeDefined();
}, 60_000);

test("dashboard close hangs up Claude Code and Codex and leaves the Cursor client", async () => {
  const cursor = installFakeCursor({ working: true });
  machine = cursorDashboardMachine(cursor);
  const { root } = machine;
  // Codex terminal evidence lives in the server's own temp directory, which
  // close removes. This case reads the hangup after that close, so the record
  // is kept in the machine directory that outlives the server.
  const codexTerminal = path.join(root, "codex-terminal");
  mkdirSync(codexTerminal);
  writeFileSync(
    path.join(codexTerminal, "control.json"),
    JSON.stringify({ mode: "ready" }),
  );
  const server = machine.adopt(
    await startDashboardServer({
      ...developmentBoundary,
      liveServer: "separate process",
      machine: root,
      projectFolders: ["open-dough"],
      codex: true,
      pathPrefix: [cursor.binDir],
      extraEnv: { ...cursor.env, FAKE_CODEX_TERMINAL_ROOT: codexTerminal },
    }),
  );
  server.codex.env["FAKE_CODEX_TERMINAL_ROOT"] = codexTerminal;
  const { pid: cursorPid } = await launchedCursorClient(server, cursor);
  const claudeTerminal = await openTerminal(
    server,
    await composeSession(server),
  );
  expect(await shows(claudeTerminal, "attached")).toBe(true);
  await givenSavedCodexSession(server, server.codex);
  const codexSession = await openCodexTerminal(server, server.codex.threadId);
  expect(await shows(codexSession, "original retained history")).toBe(true);
  const codexPid = codexAttaches(server.codex)[0]?.pid ?? 0;

  await server.close();
  await stayedUp(cursor, cursorPid, 500);
  expect(await lastAttachEnded(server)).toBe("SIGHUP");
  await expect
    .poll(() => codexEndOnceGone(server.codex, codexPid), { timeout: 5_000 })
    .toBe("SIGHUP");
}, 60_000);
