// Same-build helper repair at the runner boundary: a runner whose helper
// proof drifted or whose wire helper file was deleted is left alone
// through deployment ensures and the first real launch (helper restored
// from this install). Machine-restart and stale-build shapes live in
// ./cursor-runner-restart-shapes.spec.ts.
import { existsSync, rmSync } from "node:fs";
import path from "node:path";
import { expect, test } from "../support/pageTest.ts";
import { computeRunnerBuildId } from "../../server/hosts/cursor/runnerBuild.ts";
import { cursorRunnerSpawnHelper } from "../../server/hosts/cursor/runnerSpawnHelper.ts";
import { ensureCursorRunner } from "../../server/hosts/cursor/runnerClient.ts";
import { readCursorRunnerAddress } from "../../server/hosts/cursor/runnerPaths.ts";
import {
  createChatOnRunner,
  keepWorkingClient,
  startRunnerProofFixture,
} from "../support/cursorRunnerProof.ts";
import {
  clearRetiredCheckoutHelperProof,
  publishRetiredCheckoutHelper,
  writeRunnerAddress,
} from "../support/cursorRunnerRecordedAddress.ts";
import { processRunning } from "../support/processGroup.ts";

test("a runner whose recorded helper path drifted is left by start-if-absent and kept for the next launch", async () => {
  test.setTimeout(60_000);
  test.skip(
    cursorRunnerSpawnHelper() === undefined,
    "this install's node-pty ships no separate terminal helper",
  );
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

    // New work repairs helper proof for the same answering same-build
    // runner instead of stopping it: the held client stays up, and the
    // next launch reuses that runner.
    const created = await createChatOnRunner(fixture);
    expect(created).toMatchObject({
      failed: false,
      stdout: `${fixture.cursor.sessionId}\n`,
    });
    expect(processRunning(before?.pid)).toBe(true);
    expect(processRunning(heldPid)).toBe(true);
    const kept = readCursorRunnerAddress(fixture.home);
    expect(kept?.pid).toBe(before?.pid);
    expect(kept?.buildId).toBe(computeRunnerBuildId());
    expect(existsSync(kept?.spawnHelper ?? "")).toBe(true);
    expect(kept?.spawnHelper).not.toBe(
      path.join(fixture.root, "missing-spawn-helper"),
    );
    await keepWorkingClient(fixture, "d4e5f6a7-b8c9-4abd-9ef0-123456789abc");
    expect(fixture.cursor.attaches()).toHaveLength(2);
    expect(fixture.cursor.attaches()[0]?.pid).toBe(heldPid);
    expect(processRunning(heldPid)).toBe(true);
    expect(readCursorRunnerAddress(fixture.home)?.pid).toBe(before?.pid);
  } finally {
    await fixture.restore();
  }
});

test("a runner whose wire helper file was deleted is left by start-if-absent and kept when new work restores that file from this install", async () => {
  test.setTimeout(60_000);
  test.skip(
    cursorRunnerSpawnHelper() === undefined,
    "this install's node-pty ships no separate terminal helper",
  );
  const fixture = startRunnerProofFixture();
  try {
    const retired = publishRetiredCheckoutHelper(fixture);
    await keepWorkingClient(fixture);
    const before = readCursorRunnerAddress(fixture.home);
    const heldPid = fixture.cursor.attaches()[0]?.pid ?? 0;
    expect(before?.spawnHelper).toBe(retired);
    expect(existsSync(retired)).toBe(true);
    // Production retirement deletes the checkout that held the helper
    // while the runner keeps answering the same build: recorded and wire
    // still name that path, and the file is gone.
    rmSync(retired);
    expect(existsSync(retired)).toBe(false);
    expect(readCursorRunnerAddress(fixture.home)?.spawnHelper).toBe(retired);

    await expect(ensureCursorRunner(fixture.home)).resolves.toBe(true);
    expect(readCursorRunnerAddress(fixture.home)?.pid).toBe(before?.pid);
    expect(processRunning(heldPid)).toBe(true);
    expect(existsSync(retired)).toBe(false);

    const created = await createChatOnRunner(fixture);
    expect(created).toMatchObject({
      failed: false,
      stdout: `${fixture.cursor.sessionId}\n`,
    });
    expect(processRunning(before?.pid)).toBe(true);
    expect(processRunning(heldPid)).toBe(true);
    expect(fixture.cursor.attaches()).toHaveLength(1);
    expect(fixture.cursor.attaches()[0]?.pid).toBe(heldPid);
    const kept = readCursorRunnerAddress(fixture.home);
    expect(kept?.pid).toBe(before?.pid);
    expect(kept?.buildId).toBe(computeRunnerBuildId());
    expect(kept?.spawnHelper).toBe(retired);
    expect(existsSync(retired)).toBe(true);
    await keepWorkingClient(fixture, "e5f6a7b8-c9d0-4bce-af01-23456789abcd");
    expect(fixture.cursor.attaches()).toHaveLength(2);
    expect(processRunning(heldPid)).toBe(true);
    expect(readCursorRunnerAddress(fixture.home)?.pid).toBe(before?.pid);
  } finally {
    clearRetiredCheckoutHelperProof();
    await fixture.restore();
  }
});

test("the production deployment shape: neither ensure nor the first real launch hangs up a same-build runner after its checkout helper was deleted", async () => {
  test.setTimeout(60_000);
  test.skip(
    cursorRunnerSpawnHelper() === undefined,
    "this install's node-pty ships no separate terminal helper",
  );
  const fixture = startRunnerProofFixture();
  try {
    const retired = publishRetiredCheckoutHelper(fixture);
    await keepWorkingClient(fixture);
    const before = readCursorRunnerAddress(fixture.home);
    const heldPid = fixture.cursor.attaches()[0]?.pid ?? 0;
    const calls = fixture.cursor.calls().length;
    expect(before?.spawnHelper).toBe(retired);
    rmSync(retired);
    expect(existsSync(retired)).toBe(false);

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
    expect(existsSync(retired)).toBe(false);

    // The first real launch through the new deployment is new work: it
    // keeps the same-build runner and its held client, restores the wire
    // helper from this install, and later work reuses that runner.
    const created = await createChatOnRunner(fixture);
    expect(created).toMatchObject({
      failed: false,
      stdout: `${fixture.cursor.sessionId}\n`,
    });
    expect(processRunning(before?.pid)).toBe(true);
    expect(processRunning(heldPid)).toBe(true);
    expect(fixture.cursor.attaches()).toHaveLength(1);
    expect(existsSync(retired)).toBe(true);
    const kept = readCursorRunnerAddress(fixture.home);
    expect(kept?.pid).toBe(before?.pid);
    expect(kept?.buildId).toBe(computeRunnerBuildId());
    expect(kept?.spawnHelper).toBe(retired);
    const again = await createChatOnRunner(fixture);
    expect(again).toMatchObject({ failed: false });
    expect(readCursorRunnerAddress(fixture.home)?.pid).toBe(before?.pid);
    expect(processRunning(heldPid)).toBe(true);
  } finally {
    clearRetiredCheckoutHelperProof();
    await fixture.restore();
  }
});
