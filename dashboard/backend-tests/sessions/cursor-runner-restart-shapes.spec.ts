// Restart resumability in the restart shapes, at the runner boundary:
// a runner killed with its address left stale (the machine-restart
// shape) is started fresh and current before a recorded session is kept
// again, and a new listener on its old port does not stand in for it.
// Build-proof replacement is ./cursor-runner-current-proof.spec.ts.
// Same-build helper repair shapes live in
// ./cursor-runner-helper-repair-shapes.spec.ts.
// Deterministic fake-Cursor proof only: real `cursor-agent` resumption
// after a real runner kill and after a real machine reboot, with a
// scoped session, remains pending native verification under ADR 0005
// and is claimed nowhere here. Cases run in order: the fixture sets HOME
// and PATH for the runner client. Each case's cleanup runs when the case
// finishes, a timeout included, so a case's runner and environment never
// outlast it.
import { spawn } from "node:child_process";
import net from "node:net";
import { expect, onTestFinished, test } from "vitest";
import { computeRunnerBuildId } from "../../server/hosts/cursor/runnerBuild.ts";
import { ensureCursorRunner } from "../../server/hosts/cursor/runnerClient.ts";
import { readCursorRunnerAddress } from "../../server/hosts/cursor/runnerPaths.ts";
import {
  keepWorkingClient,
  startRunnerProofFixture,
} from "../../test-support/support/cursorRunnerProof.ts";
import {
  killCursorRunnerLeavingAddress,
  listenOnReleasedRunnerPort,
  writeRunnerAddress,
} from "../../test-support/support/cursorRunnerRecordedAddress.ts";
import { processRunning } from "../../test-support/support/processGroup.ts";

test("a dead pid with its stale address left behind starts a fresh current runner, and the recorded session is kept again there", async () => {
  const fixture = startRunnerProofFixture();
  await keepWorkingClient(fixture);
  const heldPid = fixture.cursor.attaches()[0]?.pid ?? 0;
  const stale = await killCursorRunnerLeavingAddress(fixture.home);
  await expect
    .poll(() => processRunning(heldPid), { timeout: 5_000 })
    .toBe(false);

  // Reopening goes through ensureCursorRunner's acceptance checks
  // (alive pid + accepting port): the dead pid fails them, so a fresh
  // runner starts and publishes its own current address.
  await expect(ensureCursorRunner(fixture.home)).resolves.toBe(true);
  const fresh = readCursorRunnerAddress(fixture.home);
  expect(fresh?.pid).not.toBe(stale.pid);
  expect(fresh?.buildId).toBe(computeRunnerBuildId());

  await keepWorkingClient(fixture);
  expect(fixture.cursor.attaches()).toHaveLength(2);
  expect(fixture.cursor.attaches().at(-1)?.sessionId).toBe(
    fixture.cursor.sessionId,
  );
  expect(readCursorRunnerAddress(fixture.home)?.pid).toBe(fresh?.pid);
});

test("a port reused after the runner died does not revive its stale address", async () => {
  const fixture = startRunnerProofFixture();
  const sockets = new Set<net.Socket>();
  const squatter = net.createServer((socket) => {
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
    socket.destroy();
  });
  onTestFinished(async () => {
    for (const socket of sockets) socket.destroy();
    await new Promise<void>((resolve) => {
      squatter.close(() => {
        resolve();
      });
    });
  });
  await keepWorkingClient(fixture);
  const stale = await killCursorRunnerLeavingAddress(fixture.home);
  // An unrelated listener now accepts on the dead runner's old port,
  // and the stale address is left naming that port with a pid that is
  // gone for good (a short-lived process this test reaped itself, so
  // no zombie can answer the alive check on the dead runner's behalf).
  await listenOnReleasedRunnerPort(squatter, stale.port);
  const gone = spawn(process.execPath, ["-e", ""]);
  await new Promise<void>((resolve) => {
    gone.once("exit", () => {
      resolve();
    });
  });
  if (gone.pid === undefined) throw new Error("No short-lived pid.");
  await expect
    .poll(() => processRunning(gone.pid), { timeout: 5_000 })
    .toBe(false);
  writeRunnerAddress(fixture, { ...stale, pid: gone.pid });

  await expect(ensureCursorRunner(fixture.home)).resolves.toBe(true);
  const fresh = readCursorRunnerAddress(fixture.home);
  expect(fresh?.pid).not.toBe(gone.pid);
  expect(fresh?.pid).not.toBe(stale.pid);
  expect(fresh?.port).not.toBe(stale.port);
  expect(fresh?.buildId).toBe(computeRunnerBuildId());
  expect(squatter.listening).toBe(true);
});
