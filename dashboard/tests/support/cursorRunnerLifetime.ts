// The runner's lifetime on one machine: a detached follow-up prompt stays
// while the dashboard is down, one runner for two servers, refusal when the
// address is occupied, and a new resume after the runner is stopped.
import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "./pageTest.ts";
import { launch } from "../agentLaunchBoundary.ts";
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
  occupyRunner,
  processGroup,
  runnersFor,
} from "./cursorRunnerJourney.ts";
import { processRunning } from "./processGroup.ts";
import { stopCursorRunner } from "../../server/hosts/cursor/runnerClient.ts";
import {
  cursorRunnerAddressFile,
  readCursorRunnerAddress,
} from "../../server/hosts/cursor/runnerPaths.ts";

export async function detachedPromptStaysWhileDashboardIsDown(): Promise<void> {
  test.setTimeout(180_000);
  const cursor = installFakeCursor({ screen: "working", becomeReady: true });
  const machine = path.join(
    tmpdir(),
    `dough-cursor-idle-${process.pid.toString(36)}`,
  );
  mkdirSync(machine);
  const server = await startCursorDashboard("dev", cursor, machine);
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
    await server.close();
    await stayedUp(cursor, pid, 400);
    expect(cursor.signals(pid)).not.toContain("SIGHUP");
    cursor.showReady();
    await stayedUp(cursor, pid, 500);
    expect(readCursorRunnerAddress(path.join(machine, "home"))).toBeDefined();
  } finally {
    await stopCursorRunner(path.join(machine, "home"));
    cursor.cleanup();
    rmSync(machine, { recursive: true, force: true });
  }
}

export async function twoServersLeaveOneRunner(): Promise<void> {
  test.setTimeout(180_000);
  const cursor = installFakeCursor();
  const machine = path.join(
    tmpdir(),
    `dough-cursor-one-${process.pid.toString(36)}`,
  );
  mkdirSync(machine);
  const [first, second] = await Promise.all([
    startCursorDashboard("dev", cursor, machine),
    startCursorDashboard("dev", cursor, machine),
  ]);
  try {
    const runner = await liveRunner(first.home);
    const runnerPid = runner.pid;
    expect(readCursorRunnerAddress(second.home)?.pid).toBe(runnerPid);
    expect(processGroup(runnerPid)).toBe(runnerPid);
    expect(processGroup(first.pid)).not.toBe(processGroup(runnerPid));
    expect(processGroup(second.pid)).not.toBe(processGroup(runnerPid));
    await expect.poll(() => runnersFor(first.home)).toBe(1);
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(runnersFor(first.home)).toBe(1);
    expect(readCursorRunnerAddress(first.home)?.pid).toBe(runnerPid);
    await first.close();
    expect(processRunning(runnerPid)).toBe(true);
    expect(processRunning(second.pid)).toBe(true);
  } finally {
    await first.close();
    await second.close();
    await stopCursorRunner(path.join(machine, "home"));
    cursor.cleanup();
    rmSync(machine, { recursive: true, force: true });
  }
}

export async function unreachableRunnerRefusesStart(): Promise<void> {
  test.setTimeout(180_000);
  const cursor = installFakeCursor();
  const machine = path.join(
    tmpdir(),
    `dough-cursor-down-${process.pid.toString(36)}`,
  );
  mkdirSync(machine);
  const home = path.join(machine, "home");
  const release = await occupyRunner(home);
  let server: Awaited<ReturnType<typeof startCursorDashboard>> | undefined;
  try {
    server = await startCursorDashboard("dev", cursor, machine);
    const launched = await launch(server, {
      source: "open-dough",
      workflow: "ad-hoc",
      host: "cursor",
      instruction,
    });
    expect(JSON.parse(launched.body)).toMatchObject({
      kind: "failed",
      reason: "unavailable",
    });
    expect(cursor.calls()).toEqual([]);
    expect(cursor.attaches()).toEqual([]);
    expect(runnersFor(home)).toBe(0);
  } finally {
    rmSync(cursorRunnerAddressFile(home), { force: true });
    await release();
    await server?.close();
    cursor.cleanup();
    rmSync(machine, { recursive: true, force: true });
  }
}

export async function stoppingRunnerResumesOnNextOpen(): Promise<void> {
  test.setTimeout(180_000);
  const cursor = installFakeCursor({ working: true });
  const machine = path.join(
    tmpdir(),
    `dough-cursor-stop-${process.pid.toString(36)}`,
  );
  mkdirSync(machine);
  const server = await startCursorDashboard("dev", cursor, machine);
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
