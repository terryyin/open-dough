// The runner's lifetime on one machine: a new resume after the runner is
// stopped.
import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect } from "./pageTest.ts";
import { launch } from "../agentLaunchBoundary.ts";
import { openCursorTerminal } from "./cursorTerminal.ts";
import { installFakeCursor } from "./fakeCursor.ts";
import { keptCursor, startCursorDashboard } from "./keptCursorTurn.ts";
import { developmentBoundary } from "./dashboardServer.ts";
import { instruction } from "./cursorRunnerJourney.ts";
import { processRunning } from "./processGroup.ts";
import { stopCursorRunner } from "../../server/hosts/cursor/runnerClient.ts";
import { readCursorRunnerAddress } from "../../server/hosts/cursor/runnerPaths.ts";

export async function stoppingRunnerResumesOnNextOpen(): Promise<void> {
  const cursor = installFakeCursor({ working: true });
  const machine = path.join(
    tmpdir(),
    `dough-cursor-stop-${process.pid.toString(36)}`,
  );
  mkdirSync(machine);
  const server = await startCursorDashboard(
    developmentBoundary,
    cursor,
    machine,
  );
  try {
    expect(
      (
        await launch(server, {
          source: "open-dough",
          workflow: "ad-hoc",
          host: "cursor",
          instruction,
        })
      ).status,
    ).toBe(200);
    const sessionId = keptCursor(server.home).session.sessionId;
    const pid = cursor.attaches()[0]?.pid ?? 0;
    await stopCursorRunner(server.home);
    await expect.poll(() => cursor.signals(pid)).toContain("SIGHUP");
    await expect.poll(() => processRunning(pid)).toBe(false);
    expect(
      cursor.attaches().filter((attach) => processRunning(attach.pid)),
    ).toEqual([]);
    expect(readCursorRunnerAddress(server.home)).toBeUndefined();
    const terminal = await openCursorTerminal(server, sessionId);
    await expect.poll(() => cursor.attaches()).toHaveLength(2);
    const resumed = cursor.attaches()[1]?.pid ?? 0;
    expect(resumed).not.toBe(pid);
    expect(processRunning(resumed)).toBe(true);
    await expect.poll(() => terminal.output()).toContain("ctrl+c to stop");
    expect(cursor.calls().map((call) => call.args)).toEqual([["create-chat"]]);
  } finally {
    await server.close();
    await stopCursorRunner(path.join(machine, "home"));
    cursor.cleanup();
    rmSync(machine, { recursive: true, force: true });
  }
}
