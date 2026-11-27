// Deliberately stopping the machine-local runner hangs up the Cursor clients it
// holds and removes its address; opening the terminal again starts a new
// runner that resumes the same saved conversation in a fresh client.
import { afterEach, expect, test } from "vitest";
import { stopCursorRunner } from "../../server/hosts/cursor/runnerClient.ts";
import { readCursorRunnerAddress } from "../../server/hosts/cursor/runnerPaths.ts";
import {
  cursorDashboardMachine,
  launchedCursorClient,
  type CursorDashboardMachine,
} from "../../test-support/support/cursorDashboardMachine.ts";
import { openCursorTerminal } from "../../test-support/support/cursorTerminal.ts";
import { installFakeCursor } from "../../test-support/support/fakeCursor.ts";
import { processRunning } from "../../test-support/support/processGroup.ts";

let machine: CursorDashboardMachine | undefined;

afterEach(async () => {
  await machine?.remove();
  machine = undefined;
});

test("stopping the runner ends its clients and a new runner resumes the chat", async () => {
  const cursor = installFakeCursor({ working: true });
  machine = cursorDashboardMachine(cursor);
  const server = await machine.startDashboard();
  const { sessionId, pid } = await launchedCursorClient(server, cursor);

  await stopCursorRunner(server.home);
  await expect
    .poll(() => cursor.signals(pid), { timeout: 5_000 })
    .toContain("SIGHUP");
  await expect.poll(() => processRunning(pid), { timeout: 5_000 }).toBe(false);
  expect(
    cursor.attaches().filter((attach) => processRunning(attach.pid)),
  ).toEqual([]);
  expect(readCursorRunnerAddress(server.home)).toBeUndefined();

  const terminal = await openCursorTerminal(server, sessionId);
  await expect
    .poll(() => cursor.attaches(), { timeout: 5_000 })
    .toHaveLength(2);
  const resumed = cursor.attaches()[1]?.pid ?? 0;
  expect(resumed).not.toBe(pid);
  expect(processRunning(resumed)).toBe(true);
  await expect
    .poll(() => terminal.output(), { timeout: 5_000 })
    .toContain("ctrl+c to stop");
  expect(cursor.calls().map((call) => call.args)).toEqual([["create-chat"]]);
}, 60_000);
