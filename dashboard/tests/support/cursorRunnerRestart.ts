// A Cursor client kept by the runner is still that client after the dashboard
// server is killed and started again on the same machine.
import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { launch } from "../agentLaunchBoundary.ts";
import { shows } from "../agentTerminalBoundary.ts";
import { openCursorTerminal } from "./cursorTerminal.ts";
import { installFakeCursor } from "./fakeCursor.ts";
import {
  keptCursor,
  startCursorDashboard,
  stayedUp,
} from "./keptCursorTurn.ts";
import {
  instruction,
  liveRunner,
  processGroup,
  runnersFor,
} from "./cursorRunnerJourney.ts";
import { processRunning } from "./processGroup.ts";
import { stopCursorRunner } from "../../server/hosts/cursor/runnerClient.ts";
import { readCursorRunnerAddress } from "../../server/hosts/cursor/runnerPaths.ts";

export async function restartedDashboardTypesSameClient(): Promise<void> {
  test.setTimeout(180_000);
  const cursor = installFakeCursor({ working: true });
  const machine = path.join(
    tmpdir(),
    `dough-cursor-runner-${process.pid.toString(36)}`,
  );
  mkdirSync(machine);
  let server = await startCursorDashboard("dev", cursor, machine);
  try {
    const runner = await liveRunner(server.home);
    const runnerPid = runner.pid;
    expect(processRunning(runnerPid)).toBe(true);
    expect(processGroup(runnerPid)).toBe(runnerPid);
    expect(processGroup(server.pid)).not.toBe(runnerPid);

    const launched = await launch(server, {
      source: "open-dough",
      workflow: "ad-hoc",
      host: "cursor",
      instruction,
    });
    expect(launched.status).toBe(200);
    const sessionId = keptCursor(server.home).session.sessionId;
    expect(cursor.attaches()).toHaveLength(1);
    const pid = cursor.attaches()[0]?.pid ?? 0;
    expect(processRunning(pid)).toBe(true);

    await server.close();
    expect(processRunning(server.pid)).toBe(false);
    expect(processRunning(runnerPid)).toBe(true);
    await stayedUp(cursor, pid, 400);
    expect(cursor.calls().map((call) => call.args)).toEqual([["create-chat"]]);

    server = await startCursorDashboard("dev", cursor, machine);
    expect(readCursorRunnerAddress(server.home)?.pid).toBe(runnerPid);
    expect(runnersFor(server.home)).toBe(1);
    const terminal = await openCursorTerminal(server, sessionId);
    await expect.poll(() => terminal.output()).toContain("ctrl+c to stop");
    terminal.send({ input: "after-restart" });
    await expect.poll(() => cursor.input(pid)).toContain("after-restart");
    expect(cursor.attaches()).toHaveLength(1);
    expect(cursor.attaches()[0]?.pid).toBe(pid);
    expect(cursor.calls()).toHaveLength(1);
  } finally {
    await server.close();
    await stopCursorRunner(path.join(machine, "home"));
    cursor.cleanup();
    rmSync(machine, { recursive: true, force: true });
  }
}

export async function waitingAnswerSurvivesRestart(): Promise<void> {
  test.setTimeout(180_000);
  const cursor = installFakeCursor({ screen: "waiting" });
  const machine = path.join(
    tmpdir(),
    `dough-cursor-wait-${process.pid.toString(36)}`,
  );
  mkdirSync(machine);
  let server = await startCursorDashboard("dev", cursor, machine);
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
    expect(keptCursor(server.home).firstInput?.state).toBe("uncertain");
    await server.close();
    await stayedUp(cursor, pid, 500);
    server = await startCursorDashboard("dev", cursor, machine);
    const terminal = await openCursorTerminal(server, sessionId);
    expect(await shows(terminal, "Clarifying Questions")).toBe(true);
    terminal.send({ input: "Red" });
    await expect.poll(() => cursor.input(pid)).toContain("Red");
    expect(cursor.input(pid)).not.toContain(instruction);
    expect(cursor.attaches()).toHaveLength(1);
    expect(keptCursor(server.home).firstInput?.state).toBe("uncertain");
  } finally {
    await server.close();
    await stopCursorRunner(path.join(machine, "home"));
    cursor.cleanup();
    rmSync(machine, { recursive: true, force: true });
  }
}

export async function trustScreenSurvivesRestart(): Promise<void> {
  test.setTimeout(180_000);
  const cursor = installFakeCursor({ screen: "trust", becomeReady: true });
  const machine = path.join(
    tmpdir(),
    `dough-cursor-trust-${process.pid.toString(36)}`,
  );
  mkdirSync(machine);
  let server = await startCursorDashboard("dev", cursor, machine);
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
    const pid = cursor.attaches()[0]?.pid ?? 0;
    const sessionId = keptCursor(server.home).session.sessionId;
    expect(keptCursor(server.home).firstInput?.state).toBe("uncertain");
    expect(cursor.input(pid)).not.toContain(instruction);
    await server.close();
    expect(keptCursor(path.join(machine, "home")).firstInput?.state).toBe(
      "uncertain",
    );
    expect(cursor.input(pid)).not.toContain(instruction);
    await stayedUp(cursor, pid, 400);
    server = await startCursorDashboard("dev", cursor, machine);
    expect(keptCursor(server.home).firstInput?.state).toBe("uncertain");
    expect(cursor.input(pid)).not.toContain(instruction);
    const terminal = await openCursorTerminal(server, sessionId);
    expect(await shows(terminal, "Do you trust this workspace?")).toBe(true);
    expect(cursor.input(pid)).not.toContain(instruction);
    expect(keptCursor(server.home).firstInput?.state).toBe("uncertain");
    cursor.showReady();
    await expect.poll(() => cursor.input(pid)).toContain(instruction);
    await expect
      .poll(() => keptCursor(server.home).firstInput?.state)
      .toBe("confirmed");
    expect(cursor.attaches()).toHaveLength(1);
    expect(cursor.attaches()[0]?.pid).toBe(pid);
  } finally {
    await server.close();
    await stopCursorRunner(path.join(machine, "home"));
    cursor.cleanup();
    rmSync(machine, { recursive: true, force: true });
  }
}
