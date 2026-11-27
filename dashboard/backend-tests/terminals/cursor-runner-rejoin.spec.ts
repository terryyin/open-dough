// A Cursor client held by the machine-local runner is the same client after
// the Dashboard stops: a restarted development Dashboard types into that PID
// whether it is working or awaiting an answer, and a held trust prompt stays
// unconfirmed until that client is ready. The terminal bridge joins a held
// client even on a runner whose build proof went stale, and resumes a
// session it does not hold on a current runner. Cases run in order: the
// bridge fixture sets HOME and PATH for the runner client.
import { afterEach, expect, test } from "vitest";
import { computeRunnerBuildId } from "../../server/hosts/cursor/runnerBuild.ts";
import { readCursorRunnerAddress } from "../../server/hosts/cursor/runnerPaths.ts";
import { shows } from "../../test-support/agentTerminalBoundary.ts";
import {
  cursorDashboardMachine,
  launchedCursorClient,
  type CursorDashboardMachine,
} from "../../test-support/support/cursorDashboardMachine.ts";
import {
  instruction,
  liveRunner,
  processGroup,
  runnersFor,
} from "../../test-support/support/cursorRunnerJourney.ts";
import {
  bridgedProofTerminal,
  keepWorkingClient,
  startRunnerProofFixture,
} from "../../test-support/support/cursorRunnerProof.ts";
import { tamperRecordedProof } from "../../test-support/support/cursorRunnerRecordedAddress.ts";
import { openCursorTerminal } from "../../test-support/support/cursorTerminal.ts";
import { installFakeCursor } from "../../test-support/support/fakeCursor.ts";
import {
  keptCursor,
  stayedUp,
} from "../../test-support/support/keptCursorTurn.ts";
import { processRunning } from "../../test-support/support/processGroup.ts";

let machine: CursorDashboardMachine | undefined;

afterEach(async () => {
  await machine?.remove();
  machine = undefined;
});

test("a restarted dashboard server types into the same Cursor client", async () => {
  const cursor = installFakeCursor({ working: true });
  machine = cursorDashboardMachine(cursor);
  const first = await machine.startDashboard();
  const runnerPid = (await liveRunner(first.home)).pid;
  expect(processRunning(runnerPid)).toBe(true);
  expect(processGroup(runnerPid)).toBe(runnerPid);
  expect(processGroup(first.pid)).not.toBe(runnerPid);
  const { sessionId, pid } = await launchedCursorClient(first, cursor);
  expect(cursor.attaches()).toHaveLength(1);
  expect(processRunning(pid)).toBe(true);

  await first.close();
  expect(processRunning(first.pid)).toBe(false);
  expect(processRunning(runnerPid)).toBe(true);
  await stayedUp(cursor, pid, 400);
  expect(cursor.calls().map((call) => call.args)).toEqual([["create-chat"]]);

  const server = await machine.startDashboard();
  expect(readCursorRunnerAddress(server.home)?.pid).toBe(runnerPid);
  expect(runnersFor(server.home)).toBe(1);
  const terminal = await openCursorTerminal(server, sessionId);
  await expect
    .poll(() => terminal.output(), { timeout: 5_000 })
    .toContain("ctrl+c to stop");
  terminal.send({ input: "after-restart" });
  await expect
    .poll(() => cursor.input(pid), { timeout: 5_000 })
    .toContain("after-restart");
  expect(cursor.attaches()).toHaveLength(1);
  expect(cursor.attaches()[0]?.pid).toBe(pid);
  expect(cursor.calls()).toHaveLength(1);
}, 60_000);

test("a waiting Cursor client still takes the answer after the server is killed", async () => {
  const cursor = installFakeCursor({ screen: "waiting" });
  machine = cursorDashboardMachine(cursor);
  const first = await machine.startDashboard();
  const { sessionId, pid } = await launchedCursorClient(first, cursor);
  expect(keptCursor(first.home).firstInput?.state).toBe("uncertain");
  await first.close();
  await stayedUp(cursor, pid, 500);
  const server = await machine.startDashboard();
  const terminal = await openCursorTerminal(server, sessionId);
  expect(await shows(terminal, "Which color do you prefer")).toBe(true);
  terminal.send({ input: "Red" });
  await expect
    .poll(() => cursor.input(pid), { timeout: 5_000 })
    .toContain("Red");
  expect(cursor.input(pid)).not.toContain(instruction);
  expect(cursor.attaches()).toHaveLength(1);
  expect(keptCursor(server.home).firstInput?.state).toBe("uncertain");
}, 60_000);

test("a trust screen stays unconfirmed across a restart until that client is ready", async () => {
  const cursor = installFakeCursor({ screen: "trust", becomeReady: true });
  machine = cursorDashboardMachine(cursor);
  const first = await machine.startDashboard();
  const { sessionId, pid } = await launchedCursorClient(first, cursor);
  expect(keptCursor(first.home).firstInput?.state).toBe("uncertain");
  expect(cursor.input(pid)).not.toContain(instruction);
  await first.close();
  expect(keptCursor(first.home).firstInput?.state).toBe("uncertain");
  expect(cursor.input(pid)).not.toContain(instruction);
  await stayedUp(cursor, pid, 400);
  const server = await machine.startDashboard();
  expect(keptCursor(server.home).firstInput?.state).toBe("uncertain");
  expect(cursor.input(pid)).not.toContain(instruction);
  const terminal = await openCursorTerminal(server, sessionId);
  expect(await shows(terminal, "Do you trust this workspace?")).toBe(true);
  expect(cursor.input(pid)).not.toContain(instruction);
  expect(keptCursor(server.home).firstInput?.state).toBe("uncertain");
  cursor.showReady();
  await expect
    .poll(() => cursor.input(pid), { timeout: 5_000 })
    .toContain(instruction);
  await expect
    .poll(() => keptCursor(server.home).firstInput?.state, { timeout: 5_000 })
    .toBe("confirmed");
  expect(cursor.attaches()).toHaveLength(1);
  expect(cursor.attaches()[0]?.pid).toBe(pid);
}, 60_000);

test("terminal bridge joins a held client on a stale runner but resumes a not-held session on a current runner", async () => {
  const fixture = startRunnerProofFixture();
  let heldBridge: Awaited<ReturnType<typeof bridgedProofTerminal>> | undefined;
  let resumedBridge:
    Awaited<ReturnType<typeof bridgedProofTerminal>> | undefined;
  try {
    await keepWorkingClient(fixture);
    const stalePid = readCursorRunnerAddress(fixture.home)?.pid;
    tamperRecordedProof(fixture);
    heldBridge = await bridgedProofTerminal(fixture, fixture.cursor.sessionId);
    await expect
      .poll(() => heldBridge?.output(), { timeout: 5_000 })
      .toContain("ctrl+c to stop");
    expect(readCursorRunnerAddress(fixture.home)?.pid).toBe(stalePid);
    expect(fixture.cursor.attaches()).toHaveLength(1);
    await heldBridge.close();
    heldBridge = undefined;

    const otherId = "7f1e8c2a-9b34-4d5e-8f70-1a2b3c4d5e6f";
    resumedBridge = await bridgedProofTerminal(fixture, otherId);
    await expect
      .poll(() => readCursorRunnerAddress(fixture.home)?.buildId, {
        timeout: 5_000,
      })
      .toBe(computeRunnerBuildId());
    expect(readCursorRunnerAddress(fixture.home)?.pid).not.toBe(stalePid);
    await expect
      .poll(() => fixture.cursor.attaches().length, { timeout: 5_000 })
      .toBe(2);
    expect(fixture.cursor.attaches().at(-1)?.sessionId).toBe(otherId);
  } finally {
    await heldBridge?.close().catch(() => undefined);
    await resumedBridge?.close().catch(() => undefined);
    await fixture.restore();
  }
});
