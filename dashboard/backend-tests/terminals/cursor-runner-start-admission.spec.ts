// A real development Dashboard refuses a Cursor start while the machine's
// runner address is held by a listener that is not the runner: the launch
// answers unavailable, runs no Cursor agent, attaches nothing and starts no
// runner for that home. Which accepting runner new work may use is
// ../sessions/cursor-runner-current-proof.spec.ts.
import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "vitest";
import { cursorRunnerAddressFile } from "../../server/hosts/cursor/runnerPaths.ts";
import { launch } from "../../test-support/agentLaunchBoundary.ts";
import {
  instruction,
  occupyRunner,
  runnersFor,
} from "../../test-support/support/cursorRunnerJourney.ts";
import { developmentBoundary } from "../../test-support/support/dashboardServer.ts";
import { installFakeCursor } from "../../test-support/support/fakeCursor.ts";
import { startCursorDashboard } from "../../test-support/support/keptCursorTurn.ts";

test("an unreachable runner refuses a Cursor start", async () => {
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
    server = await startCursorDashboard(developmentBoundary, cursor, machine);
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
}, 60_000);
