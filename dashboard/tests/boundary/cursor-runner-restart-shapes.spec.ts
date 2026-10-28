// Restart resumability in the restart shapes, at the runner boundary:
// a runner killed with its address left stale (the machine-restart
// shape) is started fresh and current before a recorded session is kept
// again, and neither deployment ensure replaces a surviving stale-proof
// runner — the first real launch through the new deployment does.
// Deterministic fake-Cursor proof only: real `cursor-agent` resumption
// after a real runner kill and after a real machine reboot, with a
// scoped session, remains pending native verification under ADR 0005
// and is claimed nowhere here.
import { spawn } from "node:child_process";
import http from "node:http";
import { existsSync, rmSync } from "node:fs";
import path from "node:path";
import net from "node:net";
import { expect, test } from "../support/pageTest.ts";
import { computeRunnerBuildId } from "../../server/hosts/cursor/runnerBuild.ts";
import { ensureCursorRunner } from "../../server/hosts/cursor/runnerClient.ts";
import {
  cursorRunnerAddressFile,
  readCursorRunnerAddress,
} from "../../server/hosts/cursor/runnerPaths.ts";
import {
  createChatOnRunner,
  keepWorkingClient,
  startRunnerProofFixture,
} from "../support/cursorRunnerProof.ts";
import {
  killCursorRunnerLeavingAddress,
  listenOnReleasedRunnerPort,
  tamperRecordedProof,
  writeRunnerAddress,
} from "../support/cursorRunnerRecordedAddress.ts";
import { processRunning } from "../support/processGroup.ts";

test("a dead pid with its stale address left behind starts a fresh current runner, and the recorded session is kept again there", async () => {
  test.setTimeout(60_000);
  const fixture = startRunnerProofFixture();
  try {
    await keepWorkingClient(fixture);
    const heldPid = fixture.cursor.attaches()[0]?.pid ?? 0;
    const stale = await killCursorRunnerLeavingAddress(fixture.home);
    await expect.poll(() => processRunning(heldPid)).toBe(false);

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
  } finally {
    await fixture.restore();
  }
});

test("a port reused after the runner died does not revive its stale address", async () => {
  test.setTimeout(60_000);
  const fixture = startRunnerProofFixture();
  const sockets = new Set<net.Socket>();
  const squatter = net.createServer((socket) => {
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
    socket.destroy();
  });
  try {
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
    await expect.poll(() => processRunning(gone.pid)).toBe(false);
    writeRunnerAddress(fixture, { ...stale, pid: gone.pid });

    await expect(ensureCursorRunner(fixture.home)).resolves.toBe(true);
    const fresh = readCursorRunnerAddress(fixture.home);
    expect(fresh?.pid).not.toBe(gone.pid);
    expect(fresh?.pid).not.toBe(stale.pid);
    expect(fresh?.port).not.toBe(stale.port);
    expect(fresh?.buildId).toBe(computeRunnerBuildId());
    expect(squatter.listening).toBe(true);
  } finally {
    for (const socket of sockets) socket.destroy();
    await new Promise<void>((resolve) => {
      squatter.close(() => {
        resolve();
      });
    });
    await fixture.restore();
  }
});

test("an unrelated process reusing the recorded pid and port proves no current build: new work starts no agent and leaves it alone", async () => {
  test.setTimeout(60_000);
  const fixture = startRunnerProofFixture();
  // This test process itself is the unrelated process: it accepts on
  // the recorded port and its own alive pid is recorded, so the
  // start-if-absent acceptance checks (pid alive + port accepting) pass
  // — but it answers no runner protocol, let alone a current build.
  const unrelated = http.createServer((req, res) => {
    req.resume();
    res.end("not the Cursor runner");
  });
  try {
    await new Promise<void>((resolve) => {
      unrelated.listen(0, "127.0.0.1", () => {
        resolve();
      });
    });
    const address = unrelated.address();
    if (address === null || typeof address === "string") {
      throw new Error("No unrelated address.");
    }
    writeRunnerAddress(fixture, { port: address.port, pid: process.pid });

    // Start-if-absent sees an accepting address and starts nothing;
    // that alone never makes the unrelated process look current.
    await expect(ensureCursorRunner(fixture.home)).resolves.toBe(true);
    expect(readCursorRunnerAddress(fixture.home)?.pid).toBe(process.pid);

    const created = await createChatOnRunner(fixture);
    expect(created).toBeUndefined();
    expect(fixture.cursor.calls()).toEqual([]);
    expect(unrelated.listening).toBe(true);
    expect(readCursorRunnerAddress(fixture.home)?.pid).toBe(process.pid);
  } finally {
    // restore stops the runner named by the address; clear the address
    // naming this test process before it can be read that way.
    rmSync(cursorRunnerAddressFile(fixture.home), { force: true });
    await new Promise<void>((resolve) => {
      unrelated.close(() => {
        resolve();
      });
    });
    await fixture.restore();
  }
});

test("a runner whose terminal helper is gone is left by start-if-absent and replaced before the next launch", async () => {
  test.setTimeout(60_000);
  const fixture = startRunnerProofFixture();
  try {
    await keepWorkingClient(fixture);
    const before = readCursorRunnerAddress(fixture.home);
    const heldPid = fixture.cursor.attaches()[0]?.pid ?? 0;
    expect(before?.spawnHelper).toBeTruthy();
    expect(existsSync(before?.spawnHelper ?? "")).toBe(true);
    writeRunnerAddress(fixture, {
      ...before,
      spawnHelper: path.join(fixture.root, "missing-spawn-helper"),
    });

    await expect(ensureCursorRunner(fixture.home)).resolves.toBe(true);
    expect(readCursorRunnerAddress(fixture.home)?.pid).toBe(before?.pid);
    expect(processRunning(heldPid)).toBe(true);

    const created = await createChatOnRunner(fixture);
    expect(created).toMatchObject({
      failed: false,
      stdout: `${fixture.cursor.sessionId}\n`,
    });
    await expect.poll(() => processRunning(before?.pid)).toBe(false);
    const replacement = readCursorRunnerAddress(fixture.home);
    expect(replacement?.pid).not.toBe(before?.pid);
    expect(replacement?.buildId).toBe(computeRunnerBuildId());
    expect(existsSync(replacement?.spawnHelper ?? "")).toBe(true);
    expect(replacement?.spawnHelper).not.toBe(
      path.join(fixture.root, "missing-spawn-helper"),
    );
    await keepWorkingClient(fixture);
    expect(fixture.cursor.attaches().at(-1)?.pid).not.toBe(heldPid);
  } finally {
    await fixture.restore();
  }
});

test("the production deployment shape: neither ensure replaces a surviving stale-proof runner, and the first real launch does", async () => {
  test.setTimeout(60_000);
  const fixture = startRunnerProofFixture();
  try {
    await keepWorkingClient(fixture);
    const before = readCursorRunnerAddress(fixture.home);
    const heldPid = fixture.cursor.attaches()[0]?.pid ?? 0;
    const calls = fixture.cursor.calls().length;
    tamperRecordedProof(fixture);

    // The two ensures a new deployment runs before any launch: the
    // production watcher's one runner ensure (scripts/watch-dashboard.mjs
    // startCursorRunner) and the preview launch boundary's readiness
    // ensure (server/launchBoundary.ts `ready: ensureCursorRunner()`).
    // Both are this start-if-absent ensure; neither replaces on its own,
    // and the held client survives the dashboard replacement.
    await expect(ensureCursorRunner(fixture.home)).resolves.toBe(true);
    await expect(ensureCursorRunner(fixture.home)).resolves.toBe(true);
    expect(readCursorRunnerAddress(fixture.home)?.pid).toBe(before?.pid);
    expect(processRunning(heldPid)).toBe(true);
    expect(fixture.cursor.attaches()).toHaveLength(1);
    expect(fixture.cursor.calls()).toHaveLength(calls);

    // The first real launch through the new deployment is new work: it
    // replaces the stale runner first, once, and later work reuses the
    // replacement.
    const created = await createChatOnRunner(fixture);
    expect(created).toMatchObject({
      failed: false,
      stdout: `${fixture.cursor.sessionId}\n`,
    });
    await expect.poll(() => processRunning(before?.pid)).toBe(false);
    const replacement = readCursorRunnerAddress(fixture.home);
    expect(replacement?.pid).not.toBe(before?.pid);
    expect(replacement?.buildId).toBe(computeRunnerBuildId());
    const again = await createChatOnRunner(fixture);
    expect(again).toMatchObject({ failed: false });
    expect(readCursorRunnerAddress(fixture.home)?.pid).toBe(replacement?.pid);
  } finally {
    await fixture.restore();
  }
});
