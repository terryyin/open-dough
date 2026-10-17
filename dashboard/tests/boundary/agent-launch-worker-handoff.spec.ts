// Hold real worker-file replacements to observe exclusion before spawn is
// retained, and after child exit before the native worker is retained.
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "../support/pageTest.ts";
import { accept, attempts, continueAttempt } from "../agentLaunchBoundary.ts";
import { answerOf, request, type Problem } from "../keptExecutionStart.ts";
import { settledOutcome } from "../acceptedAttempts.ts";
import {
  startDashboardServer,
  type DashboardServer,
} from "../support/dashboardServer.ts";
import { fsPromisesHook } from "../support/serverFsHook.ts";
import { startOrigin } from "../support/startOrigin.ts";

test("the persisted server worker protects initial preparation and the child-to-native write window", async () => {
  test.setTimeout(180_000);
  const origin = await startOrigin();
  const hold = path.join(origin.machine, "hold-worker-note");
  const reached = path.join(origin.machine, "worker-note-held");
  const hook = fsPromisesHook(
    path.join(origin.machine, "worker-hold.mjs"),
    "rename",
    `async (from, to, ...args) => {
 if (String(to).endsWith('/launch-attempts.json') && fs.existsSync(${JSON.stringify(hold)})) {
  const stage = fs.readFileSync(${JSON.stringify(hold)}, 'utf8');
  const worker = Object.values(JSON.parse(fs.readFileSync(from, 'utf8'))).flat()[0]?.worker;
  if (worker && ((stage === 'spawn' && worker.pid !== process.pid) || (stage === 'launch' && worker.step === 'launch'))) {
   fs.writeFileSync(${JSON.stringify(reached)}, JSON.stringify(worker));
   await heldWhile(${JSON.stringify(hold)}, 60000);
  }
 }
 return original(from, to, ...args);
}`,
  );
  const push = origin.holdPushes();
  let first: DashboardServer | undefined;
  let second: DashboardServer | undefined;
  try {
    first = await startDashboardServer({
      mode: "boundary",
      machine: origin.machine,
      projectFolders: ["open-dough"],
      launchTimeoutMs: 60_000,
      extraEnv: hook,
    });
    first.claudeScenario("held");
    writeFileSync(hold, "spawn");
    const accepted = await answerOf<{ attempt: { id: string } }>(
      accept(first, request),
    );
    const heldWorker = () =>
      existsSync(reached)
        ? (JSON.parse(readFileSync(reached, "utf8")) as {
            pid: number;
            step: string;
          })
        : undefined;
    await expect
      .poll(heldWorker, { timeout: 30_000 })
      .toMatchObject({ step: "start" });
    const scriptPid = heldWorker()?.pid;
    if (scriptPid === undefined) throw new Error("Missing spawned worker");
    second = await startDashboardServer({
      mode: "boundary",
      machine: origin.machine,
      projectFolders: ["open-dough"],
    });
    expect((await attempts(second))[0]).toMatchObject({
      owned: false,
      running: true,
      worker: { pid: first.pid, serverPid: first.pid, step: "start" },
    });
    expect(
      await answerOf<Problem>(continueAttempt(second, accepted.attempt.id)),
    ).toMatchObject({
      kind: "uncertain",
      explanation: expect.stringContaining("already running"),
    });
    expect(await answerOf<Problem>(accept(second, request))).toMatchObject({
      kind: "failed",
      reason: "already-starting",
    });
    rmSync(hold);
    await expect.poll(() => push.isHeld(), { timeout: 30_000 }).toBe(true);
    const observingServer = second;
    await expect
      .poll(async () => (await attempts(observingServer))[0]?.worker?.pid)
      .toBe(scriptPid);
    rmSync(reached);
    writeFileSync(hold, "launch");
    push.release();
    await expect
      .poll(heldWorker, { timeout: 30_000 })
      .toMatchObject({ step: "launch" });
    expect(() => process.kill(scriptPid, 0)).toThrow();
    // The store still carries the dead script, but its recorded server is
    // alive and doing this handoff. Continue cannot duplicate that path.
    expect((await attempts(second))[0]).toMatchObject({
      owned: false,
      running: true,
      worker: { pid: scriptPid, serverPid: first.pid, step: "start" },
    });
    expect(
      await answerOf<Problem>(continueAttempt(second, accepted.attempt.id)),
    ).toMatchObject({
      kind: "uncertain",
      explanation: expect.stringContaining("already running"),
    });
    expect(await answerOf<Problem>(accept(second, request))).toMatchObject({
      kind: "failed",
      reason: "already-starting",
    });
    rmSync(hold);
    const runningServer = first;
    await expect
      .poll(() => runningServer.claudeLaunchCalls().length, { timeout: 30_000 })
      .toBe(1);
    first.releaseHeldClaude();
    expect((await settledOutcome(first, accepted.attempt.id)).kind).toBe(
      "launched",
    );
    expect((await attempts(second))[0]).toMatchObject({ running: false });
    expect((await attempts(second))[0]?.worker).toBeUndefined();
    expect(await origin.takenProfiles()).toHaveLength(1);
    expect(first.claudeLaunchCalls()).toHaveLength(1);
  } finally {
    rmSync(hold, { force: true });
    push.release();
    await second?.close();
    await first?.close();
    origin.cleanup();
  }
});
