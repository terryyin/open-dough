// Machine worker facts are separate from ownership and cleared on settlement.
import { spawnSync } from "node:child_process";
import { mock } from "node:test";
import { expect, test } from "../support/pageTest.ts";
import { OwnedAttempts } from "../../server/ownedAttempts.ts";
import { workerAlive } from "../../server/launchAttemptWorker.ts";
import { settleAttempt } from "../../server/launchAttemptSettlement.ts";
import type { LaunchAttemptRecord } from "../../src/agentLaunch.ts";

const attempt: LaunchAttemptRecord = {
  id: "12345678-1234-4123-8123-123456789abc",
  request: { source: "open-dough", host: "claude", workflow: "ad-hoc" },
  acceptedAt: new Date().toISOString(),
  publication: { kind: "none" },
};

test("signal zero observes alive, dead and permission-denied workers", () => {
  expect(workerAlive(process.pid)).toBe(true);
  const exited = spawnSync(process.execPath, ["-e", ""]);
  expect(exited.status).toBe(0);
  expect(workerAlive(exited.pid)).toBe(false);
  const observer = new OwnedAttempts();
  expect(
    observer.observed({
      ...attempt,
      worker: {
        pid: exited.pid,
        serverPid: process.pid,
        step: "start",
        notedAt: attempt.acceptedAt,
      },
    }),
  ).toMatchObject({ owned: false, running: true });
  expect(
    observer.observed({
      ...attempt,
      worker: {
        pid: exited.pid,
        serverPid: exited.pid,
        step: "start",
        notedAt: attempt.acceptedAt,
      },
    }),
  ).toMatchObject({ owned: false, running: false });
  const signal = mock.method(process, "kill", () => {
    throw Object.assign(new Error("denied"), { code: "EPERM" });
  });
  try {
    expect(workerAlive(process.pid)).toBe(true);
  } finally {
    signal.mock.restore();
  }
});

test("unowned live workers run; settled outcomes never run; concurrent notes retain both facts and settlement clears them", async () => {
  const owner = new OwnedAttempts();
  const worker = {
    pid: process.pid,
    step: "start" as const,
    notedAt: attempt.acceptedAt,
  };
  expect(owner.observed({ ...attempt, worker })).toMatchObject({
    owned: false,
    running: true,
  });
  const own = owner.own(attempt.request, attempt);
  // No file IO is needed to prove the memory answered note path.
  owner.close();
  await settleAttempt(owner, own, async (...[, publication, slow, working]) => {
    await Promise.all([working(worker), slow(attempt.acceptedAt)]);
    expect(own.attempt).toMatchObject({
      worker,
      slowSince: attempt.acceptedAt,
    });
    await publication({ kind: "none" });
    await working({ ...worker, step: "launch" });
    expect(own.attempt.worker?.step).toBe("launch");
    return { kind: "failed", reason: "refused", explanation: "Not launched." };
  });
  expect(own.attempt.worker).toBeUndefined();
  expect(own.attempt.slowSince).toBeUndefined();
  expect(owner.observed(own.attempt)).toMatchObject({
    owned: false,
    running: false,
    outcome: { kind: "failed" },
  });
});
