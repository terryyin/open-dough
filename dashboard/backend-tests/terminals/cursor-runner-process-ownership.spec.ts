// One machine home owns one Cursor runner. Two development Dashboards started
// for that home share a runner that leads its own process group, and closing
// one Dashboard leaves the runner and the other Dashboard running. How a
// runner leaves a removed home is ../sessions/cursor-runner-discarded-start.spec.ts.
import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test } from "vitest";
import { stopCursorRunner } from "../../server/hosts/cursor/runnerClient.ts";
import { readCursorRunnerAddress } from "../../server/hosts/cursor/runnerPaths.ts";
import {
  liveRunner,
  processGroup,
  runnersFor,
} from "../../test-support/support/cursorRunnerJourney.ts";
import { developmentBoundary } from "../../test-support/support/dashboardServer.ts";
import { installFakeCursor } from "../../test-support/support/fakeCursor.ts";
import { startCursorDashboard } from "../../test-support/support/keptCursorTurn.ts";
import { processRunning } from "../../test-support/support/processGroup.ts";

test("two development servers leave one runner in its own process group", async () => {
  const cursor = installFakeCursor();
  const machine = path.join(
    tmpdir(),
    `dough-cursor-one-${process.pid.toString(36)}`,
  );
  mkdirSync(machine);
  const [first, second] = await Promise.all([
    startCursorDashboard(developmentBoundary, cursor, machine),
    startCursorDashboard(developmentBoundary, cursor, machine),
  ]);
  onTestFinished(async () => {
    await first.close();
    await second.close();
    await stopCursorRunner(path.join(machine, "home"));
    cursor.cleanup();
    rmSync(machine, { recursive: true, force: true });
  });
  const runnerPid = (await liveRunner(first.home)).pid;
  expect(readCursorRunnerAddress(second.home)?.pid).toBe(runnerPid);
  expect(processGroup(runnerPid)).toBe(runnerPid);
  expect(processGroup(first.pid)).not.toBe(processGroup(runnerPid));
  expect(processGroup(second.pid)).not.toBe(processGroup(runnerPid));
  await expect.poll(() => runnersFor(first.home), { timeout: 5_000 }).toBe(1);
  await new Promise((resolve) => setTimeout(resolve, 500));
  expect(runnersFor(first.home)).toBe(1);
  expect(readCursorRunnerAddress(first.home)?.pid).toBe(runnerPid);
  await first.close();
  expect(processRunning(runnerPid)).toBe(true);
  expect(processRunning(second.pid)).toBe(true);
}, 60_000);
