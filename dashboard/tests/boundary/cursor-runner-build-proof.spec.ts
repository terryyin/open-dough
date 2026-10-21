// New Cursor work runs only on a runner that proves the current build.
// A stand-in answering the wire protocol with wrong or missing proof, and
// a real runner whose recorded proof is turned stale while it holds a
// client, are both replaced before the next exec/keep answers; a runner
// that does not answer the protocol at all is left alone and the work
// fails unreachable. The build identity is computed from the runner code
// itself: a reached sibling module moves it in source mode, and the
// bundled entry's content moves it in bundled mode.
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import net from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "../support/pageTest.ts";
import { computeRunnerBuildId } from "../../server/hosts/cursor/runnerBuild.ts";
import { readCursorRunnerAddress } from "../../server/hosts/cursor/runnerPaths.ts";
import {
  bridgedProofTerminal,
  createChatOnRunner,
  keepWorkingClient,
  startRunnerProofFixture,
  startStandInRunner,
} from "../support/cursorRunnerProof.ts";
import {
  tamperRecordedProof,
  writeRunnerAddress,
} from "../support/cursorRunnerRecordedAddress.ts";
import { processRunning } from "../support/processGroup.ts";
import { repoRoot } from "../support/repositoryRoot.ts";

for (const mode of ["wrong", "missing"] as const) {
  test(`a stand-in runner with ${mode} build proof is replaced before exec answers`, async () => {
    test.setTimeout(60_000);
    const fixture = startRunnerProofFixture();
    try {
      const standIn = await startStandInRunner(fixture, mode);
      const created = await createChatOnRunner(fixture);
      expect(created).toMatchObject({
        failed: false,
        stdout: `${fixture.cursor.sessionId}\n`,
      });
      await expect.poll(() => processRunning(standIn.pid)).toBe(false);
      const address = readCursorRunnerAddress(fixture.home);
      expect(address?.pid).not.toBe(standIn.pid);
      expect(address?.buildId).toBe(computeRunnerBuildId());
      const pidAfterReplace = address?.pid;
      const again = await createChatOnRunner(fixture);
      expect(again).toMatchObject({ failed: false });
      expect(readCursorRunnerAddress(fixture.home)?.pid).toBe(pidAfterReplace);
    } finally {
      await fixture.restore();
    }
  });
}

test("a real runner whose recorded proof turns stale while holding a client is replaced once before new work", async () => {
  test.setTimeout(60_000);
  const fixture = startRunnerProofFixture();
  try {
    await keepWorkingClient(fixture);
    const before = readCursorRunnerAddress(fixture.home);
    expect(before?.buildId).toBe(computeRunnerBuildId());
    expect(fixture.cursor.attaches()).toHaveLength(1);
    const heldPid = fixture.cursor.attaches()[0]?.pid ?? 0;
    tamperRecordedProof(fixture);
    const [first, second] = await Promise.all([
      createChatOnRunner(fixture),
      createChatOnRunner(fixture),
    ]);
    expect(first).toMatchObject({ failed: false });
    expect(second).toMatchObject({ failed: false });
    const after = readCursorRunnerAddress(fixture.home);
    expect(after?.pid).not.toBe(before?.pid);
    expect(after?.buildId).toBe(computeRunnerBuildId());
    await expect.poll(() => processRunning(before?.pid)).toBe(false);
    await expect.poll(() => processRunning(heldPid)).toBe(false);
    const again = await createChatOnRunner(fixture);
    expect(again).toMatchObject({ failed: false });
    expect(readCursorRunnerAddress(fixture.home)?.pid).toBe(after?.pid);
  } finally {
    await fixture.restore();
  }
});

test("an accepting process that does not answer the protocol is not replaced and exec starts no agent", async () => {
  test.setTimeout(60_000);
  const fixture = startRunnerProofFixture();
  const sleeper = spawn(
    process.execPath,
    ["-e", "setInterval(() => {}, 1000)"],
    { stdio: "ignore" },
  );
  const sockets = new Set<net.Socket>();
  const dummy = net.createServer((socket) => {
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
    socket.destroy();
  });
  try {
    await new Promise<void>((resolve) => {
      dummy.listen(0, "127.0.0.1", () => {
        resolve();
      });
    });
    const address = dummy.address();
    if (
      address === null ||
      typeof address === "string" ||
      sleeper.pid === undefined
    ) {
      throw new Error("No dummy address.");
    }
    writeRunnerAddress(fixture, { port: address.port, pid: sleeper.pid });
    const created = await createChatOnRunner(fixture);
    expect(created).toBeUndefined();
    expect(processRunning(sleeper.pid)).toBe(true);
    expect(fixture.cursor.calls()).toEqual([]);
    expect(readCursorRunnerAddress(fixture.home)?.pid).toBe(sleeper.pid);
  } finally {
    sleeper.kill("SIGKILL");
    for (const socket of sockets) socket.destroy();
    await new Promise<void>((resolve) => {
      dummy.close(() => {
        resolve();
      });
    });
    await fixture.restore();
  }
});

test("build identity moves with a reached sibling in source mode and with the bundled entry in bundled mode", () => {
  const root = mkdtempSync(path.join(tmpdir(), "dough-build-id-"));
  try {
    const entry = path.join(root, "runnerMain.ts");
    const sibling = path.join(root, "sibling.ts");
    const unrelated = path.join(root, "unrelated.ts");
    writeFileSync(sibling, "export const value = 1;\n");
    writeFileSync(unrelated, "export const other = 1;\n");
    writeFileSync(entry, 'import "./sibling.ts";\n');
    const sourceBefore = computeRunnerBuildId(entry);
    writeFileSync(unrelated, "export const other = 2;\n");
    expect(computeRunnerBuildId(entry)).toBe(sourceBefore);
    writeFileSync(sibling, "export const value = 2;\n");
    expect(computeRunnerBuildId(entry)).not.toBe(sourceBefore);

    const bundled = path.join(root, "runnerMain.mjs");
    writeFileSync(bundled, "console.log(1);\n");
    const bundledBefore = computeRunnerBuildId(bundled);
    writeFileSync(bundled, "console.log(2);\n");
    expect(computeRunnerBuildId(bundled)).not.toBe(bundledBefore);
    // The real source entry beside this test hashes the same on a second
    // read: the identity is a digest of its tree, not a stamped constant
    // that could drift from the code (already shown by the sibling case).
    expect(
      computeRunnerBuildId(
        path.join(repoRoot, "dashboard/server/hosts/cursor/runnerMain.ts"),
      ),
    ).toBe(computeRunnerBuildId());
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("terminal bridge joins a held client on a stale runner but resumes a not-held session on a current runner", async () => {
  test.setTimeout(60_000);
  const fixture = startRunnerProofFixture();
  let heldBridge: Awaited<ReturnType<typeof bridgedProofTerminal>> | undefined;
  let resumedBridge:
    Awaited<ReturnType<typeof bridgedProofTerminal>> | undefined;
  try {
    await keepWorkingClient(fixture);
    const stalePid = readCursorRunnerAddress(fixture.home)?.pid;
    tamperRecordedProof(fixture);
    heldBridge = await bridgedProofTerminal(fixture, fixture.cursor.sessionId);
    await expect.poll(() => heldBridge?.output()).toContain("ctrl+c to stop");
    expect(readCursorRunnerAddress(fixture.home)?.pid).toBe(stalePid);
    expect(fixture.cursor.attaches()).toHaveLength(1);
    await heldBridge.close();
    heldBridge = undefined;

    const otherId = "7f1e8c2a-9b34-4d5e-8f70-1a2b3c4d5e6f";
    resumedBridge = await bridgedProofTerminal(fixture, otherId);
    await expect
      .poll(() => readCursorRunnerAddress(fixture.home)?.buildId)
      .toBe(computeRunnerBuildId());
    expect(readCursorRunnerAddress(fixture.home)?.pid).not.toBe(stalePid);
    await expect.poll(() => fixture.cursor.attaches().length).toBe(2);
    expect(fixture.cursor.attaches().at(-1)?.sessionId).toBe(otherId);
  } finally {
    await heldBridge?.close().catch(() => undefined);
    await resumedBridge?.close().catch(() => undefined);
    await fixture.restore();
  }
});
